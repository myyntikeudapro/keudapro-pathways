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
import { AlertTriangle, ArrowLeft, CheckCircle2, ClipboardList, Activity, Loader2, LogOut, RefreshCw, ChevronDown, UserRound, Users, Layers, type LucideIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { CompanyTrainingSales } from '@/components/admin/CompanyTrainingSales';
import { CompanyTrainerCapacity, CompanyHandoffsPanel } from '@/components/admin/CompanyTrainingProduction';

type Member = { id: string; email: string; kind?: string };
const db = supabase as any;
const STATUS: [string, string][] = [['suunnittelu', 'Suunnittelu'], ['käynnissä', 'Käynnissä'], ['päättynyt', 'Päättynyt'], ['peruttu', 'Peruttu']];
const COMPLETION: [string, string][] = [['ilmoittautunut', 'Ilmoittautunut'], ['kesken', 'Kesken'], ['suoritettu', 'Suoritettu'], ['keskeytynyt', 'Keskeytynyt']];
const CERT: [string, string][] = [['ei_aloitettu', 'Ei aloitettu'], ['valmisteilla', 'Valmisteilla'], ['myönnetty', 'Myönnetty'], ['ei_oikeutta', 'Ei oikeutta']];
const PAYMENT: [string, string][] = [['ei_laskutettu', 'Ei laskutettu'], ['laskutettu', 'Laskutettu'], ['maksettu', 'Maksettu']];
const local = (v: string) => new Date(v).toISOString();

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
    <header className="ws-header"><div className="container mx-auto flex flex-wrap items-center justify-between gap-4 px-4 py-6"><div><p className="text-xs font-semibold uppercase tracking-widest text-keuda-hero-muted">KeudaPRO / Työtila</p><h1 className="mt-1 text-3xl font-bold tracking-tight">Koulutustuotanto</h1><p className="mt-1 text-sm text-keuda-hero-muted">Toteutusten valmius, poikkeamat ja vastuut yhdellä näkymällä</p></div><WorkspaceIdentity /><nav className="flex flex-wrap gap-2" aria-label="Hallinnan navigaatio">{isEditor && <Button asChild variant="secondary"><Link to="/admin">Tilannekeskus</Link></Button>}<Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground" aria-label="Kirjaudu ulos" onClick={signOut}><LogOut className="h-4 w-4" /></Button></nav></div></header>
    <main className="container mx-auto space-y-8 px-4 py-8">{isEditor ? <StaffView userId={user.id} /> : <TrainerView />}</main>
  </div>;
}

function useAct() {
  const qc = useQueryClient(); const { toast } = useToast();
  return useMutation({
    mutationFn: async (fn: () => PromiseLike<{ error: { message: string } | null }>) => { const { error } = await fn(); if (error) throw new Error(error.message); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['production_data'] }); qc.invalidateQueries({ queryKey: ['prod_detail'] }); qc.invalidateQueries({ queryKey: ['trainer_view'] }); qc.invalidateQueries({ queryKey: ['prod_attendance'] }); },
    onError: (e: Error) => toast({ title: 'Tallennus ei onnistunut', description: e.message, variant: 'destructive' }),
  });
}

function StaffView({ userId }: { userId: string }) {
  const [params, setParams] = useSearchParams();
  const query = useProductionData(true);
  const [showAll, setShowAll] = useState(false);
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
  const mineN = active.filter(d => d.production_owner_id === userId).length;
  const queueBar = <div className="flex flex-wrap items-center gap-2 rounded-xl border bg-card p-3 shadow-card">{Object.entries(PRODUCTION_QUEUES).map(([k, label]) => <Button key={k} size="sm" variant={queue === k ? 'default' : 'outline'} onClick={() => setParams({ jono: k, ...(mine ? { omat: '1' } : {}) })}>{label} <span className="ml-1.5 rounded-full bg-muted px-1.5 text-xs tabular-nums text-foreground">{productionQueue(data, k, now, mine ? userId : undefined).length}</span></Button>)}
      <Button size="sm" variant={mine ? 'secondary' : 'ghost'} onClick={() => { mine ? params.delete('omat') : params.set('omat', '1'); setParams(params); }}>{mine ? 'Näytä koko tiimi' : 'Vain omat vastuut'}</Button>
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
        <section className="overflow-x-auto rounded-xl border bg-card shadow-card"><div className="flex items-center justify-between border-b px-4 py-3"><h3 className="text-base font-semibold text-keuda-navy-section">Toteutukset</h3><span className="text-xs text-muted-foreground">{data.deliveries.length} kpl</span></div><table className="w-full text-sm"><thead className="bg-ws-tint text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground"><tr><th className="p-3">Toteutus</th><th className="p-3">Tuotannon tila</th><th className="p-3">Aloitusvalmius</th><th className="p-3">Poikkeamat</th><th className="p-3">Tuotannon vastuu</th><th className="p-3">Alkaa</th></tr></thead>
          <tbody>{data.deliveries.length === 0 && <tr><td colSpan={6} className="p-4 text-muted-foreground">Ei toteutuksia vielä.</td></tr>}{data.deliveries.slice(0, showAll ? undefined : 5).map(d => { const r = readiness(data, d.id); const n = exc.filter(e => e.deliveryId === d.id).length; return <tr key={d.id} className="border-t hover:bg-ws-tint"><td className="p-3"><button className="font-semibold text-keuda-blue underline-offset-2 hover:underline" onClick={() => setParams({ toteutus: d.id })}>{d.title}</button></td><td className="p-3"><Badge variant="outline">{STATUS.find(s => s[0] === d.production_status)?.[1]}</Badge></td><td className="p-3">{r.ready ? <span className="inline-flex items-center gap-1 rounded-full bg-ws-ok-light px-2 py-0.5 text-xs font-semibold text-ws-ok"><CheckCircle2 className="h-3.5 w-3.5" />Valmis</span> : <span className="inline-flex rounded-full bg-ws-warn-light px-2 py-0.5 text-xs font-semibold text-ws-warn">{r.missing.length} puuttuu</span>}</td><td className="p-3">{n ? <Badge variant="destructive">{n}</Badge> : <span className="text-muted-foreground">0</span>}</td><td className="p-3 text-xs">{<WorkspacePerson person={team.data?.find(m => m.id === d.production_owner_id)} name={email(d.production_owner_id)} size="xs" />}</td><td className="p-3 text-xs">{r.firstStart ? dateTime(r.firstStart) : 'Ei aikataulua'}</td></tr>; })}</tbody></table>{data.deliveries.length > 5 && <div className="border-t p-3 text-center"><Button size="sm" variant="ghost" onClick={() => setShowAll(v => !v)}><ChevronDown className={`mr-1 h-4 w-4 transition-transform ${showAll ? 'rotate-180' : ''}`} />{showAll ? 'Näytä vähemmän' : `Näytä kaikki ${data.deliveries.length}`}</Button></div>}</section>
      </Zone>
      <Zone title="Operatiiviset osiot" icon={Layers}>
        <Card><CompanyHandoffsPanel userId={userId} /></Card>
        <Card><CompanyTrainingSales /></Card>
      </Zone>
      <Zone title="Uusi toteutus" icon={Activity} tint><Card><CreateDelivery /></Card></Zone>
    </>}
  </>;
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
  const [s, setS] = useState({ title: '', start: '', end: '' }); const [blk, setBlk] = useState(''); const [q, setQ] = useState({ severity: 'keskitaso', description: '' });
  const [part, setPart] = useState(''); const [draft, setDraft] = useState({ audience: 'Osallistujat', subject: '', body: '' }); const [fb, setFb] = useState({ score: '5', comment: '' });
  if (!d) return <div><Button variant="ghost" onClick={back}><ArrowLeft className="mr-2 h-4 w-4" />Takaisin</Button><p>Toteutusta ei löydy tai sinulla ei ole siihen oikeutta.</p></div>;
  const sessions = data.sessions.filter(x => x.delivery_id === id).sort((a, b) => a.starts_at.localeCompare(b.starts_at));
  const tasks = data.tasks.filter(x => x.delivery_id === id).sort((a, b) => (a.due_at ?? '9').localeCompare(b.due_at ?? '9'));
  const r = readiness(data, id); const exc = exceptions(data, new Date()).filter(e => e.deliveryId === id);
  const billing = data.billing.find(b => b.delivery_id === id);
  const people: [string, string][] = team.map(m => [m.id, `${m.email}${m.kind === 'trainer' ? ' (kouluttaja)' : ''}`]);
  const staff: [string, string][] = team.filter(m => m.kind !== 'trainer').map(m => [m.id, m.email]);
  return <article className="space-y-5">
    <Button variant="ghost" onClick={back}><ArrowLeft className="mr-2 h-4 w-4" />Kaikki toteutukset</Button>
    <div className="flex flex-wrap items-start justify-between gap-3 rounded-xl border bg-card p-4 shadow-card sm:p-5"><div><h2 className="text-2xl font-bold text-keuda-navy-section">{d.title}</h2><p className="mt-1 text-sm text-muted-foreground">Pohja {d.template_key} · luotu {dateTime(d.created_at)} · myynnin vastuu {email(d.sales_owner_id)}</p></div>
      <div className="grid w-full gap-2 sm:w-auto sm:grid-cols-2"><Choice label="Tuotannon tila" value={d.production_status} onChange={v => act.mutate(() => db.from('prod_deliveries').update({ production_status: v }).eq('id', id))} options={STATUS} /><Choice label="Tuotannon vastuuhenkilö" value={d.production_owner_id} onChange={v => act.mutate(() => db.from('prod_deliveries').update({ production_owner_id: v }).eq('id', id))} options={staff.length ? staff : [[d.production_owner_id, email(d.production_owner_id)]]} /></div></div>
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <SummaryCard icon={Activity} label="Tuotannon tila" value={STATUS.find(x => x[0] === d.production_status)?.[1] ?? d.production_status} meta={r.firstStart ? `Alkaa ${dateTime(r.firstStart)}` : 'Ei aikataulua'} />
      <SummaryCard icon={UserRound} tone="accent" label="Vastuuhenkilö" person={team.find(m => m.id === d.production_owner_id) ?? { id: d.production_owner_id, email: email(d.production_owner_id) }} value={email(d.production_owner_id)} meta="Tuotannon vastuu" />
      <SummaryCard icon={CheckCircle2} tone={r.ready ? 'ok' : 'warn'} label="Aloitusvalmius" value={r.ready ? 'Valmis' : 'Ei valmis'} meta={r.ready ? 'Kaikki edellytykset kunnossa' : `${r.missing.length} puuttuu`} />
      <SummaryCard icon={AlertTriangle} tone={exc.length ? 'risk' : 'ok'} label="Poikkeamat" value={exc.length} meta={exc.length ? 'Vaatii toimenpiteitä' : 'Ei avoimia'} />
    </div>
    <div className={`rounded-xl border border-l-4 p-4 shadow-card sm:p-5 ${r.ready ? 'border-l-ws-ok bg-ws-ok-light' : 'border-l-ws-warn bg-ws-warn-light'}`}><h3 className={`flex items-center gap-2 text-lg font-semibold ${r.ready ? 'text-ws-ok' : 'text-ws-warn'}`}>{r.ready ? <CheckCircle2 className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}{r.ready ? 'Aloitusvalmis' : 'Ei aloitusvalmis'}</h3>{!r.ready && <ul className="mt-2 list-disc space-y-0.5 pl-6 text-sm text-foreground">{r.missing.map(m => <li key={m}>{m}</li>)}</ul>}</div>
    {exc.length > 0 && <div className="rounded-xl border border-destructive/40 border-l-4 border-l-destructive bg-ws-risk-light p-4 shadow-card sm:p-5"><h3 className="flex items-center gap-2 text-lg font-semibold text-destructive"><AlertTriangle className="h-5 w-5" />Poikkeamat ({exc.length})</h3><ul className="mt-2 space-y-1.5 text-sm">{exc.map(e => <li key={e.key}><Badge variant="destructive" className="mr-2">{EXCEPTION_LABEL[e.kind]}</Badge>{e.label} <span className="text-xs text-muted-foreground">· <WorkspacePerson person={team.find(m => m.id === e.ownerId)} name={email(e.ownerId)} size="xs" /></span></li>)}</ul></div>}
    <h2 className="flex items-center gap-2 pt-2 text-sm font-semibold uppercase tracking-wider text-ws-area"><Layers className="h-4 w-4" />Toteutuksen hallinta</h2>

    <Section title="Sessiot ja varaukset">
      <ul className="divide-y text-sm">{sessions.map(x => { const bks = data.bookings.filter(b => b.session_id === x.id && b.status !== 'peruttu'); const held = data.actuals.some(a => a.session_id === x.id); return <li key={x.id} className="flex flex-wrap items-center justify-between gap-2 py-2"><span><strong>{x.seq}. {x.title}</strong> · {dateTime(x.starts_at)}–{dateTime(x.ends_at)}<span className="block text-xs text-muted-foreground">Kouluttaja: {bks.length ? bks.map(b => <WorkspacePerson key={b.id} person={team.find(m => m.id === b.trainer_id)} name={email(b.trainer_id)} size="xs" />) : 'ei varattu'} · Toteuma: {held ? 'kirjattu' : 'ei kirjattu'}</span></span>
        <span className="flex flex-wrap gap-2"><div className="w-56"><Choice label="Varaa kouluttaja" value="" onChange={v => act.mutate(() => db.from('prod_trainer_bookings').insert({ session_id: x.id, trainer_id: v }))} options={people} /></div>
          {!held && Date.parse(x.ends_at) < Date.now() && <Button size="sm" variant="outline" onClick={() => act.mutate(() => db.from('prod_actuals').insert({ session_id: x.id, held: true, hours: (Date.parse(x.ends_at) - Date.parse(x.starts_at)) / 3_600_000, attendees: extra.data?.participants.length ?? 0 }))}>Kirjaa toteuma</Button>}</span></li>; })}</ul>
      <form className="grid gap-2 sm:grid-cols-4" onSubmit={e => { e.preventDefault(); act.mutate(() => db.from('prod_sessions').insert({ delivery_id: id, seq: sessions.length + 1, title: s.title, starts_at: local(s.start), ends_at: local(s.end) })); setS({ title: '', start: '', end: '' }); }}>
        <Input aria-label="Session nimi" placeholder="Session nimi" value={s.title} onChange={e => setS({ ...s, title: e.target.value })} required /><Input aria-label="Alkaa" type="datetime-local" value={s.start} onChange={e => setS({ ...s, start: e.target.value })} required /><Input aria-label="Päättyy" type="datetime-local" value={s.end} onChange={e => setS({ ...s, end: e.target.value })} required /><Button variant="secondary">Lisää sessio</Button></form>
    </Section>

    <Section title="Valmistelutehtävät">
      {(['general', 'specific'] as const).map(scope => <div key={scope}><h4 className="text-xs font-medium uppercase text-muted-foreground">{scope === 'general' ? 'Yleinen prosessisääntö' : 'Toteutustyypin erityisvaatimus'}</h4><ul className="divide-y text-sm">{tasks.filter(t => t.scope === scope).map(t => { const late = !t.completed_at && t.due_at && Date.parse(t.due_at) < Date.now(); return <li key={t.id} className="flex items-center gap-3 py-2"><input type="checkbox" aria-label={`Merkitse tehdyksi: ${t.title}`} checked={!!t.completed_at} onChange={() => act.mutate(() => db.from('prod_tasks').update({ completed_at: t.completed_at ? null : new Date().toISOString() }).eq('id', t.id))} className="h-4 w-4" /><span className="flex-1"><span className={t.completed_at ? 'line-through' : ''}>{t.title}</span>{t.blocks_start && <Badge variant="outline" className="ml-2">Estää aloituksen</Badge>}<span className={`block text-xs ${late ? 'text-destructive' : 'text-muted-foreground'}`}><WorkspacePerson person={team.find(m => m.id === t.owner_id)} name={email(t.owner_id)} size="xs" /> · {t.due_at ? `määräaika ${dateTime(t.due_at)}` : 'määräaika lasketaan, kun sessiot on aikataulutettu'}</span></span></li>; })}</ul></div>)}
    </Section>

    <Section title="Estävät tekijät">
      <ul className="text-sm">{data.blockers.filter(b => b.delivery_id === id).map(b => <li key={b.id} className="flex items-center justify-between py-1"><span className={b.resolved_at ? 'line-through text-muted-foreground' : ''}>{b.description} · <WorkspacePerson person={team.find(m => m.id === b.owner_id)} name={email(b.owner_id)} size="xs" /></span>{!b.resolved_at && <Button size="sm" variant="ghost" onClick={() => act.mutate(() => db.from('prod_blockers').update({ resolved_at: new Date().toISOString() }).eq('id', b.id))}>Ratkaistu</Button>}</li>)}</ul>
      <form className="flex gap-2" onSubmit={e => { e.preventDefault(); act.mutate(() => db.from('prod_blockers').insert({ delivery_id: id, description: blk, owner_id: d.production_owner_id })); setBlk(''); }}><Input aria-label="Estävä tekijä" placeholder="Kuvaa estävä tekijä" value={blk} onChange={e => setBlk(e.target.value)} required /><Button variant="secondary">Lisää</Button></form>
    </Section>

    <Section title="Laatupoikkeamat">
      <ul className="text-sm">{data.quality.filter(x => x.delivery_id === id).map(x => <li key={x.id} className="flex items-center justify-between py-1"><span className={x.closed_at ? 'line-through text-muted-foreground' : ''}><Badge variant="outline" className="mr-2">{x.severity}</Badge>{x.description}</span>{!x.closed_at && <Button size="sm" variant="ghost" onClick={() => act.mutate(() => db.from('prod_quality_issues').update({ closed_at: new Date().toISOString(), corrective_action: 'Korjattu' }).eq('id', x.id))}>Sulje</Button>}</li>)}</ul>
      <form className="grid gap-2 sm:grid-cols-[10rem_1fr_auto]" onSubmit={e => { e.preventDefault(); act.mutate(() => db.from('prod_quality_issues').insert({ delivery_id: id, severity: q.severity, description: q.description, owner_id: d.production_owner_id })); setQ({ ...q, description: '' }); }}><Choice label="Vakavuus" value={q.severity} onChange={v => setQ({ ...q, severity: v })} options={[['matala', 'Matala'], ['keskitaso', 'Keskitaso'], ['korkea', 'Korkea']]} /><Input aria-label="Laatupoikkeama" placeholder="Kuvaus" value={q.description} onChange={e => setQ({ ...q, description: e.target.value })} required className="self-end" /><Button variant="secondary" className="self-end">Kirjaa</Button></form>
    </Section>
    <Section title="Läsnäolo"><AttendancePanel deliveryId={id} sessions={sessions} /></Section>
    <Section title="Osallistujat – suoritus ja todistus">
      <ul className="divide-y text-sm">{extra.data?.participants.filter(p => !p.removed_at).map(p => <li key={p.id} className="grid items-end gap-2 py-2 sm:grid-cols-3"><WorkspacePerson name={p.name} /><Choice label="Suoritus" value={p.completion_status} onChange={v => act.mutate(() => db.from('prod_participants').update({ completion_status: v }).eq('id', p.id))} options={COMPLETION} /><Choice label="Todistus" value={p.certificate_status} onChange={v => act.mutate(() => db.from('prod_participants').update({ certificate_status: v }).eq('id', p.id))} options={CERT} /></li>)}</ul>
      <form className="flex gap-2" onSubmit={e => { e.preventDefault(); act.mutate(() => db.from('prod_participants').insert({ delivery_id: id, name: part })); setPart(''); }}><Input aria-label="Osallistujan nimi" placeholder="Osallistujan nimi" value={part} onChange={e => setPart(e.target.value)} required /><Button variant="secondary">Lisää</Button></form>
    </Section>

    <Section title="Osallistujaviestien luonnokset">
      <p className="text-xs text-muted-foreground">Luonnoksen hyväksyy toinen henkilö tai pääkäyttäjä. Kehityskopiossa viestejä ei lähetetä.</p>
      <ul className="divide-y text-sm">{extra.data?.drafts.map(m => <li key={m.id} className="flex flex-wrap items-center justify-between gap-2 py-2"><span><strong>{m.subject}</strong> · {m.audience}<span className="block text-xs text-muted-foreground">{m.send_state === 'luonnos' ? 'Luonnos' : `Hyväksytty ${dateTime(m.approved_at)} (${email(m.approved_by)}), ei lähetetty`}</span></span>{m.send_state === 'luonnos' && <Button size="sm" variant="outline" onClick={() => act.mutate(() => db.from('prod_message_drafts').update({ approved_at: new Date().toISOString() }).eq('id', m.id))}>Hyväksy</Button>}</li>)}</ul>
      <form className="grid gap-2" onSubmit={e => { e.preventDefault(); act.mutate(() => db.from('prod_message_drafts').insert({ delivery_id: id, ...draft })); setDraft({ ...draft, subject: '', body: '' }); }}><Input aria-label="Otsikko" placeholder="Otsikko" value={draft.subject} onChange={e => setDraft({ ...draft, subject: e.target.value })} required /><textarea aria-label="Viesti" className="min-h-20 rounded-md border bg-background p-2 text-sm" value={draft.body} onChange={e => setDraft({ ...draft, body: e.target.value })} required /><Button variant="secondary" className="justify-self-start">Tallenna luonnos</Button></form>
    </Section>

    <Section title="Palautteet">
      <ul className="text-sm">{extra.data?.feedback.map(f => <li key={f.id}>{f.score}/5 {f.comment}</li>)}</ul>
      <form className="grid gap-2 sm:grid-cols-[8rem_1fr_auto]" onSubmit={e => { e.preventDefault(); act.mutate(() => db.from('prod_feedback').insert({ delivery_id: id, score: Number(fb.score), comment: fb.comment })); setFb({ score: '5', comment: '' }); }}><Choice label="Arvio" value={fb.score} onChange={v => setFb({ ...fb, score: v })} options={['1', '2', '3', '4', '5'].map(n => [n, n])} /><Input aria-label="Palaute" className="self-end" value={fb.comment} onChange={e => setFb({ ...fb, comment: e.target.value })} /><Button variant="secondary" className="self-end">Kirjaa</Button></form>
    </Section>

    <Section title="Laskutusvalmius ja maksutila">
      <p className="text-xs text-muted-foreground">Erillinen tuotannon tilasta ja osallistujien suorituksista.</p>
      {billing && <div className="grid items-end gap-3 sm:grid-cols-2"><label className="flex items-center gap-2 text-sm"><input type="checkbox" className="h-4 w-4" checked={billing.billing_ready} onChange={() => act.mutate(() => db.from('prod_billing_readiness').update({ billing_ready: !billing.billing_ready }).eq('delivery_id', id))} />Laskutusvalmis</label><Choice label="Maksutila" value={billing.payment_status} onChange={v => act.mutate(() => db.from('prod_billing_readiness').update({ payment_status: v }).eq('delivery_id', id))} options={PAYMENT} /></div>}
    </Section>
  </article>;
}

function TrainerView() {
  const act = useAct();
  const q = useQuery({ queryKey: ['trainer_view'], queryFn: async () => {
    const [s, t, a] = await Promise.all([db.from('prod_trainer_sessions').select('*').order('starts_at'), db.from('prod_tasks').select('id,title,due_at,completed_at').order('due_at'), db.from('prod_actuals').select('session_id')]);
    for (const r of [s, t, a]) if (r.error) throw r.error; return { sessions: s.data as any[], tasks: t.data as any[], actuals: new Set((a.data as any[]).map(x => x.session_id)) };
  } });
  if (q.isPending) return <><CompanyTrainerCapacity /><Loader2 className="h-5 w-5 animate-spin" aria-label="Ladataan" /></>;
  if (q.isError || (!q.data.sessions.length && !q.data.tasks.length)) return <><CompanyTrainerCapacity /><p>Sinulle ei ole varattuja sessioita. Jos odotit näkeväsi tietoja, ota yhteyttä tuotannon vastuuhenkilöön.</p></>;
  return <>
    <CompanyTrainerCapacity />
    <Section title="Omat sessiot"><ul className="divide-y text-sm">{q.data.sessions.map(s => <li key={s.session_id} className="flex flex-wrap items-center justify-between gap-2 py-2"><span><strong>{s.delivery_title}</strong> · {s.seq}. {s.session_title}<span className="block text-xs text-muted-foreground">{dateTime(s.starts_at)}–{dateTime(s.ends_at)}{s.location ? ` · ${s.location}` : ''}</span></span>{q.data.actuals.has(s.session_id) ? <Badge>Toteuma kirjattu</Badge> : Date.parse(s.ends_at) < Date.now() && <Button size="sm" variant="outline" onClick={() => act.mutate(() => db.from('prod_actuals').insert({ session_id: s.session_id, held: true, hours: (Date.parse(s.ends_at) - Date.parse(s.starts_at)) / 3_600_000, attendees: 0 }))}>Kirjaa toteuma</Button>}</li>)}</ul></Section>
    <Section title="Omat tehtävät"><ul className="divide-y text-sm">{q.data.tasks.map(t => <li key={t.id} className="flex items-center gap-3 py-2"><input type="checkbox" className="h-4 w-4" aria-label={`Merkitse tehdyksi: ${t.title}`} checked={!!t.completed_at} onChange={() => act.mutate(() => db.from('prod_tasks').update({ completed_at: t.completed_at ? null : new Date().toISOString() }).eq('id', t.id))} /><span>{t.title}<span className="block text-xs text-muted-foreground">{t.due_at ? dateTime(t.due_at) : 'Ei määräaikaa'}</span></span></li>)}</ul></Section>
  </>;
}
