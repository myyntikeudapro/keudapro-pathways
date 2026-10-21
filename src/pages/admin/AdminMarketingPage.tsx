import { useMemo, useState } from "react";
import { Navigate, Link, useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Loader2, LogOut, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { SEO } from "@/components/seo/SEO";

type Ev = { session_id: string; event: string; path: string | null; utm_source: string | null; utm_campaign: string | null; device: string | null; props: Record<string, unknown>; created_at: string };
type Lead = { id: string; name: string; email: string; phone: string | null; organization: string | null; meeting_format: string; message: string; source: string | null; created_at: string; status: string; notes: string | null; utm_source: string | null; utm_medium: string | null; utm_campaign: string | null; handled_by: string | null };

const STATUSES = ["uusi", "yhteydessä", "kartoitus tehty", "koulutukseen", "ei jatkoon"] as const;
const nf = new Intl.NumberFormat("fi-FI");
const pct = (a: number, b: number) => (b ? `${Math.round((a / b) * 100)} %` : "–");
const fmt = (iso: string) => new Intl.DateTimeFormat("fi-FI", { day: "numeric", month: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
const label = (s: string | null) => s || "suora / tuntematon";
const EVENT_NAMES: Record<string, string> = {
  assessment_opened: "Avasi kartoituksen", assessment_step1_completed: "Täytti kartoituksen vaiheen 1", assessment_submitted: "Lähetti kartoituksen",
  assessment_failed: "Kartoituksen lähetys epäonnistui", assessment_phone_clicked: "Klikkasi puhelinnumeroa", assessment_email_clicked: "Klikkasi sähköpostia",
  lead_submitted: "Jätti yhteydenoton", keuda_external_opened: "Siirtyi maksulliseen koulutukseen", course_selected: "Valitsi koulutuksen",
  course_registration_click: "Klikkasi ilmoittautumista", start_selected: "Valitsi aloituksen", muutosturva_path_selected: "Valitsi asiointipolun",
  ai_assessment_start: "Aloitti tekoälytestin", ai_assessment_complete: "Suoritti tekoälytestin", organization_ai_cta: "Organisaation tekoäly-CTA",
};

function countBy<T>(rows: T[], key: (r: T) => string | null | undefined, unique?: (r: T) => string) {
  const m = new Map<string, Set<string> | number>();
  rows.forEach((r, i) => {
    const k = key(r);
    if (!k) return;
    if (unique) {
      const s = (m.get(k) as Set<string>) ?? new Set<string>();
      s.add(unique(r));
      m.set(k, s);
    } else m.set(k, ((m.get(k) as number) ?? 0) + 1);
    void i;
  });
  return [...m.entries()].map(([k, v]) => [k, typeof v === "number" ? v : v.size] as [string, number]).sort((a, b) => b[1] - a[1]);
}

function Bar({ name, value, max, sub }: { name: string; value: number; max: number; sub?: string }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm gap-2"><span className="truncate">{name}</span><span className="tabular-nums font-medium">{nf.format(value)}{sub && <span className="text-muted-foreground font-normal"> · {sub}</span>}</span></div>
      <div className="h-2 rounded-full bg-muted overflow-hidden"><div className="h-full bg-primary rounded-full" style={{ width: `${max ? (value / max) * 100 : 0}%` }} /></div>
    </div>
  );
}

function Kpi({ title, value, hint }: { title: string; value: string; hint?: string }) {
  return <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">{title}</p><p className="text-2xl font-semibold tabular-nums mt-1">{value}</p>{hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}</CardContent></Card>;
}

function List({ rows, empty = "Ei vielä tietoja tältä ajalta." }: { rows: [string, number, string?][]; empty?: string }) {
  if (!rows.length) return <p className="text-sm text-muted-foreground">{empty}</p>;
  const max = Math.max(...rows.map((r) => r[1]));
  return <div className="space-y-3">{rows.slice(0, 10).map(([n, v, s]) => <Bar key={n} name={n} value={v} max={max} sub={s} />)}</div>;
}

export default function AdminMarketingPage() {
  const { user, loading, isEditor, roleLoading, signOut } = useAuth();
  const [days, setDays] = useState(30);
  const [params, setParams] = useSearchParams();
  const tab = ["overview", "leads", "users"].includes(params.get("tab") ?? "") ? params.get("tab")! : "overview";
  const since = useMemo(() => new Date(Date.now() - days * 864e5).toISOString(), [days]);
  const qc = useQueryClient();

  const events = useQuery({
    queryKey: ["mkt_events", since],
    enabled: !!user && isEditor,
    queryFn: async () => {
      const { data, error } = await supabase.from("marketing_events").select("session_id,event,path,utm_source,utm_campaign,device,props,created_at").gte("created_at", since).order("created_at", { ascending: false }).limit(20000);
      if (error) throw error;
      return data as Ev[];
    },
  });
  const leads = useQuery({
    queryKey: ["mkt_leads", since],
    enabled: !!user && isEditor,
    queryFn: async () => {
      const { data, error } = await supabase.from("booking_requests").select("*").gte("created_at", since).order("created_at", { ascending: false }).limit(1000);
      if (error) throw error;
      return data as Lead[];
    },
  });

  const s = useMemo(() => {
    const ev = events.data ?? [];
    const ld = leads.data ?? [];
    const views = ev.filter((e) => e.event === "page_view");
    const sessions = new Set(views.map((e) => e.session_id));
    const mtSessions = new Set(views.filter((e) => e.path === "/muutosturva").map((e) => e.session_id));
    const sess = (name: string) => new Set(ev.filter((e) => e.event === name).map((e) => e.session_id)).size;
    const mtLeads = ld.filter((l) => l.source === "muutosturva-kartoitus").length;
    const srcSessions = countBy(views, (e) => label(e.utm_source), (e) => e.session_id);
    const srcLeads = new Map(countBy(ld, (l) => label(l.utm_source)));
    const channels = srcSessions.map(([k, v]) => [k, v, `${srcLeads.get(k) ?? 0} yhteydenottoa (${pct(srcLeads.get(k) ?? 0, v)})`] as [string, number, string]);
    srcLeads.forEach((v, k) => { if (!srcSessions.find((c) => c[0] === k)) channels.push([k, 0, `${v} yhteydenottoa`]); });
    const courseOf = (e: Ev) => (typeof e.props?.course === "string" ? (e.props.course as string) : null);
    return {
      sessions: sessions.size,
      views: views.length,
      mtSessions: mtSessions.size,
      opened: sess("assessment_opened"),
      step1: sess("assessment_step1_completed"),
      submitted: sess("assessment_submitted"),
      leadsTotal: ld.length,
      mtLeads,
      newLeads: ld.filter((l) => l.status === "uusi").length,
      won: ld.filter((l) => l.status === "koulutukseen").length,
      channels,
      campaigns: countBy(views.filter((e) => e.utm_campaign), (e) => e.utm_campaign, (e) => e.session_id),
      pages: countBy(views, (e) => e.path),
      devices: countBy(views, (e) => e.device, (e) => e.session_id),
      courses: countBy(ev.filter((e) => ["course_selected", "assessment_submitted", "keuda_external_opened", "course_registration_click"].includes(e.event)), courseOf),
      actions: countBy(ev.filter((e) => e.event !== "page_view"), (e) => EVENT_NAMES[e.event] ?? e.event),
      leadSources: countBy(ld, (l) => l.source ?? l.meeting_format),
      statuses: countBy(ld, (l) => l.status),
    };
  }, [events.data, leads.data]);

  if (loading || roleLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  if (!user) return <Navigate to="/admin/login" replace />;
  if (!isEditor) return <Navigate to="/admin/yhteydenotot" replace />;

  const refresh = () => { events.refetch(); leads.refetch(); };
  const busy = events.isFetching || leads.isFetching;

  const exportCsv = () => {
    const rows = [["Saapui", "Nimi", "Sähköposti", "Puhelin", "Lähde", "Kanava", "Kampanja", "Tila", "Käsittelijä", "Muistiinpanot"], ...(leads.data ?? []).map((l) => [fmt(l.created_at), l.name, l.email, l.phone ?? "", l.source ?? l.meeting_format, l.utm_source ?? "", l.utm_campaign ?? "", l.status, l.handled_by ?? "", l.notes ?? ""])];
    const csv = "\uFEFF" + rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(";")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    a.download = `yhteydenotot-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <SEO title="Markkinointi ja ostopolku – KeudaPRO" description="Markkinoinnin ja ostopolun seuranta." path="/admin/markkinointi" />
      <header className="bg-background border-b">
        <div className="container mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-3">
          <div><h1 className="text-xl font-semibold">Markkinointi ja ostopolku</h1><p className="text-xs text-muted-foreground">{user.email}</p></div>
          <div className="flex flex-wrap items-center gap-2">
            {[7, 30, 90].map((d) => <Button key={d} size="sm" variant={days === d ? "default" : "outline"} onClick={() => setDays(d)}>{d} pv</Button>)}
            <Button variant="outline" size="sm" onClick={refresh} disabled={busy}><RefreshCw className={`mr-2 h-4 w-4 ${busy ? "animate-spin" : ""}`} />Päivitä</Button>
            <Button asChild variant="ghost" size="sm"><Link to="/admin">Sisältöeditori</Link></Button>
            <Button variant="outline" size="sm" onClick={signOut}><LogOut className="mr-2 h-4 w-4" />Ulos</Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Tabs value={tab} onValueChange={(v) => setParams(v === "overview" ? {} : { tab: v }, { replace: true })}>
          <TabsList className="mb-4 flex-wrap h-auto">
            <TabsTrigger value="overview">Yleiskuva</TabsTrigger>
            <TabsTrigger value="leads">Yhteydenotot ({s.leadsTotal})</TabsTrigger>
            <TabsTrigger value="users">Käyttäjät</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {events.isLoading ? <Loader2 className="h-6 w-6 animate-spin mx-auto my-10 text-muted-foreground" /> : <>
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                <Kpi title="Käynnit" value={nf.format(s.sessions)} hint={`${nf.format(s.views)} sivunäyttöä`} />
                <Kpi title="Yhteydenotot" value={nf.format(s.leadsTotal)} hint={`Kävijöistä ${pct(s.leadsTotal, s.sessions)}`} />
                <Kpi title="Muutosturvakartoitukset" value={nf.format(s.mtLeads)} />
                <Kpi title="Käsittelemättä" value={nf.format(s.newLeads)} hint="Tila: uusi" />
                <Kpi title="Koulutukseen" value={nf.format(s.won)} hint={`Yhteydenotoista ${pct(s.won, s.leadsTotal)}`} />
              </div>

              <Card>
                <CardHeader><CardTitle className="text-base">Muutosturvan ostopolku</CardTitle><CardDescription>Montako käyntiä eteni kuhunkin vaiheeseen. Prosentti kertoo osuuden edellisestä vaiheesta.</CardDescription></CardHeader>
                <CardContent className="space-y-3">
                  {([["Kävi Muutosturva-sivulla", s.mtSessions, 0], ["Avasi kartoituksen", s.opened, s.mtSessions], ["Täytti vaiheen 1", s.step1, s.opened], ["Lähetti kartoituksen", s.submitted, s.step1]] as [string, number, number][]).map(([n, v, prev], i) => <Bar key={n} name={n} value={v} max={Math.max(s.mtSessions, 1)} sub={i ? pct(v, prev) : undefined} />)}
                </CardContent>
              </Card>

              <div className="grid lg:grid-cols-2 gap-4">
                <Card><CardHeader><CardTitle className="text-base">Kanavat</CardTitle><CardDescription>Käynnit ja yhteydenotot lähteittäin</CardDescription></CardHeader><CardContent><List rows={s.channels} /></CardContent></Card>
                <Card><CardHeader><CardTitle className="text-base">Kampanjat</CardTitle><CardDescription>Linkit, joissa on utm_campaign-tunniste</CardDescription></CardHeader><CardContent><List rows={s.campaigns} empty="Ei kampanjalinkkejä tältä ajalta. Lisää mainoslinkkeihin utm_campaign." /></CardContent></Card>
                <Card><CardHeader><CardTitle className="text-base">Kiinnostavimmat koulutukset</CardTitle><CardDescription>Valinnat, kartoitukset ja siirtymät maksulliseen</CardDescription></CardHeader><CardContent><List rows={s.courses} /></CardContent></Card>
                <Card><CardHeader><CardTitle className="text-base">Suosituimmat sivut</CardTitle></CardHeader><CardContent><List rows={s.pages} /></CardContent></Card>
                <Card><CardHeader><CardTitle className="text-base">Toiminnot</CardTitle><CardDescription>Klikkaukset ja lomakkeiden vaiheet</CardDescription></CardHeader><CardContent><List rows={s.actions} /></CardContent></Card>
                <Card><CardHeader><CardTitle className="text-base">Laitteet ja yhteydenottojen tila</CardTitle></CardHeader><CardContent className="space-y-6"><List rows={s.devices} /><List rows={s.statuses} empty="Ei yhteydenottoja." /></CardContent></Card>
              </div>
              <p className="text-xs text-muted-foreground">Seuranta on nimetöntä ja koskee vain kävijöitä, jotka hyväksyvät evästeet. Todellinen kävijämäärä on siksi suurempi. Tiedot kertyvät 21.10.2026 alkaen.</p>
            </>}
          </TabsContent>

          <TabsContent value="leads" className="space-y-3">
            <div className="flex justify-between items-center gap-2"><p className="text-sm text-muted-foreground">Merkitse tila ja muistiinpanot, niin näet mistä kanavista tulee oikeita aloittajia.</p><Button size="sm" variant="outline" onClick={exportCsv}><Download className="mr-2 h-4 w-4" />Lataa Excel (CSV)</Button></div>
            {(leads.data ?? []).length === 0 ? <Card><CardContent className="py-10 text-center text-sm text-muted-foreground">Ei yhteydenottoja tältä ajalta.</CardContent></Card> :
              (leads.data ?? []).map((l) => <LeadCard key={l.id} lead={l} me={user.email ?? ""} onSaved={() => qc.invalidateQueries({ queryKey: ["mkt_leads"] })} />)}
          </TabsContent>

          <TabsContent value="users"><UsersPanel /></TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function LeadCard({ lead, me, onSaved }: { lead: Lead; me: string; onSaved: () => void }) {
  const [status, setStatus] = useState(lead.status);
  const [notes, setNotes] = useState(lead.notes ?? "");
  const [saving, setSaving] = useState(false);
  const dirty = status !== lead.status || notes !== (lead.notes ?? "");
  const save = async () => {
    setSaving(true);
    const { error } = await supabase.from("booking_requests").update({ status, notes: notes.slice(0, 2000) || null, handled_by: me }).eq("id", lead.id);
    setSaving(false);
    if (error) return toast.error("Tallennus epäonnistui.");
    toast.success("Tallennettu");
    onSaved();
  };
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-base">{lead.name}</CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{lead.source ?? lead.meeting_format}</Badge>
            {lead.utm_source && <Badge variant="outline">{lead.utm_source}{lead.utm_campaign ? ` · ${lead.utm_campaign}` : ""}</Badge>}
            <span className="text-xs text-muted-foreground">{fmt(lead.created_at)}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-muted-foreground">
          <a className="underline" href={`mailto:${lead.email}`}>{lead.email}</a>
          {lead.phone && <a className="underline" href={`tel:${lead.phone}`}>{lead.phone}</a>}
          {lead.organization && <span>{lead.organization}</span>}
        </div>
        <details><summary className="cursor-pointer text-primary">Näytä viesti</summary><p className="whitespace-pre-wrap mt-2">{lead.message}</p></details>
        <div className="grid sm:grid-cols-[200px_1fr_auto] gap-2 items-start">
          <select aria-label="Tila" className="min-h-10 rounded-md border border-input bg-background px-3" value={status} onChange={(e) => setStatus(e.target.value)}>
            {STATUSES.map((x) => <option key={x}>{x}</option>)}
          </select>
          <Textarea aria-label="Muistiinpanot" rows={1} placeholder="Muistiinpanot" value={notes} onChange={(e) => setNotes(e.target.value)} />
          <Button size="sm" disabled={!dirty || saving} onClick={save}>{saving ? "Tallennetaan…" : "Tallenna"}</Button>
        </div>
        {lead.handled_by && <p className="text-xs text-muted-foreground">Viimeksi käsitellyt: {lead.handled_by}</p>}
      </CardContent>
    </Card>
  );
}

function UsersPanel() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("editor");
  const [created, setCreated] = useState<{ email: string; password: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const users = useQuery({
    queryKey: ["admin_users"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("admin-users", { body: { action: "list" } });
      if (error) throw error;
      return (data?.users ?? []) as { id: string; email: string; role: string; last_sign_in_at: string | null }[];
    },
    retry: false,
  });
  const create = async () => {
    setBusy(true);
    const { data, error } = await supabase.functions.invoke("admin-users", { body: { action: "create", email, role } });
    setBusy(false);
    if (error || !data?.ok) return toast.error(data?.error ?? "Käyttäjän luonti epäonnistui. Vain pääkäyttäjä voi lisätä käyttäjiä.");
    setCreated({ email: data.email, password: data.password });
    setEmail("");
    users.refetch();
  };
  if (users.isError) return <Card><CardContent className="py-8 text-sm text-muted-foreground">Käyttäjien hallinta on vain pääkäyttäjille.</CardContent></Card>;
  return (
    <div className="grid lg:grid-cols-2 gap-4">
      <Card>
        <CardHeader><CardTitle className="text-base">Lisää käyttäjä</CardTitle><CardDescription>Myyjä tai markkinoija näkee seurannan ja voi käsitellä yhteydenottoja. Pääkäyttäjä voi lisäksi hallita käyttäjiä.</CardDescription></CardHeader>
        <CardContent className="space-y-3">
          <Input type="email" placeholder="etunimi.sukunimi@keuda.fi" value={email} onChange={(e) => setEmail(e.target.value)} aria-label="Sähköposti" />
          <select aria-label="Rooli" className="w-full min-h-10 rounded-md border border-input bg-background px-3 text-sm" value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="editor">Myynti / markkinointi</option>
            <option value="admin">Pääkäyttäjä</option>
          </select>
          <Button onClick={create} disabled={busy || !email}>{busy ? "Luodaan…" : "Luo tunnus"}</Button>
          {created && <div className="rounded-md border p-3 text-sm space-y-1 bg-muted/40"><p className="font-medium">Tunnus luotu – lähetä tiedot käyttäjälle:</p><p>Osoite: keudapro.fi/admin/login</p><p>Käyttäjä: {created.email}</p><p>Salasana: <code>{created.password}</code></p><p className="text-xs text-muted-foreground">Salasana näytetään vain nyt.</p></div>}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-base">Käyttäjät</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {users.isLoading ? <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /> : (users.data ?? []).map((u) => (
            <div key={u.id} className="flex justify-between gap-2 text-sm border-b pb-2"><span className="truncate">{u.email}</span><span className="text-muted-foreground shrink-0">{u.role === "admin" ? "Pääkäyttäjä" : "Myynti"} · {u.last_sign_in_at ? fmt(u.last_sign_in_at) : "ei kirjautunut"}</span></div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
