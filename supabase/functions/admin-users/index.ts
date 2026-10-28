import { createClient } from "https://esm.sh/@supabase/supabase-js@2.58.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

// Admin-only: list admin/editor users and create new editor users with a temporary password.
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const token = (req.headers.get("Authorization") ?? "").replace("Bearer ", "");
    const { data: u, error: ue } = await admin.auth.getUser(token);
    if (ue || !u.user) return json({ error: "Kirjaudu sisään." }, 401);
    const body = await req.json().catch(() => ({}));
    if (body.action === "team") {
      const { data: allowed } = await admin.rpc("is_editor_or_admin", { _user_id: u.user.id });
      if (!allowed) return json({ error: "Ei käyttöoikeutta." }, 403);
      const { data: roles, error } = await admin.from("user_roles").select("user_id");
      if (error) throw error;
      const members: { id: string; email: string }[] = [];
      for (const id of new Set((roles ?? []).map((r) => r.user_id))) {
        const { data, error: userError } = await admin.auth.admin.getUserById(id);
        if (userError) throw userError;
        if (data.user?.email) members.push({ id, email: data.user.email });
      }
      return json({ users: members });
    }
    const { data: isAdmin } = await admin.rpc("has_role", { _user_id: u.user.id, _role: "admin" });
    if (!isAdmin) return json({ error: "Vain pääkäyttäjä voi hallita käyttäjiä." }, 403);
    if (body.action === "list") {
      const { data: roles } = await admin.from("user_roles").select("user_id, role");
      const { data: list } = await admin.auth.admin.listUsers({ perPage: 200 });
      const users = (list?.users ?? [])
        .filter((x) => roles?.some((r) => r.user_id === x.id))
        .map((x) => ({
          id: x.id,
          email: x.email,
          role: roles?.find((r) => r.user_id === x.id && r.role === "admin") ? "admin" : "editor",
          last_sign_in_at: x.last_sign_in_at,
        }));
      return json({ users });
    }
    if (body.action === "create") {
      const email = String(body.email ?? "").trim().toLowerCase();
      const role = body.role === "admin" ? "admin" : "editor";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 255) return json({ error: "Tarkista sähköpostiosoite." }, 400);
      const bytes = crypto.getRandomValues(new Uint8Array(9));
      const password = "Keuda-" + btoa(String.fromCharCode(...bytes)).replace(/[+/=]/g, "x");
      let userId: string | undefined;
      const { data: created, error: ce } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
      if (ce) {
        const { data: list } = await admin.auth.admin.listUsers({ perPage: 200 });
        const existing = list?.users.find((x) => x.email?.toLowerCase() === email);
        if (!existing) return json({ error: ce.message }, 400);
        userId = existing.id;
        await admin.auth.admin.updateUserById(userId, { password });
      } else userId = created.user.id;
      const { data: has } = await admin.from("user_roles").select("id").eq("user_id", userId).eq("role", role).maybeSingle();
      if (!has) await admin.from("user_roles").insert({ user_id: userId, role });
      return json({ ok: true, email, password });
    }
    if (body.action === "ai_talent_demo") {
      // Shared AI Talent demo login: no site roles (never CRM access), membership only.
      const email = "ai-talent-demo@keudapro.fi";
      const memberRole = ["participant", "helsinki", "partner"].includes(body.role) ? body.role : "partner";
      const bytes = crypto.getRandomValues(new Uint8Array(6));
      const password = "Demo-" + btoa(String.fromCharCode(...bytes)).replace(/[+/=]/g, "x");
      const { data: list } = await admin.auth.admin.listUsers({ perPage: 1000 });
      const existing = list?.users.find((x) => x.email?.toLowerCase() === email);
      let userId = existing?.id;
      if (userId) {
        const { data: siteRoles } = await admin.from("user_roles").select("id").eq("user_id", userId);
        if ((siteRoles ?? []).length) return json({ error: "Demotunnuksella on sivuston rooli, ei muutettu." }, 409);
        const { error } = await admin.auth.admin.updateUserById(userId, { password });
        if (error) throw error;
      } else {
        const { data: created, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
        if (error) throw error;
        userId = created.user.id;
      }
      await admin.from("ai_talent_members").delete().eq("email", email);
      const { error: me } = await admin.from("ai_talent_members").insert({ email, role: memberRole, user_id: userId, created_by: u.user.id });
      if (me) throw me;
      return json({ ok: true, email, password, role: memberRole });
    }
    if (body.action === "ai_talent_demo_disable") {
      const email = "ai-talent-demo@keudapro.fi";
      await admin.from("ai_talent_members").delete().eq("email", email);
      const { data: list } = await admin.auth.admin.listUsers({ perPage: 1000 });
      const existing = list?.users.find((x) => x.email?.toLowerCase() === email);
      if (existing) {
        const bytes = crypto.getRandomValues(new Uint8Array(24));
        await admin.auth.admin.updateUserById(existing.id, { password: btoa(String.fromCharCode(...bytes)) });
      }
      return json({ ok: true });
    }
    return json({ error: "Tuntematon toiminto." }, 400);
  } catch (e) {
    console.error("admin-users error:", e);
    return json({ error: (e as Error).message }, 500);
  }
});
