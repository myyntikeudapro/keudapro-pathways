import { useMemo, useState, type ReactNode } from "react";
import { Navigate, Link, useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Loader2, LogOut, RefreshCw, Home, Layers, CalendarDays, BarChart3, Inbox, Users, Eye, Target, Clock, GraduationCap } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { SEO } from "@/components/seo/SEO";
import { CrmLeads, TasksPanel, SalesPanel, CampaignPanel } from '@/components/admin/CrmWorkspace';
import { readAll, orderedFunnel, paidPlatform, normalizeCampaign } from '@/lib/crm';
import type { Lead, TeamMember } from '@/lib/crm';

type Ev = { session_id: string; event: string; path: string | null; utm_source: string | null; utm_campaign: string | null; utm_medium: string | null; device: string | null; props: Record<string, unknown>; created_at: string };


const nf = new Intl.NumberFormat("fi-FI");
const pct = (a: number, b: number) => (b ? `${Math.round((a / b) * 100)} %` : "–");
const fmt = (iso: string) => new Intl.DateTimeFormat("fi-FI", { timeZone: "Europe/Helsinki", day: "numeric", month: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
const label = (s: string | null) => ({ig:"instagram",fb:"facebook"}[s?.toLowerCase() ?? ""] ?? s?.toLowerCase()) || "suora / tuntematon";
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

const SERVICES: Record<string, { label: string; short: string; paths: string[] | null; leadSource?: string; steps: [string, string][] }> = {
  all: { label: "Kaikki palvelut", short: "Koko sivusto", paths: null, steps: [["Kävi sivustolla", "page_view"], ["Jätti yhteydenoton", "lead_submitted"]] },
  muutosturva: { label: "Muutosturva", short: "/muutosturva", paths: ["/muutosturva"], leadSource: "muutosturva-kartoitus", steps: [["Kävi Muutosturva-sivulla", "page_view"], ["Avasi kartoituksen", "assessment_opened"], ["Täytti vaiheen 1", "assessment_step1_completed"], ["Lähetti kartoituksen", "assessment_submitted"]] },
  kasvu: { label: "Kasvu", short:"/kasvu", paths:["/kasvu"], steps:[["Kävi sivulla","page_view"],["Jätti yhteydenoton","lead_submitted"]] },
  hub: {label:"Hub",short:"/hub",paths:["/hub","/hub/tyoelamaverkko"],steps:[["Kävi sivulla","page_view"],["Jätti yhteydenoton","lead_submitted"]]},
  osaaminen: {label:"Osaaminen",short:"/osaaminen",paths:["/osaaminen"],steps:[["Kävi sivulla","page_view"],["Jätti yhteydenoton","lead_submitted"]]},
  aly: { label: "Äly – tekoälypätevyydet", short: "/aly", paths: ["/aly"], steps: [["Kävi Äly-sivulla", "page_view"], ["Aloitti tekoälytestin", "ai_assessment_start"], ["Suoritti testin", "ai_assessment_complete"], ["Klikkasi ilmoittautumista", "course_registration_click"]] },
};
type AdRow = { campaign_id?: string; platform: "meta" | "google"; campaign: string; spend: number; impressions: number; clicks: number; currency: string };
const eur = (n: number) => new Intl.NumberFormat("fi-FI", { style: "currency", currency: "EUR", maximumFractionDigits: n < 100 ? 2 : 0 }).format(n);
const LEVELS: Record<string, string> = { coordinator: "AI Coordinator", manager: "AI Manager", director: "AI Director" };

function Bar({ name, value, max, sub, tone = "primary" }: { name: string; value: number; max: number; sub?: string; tone?: "primary" | "blue" | "amber" }) {
  const color = tone === "blue" ? "bg-keuda-blue" : tone === "amber" ? "bg-keuda-amber" : "bg-primary";
  return (
    <div className="space-y-1.5 min-w-0">
      <div className="flex justify-between text-sm gap-3"><span className="truncate min-w-0">{name}</span><span className="tabular-nums font-semibold shrink-0">{nf.format(value)}{sub && <span className="text-muted-foreground font-normal"> · {sub}</span>}</span></div>
      <div className="h-2 rounded-full bg-muted overflow-hidden"><div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${max ? Math.max((value / max) * 100, value ? 2 : 0) : 0}%` }} /></div>
    </div>
  );
}

function Kpi({ title, value, hint, icon: Icon, accent }: { title: string; value: string; hint?: string; icon: typeof Users; accent: string }) {
  return (
    <Card className="relative overflow-hidden border-border/70 shadow-sm">
      <span className={`absolute inset-x-0 top-0 h-1 ${accent}`} />
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-2"><p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground leading-tight">{title}</p><Icon className="h-4 w-4 text-muted-foreground shrink-0" /></div>
        <p className="text-2xl sm:text-3xl font-semibold tabular-nums mt-2 text-keuda-blue">{value}</p>
        {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
      </CardContent>
    </Card>
  );
}

function Panel({ title, desc, children, className = "" }: { title: string; desc?: string; children: ReactNode; className?: string }) {
  return (
    <Card className={`border-border/70 shadow-sm min-w-0 ${className}`}>
      <CardHeader className="pb-3 border-b bg-muted/30"><CardTitle className="text-sm font-semibold uppercase tracking-wide text-keuda-blue">{title}</CardTitle>{desc && <CardDescription className="text-xs">{desc}</CardDescription>}</CardHeader>
      <CardContent className="pt-4">{children}</CardContent>
    </Card>
  );
}

function List({ rows, empty = "Ei vielä tietoja tältä ajalta.", tone }: { rows: [string, number, string?][]; empty?: string; tone?: "primary" | "blue" | "amber" }) {
  if (!rows.length) return <p className="text-sm text-muted-foreground">{empty}</p>;
  const max = Math.max(...rows.map((r) => r[1]));
  return <div className="space-y-3">{rows.slice(0, 10).map(([n, v, s]) => <Bar key={n} name={n} value={v} max={max} sub={s} tone={tone} />)}</div>;
}

export default function AdminMarketingPage() {
  const { user, loading, isEditor, roleLoading, signOut } = useAuth();
  const [params, setParams] = useSearchParams();
  const requestedTab = params.get('tab') ?? 'overview';
  const tab = ['overview', 'leads', 'tasks', 'sales', 'campaigns', 'users'].includes(requestedTab) ? requestedTab : 'overview';
  const requestedService = params.get('palvelu') ?? 'all';
  const service = SERVICES[requestedService] ? requestedService : 'all';
  const days = [7, 30, 90, 365].includes(Number(params.get("pv"))) ? Number(params.get("pv")) : 30;
  const setParam = (k: string, v: string | null) => { const n = new URLSearchParams(params); if (v) n.set(k, v); else n.delete(k); setParams(n, { replace: true }); };
  const since = useMemo(() => {
    const now = new Date();
    const day = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Helsinki' }).format(now);
    const start = new Date(`${day}T12:00:00Z`); start.setUTCDate(start.getUTCDate() - days + 1);
    const date = start.toISOString().slice(0,10);
    const summer = new Intl.DateTimeFormat('en-US', { timeZone:'Europe/Helsinki', timeZoneName:'shortOffset' }).format(new Date(`${date}T00:00:00Z`)).includes('GMT+3');
    return new Date(`${date}T00:00:00${summer?'+03:00':'+02:00'}`).toISOString();
  }, [days]);
  const qc = useQueryClient();
  const svc = SERVICES[service];

  const events = useQuery({
    queryKey: ["mkt_events", since],
    enabled: !!user && isEditor,
    queryFn: async () => {
      return readAll<Ev>((from,to) => supabase.from('marketing_events').select('session_id,event,path,utm_source,utm_medium,utm_campaign,device,props,created_at').gte('created_at', since).order('created_at', {ascending:true}).order('id').range(from,to) as unknown as PromiseLike<{data:Ev[]|null;error:unknown}>);
    },
  });
  const leads = useQuery({
    queryKey: ["mkt_leads"],
    enabled: !!user && isEditor,
    queryFn: async () => {
      return readAll<Lead>((from,to) => supabase.from('booking_requests').select('*').order('created_at', {ascending:false}).order('id').range(from,to));
    },
  });

  const team = useQuery({queryKey:['crm_team'], enabled:!!user&&isEditor, queryFn:async()=>{const {data,error}=await supabase.functions.invoke('admin-users',{body:{action:'team'}});if(error)throw error;return data.users as TeamMember[];}});
  const tasks = useQuery({queryKey:['crm_tasks'],enabled:!!user&&isEditor,queryFn:()=>readAll((from,to)=>supabase.from('crm_tasks').select('*').order('due_at').order('id').range(from,to))});
  const campaigns = useQuery({queryKey:['crm_campaigns'],enabled:!!user&&isEditor,queryFn:()=>readAll((from,to)=>supabase.from('marketing_campaigns').select('*').order('created_at',{ascending:false}).order('id').range(from,to))});

  const ads = useQuery({
    queryKey: ["ad_spend", days],
    enabled: !!user && isEditor,
    retry: false,
    staleTime: 15 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("ad-spend", { body: { days } });
      if (error || !data?.ok) throw new Error("ad-spend");
      return data as { rows: AdRow[]; status: Record<"meta" | "google", { connected: boolean; error?: string }> };
    },
  });

  const s = useMemo(() => {
    const all = events.data ?? [];
    const allLeads = (leads.data ?? []).filter(l=>l.created_at>=since);
    const ev = svc.paths ? all.filter(e=>e.path && svc.paths?.includes(e.path)) : all;
    const ld = service==='all' ? allLeads : allLeads.filter(l=>l.service_key===service || (!l.service_key && svc.leadSource && l.source===svc.leadSource));
    const views = ev.filter((e) => e.event === "page_view");
    const sessions = new Set(views.map((e) => e.session_id));
    const srcSessions = countBy(views, (e) => label(e.utm_source), (e) => e.session_id);
    const srcLeads = new Map(countBy(ld, (l) => l.session_id ? label(l.utm_source) : "Kohdistus puuttuu"));
    const convertedByChannel = new Map(countBy(ld.filter(l=>l.session_id && sessions.has(l.session_id)),l=>label(l.utm_source),l=>l.session_id ?? l.id));
    const channels = srcSessions.map(([k, v]) => [k, v, `${srcLeads.get(k) ?? 0} yht. (${pct(convertedByChannel.get(k) ?? 0, v)})`] as [string, number, string]);
    srcLeads.forEach((v, k) => { if (!srcSessions.find((c) => c[0] === k)) channels.push([k, 0, `${v} yht.`]); });
    const courseOf = (e: Ev) => { const p = e.props ?? {}; if (typeof p.course === "string") return p.course as string; const lv = (p.level ?? p.result) as string | undefined; return lv ? LEVELS[lv] ?? lv : null; };
    const funnelCounts = orderedFunnel(ev, svc.steps.map(([,k])=>k), svc.paths);
    const funnel = svc.steps.map(([n],i)=>[n,funnelCounts[i]] as [string,number]);
    return {
      sessions: sessions.size,
      views: views.length,
      funnel,
      conversion: pct(funnel[funnel.length - 1][1], funnel[0][1]),
      leadsTotal: ld.length,
      newLeads: ld.filter((l) => l.status === "uusi").length,
      won: ld.filter((l) => l.status === "koulutukseen").length,
      leads: ld,
      channels,
      campaigns: countBy(views.filter((e) => e.utm_campaign), (e) => e.utm_campaign, (e) => e.session_id),
      pages: countBy(views, (e) => e.path),
      devices: countBy(views, (e) => e.device, (e) => e.session_id),
      courses: countBy(ev.filter((e) => ["course_selected", "assessment_submitted", "keuda_external_opened", "course_registration_click", "ai_assessment_complete"].includes(e.event)), courseOf),
      actions: countBy(ev.filter((e) => e.event !== "page_view" && !e.event.startsWith("ai_result_")), (e) => EVENT_NAMES[e.event] ?? e.event),
      statuses: countBy(ld, (l) => l.status),
    };
  }, [events.data, leads.data, svc, service, since]);

  const allServiceLeads = (leads.data ?? []).filter(l=>service==='all'||l.service_key===service||(!l.service_key&&svc.leadSource===l.source));
  const mapped = campaigns.data ?? [];
  const matchesAd = (c:typeof mapped[number], r:AdRow) => c.platform===r.platform && (c.ad_campaign_id && r.campaign_id ? c.ad_campaign_id===r.campaign_id : c.ad_campaign_name===r.campaign);
  const adRows = (ads.data?.rows ?? []).filter(r=>service==='all'||mapped.some(c=>c.service_key===service&&matchesAd(c,r)));
  const metaSpend = adRows.filter(r=>r.platform==='meta').reduce((a,r)=>a+r.spend,0);
  const googleSpend = adRows.filter(r=>r.platform==='google').reduce((a,r)=>a+r.spend,0);
  const totalSpend = metaSpend+googleSpend;
  const metaOk = !!ads.data?.status.meta.connected && !ads.data?.status.meta.error;
  const googleOk = !!ads.data?.status.google.connected && !ads.data?.status.google.error;
  const metaLeads = s.leads.filter(l=>paidPlatform(l.utm_source,l.utm_medium)==='meta').length;
  const googleLeads = s.leads.filter(l=>paidPlatform(l.utm_source,l.utm_medium)==='google').length;
  const paidLeads=metaLeads+googleLeads;
  const cpl=(sp:number,n:number)=>(n?eur(sp/n):'–');
  const campaignRows=adRows.map(r=>({...r,leads:s.leads.filter(l=>paidPlatform(l.utm_source,l.utm_medium)===r.platform && l.utm_campaign && (mapped.some(c=>matchesAd(c,r)&&c.utm_source===l.utm_source&&c.utm_campaign===l.utm_campaign) || normalizeCampaign(l.utm_campaign)===normalizeCampaign(r.campaign))).length})).sort((a,b)=>b.spend-a.spend);
  const unknownCampaigns=(ads.data?.rows??[]).filter(r=>!mapped.some(c=>matchesAd(c,r))).length;
  const viewSessions = new Set((events.data??[]).filter(e=>e.event==='page_view' && (!svc.paths || (e.path && svc.paths.includes(e.path)))).map(e=>e.session_id));
  const consentSessions = new Set(s.leads.filter(l=>l.session_id && viewSessions.has(l.session_id)).map(l=>l.session_id));
  const knownConversion = pct(consentSessions.size,s.sessions);
  const saved=()=>{qc.invalidateQueries({queryKey:['mkt_leads']});qc.invalidateQueries({queryKey:['crm_tasks']});qc.invalidateQueries({queryKey:['crm_campaigns']});qc.invalidateQueries({queryKey:['lead_activity']});};

  if (loading || roleLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  if (!user) return <Navigate to="/admin/login" replace />;
  if (!isEditor) return <Navigate to="/admin/yhteydenotot" replace />;

  const refresh = () => { events.refetch(); leads.refetch(); ads.refetch(); tasks.refetch(); campaigns.refetch(); team.refetch(); };
  const busy = events.isFetching || leads.isFetching || ads.isFetching;

  const exportCsv = () => {
    const rows = [["Saapui", "Nimi", "Sähköposti", "Puhelin", "Lähde", "Kanava", "Kampanja", "Tila", "Käsittelijä", "Muistiinpanot"], ...allServiceLeads.map((l) => [fmt(l.created_at), l.name, l.email, l.phone ?? "", l.source ?? l.meeting_format, l.utm_source ?? "", l.utm_campaign ?? "", l.status, l.handled_by ?? "", l.notes ?? ""])];
    const csv = "\uFEFF" + rows.map((r) => r.map((c) => `"${( /^[=+@-]/.test(String(c)) ? "'" + String(c) : String(c)).replace(/"/g, '""')}"`).join(";")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    a.download = `yhteydenotot-${service}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="min-h-screen bg-muted/40 overflow-x-hidden">
      <SEO title="Markkinointi ja myynti – KeudaPRO" description="Markkinoinnin ja ostopolun seuranta." path="/admin/markkinointi" />
      <header className="bg-keuda-hero-surface text-primary-foreground">
        <div className="container mx-auto px-4 pt-5 pb-6 space-y-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-keuda-amber">KeudaPRO · Työtila</p>
              <h1 className="text-xl sm:text-2xl font-semibold mt-1 text-primary-foreground">Markkinointi ja myynti</h1>
              <p className="text-xs text-keuda-hero-muted truncate">{user.email}</p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Button asChild variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"><Link to="/admin" aria-label="Hallinnan etusivu"><Home className="h-4 w-4 sm:mr-2" /><span className="hidden sm:inline">Hallinta</span></Link></Button>
              <Button variant="ghost" size="sm" onClick={signOut} aria-label="Kirjaudu ulos" className="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"><LogOut className="h-4 w-4 sm:mr-2" /><span className="hidden sm:inline">Ulos</span></Button>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_220px_auto] gap-2">
            <label className="min-w-0"><span className="sr-only">Palvelu</span>
              <Select value={service} onValueChange={(v) => setParam("palvelu", v === "all" ? null : v)}>
                <SelectTrigger aria-label="Valitse palvelu" className="h-11 bg-background text-foreground"><Layers className="h-4 w-4 mr-2 text-muted-foreground shrink-0" /><SelectValue /></SelectTrigger>
                <SelectContent>{Object.entries(SERVICES).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent>
              </Select>
            </label>
            <label><span className="sr-only">Aikaväli</span>
              <Select value={String(days)} onValueChange={(v) => setParam("pv", v === "30" ? null : v)}>
                <SelectTrigger aria-label="Valitse aikaväli" className="h-11 bg-background text-foreground"><CalendarDays className="h-4 w-4 mr-2 text-muted-foreground shrink-0" /><SelectValue /></SelectTrigger>
                <SelectContent>{[[7, "Viimeiset 7 päivää"], [30, "Viimeiset 30 päivää"], [90, "Viimeiset 90 päivää"], [365, "Viimeiset 12 kk"]].map(([d, t]) => <SelectItem key={d} value={String(d)}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </label>
            <Button variant="secondary" className="h-11" onClick={refresh} disabled={busy}><RefreshCw className={`mr-2 h-4 w-4 ${busy ? "animate-spin" : ""}`} />Päivitä</Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-5 sm:py-6">
        <Tabs value={tab} onValueChange={(v) => setParam("tab", v === "overview" ? null : v)}>
          <TabsList className="mb-5 grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 h-auto p-1 bg-background border shadow-sm sm:w-auto sm:inline-grid">
            <TabsTrigger value="overview" className="py-2 data-[state=active]:bg-keuda-blue data-[state=active]:text-primary-foreground"><BarChart3 className="h-4 w-4 sm:mr-2" /><span className="text-xs sm:text-sm">Yleiskuva</span></TabsTrigger>
            <TabsTrigger value="leads" className="py-2 data-[state=active]:bg-keuda-blue data-[state=active]:text-primary-foreground"><Inbox className="h-4 w-4 sm:mr-2" /><span className="text-xs sm:text-sm">Asiakkaat</span></TabsTrigger>
            <TabsTrigger value="users" className="py-2 data-[state=active]:bg-keuda-blue data-[state=active]:text-primary-foreground"><Users className="h-4 w-4 sm:mr-2" /><span className="text-xs sm:text-sm">Käyttäjät</span></TabsTrigger>
            <TabsTrigger value="tasks" className="py-2 data-[state=active]:bg-keuda-blue data-[state=active]:text-primary-foreground">Tehtävät</TabsTrigger>
            <TabsTrigger value="sales" className="py-2 data-[state=active]:bg-keuda-blue data-[state=active]:text-primary-foreground">Myyntitulokset</TabsTrigger>
            <TabsTrigger value="campaigns" className="py-2 data-[state=active]:bg-keuda-blue data-[state=active]:text-primary-foreground">Kampanjalinkit</TabsTrigger>
          </TabsList>
          {(events.isError||leads.isError||tasks.isError||team.isError||campaigns.isError)&&<p role="alert" className="border border-destructive bg-background text-destructive p-3 rounded-lg mb-4 text-sm">Kaikkia tietoja ei saatu haettua. Puuttuvia tietoja ei voi tulkita nollatulokseksi. Kokeile Päivitä.</p>}
          <p className="text-xs text-muted-foreground mb-4">Käynnit päivitetty: {events.dataUpdatedAt?fmt(new Date(events.dataUpdatedAt).toISOString()):'–'} · Mainoskulut: {ads.dataUpdatedAt?fmt(new Date(ads.dataUpdatedAt).toISOString()):'–'} · Suomen aika</p>

          <TabsContent value="overview" className="space-y-4 mt-0">
            <div className="flex flex-wrap items-center gap-2 text-sm"><Badge className="bg-keuda-blue text-primary-foreground hover:bg-keuda-blue">{svc.label}</Badge><span className="text-muted-foreground">{svc.short} · {days === 365 ? "12 kk" : `${days} pv`}</span></div>
            {events.isLoading || leads.isLoading ? <Loader2 className="h-6 w-6 animate-spin mx-auto my-10 text-muted-foreground" /> : events.isError || leads.isError ? <p className="text-muted-foreground">Mittarit eivät ole saatavilla.</p> : <>
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                <Kpi icon={Eye} accent="bg-keuda-blue" title="Käynnit" value={nf.format(s.sessions)} hint={`${nf.format(s.views)} sivunäyttöä`} />
                <Kpi icon={Inbox} accent="bg-primary" title="Yhteydenotot" value={nf.format(s.leadsTotal)} hint={`Seuratuista käynneistä ${knownConversion}`} />
                <Kpi icon={Target} accent="bg-keuda-amber" title="Polun konversio" value={s.conversion} hint="Ensimmäisestä viimeiseen vaiheeseen" />
                <Kpi icon={Clock} accent="bg-destructive" title="Käsittelemättä" value={nf.format(s.newLeads)} hint="Tila: uusi" />
                <Kpi icon={GraduationCap} accent="bg-primary" title="Koulutukseen" value={nf.format(s.won)} hint={`Yhteydenotoista ${pct(s.won, s.leadsTotal)}`} />
              </div>

              <Panel title={`Ostopolku – ${svc.label}`} desc="Montako käyntiä eteni kuhunkin vaiheeseen. Prosentti on osuus edellisestä vaiheesta.">
                <ol className="grid gap-3 sm:grid-cols-4">
                  {s.funnel.map(([n, v], i) => (
                    <li key={n} className="rounded-lg border bg-muted/30 p-3 min-w-0">
                      <div className="flex items-center gap-2"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-keuda-blue text-xs font-semibold text-primary-foreground">{i + 1}</span><span className="text-xs text-muted-foreground leading-tight">{n}</span></div>
                      <p className="text-2xl font-semibold tabular-nums mt-2">{nf.format(v)}</p>
                      <div className="h-1.5 rounded-full bg-muted mt-2 overflow-hidden"><div className="h-full bg-keuda-blue rounded-full" style={{ width: `${s.funnel[0][1] ? (v / s.funnel[0][1]) * 100 : 0}%` }} /></div>
                      <p className="text-xs text-muted-foreground mt-1">{i ? `${pct(v, s.funnel[i - 1][1])} edellisestä` : "Lähtötaso"}</p>
                    </li>
                  ))}
                </ol>
              </Panel>


              <Panel title="Mainoskulut ja hinta per yhteydenotto" desc="Meta (Facebook, Instagram) ja Google Ads. Yhteydenotot yhdistetään mainoksiin linkin utm_source- ja utm_campaign-tunnisteilla.">
                {ads.isLoading ? <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /> : ads.isError ? <p className="text-sm text-muted-foreground">Mainoskulujen haku epäonnistui. Yritä Päivitä-painikkeella uudelleen.</p> : <div className="space-y-5">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {([["Mainoskulut yhteensä", metaOk&&googleOk?eur(totalSpend):"Ei saatavilla", `${nf.format(paidLeads)} yhteydenottoa mainoksista`], ["Hinta / yhteydenotto", metaOk&&googleOk?cpl(totalSpend, paidLeads):"–", "Kaikki maksetut kanavat"], ["Meta (FB + IG)", metaOk?eur(metaSpend):"Ei saatavilla", metaOk?`${cpl(metaSpend, metaLeads)} / yhteydenotto`:(ads.data?.status.meta.error??"Ei yhdistetty")], ["Google Ads", !googleOk ? "Ei saatavilla" : eur(googleSpend), !googleOk ? (ads.data?.status.google.error??"Ei yhdistetty") : `${cpl(googleSpend, googleLeads)} / yhteydenotto`]] as [string, string, string][]).map(([t, v, h]) => (
                      <div key={t} className="rounded-lg border bg-muted/30 p-3 min-w-0"><p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{t}</p><p className="text-xl font-semibold tabular-nums mt-1 text-keuda-blue">{v}</p><p className="text-xs text-muted-foreground mt-0.5">{h}</p></div>
                    ))}
                  </div>
                  {campaignRows.length === 0 ? <p className="text-sm text-muted-foreground">{metaOk&&googleOk?`Ei mainoskuluja tällä aikavälillä${service !== "all" ? " tähän palveluun yhdistetyissä kampanjoissa" : ""}.`:"Kaikkien mainosalustojen tietoja ei ole saatavilla. Kokonaiskuluja ei voida vahvistaa."}</p> :
                    <div className="overflow-x-auto -mx-1"><table className="w-full text-sm min-w-[560px]"><thead><tr className="text-left text-xs uppercase tracking-wide text-muted-foreground border-b"><th className="py-2 px-1 font-medium">Kampanja</th><th className="py-2 px-1 font-medium">Kanava</th><th className="py-2 px-1 font-medium text-right">Kulut</th><th className="py-2 px-1 font-medium text-right">Klikit</th><th className="py-2 px-1 font-medium text-right">Yhteydenotot</th><th className="py-2 px-1 font-medium text-right">€ / yht.</th></tr></thead>
                      <tbody>{campaignRows.map((r) => <tr key={r.platform + r.campaign} className="border-b last:border-0"><td className="py-2 px-1 max-w-[220px] truncate">{r.campaign}</td><td className="py-2 px-1">{r.platform === "meta" ? "Meta" : "Google"}</td><td className="py-2 px-1 text-right tabular-nums">{eur(r.spend)}</td><td className="py-2 px-1 text-right tabular-nums">{nf.format(r.clicks)}</td><td className="py-2 px-1 text-right tabular-nums">{r.leads}</td><td className="py-2 px-1 text-right tabular-nums font-semibold">{cpl(r.spend, r.leads)}</td></tr>)}</tbody></table></div>}
                  <p className="text-xs text-muted-foreground">{unknownCampaigns} mainosalustan kampanjaa ilman palvelukohdistusta. Kohdistus tehdään Kampanjalinkit-välilehdellä. Hinta per yhteydenotto perustuu vain maksetun liikenteen tunnistettuihin yhteydenottoihin, ei orgaaniseen Google-liikenteeseen. Ulkoisen koulutuksen klikkaus ei ole vahvistettu kauppa.</p>
                </div>}
              </Panel>
              <div className="grid lg:grid-cols-2 gap-4">
                <Panel title="Kanavat" desc="Käynnit ja yhteydenotot lähteittäin"><List rows={s.channels} tone="blue" /></Panel>
                <Panel title="Kampanjat" desc="Linkit, joissa on utm_campaign-tunniste"><List rows={s.campaigns} tone="amber" empty="Ei kampanjalinkkejä tältä ajalta. Lisää mainoslinkkeihin utm_campaign." /></Panel>
                <Panel title={service === "aly" ? "Kiinnostavimmat tasot" : "Kiinnostavimmat koulutukset"} desc="Valinnat, testitulokset ja ilmoittautumisklikkaukset"><List rows={s.courses} /></Panel>
                <Panel title="Suosituimmat sivut"><List rows={s.pages} tone="blue" /></Panel>
                <Panel title="Toiminnot" desc="Klikkaukset ja lomakkeiden vaiheet"><List rows={s.actions} /></Panel>
                <Panel title="Laitteet ja yhteydenottojen tila"><div className="space-y-6"><List rows={s.devices} tone="blue" /><List rows={s.statuses} tone="amber" empty="Ei yhteydenottoja." /></div></Panel>
              </div>
              <p className="text-xs text-muted-foreground">Seuranta on nimetöntä ja koskee vain kävijöitä, jotka hyväksyvät evästeet. Todellinen kävijämäärä on siksi suurempi. Tiedot kertyvät 21.10.2026 alkaen.</p>
            </>}
          </TabsContent>

          <TabsContent value="leads" className="space-y-3 mt-0">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2"><p className="text-sm text-muted-foreground">{svc.label}: merkitse tila ja muistiinpanot, niin näet mistä kanavista tulee oikeita aloittajia.</p><Button size="sm" variant="outline" className="self-start shrink-0" onClick={exportCsv}><Download className="mr-2 h-4 w-4" />Lataa Excel (CSV)</Button></div>
            {leads.isLoading||tasks.isLoading||team.isLoading?<Loader2 className="h-5 w-5 animate-spin"/>:leads.isError||tasks.isError||team.isError?<p>Tiedot eivät ole saatavilla.</p>:<CrmLeads leads={allServiceLeads} tasks={tasks.data??[]} team={team.data??[]} me={{id:user.id,email:user.email??''}} onSaved={saved}/>}
          </TabsContent>
          <TabsContent value="tasks"><TasksPanel tasks={tasks.data??[]} leads={allServiceLeads} team={team.data??[]} me={{id:user.id,email:user.email??''}} onSaved={saved}/></TabsContent>
          <TabsContent value="sales"><SalesPanel leads={allServiceLeads} since={since}/></TabsContent>
          <TabsContent value="campaigns"><CampaignPanel campaigns={mapped} ads={ads.data?.rows??[]} service={service} onSaved={saved}/></TabsContent>

          <TabsContent value="users" className="mt-0"><UsersPanel /></TabsContent>
        </Tabs>
      </main>
    </div>
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
