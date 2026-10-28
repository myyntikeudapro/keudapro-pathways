import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AiTalentShell } from "@/components/hub/AiTalentShell";
import { useAiTalentMembership } from "@/hooks/useAiTalentMembership";
import { AI_TALENT_ROLES, AiTalentRole, isAiTalentVisible, normalizeMemberEmail } from "@/data/aiTalent";
import NotFound from "@/pages/NotFound";

interface Member { id: string; email: string; role: AiTalentRole; created_at: string }

const roleLabel = (r: string) => AI_TALENT_ROLES.find((x) => x.value === r)?.label ?? r;

const AiTalentAdminPage = () => {
  const { user, role, loading, signOut } = useAiTalentMembership();
  const [members, setMembers] = useState<Member[]>([]);
  const [email, setEmail] = useState("");
  const [newRole, setNewRole] = useState<AiTalentRole>("participant");
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const { data } = await supabase.from("ai_talent_members").select("id,email,role,created_at").order("created_at", { ascending: false });
    setMembers((data ?? []) as Member[]);
  }, []);
  useEffect(() => { if (role === "admin") load(); }, [role, load]);

  if (!isAiTalentVisible()) return <NotFound />;

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = normalizeMemberEmail(email);
    if (!clean) { setMsg({ kind: "err", text: "Tarkista sähköpostiosoite." }); return; }
    setBusy(true); setMsg(null);
    const { error } = await supabase.from("ai_talent_members").insert({ email: clean, role: newRole });
    setBusy(false);
    if (error) { setMsg({ kind: "err", text: error.code === "23505" ? "Osoite on jo jäsenlistalla." : "Lisäys epäonnistui." }); return; }
    setEmail(""); setMsg({ kind: "ok", text: `${clean} lisättiin. Hän voi kirjautua sivulle sähköpostilinkillä.` }); load();
  };
  const [demo, setDemo] = useState<{ email: string; password: string } | null>(null);
  const demoAction = async (action: "ai_talent_demo" | "ai_talent_demo_disable") => {
    if (action === "ai_talent_demo_disable" && !window.confirm("Suljetaanko demotunnus? Salasana lakkaa toimimasta.")) return;
    setBusy(true); setMsg(null);
    const { data, error } = await supabase.functions.invoke("admin-users", { body: { action, role: "partner" } });
    setBusy(false);
    if (error || data?.error) { setMsg({ kind: "err", text: data?.error ?? "Demotunnuksen käsittely epäonnistui." }); return; }
    setDemo(action === "ai_talent_demo" ? { email: data.email, password: data.password } : null);
    setMsg({ kind: "ok", text: action === "ai_talent_demo" ? "Demotunnus on valmis." : "Demotunnus suljettiin." });
    load();
  };
  const remove = async (m: Member) => {
    if (!window.confirm(`Poistetaanko ${m.email} jäsenistä?`)) return;
    const { error } = await supabase.from("ai_talent_members").delete().eq("id", m.id);
    if (error) setMsg({ kind: "err", text: "Poisto epäonnistui." }); else load();
  };

  return (
    <AiTalentShell email={user?.email} onSignOut={signOut} crumb="Jäsenet">
      <section className="keuda-container py-10 md:py-14">
        {loading ? <p role="status" className="text-muted-foreground">Ladataan…</p> : role !== "admin" ? (
          <div className="max-w-xl">
            <h1 className="text-2xl font-bold mb-2">Ei käyttöoikeutta</h1>
            <p className="text-muted-foreground mb-4">Jäsenten hallinta on vain ylläpitäjille.</p>
            <Link to="/hub/ai-talent" className="text-[hsl(var(--keuda-blue))] underline">Takaisin AI Talent -sivulle</Link>
          </div>
        ) : (
          <>
            <h1 className="text-3xl font-bold text-[hsl(var(--keuda-blue))] mb-6">AI Talent – jäsenet</h1>
            <form onSubmit={add} className="grid gap-3 rounded-2xl border border-border bg-card p-5 sm:grid-cols-[1fr_220px_auto] sm:items-end mb-4">
              <div className="space-y-1.5"><Label htmlFor="m-email">Sähköposti</Label><Input id="m-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
              <div className="space-y-1.5">
                <Label htmlFor="m-role">Rooli</Label>
                <select id="m-role" value={newRole} onChange={(e) => setNewRole(e.target.value as AiTalentRole)} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  {AI_TALENT_ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
              <Button type="submit" variant="cta" disabled={busy}>Lisää jäsen</Button>
            </form>
            <div className="mb-6 rounded-2xl border-2 border-keuda-orange/50 bg-card p-5">
              <h2 className="font-bold text-lg mb-1">Demopalaverin yhteinen tunnus</h2>
              <p className="text-sm text-muted-foreground mb-4">Kumppanin näkymä: näkee ohjelman ja aihiopankin, voi ehdottaa aihioita. Ei pääsyä myyntityötilaan. Uusi luonti vaihtaa salasanan.</p>
              {demo && (
                <div className="mb-4 rounded-lg bg-muted p-3 text-sm">
                  <p>Tunnus: <strong className="break-all">{demo.email}</strong></p>
                  <p>Salasana: <strong className="font-mono">{demo.password}</strong></p>
                  <p className="mt-1 text-xs text-muted-foreground">Salasana näytetään vain nyt. Kirjautuminen: /hub/ai-talent → sähköposti ja salasana.</p>
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                <Button variant="cta" disabled={busy} onClick={() => demoAction("ai_talent_demo")}>Luo / uusi demotunnus</Button>
                <Button variant="outline" disabled={busy} onClick={() => demoAction("ai_talent_demo_disable")}>Sulje demotunnus</Button>
              </div>
            </div>
            {msg && <p role="status" className={`mb-4 text-sm ${msg.kind === "ok" ? "text-[hsl(var(--keuda-blue))]" : "text-destructive"}`}>{msg.text}</p>}
            <ul className="divide-y divide-border rounded-2xl border border-border bg-card">
              {members.length === 0 && <li className="p-4 text-sm text-muted-foreground">Ei vielä jäseniä.</li>}
              {members.map((m) => (
                <li key={m.id} className="flex flex-wrap items-center justify-between gap-2 p-4">
                  <div className="min-w-0"><p className="font-medium break-all">{m.email}</p><p className="text-xs text-muted-foreground">{roleLabel(m.role)} · lisätty {new Date(m.created_at).toLocaleDateString("fi-FI")}</p></div>
                  <Button variant="outline" size="sm" onClick={() => remove(m)} disabled={m.email === user?.email?.toLowerCase()}>Poista</Button>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>
    </AiTalentShell>
  );
};

export default AiTalentAdminPage;
