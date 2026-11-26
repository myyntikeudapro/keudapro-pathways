import { productionFlow } from '@/lib/companyFlow';
import { FlowStepper } from '@/components/admin/FlowStepper';
import { WorkspaceHeader, headerGhost } from '@/components/admin/WorkspaceHeader';
import { WorkspaceNav } from "@/components/admin/WorkspaceNav";
import { AttendancePanel } from '@/components/admin/AttendancePanel';
import { WorkspaceSummary as SummaryCard } from "@/components/admin/WorkspaceSummary";
import { WorkspaceIdentity, WorkspacePerson } from "@/components/admin/WorkspacePerson";
import { useState, type FormEvent, type ReactNode } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useProductionData } from '@/hooks/useProductionData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Choice } from '@/components/admin/CrmWorkspace';
import { SEO } from '@/components/seo/SEO';
import { dateTime, readAll } from '@/lib/crm';
import { EMPTY_PRODUCTION, EXCEPTION_LABEL, PRODUCTION_QUEUES, exceptions, productionQueue, readiness } from '@/lib/productionCenter';
import { AlertTriangle, ArrowLeft, CheckCircle2, ClipboardList, Activity, Loader2, LogOut, RefreshCw, ChevronDown, UserRound, Users, Layers, Pencil, Trash2, X, type LucideIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { CompanyTrainingSales } from '@/components/admin/CompanyTrainingSales';
import { CompanyTrainerCapacity, CompanyHandoffsPanel } from '@/components/admin/CompanyTrainingProduction';
import { helsinkiIso as local, helsinkiLocal } from '@/lib/helsinkiTime';
import { sessionInput, bookingToReuse } from '@/lib/productionSession';
import { billingEligible } from '@/lib/billingReadiness';
import { STAGE_LABEL, boardRow, boardRows, timeline, type BoardRow, type CardTab, type Tone } from '@/lib/productionBoard';

type Member = { id: string; email: string; kind?: string };
const db = supabase as any;
const STATUS: [string, string][] = [['suunnittelu', 'Suunnittelu'], ['käynnissä', 'Käynnissä'], ['päättynyt', 'Päättynyt'], ['peruttu', 'Peruttu']];
const COMPLETION: [string, string][] = [['ilmoittautunut', 'Ilmoittautunut'], ['kesken', 'Kesken'], ['suoritettu', 'Suoritettu'], ['keskeytynyt', 'Keskeytynyt']];
const CERT: [string, string][] = [['ei_aloitettu', 'Ei aloitettu'], ['valmisteilla', 'Valmisteilla'], ['myönnetty', 'Myönnetty'], ['ei_oikeutta', 'Ei oikeutta']];
const PAYMENT: [string, string][] = [['ei_laskutettu', 'Ei laskutettu'], ['laskutettu', 'Laskutettu'], ['maksettu', 'Maksettu']];

function Section({ title, children, open = false }: { title: string; children: ReactNode; open?: boolean }) {
  return <details open={open} className="group rounded-xl border bg-card shadow-card"><summary className="flex cursor-pointer list-none items-center justify-between gap-2 p-4 sm:px-5"><h3 className="text-base font-semibold text-keuda-navy-section">{title}</h3><ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180" aria-hidden /></summary><div className="space-y-3 border-t p-4 sm:p-5">{children}</div></details>;
}

function Zone({ title, icon: Icon, tint, open = false, children }: { title: string; icon: LucideIcon; tint?: boolean; open?: boolean; children: ReactNode }) {
  return <details open={open} className={`group rounded-2xl ${tint ? 'border border-border/70 bg-ws-tint' : 'border border-transparent'}`}>
    <summary className={`flex cursor-pointer list-none items-center justify-between gap-2 rounded-2xl py-3 ${tint ? 'px-4 sm:px-5' : 'px-1'} hover:bg-ws-tint`}><h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-ws-area"><Icon className="h-4 w-4" aria-hidden />{title}</h2><span className="flex items-center gap-1 text-xs text-muted-foreground"><span className="group-open:hidden">Avaa</span><span className="hidden group-open:inline">Sulje</span><ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" aria-hidden /></span></summary>
    <div className={`space-y-4 ${tint ? 'px-4 pb-4 sm:px-5 sm:pb-5' : 'pb-2'}`}>{children}</div>
  </details>;
}

function Card({ children }: { children: ReactNode }) {
  return <div className="rounded-xl border bg-card p-4 shadow-card sm:p-5">{children}</div>;
}

export default function AdminProductionPage() {
  const { user, loading, roleLoading, isEditor, signOut } = useAuth();
  if (loading || roleLoading) return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-6 w-6 animate-spin" aria-label="Tarkistetaan käyttöoikeutta" /></div>;
  if (!user) return <Navigate to="/admin/login" replace />;
  return <div className="ws-page ws-with-nav ws-area-production"><WorkspaceNav />
    <SEO title="Tuotanto – KeudaPRO" description="Koulutustuotannon työtila." path="/admin/tuotanto" />
    <WorkspaceHeader title="Koulutustuotanto" subtitle="Toteutusten valmius, poikkeamat ja vastuut yhdellä näkymällä" onSignOut={signOut} home={isEditor} actions={<WorkspaceIdentity />} />
    <main className="container mx-auto space-y-8 px-4 py-8">{isEditor ? <StaffView userId={user.id} /> : <TrainerView />}</main>
  </div>;
}

function useAct() {
  const qc = useQueryClient(); const { toast } = useToast();
  return useMutation({
    mutationFn: async (fn: () => PromiseLike<{ error: { message: string } | null }>) => { const { error } = await fn(); if (error) throw new Error(error.message); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['production_data'] }); qc.invalidateQueries({ queryKey: ['prod_detail'] }); qc.invalidateQueries({ queryKey: ['trainer_view'] }); qc.invalidateQueries({ queryKey: ['attendance'] }); qc.invalidateQueries({ queryKey: ['company_handoffs'] }); qc.invalidateQueries({ queryKey: ['flow_board'] }); },
    onError: (e: Error) => toast({ title: 'Tallennus ei onnistunut', description: e.message.includes('PROD_SESSION_NOT_ENDED') ? 'Toteuman voi kirjata vasta session päätyttyä.' : e.message.includes('PROD_BILLING_ACTUALS_REQUIRED') ? 'Laskutusvalmius vaatii kaikkien päättyneiden sessioiden toteumat.' : e.message, variant: 'destructive' }),
  });
}

function StaffView({ userId }: { userId: string }) {
  const [params, setParams] = useSearchParams();
  const query = useProductionData(true);
  const data = query.data ?? EMPTY_PRODUCTION;
  const team = useQuery({ queryKey: ['prod_team'], queryFn: async () => { const { data, error } = await supabase.functions.invoke('admin-users', { body: { action: 'team' } }); if (error) throw error; return data.users as Member[]; } });
  const { user } = useAuth();
  const email = (id: string | null) => (id === user?.id ? user?.email : id && team.data?.find(m => m.id === id)?.email) || (id ? 'Käyttäjä (hakemistotieto puuttuu)' : 'Ei vastuuhenkilöä');
  const now = new Date();
  const queue = params.get('jono'); const mine = params.get('omat') === '1'; const selected = params.get('toteutus');
  if (query.isPending) return <p role="status" className="flex items-center gap-2"><Loader2 className="h-5 w-5 animate-spin" />Ladataan…</p>;
  if (query.isError) return <p role="alert" className="text-destructive">Tuotannon tietoja ei voitu hakea.</p>;
  if (selected) return <DeliveryDetail id={selected} data={data} team={team.data ?? []} email={email} back={() => { params.delete('toteutus'); setParams(params); }} />;
  const exc = exceptions(data, now);
  const rows = queue ? productionQueue(data, queue, now, mine ? userId : undefined) : null;
  const active = data.deliveries.filter(d => d.production_status !== 'päättynyt' && d.production_status !== 'peruttu');
  const readyN = active.filter(d => readiness(data, d.id).ready).length;
  const running = data.deliveries.filter(d => d.production_status === 'käynnissä').length;
  const planning = data.deliveries.filter(d => d.production_status === 'suunnittelu').length;
  const mineN = boardRows(data, now, userId).length;
  const queueBar = <div className="flex flex-wrap items-center gap-2 rounded-xl border bg-card p-3 shadow-card">{Object.entries(PRODUCTION_QUEUES).map(([k, label]) => <Button key={k} size="sm" variant={queue === k ? 'default' : 'outline'} onClick={() => setParams({ jono: k, ...(mine ? { omat: '1' } : {}) })}>{label} <span className="ml-1.5 rounded-full bg-muted px-1.5 text-xs tabular-nums text-foreground">{productionQueue(data, k, now, mine ? userId : undefined).length}</span></Button>)}
      <Button size="sm" variant={mine ? 'secondary' : 'ghost'} onClick={() => { mine ? params.delete('omat') : params.set('omat', '1'); setParams(params); }}>{mine ? 'Näytä koko tiimi' : 'Vain omat vastuut (jonot ja lista)'}</Button>
      {queue && <Button size="sm" variant="ghost" onClick={() => setParams({})}>Kaikki toteutukset</Button>}
      <Button size="sm" variant="outline" className="ml-auto border-ws-bronze/50 text-ws-bronze hover:bg-ws-bronze-light hover:text-ws-bronze" disabled={query.isFetching} onClick={() => query.refetch()}><RefreshCw className={`mr-2 h-4 w-4 ${query.isFetching ? 'animate-spin' : ''}`} />Päivitä</Button></div>;
  return <>
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <SummaryCard icon={Activity} label="Tuotannon tila" value={`${active.length} aktiivista`} meta={`${running} käynnissä · ${planning} suunnittelussa`} />
      <SummaryCard icon={UserRound} tone="accent" label="Vastuuhenkilö" person={team.data?.find(m => m.id === userId) ?? { id: userId, email: email(userId) }} value={`${mineN} omaa`} meta={email(userId)} />
      <SummaryCard icon={CheckCircle2} tone={readyN === active.length ? 'ok' : 'warn'} label="Aloitusvalmius" value={`${readyN} / ${active.length} valmis`} meta={active.length - readyN ? `${active.length - readyN} ei aloitusvalmis` : 'Kaikki aloitusvalmiita'} />
      <SummaryCard icon={AlertTriangle} tone={exc.length ? 'risk' : 'ok'} label="Poikkeamat" value={exc.length} meta={exc.length ? 'Vaatii toimenpiteitä' : 'Ei avoimia poikkeamia'} />
    </div>
    {queueBar}
    {rows ? <section aria-label={queue ? PRODUCTION_QUEUES[queue] : undefined} className="divide-y overflow-hidden rounded-xl border bg-card shadow-card">{rows.length === 0 && <p className="p-4 text-sm text-muted-foreground">Ei rivejä.</p>}{rows.map(r => <Button variant="ghost" key={r.id} className="h-auto w-full justify-start whitespace-normal rounded-none p-4 text-left" onClick={() => setParams({ toteutus: r.deliveryId })}><span><span className="block font-semibold text-keuda-navy-section">{r.title}</span><span className="block text-xs text-muted-foreground">{r.detail} · <WorkspacePerson person={team.data?.find(m => m.id === r.ownerId)} name={email(r.ownerId)} size="xs" /></span></span></Button>)}</section> : <>
      <Zone title="Kriittinen tila" icon={AlertTriangle} open>
        {exc.length > 0 && <div className="rounded-xl border border-destructive/40 border-l-4 border-l-destructive bg-ws-risk-light p-4 shadow-card sm:p-5">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-destructive"><AlertTriangle className="h-5 w-5" />Poikkeamat ({exc.length})</h3>
          <ul className="mt-3 divide-y divide-destructive/15 text-sm">{exc.slice(0, 8).map(e => <li key={e.key} className="flex flex-wrap items-center gap-2 py-2"><Badge variant="destructive">{EXCEPTION_LABEL[e.kind]}</Badge><button className="font-medium text-foreground underline-offset-2 hover:underline" onClick={() => setParams({ toteutus: e.deliveryId })}>{e.label}</button><span className="text-xs text-muted-foreground">· <WorkspacePerson person={team.data?.find(m => m.id === e.ownerId)} name={email(e.ownerId)} size="xs" /></span></li>)}</ul>
          {exc.length > 8 && <Button size="sm" variant="outline" className="mt-2" onClick={() => setParams({ jono: 'exceptions' })}>Näytä kaikki {exc.length}</Button>}
        </div>}
        <WorkList data={data} now={now} mineId={mine ? userId : undefined} team={team.data ?? []} email={email} open={id => setParams({ toteutus: id })} />
      </Zone>
      <Zone title="Yrityskoulutukset: luovutukset ja kapasiteetti" icon={Layers} open>
        <Card><CompanyHandoffsPanel userId={userId} /></Card>
        <Card><CompanyTrainingSales /></Card>
      </Zone>
      <Zone title="Uusi toteutus" icon={Activity} tint><Card><CreateDelivery /></Card></Zone>
    </>}
  </>;
}

const TONE: Record<Tone, { dot: string; text: string; label: string }> = {
  ok: { dot: 'bg-ws-ok', text: 'text-ws-ok', label: 'Kunnossa' }, warn: { dot: 'bg-ws-warn', text: 'text-ws-warn', label: 'Seurattava' }, risk: { dot: 'bg-destructive', text: 'text-destructive', label: 'Este' },
};
function Light({ tone }: { tone: Tone }) { return <span className={`inline-block h-2.5 w-2.5 shrink-0 rounded-full ${TONE[tone].dot}`} aria-label={TONE[tone].label} />; }

function WorkList({ data, now, mineId, team, email, open }: { data: typeof EMPTY_PRODUCTION; now: Date; mineId?: string; team: Member[]; email: (id: string | null) => string; open: (id: string) => void }) {
  const [params, setParams] = useSearchParams();
  const view = params.get('nakyma') === 'aikajana' ? 'aikajana' : 'lista';
  const onlyUnscheduled = params.get('vaihe') === 'aikatauluttamatta';
  const all = boardRows(data, now, mineId);
  const rows = onlyUnscheduled ? all.filter(r => r.stage === 'aikatauluttamatta') : all;
  const unscheduled = all.filter(r => r.stage === 'aikatauluttamatta').length;
  const set = (k: string, v: string | null) => { const n = new URLSearchParams(params); v ? n.set(k, v) : n.delete(k); setParams(n); };
  const person = (id: string) => <WorkspacePerson person={team.find(m => m.id === id)} name={email(id)} size="xs" />;
  return <section className="rounded-xl border bg-card shadow-card">
    <div className="flex flex-wrap items-center gap-2 border-b px-4 py-3"><h3 className="mr-auto text-base font-semibold text-keuda-navy-section">Koulutukset <span className="text-xs font-normal text-muted-foreground">{rows.length} kpl{mineId ? ' · omat' : ''}</span></h3>
      <Button size="sm" variant={onlyUnscheduled ? 'default' : 'outline'} onClick={() => set('vaihe', onlyUnscheduled ? null : 'aikatauluttamatta')}>Aikatauluttamattomat <span className="ml-1.5 rounded-full bg-muted px-1.5 text-xs tabular-nums text-foreground">{unscheduled}</span></Button>
      <div className="inline-flex rounded-md border p-0.5" role="group" aria-label="Näkymä"><Button size="sm" variant={view === 'lista' ? 'secondary' : 'ghost'} aria-pressed={view === 'lista'} onClick={() => set('nakyma', null)}>Lista</Button><Button size="sm" variant={view === 'aikajana' ? 'secondary' : 'ghost'} aria-pressed={view === 'aikajana'} onClick={() => set('nakyma', 'aikajana')}>Aikajana</Button></div></div>
    {rows.length === 0 && <p className="p-4 text-sm text-muted-foreground">Ei koulutuksia tällä rajauksella.</p>}
    {view === 'lista' ? <ul className="divide-y">{rows.map(r => <li key={r.id}><button className="grid w-full gap-1 p-4 text-left hover:bg-ws-tint md:grid-cols-[minmax(0,2fr)_9rem_8rem_minmax(0,1fr)_minmax(0,2fr)] md:items-center md:gap-3" onClick={() => open(r.id)}>
      <span className="flex min-w-0 items-center gap-2"><Light tone={r.tone} /><span className="min-w-0 break-words font-semibold text-keuda-blue">{r.title}</span></span>
      <span><Badge variant="outline">{STAGE_LABEL[r.stage]}</Badge></span>
      <span className="text-xs text-muted-foreground">{r.firstStart ? dateTime(r.firstStart) : 'Ei aikataulua'}</span>
      <span className="text-xs">{person(r.ownerId)}</span>
      <span className="text-xs"><span className={`block font-medium ${TONE[r.tone].text}`}>{r.reason}</span><span className="block text-muted-foreground">Seuraavaksi: {r.next}{r.total ? ` · kriittiset ${r.done}/${r.total}` : ''}</span></span>
    </button></li>)}</ul>
    : <div className="space-y-4 p-4">{(() => { const weeks = timeline(data, new Set(rows.map(r => r.id))); const byId = new Map(rows.map(r => [r.id, r]));
        if (!weeks.length) return <p className="text-sm text-muted-foreground">Ei aikataulutettuja sessioita.{unscheduled ? ` ${unscheduled} koulutusta odottaa aikataulutusta.` : ''}</p>;
        return weeks.map(([wk, items]) => { const trainerCount = new Map<string, number>(); items.forEach(i => i.trainers.forEach(t => trainerCount.set(t, (trainerCount.get(t) ?? 0) + 1)));
          return <div key={wk}><h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Viikko alkaen {new Date(`${wk}T12:00:00`).toLocaleDateString('fi-FI')}</h4>
            <ul className="divide-y rounded-lg border">{items.map(i => { const r = byId.get(i.deliveryId)!; return <li key={i.sessionId}><button className="flex w-full flex-wrap items-center gap-x-3 gap-y-1 p-3 text-left text-sm hover:bg-ws-tint" onClick={() => open(i.deliveryId)}><Light tone={r.tone} /><span className="w-40 shrink-0 text-xs tabular-nums text-muted-foreground">{dateTime(i.starts_at)}–{new Date(i.ends_at).toLocaleTimeString('fi-FI', { timeZone: 'Europe/Helsinki', hour: '2-digit', minute: '2-digit' })}</span><span className="min-w-0 flex-1 break-words"><strong>{r.title}</strong> · {i.title}</span><span className="text-xs">{i.trainers.length ? i.trainers.map(t => <span key={t} className="mr-2">{person(t)}{(trainerCount.get(t) ?? 0) > 1 ? <span className="ml-1 text-muted-foreground">({trainerCount.get(t)} sessiota viikolla)</span> : null}</span>) : <span className="text-destructive">Kouluttaja puuttuu</span>}</span></button></li>; })}</ul></div>; }); })()}</div>}
  </section>;
}

function CreateDelivery() {
  const act = useAct(); const [order, setOrder] = useState(''); const [tpl, setTpl] = useState('A');
  const orders = useQuery({ queryKey: ['prod_orders'], queryFn: async () => {
    const [o, d] = await Promise.all([readAll((f, t) => db.from('crm_orders').select('id,service_key,starts_on,organization_id,crm_organizations(name)').order('created_at').range(f, t)), readAll((f, t) => db.from('prod_deliveries').select('order_id').range(f, t))]);
    const used = new Set((d as any[]).map(x => x.order_id)); return (o as any[]).filter(x => !used.has(x.id));
  } });
  const templates = useQuery({ queryKey: ['prod_templates'], queryFn: async () => { const { data, error } = await db.from('prod_templates').select('key,name').order('key'); if (error) throw error; return data as { key: string; name: string }[]; } });
  if (!orders.data?.length) return <p className="text-sm text-muted-foreground">Kaikista vahvistetuista tilauksista on jo toteutus.</p>;
  return <form className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end" onSubmit={(e: FormEvent) => { e.preventDefault(); act.mutate(() => db.rpc('prod_create_delivery', { p_order_id: order, p_template_key: tpl })); setOrder(''); }}>
    <Choice label="Vahvistettu tilaus" value={order} onChange={setOrder} options={orders.data.map(o => [o.id, `${o.crm_organizations?.name ?? 'Asiakas'} · ${o.service_key} · ${o.starts_on}`])} />
    <Choice label="Toteutuspohja" value={tpl} onChange={setTpl} options={(templates.data ?? []).map(t => [t.key, `${t.key} · ${t.name}`])} />
    <Button disabled={!order || act.isPending}>Luo toteutus</Button>
  </form>;
}

function DeliveryDetail({ id, data, team, email, back }: { id: string; data: typeof EMPTY_PRODUCTION; team: Member[]; email: (id: string | null) => string; back: () => void }) {
  const act = useAct();
  const d = data.deliveries.find(x => x.id === id);
  const extra = useQuery({ queryKey: ['prod_detail', id], queryFn: async () => {
    const [p, m, f] = await Promise.all(['prod_participants', 'prod_message_drafts', 'prod_feedback'].map(t => db.from(t).select('*').eq('delivery_id', id).order('created_at')));
    for (const r of [p, m, f]) if (r.error) throw r.error; return { participants: p.data as any[], drafts: m.data as any[], feedback: f.data as any[] };
  } });
  const [s, setS] = useState({ title: '', start: '', end: '' }); const [editingSession, setEditingSession] = useState<string | null>(null); const [blk, setBlk] = useState(''); const [q, setQ] = useState({ severity: 'keskitaso', description: '' });
  const [params, setParams] = useSearchParams();
  const tab = (params.get('valilehti') as CardTab | null) ?? 'yhteenveto';
  const goTab = (t: CardTab) => { const n = new URLSearchParams(params); n.set('valilehti', t); setParams(n); };
  const [part, setPart] = useState(''); const [draft, setDraft] = useState({ audience: 'Osallistujat', subject: '', body: '' }); const [fb, setFb] = useState({ score: '5', comment: '' });
  if (!d) return <div><Button variant="ghost" onClick={back}><ArrowLeft className="mr-2 h-4 w-4" />Takaisin</Button><p>Toteutusta ei löydy tai sinulla ei ole siihen oikeutta.</p></div>;
  const sessions = data.sessions.filter(x => x.delivery_id === id).sort((a, b) => a.starts_at.localeCompare(b.starts_at));
  const tasks = data.tasks.filter(x => x.delivery_id === id).sort((a, b) => (a.due_at ?? '9').localeCompare(b.due_at ?? '9'));
  const r = readiness(data, id); const exc = exceptions(data, new Date()).filter(e => e.deliveryId === id);
  const billing = data.billing.find(b => b.delivery_id === id);
  const canBill = billingEligible(sessions, data.actuals);
  const row = boardRow(data, id, new Date());
  const TABS: [CardTab, string][] = [['yhteenveto', 'Yhteenveto'], ['aikataulu', `Aikataulu ja kouluttajat (${sessions.length})`], ['tehtavat', `Tehtävät ja esteet (${tasks.filter(t => !t.completed_at).length})`], ['osallistujat', 'Osallistujat'], ['toteumat', 'Toteumat ja laskutus'], ['laatu', 'Laatu, viestit ja palaute']];
  const show = (t: CardTab) => tab === t;
  const people: [string, string][] = team.map(m => [m.id, `${m.email}${m.kind === 'trainer' ? ' (kouluttaja)' : ''}`]);
  const staff: [string, string][] = team.filter(m => m.kind !== 'trainer').map(m => [m.id, m.email]);
  return <article className="space-y-5">
    <Button variant="ghost" onClick={back}><ArrowLeft className="mr-2 h-4 w-4" />Kaikki toteutukset</Button>
    <FlowStepper title="Toteutuksen eteneminen" flow={productionFlow({ sessions: sessions.length, sessionsBooked: sessions.every(x => data.bookings.some(b => b.session_id === x.id && b.status !== 'peruttu')), ready: r.ready, allHeld: canBill, billingReady: !!billing?.billing_ready && canBill })} />
    <div className="flex flex-wrap items-start justify-between gap-3 rounded-xl border bg-card p-4 shadow-card sm:p-5"><div><h2 className="text-2xl font-bold text-keuda-navy-section">{d.title}</h2><p className="mt-1 text-sm text-muted-foreground">Pohja {d.template_key} · luotu {dateTime(d.created_at)} · myynnin vastuu {email(d.sales_owner_id)}</p></div>
      <div className="grid w-full gap-2 sm:w-auto sm:grid-cols-2"><Choice label="Tuotannon tila" value={d.production_status} onChange={v => act.mutate(() => db.from('prod_deliveries').update({ production_status: v }).eq('id', id))} options={STATUS} /><Choice label="Tuotannon vastuuhenkilö" value={d.production_owner_id} onChange={v => act.mutate(() => db.from('prod_deliveries').update({ production_owner_id: v }).eq('id', id))} options={staff.length ? staff : [[d.production_owner_id, email(d.production_owner_id)]]} /></div></div>
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <SummaryCard icon={Activity} label="Tuotannon tila" value={STATUS.find(x => x[0] === d.production_status)?.[1] ?? d.production_status} meta={r.firstStart ? `Alkaa ${dateTime(r.firstStart)}` : 'Ei aikataulua'} />
      <SummaryCard icon={UserRound} tone="accent" label="Vastuuhenkilö" person={team.find(m => m.id === d.production_owner_id) ?? { id: d.production_owner_id, email: email(d.production_owner_id) }} value={email(d.production_owner_id)} meta="Tuotannon vastuu" />
      <SummaryCard icon={CheckCircle2} tone={r.ready ? 'ok' : 'warn'} label="Aloitusvalmius" value={r.ready ? 'Valmis' : 'Ei valmis'} meta={r.ready ? 'Kaikki edellytykset kunnossa' : `${r.missing.length} puuttuu`} />
      <SummaryCard icon={AlertTriangle} tone={exc.length ? 'risk' : 'ok'} label="Poikkeamat" value={exc.length} meta={exc.length ? 'Vaatii toimenpiteitä' : 'Ei avoimia'} />
    </div>
    <div className={`flex flex-wrap items-center gap-3 rounded-xl border border-l-4 p-4 shadow-card ${row.tone === 'ok' ? 'border-l-ws-ok' : row.tone === 'warn' ? 'border-l-ws-warn' : 'border-l-destructive'}`}><Light tone={row.tone} /><div className="min-w-0 flex-1"><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Seuraava askel · {STAGE_LABEL[row.stage]}</p><p className="font-semibold text-foreground">{row.next}</p><p className={`text-xs ${TONE[row.tone].text}`}>{row.reason}{row.total ? ` · kriittiset tehtävät ${row.done}/${row.total}` : ''}</p></div>{row.tab !== tab && <Button onClick={() => goTab(row.tab)}>Siirry: {TABS.find(t => t[0] === row.tab)?.[1].replace(/ \(\d+\)$/, '')}</Button>}</div>
    <div role="tablist" aria-label="Koulutuskortin osiot" className="flex gap-1 overflow-x-auto rounded-xl border bg-card p-1 shadow-card">{TABS.map(([k, label]) => <Button key={k} role="tab" aria-selected={tab === k} size="sm" variant={tab === k ? 'default' : 'ghost'} className="shrink-0" onClick={() => goTab(k)}>{label}</Button>)}</div>
    {show('yhteenveto') && <>
    <div className={`rounded-xl border border-l-4 p-4 shadow-card sm:p-5 ${r.ready ? 'border-l-ws-ok bg-ws-ok-light' : 'border-l-ws-warn bg-ws-warn-light'}`}><h3 className={`flex items-center gap-2 text-lg font-semibold ${r.ready ? 'text-ws-ok' : 'text-ws-warn'}`}>{r.ready ? <CheckCircle2 className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}{r.ready ? 'Aloitusvalmis' : 'Ei aloitusvalmis'}</h3>{!r.ready && <ul className="mt-2 list-disc space-y-0.5 pl-6 text-sm text-foreground">{r.missing.map(m => <li key={m}>{m}</li>)}</ul>}</div>
    {exc.length > 0 && <div className="rounded-xl border border-destructive/40 border-l-4 border-l-destructive bg-ws-risk-light p-4 shadow-card sm:p-5"><h3 className="flex items-center gap-2 text-lg font-semibold text-destructive"><AlertTriangle className="h-5 w-5" />Poikkeamat ({exc.length})</h3><ul className="mt-2 space-y-1.5 text-sm">{exc.map(e => <li key={e.key}><Badge variant="destructive" className="mr-2">{EXCEPTION_LABEL[e.kind]}</Badge>{e.label} <span className="text-xs text-muted-foreground">· <WorkspacePerson person={team.find(m => m.id === e.ownerId)} name={email(e.ownerId)} size="xs" /></span></li>)}</ul></div>}
    </>}
    {show('aikataulu') && <Section open title="Sessiot ja kouluttajavaraukset">
      <ul className="divide-y text-sm">{sessions.map(x => { const bks = data.bookings.filter(b => b.session_id === x.id && b.status !== 'peruttu'); const held = data.actuals.some(a => a.session_id === x.id && a.held === true); return <li key={x.id} className="flex flex-wrap items-center justify-between gap-2 py-2"><span><strong>{x.seq}. {x.title}</strong> · {dateTime(x.starts_at)}–{dateTime(x.ends_at)}<span className="block text-xs text-muted-foreground">Kouluttaja: {bks.length ? bks.map(b => <WorkspacePerson key={b.id} person={team.find(m => m.id === b.trainer_id)} name={email(b.trainer_id)} size="xs" />) : 'ei varattu'} · Toteuma: {held ? 'kirjattu' : 'ei kirjattu'}</span></span>
        <span className="flex flex-wrap gap-2"><div className="w-full max-w-56"><Choice label="Varaa kouluttaja" value="" onChange={v => act.mutate(() => { const existing = bookingToReuse(data.bookings, x.id, v); return existing ? db.from('prod_trainer_bookings').update({ status: 'varattu' }).eq('id', existing) : db.from('prod_trainer_bookings').insert({ session_id: x.id, trainer_id: v }); })} options={people} /></div>
          {bks.map(b => <Button key={b.id} size="sm" variant="ghost" disabled={act.isPending || held} title={`Peru kouluttajan ${email(b.trainer_id)} varaus`} aria-label={`Peru varaus: ${x.title}, ${email(b.trainer_id)}`} onClick={() => { if (window.confirm('Perutaanko tämä kouluttajavaraus? Voit valita sen jälkeen uuden kouluttajan.')) act.mutate(() => db.from('prod_trainer_bookings').update({ status: 'peruttu' }).eq('id', b.id)); }}><X className="mr-1 h-4 w-4" />Peru varaus</Button>)}
          <Button size="icon" variant="outline" title="Muokkaa sessiota" aria-label={`Muokkaa sessiota: ${x.title}`} disabled={held || act.isPending} onClick={() => { setEditingSession(x.id); setS({ title: x.title, start: helsinkiLocal(x.starts_at), end: helsinkiLocal(x.ends_at) }); }}><Pencil className="h-4 w-4" /></Button>
          <Button size="icon" variant="outline" title="Poista sessio" aria-label={`Poista sessio: ${x.title}`} disabled={held || act.isPending} onClick={() => { if (window.confirm('Poistetaanko sessio ja sen varaukset? Kirjattua toteumaa ei voi poistaa tästä.')) act.mutate(() => db.from('prod_sessions').delete().eq('id', x.id)); }}><Trash2 className="h-4 w-4" /></Button>
          {!held && Date.parse(x.ends_at) < Date.now() && <Button size="sm" variant="outline" onClick={() => act.mutate(() => db.from('prod_actuals').insert({ session_id: x.id, held: true, hours: (Date.parse(x.ends_at) - Date.parse(x.starts_at)) / 3_600_000, attendees: extra.data?.participants.filter(p => !p.removed_at).length ?? 0 }))}>Kirjaa toteuma</Button>}</span></li>; })}</ul>
      <form className="grid gap-2 sm:grid-cols-4" onSubmit={async e => { e.preventDefault(); try { await act.mutateAsync(() => { const input = sessionInput(s.title, s.start, s.end); return editingSession ? db.from('prod_sessions').update(input).eq('id', editingSession) : db.from('prod_sessions').insert({ delivery_id: id, seq: Math.max(0, ...sessions.map(x => x.seq)) + 1, ...input }); }); setS({ title: '', start: '', end: '' }); setEditingSession(null); } catch { /* The mutation shows the error and preserves the input. */ } }}>
        <Input aria-label="Session nimi" placeholder="Session nimi" value={s.title} onChange={e => setS({ ...s, title: e.target.value })} required /><Input aria-label="Alkaa" type="datetime-local" value={s.start} onChange={e => setS({ ...s, start: e.target.value })} required /><Input aria-label="Päättyy" type="datetime-local" value={s.end} onChange={e => setS({ ...s, end: e.target.value })} required /><Button variant="secondary" disabled={act.isPending}>{editingSession ? 'Tallenna sessio' : 'Lisää sessio'}</Button>{editingSession && <Button type="button" variant="ghost" onClick={() => { setEditingSession(null); setS({ title: '', start: '', end: '' }); }}>Peruuta muokkaus</Button>}</form>
    </Section>}

    {show('tehtavat') && <><Section open title="Valmistelutehtävät">
      {(['general', 'specific'] as const).map(scope => <div key={scope}><h4 className="text-xs font-medium uppercase text-muted-foreground">{scope === 'general' ? 'Yleinen prosessisääntö' : 'Toteutustyypin erityisvaatimus'}</h4><ul className="divide-y text-sm">{tasks.filter(t => t.scope === scope).map(t => { const late = !t.completed_at && t.due_at && Date.parse(t.due_at) < Date.now(); return <li key={t.id} className="grid grid-cols-[1rem_minmax(0,1fr)] items-center gap-3 py-2 sm:flex"><input type="checkbox" aria-label={`Merkitse tehdyksi: ${t.title}`} checked={!!t.completed_at} onChange={() => act.mutate(() => db.from('prod_tasks').update({ completed_at: t.completed_at ? null : new Date().toISOString() }).eq('id', t.id))} className="h-4 w-4" /><span className="min-w-0 flex-1 break-words"><span className={t.completed_at ? 'line-through' : ''}>{t.title}</span>{t.blocks_start && <Badge variant="outline" className="ml-2">Estää aloituksen</Badge>}<span className={`block text-xs ${late ? 'text-destructive' : 'text-muted-foreground'}`}><WorkspacePerson person={team.find(m => m.id === t.owner_id)} name={email(t.owner_id)} size="xs" /> · {t.due_at ? `määräaika ${dateTime(t.due_at)}` : 'määräaika lasketaan, kun sessiot on aikataulutettu'}{(t as any).due_manual ? ' · asetettu käsin' : ''}</span></span><input key={t.due_at ?? 'none'} type="date" aria-label={`Määräaika: ${t.title}`} className="col-start-2 h-8 w-full min-w-0 rounded-md border border-input bg-background px-2 text-xs sm:w-36" defaultValue={t.due_at ? new Date(t.due_at).toLocaleDateString('sv-SE', { timeZone: 'Europe/Helsinki' }) : ''} onChange={e => { const v = e.target.value; const cur = t.due_at ? new Date(t.due_at).toLocaleDateString('sv-SE', { timeZone: 'Europe/Helsinki' }) : ''; if (!v || v === cur) return; act.mutate(() => db.from('prod_tasks').update({ due_at: local(`${v}T12:00`) }).eq('id', t.id)); }} />{(t as any).due_manual && <Button size="sm" variant="ghost" onClick={() => act.mutate(() => db.from('prod_tasks').update({ due_at: null }).eq('id', t.id))}>Palauta automaattinen</Button>}</li>; })}</ul></div>)}
    </Section>

    <Section title="Estävät tekijät">
      <ul className="text-sm">{data.blockers.filter(b => b.delivery_id === id).map(b => <li key={b.id} className="flex items-center justify-between py-1"><span className={b.resolved_at ? 'line-through text-muted-foreground' : ''}>{b.description} · <WorkspacePerson person={team.find(m => m.id === b.owner_id)} name={email(b.owner_id)} size="xs" /></span>{!b.resolved_at && <Button size="sm" variant="ghost" onClick={() => act.mutate(() => db.from('prod_blockers').update({ resolved_at: new Date().toISOString() }).eq('id', b.id))}>Ratkaistu</Button>}</li>)}</ul>
      <form className="flex gap-2" onSubmit={e => { e.preventDefault(); act.mutate(() => db.from('prod_blockers').insert({ delivery_id: id, description: blk, owner_id: d.production_owner_id })); setBlk(''); }}><Input aria-label="Estävä tekijä" placeholder="Kuvaa estävä tekijä" value={blk} onChange={e => setBlk(e.target.value)} required /><Button variant="secondary">Lisää</Button></form>
    </Section></>}

    {show('laatu') && <><Section open title="Laatupoikkeamat">
      <ul className="text-sm">{data.quality.filter(x => x.delivery_id === id).map(x => <li key={x.id} className="flex items-center justify-between py-1"><span className={x.closed_at ? 'line-through text-muted-foreground' : ''}><Badge variant="outline" className="mr-2">{x.severity}</Badge>{x.description}</span>{!x.closed_at && <Button size="sm" variant="ghost" onClick={() => act.mutate(() => db.from('prod_quality_issues').update({ closed_at: new Date().toISOString(), corrective_action: 'Korjattu' }).eq('id', x.id))}>Sulje</Button>}</li>)}</ul>
      <form className="grid gap-2 sm:grid-cols-[10rem_1fr_auto]" onSubmit={e => { e.preventDefault(); act.mutate(() => db.from('prod_quality_issues').insert({ delivery_id: id, severity: q.severity, description: q.description, owner_id: d.production_owner_id })); setQ({ ...q, description: '' }); }}><Choice label="Vakavuus" value={q.severity} onChange={v => setQ({ ...q, severity: v })} options={[['matala', 'Matala'], ['keskitaso', 'Keskitaso'], ['korkea', 'Korkea']]} /><Input aria-label="Laatupoikkeama" placeholder="Kuvaus" value={q.description} onChange={e => setQ({ ...q, description: e.target.value })} required className="self-end" /><Button variant="secondary" className="self-end">Kirjaa</Button></form>
    </Section>
    </>}
    {show('osallistujat') && <><Section open title="Osallistujat – suoritus ja todistus">
      <ul className="divide-y text-sm">{extra.data?.participants.filter(p => !p.removed_at).map(p => <li key={p.id} className="grid items-end gap-2 py-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_2rem]"><WorkspacePerson name={p.name} /><Choice label="Suoritus" value={p.completion_status} onChange={v => act.mutate(() => db.from('prod_participants').update({ completion_status: v }).eq('id', p.id))} options={COMPLETION} /><Choice label="Todistus" value={p.certificate_status} onChange={v => act.mutate(() => db.from('prod_participants').update({ certificate_status: v }).eq('id', p.id))} options={CERT} /><Button size="icon" variant="ghost" title="Poista osallistujalistalta" aria-label={`Poista osallistujalistalta: ${p.name}`} disabled={act.isPending} onClick={() => { if (window.confirm("Poistetaanko osallistuja tältä listalta? Aiemmat kirjaukset säilyvät.")) act.mutate(() => db.from("prod_participants").update({ removed_at: new Date().toISOString() }).eq("id", p.id)); }}><Trash2 className="h-4 w-4" /></Button></li>)}</ul>
      <form className="flex gap-2" onSubmit={e => { e.preventDefault(); act.mutate(() => db.from('prod_participants').insert({ delivery_id: id, name: part })); setPart(''); }}><Input aria-label="Osallistujan nimi" placeholder="Osallistujan nimi" value={part} onChange={e => setPart(e.target.value)} required /><Button variant="secondary">Lisää</Button></form>
    </Section>
    <Section title="Läsnäolo"><AttendancePanel deliveryId={id} sessions={sessions} /></Section></>}

    {show('laatu') && <><Section open title="Osallistujaviestien luonnokset">
      <p className="text-xs text-muted-foreground">Luonnoksen hyväksyy toinen henkilö tai pääkäyttäjä. Kehityskopiossa viestejä ei lähetetä.</p>
      <ul className="divide-y text-sm">{extra.data?.drafts.map(m => <li key={m.id} className="flex flex-wrap items-center justify-between gap-2 py-2"><span><strong>{m.subject}</strong> · {m.audience}<span className="block text-xs text-muted-foreground">{m.send_state === 'luonnos' ? 'Luonnos' : `Hyväksytty ${dateTime(m.approved_at)} (${email(m.approved_by)}), ei lähetetty`}</span></span>{m.send_state === 'luonnos' && <Button size="sm" variant="outline" onClick={() => act.mutate(() => db.from('prod_message_drafts').update({ approved_at: new Date().toISOString() }).eq('id', m.id))}>Hyväksy</Button>}</li>)}</ul>
      <form className="grid gap-2" onSubmit={e => { e.preventDefault(); act.mutate(() => db.from('prod_message_drafts').insert({ delivery_id: id, ...draft })); setDraft({ ...draft, subject: '', body: '' }); }}><Input aria-label="Otsikko" placeholder="Otsikko" value={draft.subject} onChange={e => setDraft({ ...draft, subject: e.target.value })} required /><textarea aria-label="Viesti" className="min-h-20 rounded-md border bg-background p-2 text-sm" value={draft.body} onChange={e => setDraft({ ...draft, body: e.target.value })} required /><Button variant="secondary" className="justify-self-start">Tallenna luonnos</Button></form>
    </Section>

    <Section title="Palautteet">
      <ul className="text-sm">{extra.data?.feedback.map(f => <li key={f.id}>{f.score}/5 {f.comment}</li>)}</ul>
      <form className="grid gap-2 sm:grid-cols-[8rem_1fr_auto]" onSubmit={e => { e.preventDefault(); act.mutate(() => db.from('prod_feedback').insert({ delivery_id: id, score: Number(fb.score), comment: fb.comment })); setFb({ score: '5', comment: '' }); }}><Choice label="Arvio" value={fb.score} onChange={v => setFb({ ...fb, score: v })} options={['1', '2', '3', '4', '5'].map(n => [n, n])} /><Input aria-label="Palaute" className="self-end" value={fb.comment} onChange={e => setFb({ ...fb, comment: e.target.value })} /><Button variant="secondary" className="self-end">Kirjaa</Button></form>
    </Section></>}

    {show('toteumat') && <><Section open title="Toteumat">
      <ul className="divide-y text-sm">{sessions.length === 0 && <li className="py-2 text-muted-foreground">Ei sessioita.</li>}{sessions.map(x => { const held = data.actuals.some(a => a.session_id === x.id && a.held === true); const ended = Date.parse(x.ends_at) < Date.now(); return <li key={x.id} className="flex flex-wrap items-center justify-between gap-2 py-2"><span><strong>{x.seq}. {x.title}</strong> · {dateTime(x.starts_at)}</span>{held ? <Badge>Toteuma kirjattu</Badge> : ended ? <Button size="sm" onClick={() => act.mutate(() => db.from('prod_actuals').insert({ session_id: x.id, held: true, hours: (Date.parse(x.ends_at) - Date.parse(x.starts_at)) / 3_600_000, attendees: extra.data?.participants.filter(p => !p.removed_at).length ?? 0 }))}>Kirjaa toteuma</Button> : <span className="text-xs text-muted-foreground">Kirjattavissa session päätyttyä</span>}</li>; })}</ul>
    </Section>
    <Section open title="Laskutusvalmius ja maksutila">
      <p className="text-xs text-muted-foreground">Erillinen tuotannon tilasta ja osallistujien suorituksista.</p>
      {!canBill && <p className="text-sm text-muted-foreground">Odottaa kaikkien sessioiden päättymistä ja toteumien kirjaamista.</p>}
      {billing?.billing_ready && !canBill && <p role="alert" className="text-sm text-destructive">Aiempi laskutusvalmis-merkintä ei vastaa toteumia. Tarkista sessiot ja toteumakirjaukset ennen laskutusta.</p>}
      {billing && <div className="grid items-end gap-3 sm:grid-cols-2"><label className="flex items-center gap-2 text-sm"><input type="checkbox" className="h-4 w-4" checked={billing.billing_ready && canBill} disabled={act.isPending || (!billing.billing_ready && !canBill)} onChange={() => act.mutate(() => db.from('prod_billing_readiness').update({ billing_ready: !billing.billing_ready }).eq('delivery_id', id))} />Laskutusvalmis<span className="text-xs text-muted-foreground">(merkitään automaattisesti, kun kaikkien sessioiden toteuma on kirjattu)</span></label><Choice label="Maksutila" value={billing.payment_status} onChange={v => act.mutate(() => db.from('prod_billing_readiness').update({ payment_status: v }).eq('delivery_id', id))} options={PAYMENT} /></div>}
    </Section></>}
  </article>;
}

function TrainerView() {
  const act = useAct();
  const q = useQuery({ queryKey: ['trainer_view'], queryFn: async () => {
    const [s, t, a] = await Promise.all([db.from('prod_trainer_sessions').select('session_id,seq,session_title,starts_at,ends_at,location,delivery_title,booking_status,company_name').order('starts_at'), db.rpc('prod_my_trainer_tasks'), db.from('prod_actuals').select('session_id,held')]);
    for (const r of [s, t, a]) if (r.error) throw r.error; return { sessions: s.data as any[], tasks: t.data as any[], actuals: new Set((a.data as any[]).filter(x => x.held === true).map(x => x.session_id)) };
  } });
  if (q.isPending) return <><CompanyTrainerCapacity /><Loader2 className="h-5 w-5 animate-spin" aria-label="Ladataan" /></>;
  if (q.isError || (!q.data.sessions.length && !q.data.tasks.length)) return <><CompanyTrainerCapacity /><p>Sinulle ei ole varattuja sessioita. Jos odotit näkeväsi tietoja, ota yhteyttä tuotannon vastuuhenkilöön.</p></>;
  return <>
    <CompanyTrainerCapacity />
    <Section title="Omat sessiot" open><ul className="divide-y text-sm">{q.data.sessions.map(s => <li key={s.session_id} className="flex flex-wrap items-center justify-between gap-2 py-2"><span className="min-w-0 break-words"><strong className="block text-keuda-blue">{s.company_name ?? 'Yrityksen nimi puuttuu'}</strong><span>{s.delivery_title} · {s.seq}. {s.session_title}</span><span className="block text-xs text-muted-foreground">{dateTime(s.starts_at)}–{dateTime(s.ends_at)}{s.location ? ` · ${s.location}` : ''}</span></span>{q.data.actuals.has(s.session_id) ? <Badge>Toteuma kirjattu</Badge> : Date.parse(s.ends_at) < Date.now() && <Button size="sm" variant="outline" onClick={() => act.mutate(() => db.from('prod_actuals').insert({ session_id: s.session_id, held: true, hours: (Date.parse(s.ends_at) - Date.parse(s.starts_at)) / 3_600_000, attendees: 0 }))}>Kirjaa toteuma</Button>}</li>)}</ul></Section>
    <Section title="Omat tehtävät" open><ul className="divide-y text-sm">{q.data.tasks.map(t => <li key={t.id} className="flex items-center gap-3 py-2"><input type="checkbox" className="h-4 w-4" aria-label={`Merkitse tehdyksi: ${t.title}`} checked={!!t.completed_at} onChange={() => act.mutate(() => db.from('prod_tasks').update({ completed_at: t.completed_at ? null : new Date().toISOString() }).eq('id', t.id))} /><span className="min-w-0 break-words"><strong className="block text-keuda-blue">{t.company_name ?? 'Yrityksen nimi puuttuu'}</strong>{t.title}<span className="block text-xs text-muted-foreground">{t.due_at ? dateTime(t.due_at) : 'Ei määräaikaa'}</span></span></li>)}</ul></Section>
  </>;
}
