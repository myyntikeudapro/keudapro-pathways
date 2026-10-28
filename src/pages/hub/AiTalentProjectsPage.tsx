import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AiTalentShell } from "@/components/hub/AiTalentShell";
import { useAiTalentMembership } from "@/hooks/useAiTalentMembership";
import NotFound from "@/pages/NotFound";
import {
  AI_TALENT_PATH_NAMES, AI_TALENT_PROJECT_STATUSES, AiTalentProjectStatus,
  canProposeProject, isAiTalentVisible,
} from "@/data/aiTalent";

interface Project {
  id: string; path: number; title: string; owner_org: string; owner_name: string | null;
  problem: string | null; deliverable: string | null; metric: string | null; data_scope: string | null;
  commitment_accepted: boolean; status: AiTalentProjectStatus; participant_user_id: string | null;
}
interface Participant { user_id: string; email: string }

const STATUS_STYLE: Record<AiTalentProjectStatus, string> = {
  ehdotus: "bg-muted text-muted-foreground border-border",
  avoin: "bg-[hsl(var(--keuda-blue)/0.1)] text-[hsl(var(--keuda-blue))] border-[hsl(var(--keuda-blue)/0.3)]",
  rajattu: "bg-keuda-orange/10 text-foreground border-keuda-orange/40",
  "käynnissä": "bg-primary/10 text-primary border-primary/30",
  valmis: "bg-foreground text-background border-foreground",
};

const EMPTY = { path: 1, title: "", owner_org: "", owner_name: "", problem: "", deliverable: "", metric: "", data_scope: "", commitment_accepted: false, status: "ehdotus" as AiTalentProjectStatus, participant_user_id: "" };
type Draft = typeof EMPTY;

const selectCls = "h-10 w-full rounded-md border border-input bg-background px-3 text-sm";

function ProjectForm({ initial, isAdmin, participants, onDone }: { initial: Draft & { id?: string }; isAdmin: boolean; participants: Participant[]; onDone: () => void }) {
  const [d, setD] = useState(initial);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((x) => ({ ...x, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!d.title.trim() || !d.owner_org.trim()) { setErr("Otsikko ja omistajaorganisaatio ovat pakollisia."); return; }
    if (!isAdmin && (!d.problem.trim() || !d.deliverable.trim() || !d.metric.trim() || !d.data_scope.trim() || !d.commitment_accepted)) {
      setErr("Täytä kaikki kentät ja vahvista sitoumus."); return;
    }
    setBusy(true); setErr(null);
    const row = {
      path: Number(d.path), title: d.title.trim(), owner_org: d.owner_org.trim(), owner_name: d.owner_name.trim() || null,
      problem: d.problem.trim() || null, deliverable: d.deliverable.trim() || null, metric: d.metric.trim() || null,
      data_scope: d.data_scope.trim() || null, commitment_accepted: d.commitment_accepted,
      status: isAdmin ? d.status : "ehdotus",
      participant_user_id: isAdmin ? d.participant_user_id || null : null,
    };
    const { data: auth } = await supabase.auth.getUser();
    const { error } = initial.id
      ? await supabase.from("ai_talent_projects").update(row).eq("id", initial.id)
      : await supabase.from("ai_talent_projects").insert({ ...row, created_by: auth.user?.id });
    setBusy(false);
    if (error) { setErr("Tallennus epäonnistui. Tarkista käyttöoikeutesi."); return; }
    onDone();
  };

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="p-path">Polku</Label>
          <select id="p-path" className={selectCls} value={d.path} onChange={(e) => set("path", Number(e.target.value))}>
            {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}. {AI_TALENT_PATH_NAMES[n]}</option>)}
          </select>
        </div>
        {isAdmin && (
          <div className="space-y-1.5">
            <Label htmlFor="p-status">Tila</Label>
            <select id="p-status" className={selectCls} value={d.status} onChange={(e) => set("status", e.target.value as AiTalentProjectStatus)}>
              {AI_TALENT_PROJECT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        )}
      </div>
      <div className="space-y-1.5"><Label htmlFor="p-title">Otsikko</Label><Input id="p-title" value={d.title} onChange={(e) => set("title", e.target.value)} /></div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5"><Label htmlFor="p-org">Omistajaorganisaatio</Label><Input id="p-org" value={d.owner_org} onChange={(e) => set("owner_org", e.target.value)} /></div>
        <div className="space-y-1.5"><Label htmlFor="p-owner">Yhteyshenkilö</Label><Input id="p-owner" value={d.owner_name} onChange={(e) => set("owner_name", e.target.value)} /></div>
      </div>
      <div className="space-y-1.5"><Label htmlFor="p-problem">Ongelma nykytilassa</Label><Textarea id="p-problem" rows={3} value={d.problem} onChange={(e) => set("problem", e.target.value)} /></div>
      <div className="space-y-1.5"><Label htmlFor="p-deliv">Mitä nuori rakentaa</Label><Textarea id="p-deliv" rows={3} placeholder="Prototyyppi tai ensimmäinen versio, ei tuotantojärjestelmä" value={d.deliverable} onChange={(e) => set("deliverable", e.target.value)} /></div>
      <div className="space-y-1.5"><Label htmlFor="p-metric">Millä mitataan</Label><Textarea id="p-metric" rows={2} value={d.metric} onChange={(e) => set("metric", e.target.value)} /></div>
      <div className="space-y-1.5"><Label htmlFor="p-data">Mitä dataa prototyypissä saa käyttää</Label><Textarea id="p-data" rows={2} value={d.data_scope} onChange={(e) => set("data_scope", e.target.value)} /></div>
      <label className="flex items-start gap-3 rounded-lg border border-border bg-muted/40 p-3 text-sm">
        <Checkbox checked={d.commitment_accepted} onCheckedChange={(v) => set("commitment_accepted", v === true)} className="mt-0.5" />
        <span>Sitoudumme tapaamisiin n. 1 h / 2 viikkoa sekä loppuarviointiin ja palautteeseen nuoren portfolioon.</span>
      </label>
      {isAdmin && (
        <div className="space-y-1.5">
          <Label htmlFor="p-part">Kiinnitetty osallistuja</Label>
          <select id="p-part" className={selectCls} value={d.participant_user_id} onChange={(e) => set("participant_user_id", e.target.value)}>
            <option value="">Ei kiinnitetty</option>
            {participants.map((p) => <option key={p.user_id} value={p.user_id}>{p.email}</option>)}
          </select>
          {participants.length === 0 && <p className="text-xs text-muted-foreground">Osallistujat näkyvät tässä, kun he ovat kirjautuneet kerran.</p>}
        </div>
      )}
      {err && <p role="alert" className="text-sm text-destructive">{err}</p>}
      <Button type="submit" disabled={busy}>{busy ? "Tallennetaan…" : isAdmin ? "Tallenna aihio" : "Lähetä ehdotus"}</Button>
    </form>
  );
}

const AiTalentProjectsPage = () => {
  const { user, role, loading, signOut } = useAiTalentMembership();
  const [projects, setProjects] = useState<Project[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [editing, setEditing] = useState<(Draft & { id?: string }) | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const isAdmin = role === "admin";

  const load = useCallback(async () => {
    const { data } = await supabase.from("ai_talent_projects").select("*").order("path").order("created_at");
    setProjects((data ?? []) as Project[]);
  }, []);
  useEffect(() => { if (role) load(); }, [role, load]);
  useEffect(() => {
    if (!isAdmin) return;
    supabase.rpc("ai_talent_participants").then(({ data }) => setParticipants((data ?? []) as Participant[]));
  }, [isAdmin]);

  if (!isAiTalentVisible()) return <NotFound />;

  const toDraft = (p: Project): Draft & { id: string } => ({
    id: p.id, path: p.path, title: p.title, owner_org: p.owner_org, owner_name: p.owner_name ?? "",
    problem: p.problem ?? "", deliverable: p.deliverable ?? "", metric: p.metric ?? "", data_scope: p.data_scope ?? "",
    commitment_accepted: p.commitment_accepted, status: p.status, participant_user_id: p.participant_user_id ?? "",
  });
  const emailOf = (id: string | null) => participants.find((p) => p.user_id === id)?.email;

  return (
    <AiTalentShell email={user?.email} onSignOut={signOut} crumb="Projektit">
      {loading ? <p role="status" className="keuda-container py-24 text-muted-foreground">Ladataan…</p> : !role ? (
        <section className="keuda-container py-14 max-w-xl">
          <h1 className="text-2xl font-bold mb-2">Kirjaudu ensin</h1>
          <p className="text-muted-foreground mb-4">Projektit näkyvät ohjelman jäsenille.</p>
          <Link to="/hub/ai-talent" className="text-[hsl(var(--keuda-blue))] underline">Kirjautumiseen</Link>
        </section>
      ) : (
        <>
          <section className="bg-muted/40 border-b border-border py-10 md:py-14">
            <div className="keuda-container">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-keuda-orange mb-3">AI Talent · Projektit</p>
              <h1 className="text-3xl md:text-4xl font-bold text-[hsl(var(--keuda-blue))] mb-4">{role === "participant" ? "Oma projektisi" : "Aihiopankki"}</h1>
              {role !== "participant" && (
                <p className="max-w-3xl text-foreground">Aihiopankki on ohjelman tärkein työkalu polkujen lunastamiseen: viisi polkua on tarjolla vain, jos jokaiseen on oikea aihio, jolla on oikea omistaja. Tavoite ennen valintoja: 6–8 rajattua aihiota.</p>
              )}
              {canProposeProject(role) && (
                <Button className="mt-6" onClick={() => { setNotice(null); setEditing({ ...EMPTY }); }}>{isAdmin ? "Lisää aihio" : "Ehdota aihiota"}</Button>
              )}
              {notice && <p role="status" className="mt-4 text-sm text-primary">{notice}</p>}
            </div>
          </section>
          <section className="keuda-container py-10 md:py-14 space-y-10">
            {projects.length === 0 && <p className="text-muted-foreground">{role === "participant" ? "Sinulle ei ole vielä kiinnitetty aihiota." : "Aihioita ei vielä ole."}</p>}
            {[1, 2, 3, 4, 5].map((n) => {
              const list = projects.filter((p) => p.path === n);
              if (!list.length) return null;
              return (
                <div key={n}>
                  <h2 className="text-xl md:text-2xl font-bold mb-4"><span className="text-keuda-orange">{n}.</span> {AI_TALENT_PATH_NAMES[n]}</h2>
                  <ul className="grid gap-4 md:grid-cols-2">
                    {list.map((p) => (
                      <li key={p.id} className="flex flex-col rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
                        <div className="mb-3 flex flex-wrap items-center gap-2">
                          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Polku {n}</span>
                          <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLE[p.status]}`}>{p.status}</span>
                        </div>
                        <h3 className="font-bold text-lg leading-snug mb-1 hyphens-auto">{p.title}</h3>
                        <p className="text-sm text-muted-foreground mb-3">{p.owner_org}{p.owner_name ? ` · ${p.owner_name}` : ""}</p>
                        {p.problem && <p className="text-sm line-clamp-3">{p.problem}</p>}
                        {isAdmin && (
                          <div className="mt-auto pt-4 flex flex-wrap items-center justify-between gap-2 text-sm">
                            <span className="text-muted-foreground break-all">{p.participant_user_id ? `Osallistuja: ${emailOf(p.participant_user_id) ?? "kiinnitetty"}` : "Ei osallistujaa"}</span>
                            <Button variant="outline" size="sm" onClick={() => { setNotice(null); setEditing(toDraft(p)); }}>Muokkaa</Button>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </section>
        </>
      )}
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Muokkaa aihiota" : isAdmin ? "Lisää aihio" : "Ehdota aihiota"}</DialogTitle>
            <DialogDescription>Aihio on rajattu kehitysprojekti, jossa nuori rakentaa prototyypin tai ensimmäisen version.</DialogDescription>
          </DialogHeader>
          {editing && (
            <ProjectForm initial={editing} isAdmin={isAdmin} participants={participants}
              onDone={() => { setEditing(null); setNotice(isAdmin ? "Aihio tallennettiin." : "Kiitos! Ehdotus tallennettiin ja ylläpitäjä käsittelee sen."); load(); }} />
          )}
        </DialogContent>
      </Dialog>
    </AiTalentShell>
  );
};

export default AiTalentProjectsPage;
