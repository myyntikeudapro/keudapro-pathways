import { useAuth } from '@/hooks/useAuth';
import { NextStep } from './NextStep';
import { receiveHref, salesTaskHref, trainingTaskHref } from '@/lib/workspaceNextStep';
import { useFlowTaskFocus } from '@/hooks/useFlowTaskFocus';
import { WorkspacePerson } from "./WorkspacePerson";
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, Save, Check, Undo2, Trash2 } from 'lucide-react';
import { listTrainerProgrammes, companyWorkflow, companyErrorText, buildCapacity, readinessLabel, type CapacityStationInput, type CapacitySlotInput, type CompanySnapshot } from '@/lib/companyTrainingWorkflow';
import { helsinkiLocal as local } from '@/lib/helsinkiTime';

const db = supabase as any;
// Every write goes through the companyWorkflow port; UI renders only the state read back afterwards.
const rpc = async (name: string, args: Record<string, unknown>) => { const { data, error } = await db.rpc(name, args); if (error) throw new Error(error.message || 'rpc_failed'); return data; };
const workflow = companyWorkflow(rpc);
const fmt = (iso?: string) => iso ? new Date(iso).toLocaleString('fi-FI', { timeZone: 'Europe/Helsinki', dateStyle: 'short', timeStyle: 'short' }) : '–';
const Status = ({ error, result }: { error: string; result: string }) => <>{error && <p role="alert" className="text-sm text-destructive">{error}</p>}{result && <p role="status" className="text-sm text-primary">{result}</p>}</>;
function Missing({ items }: { items: string[] }) {
  return items.length ? <ul className="list-disc space-y-0.5 pl-5 text-sm text-destructive">{items.map((m, i) => <li key={i}>{readinessLabel(m)}</li>)}</ul> : <p className="text-sm text-primary">Ei puutteita.</p>;
}

/* ---------- Kouluttajan rajattu kapasiteettinäkymä ---------- */
export function CompanyTrainerCapacity() {
  useFlowTaskFocus();
  const [params, setParams] = useSearchParams();
  const id = params.get('ohjelma') ?? '';
  const open = (next: string) => { const n = new URLSearchParams(params); n.set('ohjelma', next); setParams(n, { replace: true }); };
  const list = useQuery({ queryKey: ['company_trainer_list'], retry: false, queryFn: () => listTrainerProgrammes(rpc) });
  const stateText = (s: string) => ({ draft: 'Luonnos', approved: 'Ohjelma hyväksytty', superseded: 'Korvattu', cancelled: 'Peruttu' } as Record<string, string>)[s] ?? s;
  return <section className="space-y-3 rounded-lg border bg-background p-4">
    <h2 className="text-lg font-semibold text-keuda-blue">Yrityskoulutuksen kapasiteetti</h2>
    <p className="text-sm text-muted-foreground">Sinulle nimetyt ohjelmat. Yrityksen nimi näkyy; yhteystiedot ja hinnat eivät näy.</p>
    {list.isPending && <p role="status" className="text-sm">Ladataan omia ohjelmia…</p>}
    {list.isError && <p role="alert" className="text-sm text-destructive">Omia ohjelmia ei voitu lukea.</p>}
    {list.data?.length === 0 && <p className="text-sm text-muted-foreground">Sinulle ei ole nimetty yrityskoulutuksen ohjelmia.</p>}
    {!!list.data?.length && <ul aria-label="Omat ohjelmat" className="divide-y rounded border">{list.data.map(p => <li key={p.id}><Button variant="ghost" type="button" aria-current={p.id === id || undefined} onClick={() => open(p.id)} className={`h-auto w-full flex-wrap justify-start gap-2 whitespace-normal p-3 text-left text-sm ${p.id === id ? 'bg-muted' : ''}`}>
      <span className="w-full break-words font-semibold text-keuda-blue">{p.company_name ?? 'Yrityksen nimi puuttuu'}</span><span>{fmt(p.starts_at ?? undefined)} – {fmt(p.ends_at ?? undefined)}</span><Badge variant="outline">Revisio {p.revision}</Badge><Badge variant="secondary">{stateText(p.state)}</Badge><Badge variant={p.capacity_approved ? 'default' : 'outline'}>{p.capacity_approved ? 'Kapasiteetti hyväksytty' : 'Kapasiteetti hyväksymättä'}</Badge>
    </Button></li>)}</ul>}
    {id && <TrainerProgramme key={id} id={id} onRevision={open} />}
  </section>;
}

/* ---------- Henkilöstön kapasiteettipaneeli (kouluttaja tai tuotantovastaava) ---------- */
export function CompanyCapacityPanel({ programmeId, onChanged }: { programmeId: string; onChanged: () => Promise<unknown> }) {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ['company_capacity', programmeId], retry: false, queryFn: () => workflow.read(programmeId) });
  const me = useQuery({ queryKey: ['me_id'], queryFn: async () => (await supabase.auth.getUser()).data.user?.id ?? null });
  return <section className="space-y-2 rounded border p-3">
    <h3 className="text-base font-semibold text-keuda-blue">Kapasiteetti</h3>
    <p className="text-xs text-muted-foreground">Vastuukouluttaja tai tuotantovastaava voi tallentaa ja hyväksyä. Tekoäly- ja yleiskoulutuksissa rastit ja koneet eivät ole pakollisia: aseta osallistujamäärä, tallenna ja hyväksy.</p>
    {q.isPending && <p role="status" className="text-sm">Ladataan kapasiteettia…</p>}
    {q.isError && <p role="alert" className="text-sm text-destructive">{companyErrorText(q.error)}</p>}
    {q.data && me.data && me.data !== (q.data as any).responsible_trainer_id && <p className="rounded-md border border-dashed bg-muted/40 p-2 text-sm">{me.data === (q.data as any).production_owner_id ? 'Voit tallentaa ja hyväksyä kapasiteetin tästä kouluttajan puolesta. Kouluttaja voi tehdä saman omalla tunnuksellaan (Tuotanto → Yrityskoulutuksen kapasiteetti).' : 'Vastuukouluttaja tai tuotantovastaava tallentaa ja hyväksyy kapasiteetin. Sinun ei tarvitse tehdä tässä mitään.'}</p>}
    {q.data && me.data && (me.data === (q.data as any).responsible_trainer_id || me.data === (q.data as any).production_owner_id) && <CapacityForm canSave onBehalf={me.data !== (q.data as any).responsible_trainer_id} key={q.data.id} snap={q.data} onSaved={async () => { qc.removeQueries({ queryKey: ['company_capacity'] }); await onChanged(); }} reload={async () => { await qc.refetchQueries({ queryKey: ['company_capacity', programmeId] }); await onChanged(); }} />}
  </section>;
}

function TrainerProgramme({ id, onRevision }: { id: string; onRevision: (id: string) => void }) {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ['company_trainer', id], retry: false, queryFn: () => workflow.read(id) });
  if (q.isPending) return <p role="status" className="text-sm">Ladataan ohjelmaa…</p>;
  if (q.isError) return <p role="alert" className="text-sm text-destructive">{companyErrorText(q.error)}</p>;
  return <CapacityForm key={q.data.id} snap={q.data} onSaved={async next => { qc.removeQueries({ queryKey: ['company_trainer'] }); await qc.invalidateQueries({ queryKey: ['company_trainer_list'] }); onRevision(next); }} reload={() => Promise.all([qc.refetchQueries({ queryKey: ['company_trainer', id] }), qc.refetchQueries({ queryKey: ['company_trainer_list'] })])} />;
}

function CapacityForm({ snap, onSaved, reload, canSave = true, onBehalf = false }: { snap: CompanySnapshot & { resources?: any[] }; onSaved: (id: string) => Promise<void>; reload: () => Promise<unknown>; canSave?: boolean; onBehalf?: boolean }) {
  const { isEditor } = useAuth();
  const caseId = 'case_lead_id' in snap && typeof snap.case_lead_id === 'string' ? snap.case_lead_id : null;
  const capacityHref = isEditor && caseId ? salesTaskHref(caseId, 'capacity') : `/admin/tuotanto?${new URLSearchParams({ ohjelma: snap.id, tehtava: 'capacity' })}`;
  const cap = (snap.capacity ?? {}) as any;
  const trainerId: string = cap.responsibleTrainerId ?? '';
  const machines: string[] = (Array.isArray((snap as any).resources) ? (snap as any).resources : Array.isArray((snap as any).resource_plan) ? (snap as any).resource_plan : []).map((r: any) => String(r.resourceId)).filter(Boolean);
  const [participants, setParticipants] = useState<number>(Array.isArray(cap.participantIds) ? cap.participantIds.length : 1);
  const [stations, setStations] = useState<CapacityStationInput[]>(Array.isArray(cap.stations) ? cap.stations.map(({ trainerIds, ...s }: any) => s) : []);
  const [slots, setSlots] = useState<CapacitySlotInput[]>(Array.isArray(cap.slots) ? cap.slots.map((s: any) => ({ stationId: s.stationId, participantId: s.participantId, machineId: s.machineId, startsAt: local(s.startsAt), endsAt: local(s.endsAt) })) : []);
  const [busy, setBusy] = useState(false); const [error, setError] = useState(''); const [result, setResult] = useState('');
  const run = async (fn: () => Promise<unknown>, ok: string) => { setBusy(true); setError(''); setResult(''); try { await fn(); setResult(ok); } catch (e) { setError(companyErrorText(e)); } finally { setBusy(false); } };
  const pIds = Array.from({ length: Math.max(0, participants) }, (_, i) => `p${i + 1}`);
  const setSt = (i: number, patch: Partial<CapacityStationInput>) => setStations(stations.map((s, j) => j === i ? { ...s, ...patch } : s));
  const setSl = (i: number, patch: Partial<CapacitySlotInput>) => setSlots(slots.map((s, j) => j === i ? { ...s, ...patch } : s));
  const num = (v: string) => Number(v.replace(',', '.'));
  const s0Machine = (ids?: string[]) => ids?.[0] ?? '';
  const shortId = (m: string) => `Kone ${m.slice(-4)}`;
  const capacityMissing = snap.readiness.missing.filter(m => !['handoff_not_accepted', 'preparation_tasks_open', 'blockers_open', 'confirmed_order_delivery_missing', 'programme_unapproved'].includes(m));
  return <div data-flow-task="capacity" className="space-y-4 border-t pt-3">
    {!isEditor && <NextStep owner={snap.programme?.trainers?.[0]} step={{ stage: 'Kapasiteetin valmistelu', role: 'Vastuukouluttaja', ownerId: trainerId, issues: capacityMissing, action: { label: 'Tarkista osallistujamäärä ja kapasiteetti', href: capacityHref } }} />}
    {snap.company_name !== undefined && <h3 className="break-words text-base font-semibold text-keuda-blue">{snap.company_name ?? 'Yrityksen nimi puuttuu'}</h3>}
    <div className="flex flex-wrap items-center gap-2 text-sm"><Badge variant="outline">Revisio {snap.revision}</Badge><span>{fmt(snap.programme?.startsAt)} – {fmt(snap.programme?.endsAt)}</span></div>
    <div className="text-sm"><WorkspacePerson person={{ id: trainerId }} name={snap.programme?.trainers?.[0] ?? "Vastuukouluttaja"} role="Vastuukouluttaja" /></div><p className="whitespace-pre-wrap text-sm">{snap.programme?.text}</p>
    <div className="max-w-[12rem]"><label htmlFor="ct-participants" className="text-xs text-muted-foreground">Osallistujamäärä</label><Input id="ct-participants" type="number" min={1} max={500} value={participants} onChange={e => setParticipants(Math.trunc(num(e.target.value)) || 0)} /></div>
    <div className="space-y-2"><h3 className="text-sm font-semibold">Rastit (valinnainen)</h3>
      {stations.length === 0 && <p className="text-xs text-muted-foreground">Ei rasteja – sopii tekoäly- ja yleiskoulutuksiin, joissa ei käytetä koneita.</p>}
      {stations.map((s, i) => <div key={i} className="grid gap-2 rounded border p-2 sm:grid-cols-7">
        <Input aria-label={`Rasti ${i + 1} tunnus`} value={s.id} onChange={e => setSt(i, { id: e.target.value })} />
        <select aria-label={`Rasti ${i + 1} pakollisuus`} className="h-10 rounded-md border border-input bg-background px-2 text-sm" value={s.requirement} onChange={e => setSt(i, { requirement: e.target.value as any })}><option value="required">Pakollinen</option><option value="optional">Valinnainen</option></select>
        <Input aria-label={`Rasti ${i + 1} ohjattu min`} title="Ohjattu aika (min)" inputMode="numeric" value={s.guidedMinutes} onChange={e => setSt(i, { guidedMinutes: num(e.target.value) })} />
        <Input aria-label={`Rasti ${i + 1} siirtymä min`} title="Siirtymä (min)" inputMode="numeric" value={s.transitionMinutes} onChange={e => setSt(i, { transitionMinutes: num(e.target.value) })} />
        <Input aria-label={`Rasti ${i + 1} rinnakkain`} title="Turvallisesti rinnakkain" inputMode="numeric" value={s.safeParallel} onChange={e => setSt(i, { safeParallel: num(e.target.value) })} />
        <Input aria-label={`Rasti ${i + 1} per kouluttaja`} title="Osallistujia per kouluttaja" inputMode="numeric" value={s.participantsPerTrainer} onChange={e => setSt(i, { participantsPerTrainer: num(e.target.value) })} />
        <div className="flex flex-wrap items-center gap-2 text-xs">{machines.map(m => <label key={m} className="flex items-center gap-1"><input type="checkbox" checked={s.machineIds.includes(m)} onChange={e => setSt(i, { machineIds: e.target.checked ? [...s.machineIds, m] : s.machineIds.filter(x => x !== m) })} />{shortId(m)}</label>)}<Button size="icon" variant="ghost" aria-label={`Poista rasti ${i + 1}`} onClick={() => setStations(stations.filter((_, j) => j !== i))}><Trash2 className="h-4 w-4" /></Button></div>
      </div>)}
      <p className="text-xs text-muted-foreground">Sarakkeet: tunnus · pakollisuus · ohjattu aika min · siirtymä min · turvallisesti rinnakkain · osallistujia per kouluttaja · koneet</p>
      <Button size="sm" variant="outline" onClick={() => setStations([...stations, { id: `s${stations.length + 1}`, requirement: 'required', guidedMinutes: 60, transitionMinutes: 0, safeParallel: 1, participantsPerTrainer: 1, machineIds: [] }])}><Plus className="mr-1 h-4 w-4" />Lisää rasti</Button>
    </div>
    <div className="space-y-2"><h3 className="text-sm font-semibold">Harjoitusvuorot</h3>
      {slots.map((s, i) => <div key={i} className="grid gap-2 sm:grid-cols-6">
        <select aria-label={`Vuoro ${i + 1} rasti`} className="h-10 rounded-md border border-input bg-background px-2 text-sm" value={s.stationId} onChange={e => setSl(i, { stationId: e.target.value })}><option value="">Rasti</option>{stations.map(st => <option key={st.id} value={st.id}>{st.id}</option>)}</select>
        <select aria-label={`Vuoro ${i + 1} osallistuja`} className="h-10 rounded-md border border-input bg-background px-2 text-sm" value={s.participantId} onChange={e => setSl(i, { participantId: e.target.value })}><option value="">Osallistuja</option>{pIds.map(p => <option key={p} value={p}>{p}</option>)}</select>
        <select aria-label={`Vuoro ${i + 1} kone`} className="h-10 rounded-md border border-input bg-background px-2 text-sm" value={s.machineId} onChange={e => setSl(i, { machineId: e.target.value })}><option value="">Ei konetta</option>{machines.map(m => <option key={m} value={m}>{shortId(m)}</option>)}</select>
        <Input aria-label={`Vuoro ${i + 1} alkaa`} type="datetime-local" value={s.startsAt} onChange={e => setSl(i, { startsAt: e.target.value })} />
        <Input aria-label={`Vuoro ${i + 1} päättyy`} type="datetime-local" value={s.endsAt} onChange={e => setSl(i, { endsAt: e.target.value })} />
        <Button size="icon" variant="ghost" aria-label={`Poista vuoro ${i + 1}`} onClick={() => setSlots(slots.filter((_, j) => j !== i))}><Trash2 className="h-4 w-4" /></Button>
      </div>)}
      <Button size="sm" variant="outline" onClick={() => setSlots([...slots, { stationId: stations[0]?.id ?? '', participantId: 'p1', machineId: s0Machine(stations[0]?.machineIds), startsAt: local(snap.programme?.startsAt), endsAt: local(snap.programme?.endsAt) }])}><Plus className="mr-1 h-4 w-4" />Lisää vuoro</Button>
    </div>
    <div><h3 className="text-sm font-semibold">Palvelimen tarkistus tallennetulle versiolle</h3><Missing items={capacityMissing} /></div>
    {canSave && <p className="text-xs text-muted-foreground">Helpoin tapa: aseta osallistujamäärä ja paina <strong>Tallenna ja hyväksy</strong>. Hyväksyntä koskee aina viimeksi tallennettua versiota.</p>}
    {onBehalf && <p className="rounded-md border bg-muted/50 p-2 text-xs">Hyväksyt tuotannon vastuuhenkilönä <strong>kouluttajan puolesta</strong>. Hyväksyntä tallentuu omalla nimelläsi, ja kouluttaja voi myöhemmin päivittää kapasiteetin itse.</p>}
    <div className="flex flex-wrap gap-2">
      {canSave && <Button variant="outline" disabled={busy || !trainerId} onClick={() => run(async () => { const next = await workflow.saveCapacity(snap.id, buildCapacity({ participants, trainerId, stations, slots }) as any); await onSaved(next.id); }, 'Kapasiteetti tallennettu uutena revisiona ja luettu takaisin')}><Save className="mr-2 h-4 w-4" />Tallenna kapasiteetti</Button>}
      {canSave && <Button className="order-first" disabled={busy || !trainerId} onClick={() => run(async () => { const next = await workflow.saveCapacity(snap.id, buildCapacity({ participants, trainerId, stations, slots }) as any); await workflow.approveCapacity(next.id); await onSaved(next.id); }, 'Kapasiteetti tallennettu, hyväksytty ja luettu takaisin')}><Check className="mr-2 h-4 w-4" />Tallenna ja hyväksy</Button>}
      <Button variant={canSave ? 'ghost' : 'default'} size={canSave ? 'sm' : 'default'} className={canSave ? 'self-center' : ''} disabled={busy} onClick={() => run(async () => { await workflow.approveCapacity(snap.id); await reload(); }, 'Kapasiteetti hyväksytty ja luettu takaisin')}><Check className="mr-2 h-4 w-4" />Hyväksy kapasiteetti</Button>
    </div>
    <Status error={error} result={result} />
  </div>;
}

/* ---------- Tuotannon vastaanotto ja aloitusvalmius ---------- */
export function CompanyHandoffsPanel({ userId }: { userId: string }) {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ['company_handoffs'], queryFn: async () => {
    const h = await db.from('crm_production_handoffs').select('id,order_id,production_owner_id,company_programme_id,company_state,company_revision,company_return_reason,handed_at').not('company_programme_id', 'is', null).order('handed_at', { ascending: false });
    if (h.error) throw h.error;
    return Promise.all((h.data as any[]).map(async row => {
      const snap = await workflow.read(row.company_programme_id).catch(e => ({ error: companyErrorText(e) }));
      const d = await db.from('prod_deliveries').select('id,title,production_status,company_programme_id').eq('order_id', row.order_id).maybeSingle();
      if (d.error) throw d.error;
      const [t, b] = d.data ? await Promise.all([db.from('prod_tasks').select('id,title,blocks_start,completed_at,due_at').eq('delivery_id', d.data.id).order('due_at'), db.from('prod_blockers').select('id,description,resolved_at').eq('delivery_id', d.data.id)]) : [{ data: [] }, { data: [] }];
      if ((t as any).error || (b as any).error) throw (t as any).error ?? (b as any).error;
      return { row, snap, delivery: d.data, tasks: (t as any).data as any[], blockers: (b as any).data as any[] };
    }));
  } });
  const [params] = useSearchParams();
  const selectedId = params.get('luovutus');
  return <section className="space-y-3 rounded-lg border bg-background p-4">
    <h2 className="text-lg font-semibold text-keuda-blue">Yrityskoulutusten luovutukset</h2>
    {q.isPending && <p role="status" className="text-sm">Ladataan luovutuksia…</p>}
    {q.isError && <p role="alert" className="text-sm text-destructive">Luovutuksia ei voitu lukea. Mitään ei näytetä vastaanotettuna.</p>}
    {q.data?.length === 0 && <p className="text-sm text-muted-foreground">Ei yrityskoulutusten luovutuksia.</p>}
    {selectedId && q.isSuccess && !q.data.some(item => item.row.id === selectedId) && <p role="alert">Valittua luovutusta ei löydy tai siihen ei ole oikeutta.</p>}
    {q.data?.filter(item => !selectedId || item.row.id === selectedId).map(item => <HandoffCard key={item.row.id} item={item} mine={item.row.production_owner_id === userId} refresh={() => qc.refetchQueries({ queryKey: ['company_handoffs'] })} />)}
  </section>;
}

function HandoffCard({ item, mine, refresh }: { item: any; mine: boolean; refresh: () => Promise<unknown> }) {
  const { row, snap, delivery, tasks, blockers } = item;
  const [, setParams] = useSearchParams();
  const [reason, setReason] = useState(''); const [busy, setBusy] = useState(false); const [error, setError] = useState(''); const [result, setResult] = useState('');
  const run = async (fn: () => Promise<unknown>, ok: string) => { setBusy(true); setError(''); setResult(''); try { await fn(); await refresh(); setResult(ok); } catch (e) { setError(companyErrorText(e)); await refresh(); } finally { setBusy(false); } };
  if (snap.error) return <div className="rounded border p-3 text-sm text-destructive" role="alert">{snap.error}</div>;
  const missing: string[] = snap.readiness.missing; const crit = tasks.filter((t: any) => t.blocks_start); const doneN = crit.filter((t: any) => t.completed_at).length; const pct = crit.length ? Math.round(100 * doneN / crit.length) : (snap.readiness.ready ? 100 : 0);
  const state = ({ submitted: 'Odottaa vastaanottoa', accepted: 'Vastaanotettu', returned: 'Palautettu' } as Record<string, string>)[row.company_state] ?? row.company_state;
  const stale = row.company_revision !== snap.revision;
  const critical = tasks.filter((t: any) => t.blocks_start);
  return <article data-flow-task={`handoff-${row.id}`} className="space-y-3 rounded border p-3">
    <NextStep owner={mine ? 'Oma tuotantovastuu' : null} step={{ stage: stale ? 'Luovutus koskee aiempaa revisiota' : state, role: row.company_state === 'returned' || stale ? 'Myyjä' : 'Tuotantovastaava', ownerId: row.company_state === 'returned' || stale ? snap.sales_owner_id : row.production_owner_id, waiting: !mine && row.company_state === 'submitted', issues: row.company_state === 'returned' ? [row.company_return_reason || 'Palautuksen syy puuttuu'] : missing, action: row.company_state === 'returned' || stale ? { label: 'Korjaa luovutuksen ohjelma', href: salesTaskHref(snap.case_lead_id, 'programme', undefined, row.order_id) } : row.company_state === 'accepted' && delivery ? { label: 'Avaa koulutuksen valmistelu', href: trainingTaskHref(delivery.id, 'aikataulu') } : { label: 'Tarkista vastaanoton tiedot', href: receiveHref(row.id) + '&tehtava=receive-review' } }} />
    <div className="flex flex-wrap items-center gap-2"><strong>{delivery?.title ?? 'Toteutus'}</strong><Badge variant="outline">Revisio {row.company_revision}</Badge><Badge variant={row.company_state === 'accepted' ? 'default' : row.company_state === 'returned' ? 'destructive' : 'secondary'}>{state}</Badge>{snap.readiness.ready ? <Badge>Aloitusvalmis</Badge> : null}</div>
    {stale && <p className="text-sm text-destructive">Ohjelmasta on uudempi revisio {snap.revision}; tämä luovutus vaatii uuden luovutuksen.</p>}
    <div className="text-sm"><WorkspacePerson person={{ id: snap.responsible_trainer_id }} name={snap.programme?.trainers?.[0] ?? "Vastuukouluttaja"} role="Vastuukouluttaja" /></div><p className="whitespace-pre-wrap text-sm">{snap.programme?.text}</p>
    {snap.promises && <p className="text-sm"><span className="text-muted-foreground">Asiakkaalle luvattu: </span>{snap.promises}</p>}
    <div><div className="flex items-center justify-between text-xs"><span>Aloitusvalmius</span><span>{snap.readiness.ready ? 'Valmis' : `${missing.length} puutetta`}{crit.length ? ` · kriittiset ${doneN}/${crit.length}` : ''}</span></div>
      <div className="mt-1 h-2 w-full rounded bg-muted" role="meter" aria-label="Aloitusvalmius" aria-valuemin={0} aria-valuemax={100} aria-valuenow={snap.readiness.ready ? 100 : pct}><div className="h-2 rounded bg-primary" style={{ width: `${snap.readiness.ready ? 100 : pct}%` }} /></div>
      <div className="mt-2"><Missing items={missing} /></div></div>
    <div data-flow-task={`receive-review-${row.id}`} className="grid gap-3 sm:grid-cols-2 text-sm">
      <div><h4 className="font-semibold">Kriittiset tehtävät</h4>{critical.length ? <ul>{critical.map((t: any) => <li key={t.id}>{t.completed_at ? '✓' : '○'} {t.title}</li>)}</ul> : <p className="text-muted-foreground">Ei kriittisiä tehtäviä.</p>}</div>
      <div><h4 className="font-semibold">Puutteet</h4>{blockers.length ? <ul>{blockers.map((b: any) => <li key={b.id}>{b.resolved_at ? '✓' : '○'} {b.description}</li>)}</ul> : <p className="text-muted-foreground">Ei kirjattuja puutteita.</p>}</div>
    </div>
    <div className="flex flex-wrap items-center gap-2">{delivery && <Button size="sm" onClick={() => setParams({ toteutus: delivery.id })}>Avaa koulutuskortti</Button>}<span className="text-xs text-muted-foreground">Kouluttajan linkki: <span className="font-mono">/admin/tuotanto?ohjelma={snap.id}</span></span></div>
    {row.company_state === 'returned' && <p className="text-sm">Palautuksen syy: {row.company_return_reason}</p>}
    {mine && row.company_state === 'submitted' && !stale && <div className="space-y-2">
      <div><label htmlFor={`ct-reason-${row.id}`} className="text-xs text-muted-foreground">Palautuksen syy</label><Textarea id={`ct-reason-${row.id}`} maxLength={2000} value={reason} onChange={e => setReason(e.target.value)} /></div>
      <div className="flex flex-wrap gap-2">
        <Button disabled={busy} onClick={() => run(() => workflow.respond(snap.id, row.order_id, true), 'Vastaanotettu ja luettu takaisin')}><Check className="mr-2 h-4 w-4" />Vastaanota</Button>
        <Button variant="outline" disabled={busy || !reason.trim()} onClick={() => run(async () => workflow.respond(snap.id, row.order_id, false, reason), 'Palautettu ja luettu takaisin')}><Undo2 className="mr-2 h-4 w-4" />Palauta perustellen</Button>
      </div></div>}
    {!mine && row.company_state === 'submitted' && <p className="text-xs text-muted-foreground">Vain nimetty tuotantovastaava voi vastaanottaa tai palauttaa.</p>}
    <Status error={error} result={result} />
  </article>;
}
