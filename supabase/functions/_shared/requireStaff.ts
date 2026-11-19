import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/** Returns null when the caller is a signed-in editor/admin, otherwise a 401/403 Response. */
export async function requireStaff(req: Request, headers: Record<string, string>): Promise<Response | null> {
  const deny = (status: number) =>
    new Response(JSON.stringify({ error: status === 401 ? "Sign-in required" : "Forbidden" }), {
      status, headers: { ...headers, "Content-Type": "application/json" },
    });
  const token = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!token) return deny(401);
  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data: u, error } = await admin.auth.getUser(token);
  if (error || !u?.user) return deny(401);
  const { data: roles } = await admin.from("user_roles").select("role").eq("user_id", u.user.id).in("role", ["admin", "editor"]).limit(1);
  return roles && roles.length > 0 ? null : deny(403);
}
