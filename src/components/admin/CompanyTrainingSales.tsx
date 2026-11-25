import { WorkspacePerson } from "./WorkspacePerson";
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Save, Check, Link2, Send } from 'lucide-react';
import { companyWorkflow, companyErrorText, nextRevisionInput, readinessLabel, type CompanyStaffSnapshot } from '@/lib/companyTrainingWorkflow';
import { readAll } from '@/lib/crm';
import { confirmCompanyOrder, orderInputErrors } from '@/lib/companyOrder';
import { CompanyCapacityPanel } from '@/components/admin/CompanyTrainingProduction';

const db = supabase as any;
// All writes go through server checkpoints; UI shows only state read back after each command.
const workflow = companyWorkflow(async (name, args) => {
  const { data, error } = await db.rpc(name, args);
  if (error) throw new Error(error.message || 'rpc_failed');
  return data;
});
const local = (iso?: string) => { if (!iso) return ''; const d = new Date(iso); if (!Number.isFinite(d.getTime())) return ''; const p = (n: number) => String(n).padStart(2, '0'); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`; };
type Team = { id: string; email: string }[];

function Pick({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: [string, string][] }) {
  const id = `ct-${label.replace(/\W+/g, '-')}`;
  return <div><label htmlFor={id} className="text-xs text-muted-foreground">{label}</label>
    <select id={id} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={value} onChange={e => onChange(e.target.value)}>
      <option value="">Valitse</option>{options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>{/kouluttaja|vastaava/i.test(label) && value && <div className="mt-2"><WorkspacePerson person={{ id: value }} name={options.find(([v]) => v === value)?.[1]} size="xs" /></div>}</div>;
}

export function CompanyTrainingSales({ leadId, refreshKey = '' }: { leadId?: string; refreshKey?: string }) {
  const [selected, setSelected] = useState(leadId ?? '');
  const team = useQuery({ queryKey: ['mt_team'], queryFn: async () => { const { data, error } = await supabase.functions.invoke('admin-users', { body: { action: 'team' } }); if (error) throw error; return data.users as Team; } });
  const cases = useQuery({ enabled: !leadId, queryKey: ['company_cases'], queryFn: async () => readAll((f, t) => db.from('booking_requests').select('id,name,organization').eq('mt_personal', false).not('organization', 'is', null).order('organization').order('id').range(f, t)) as Promise<any[]> });
  return <section className="space-y-4 border-t pt-5">
    <h2 className="text-lg font-semibold text-keuda-blue">Yrityskoulutuksen ohjelma</h2>
    {!leadId && <Pick label="Yrityskoulutuksen asiakas" value={selected} onChange={setSelected} options={(cases.data ?? []).map(c => [c.id, c.organization ?? c.name])} />}
    {!leadId && cases.isPending && <p role="status" className="text-sm text-muted-foreground">Ladataan yritysasiakkaita…</p>}
    {!leadId && cases.isError && <p role="alert" className="text-sm text-destructive">Yritysasiakkaita ei voitu hakea.</p>}
    {!leadId && cases.isSuccess && cases.data.length === 0 && <p className="text-sm text-muted-foreground">Ei yritysasiakkaita.</p>}
    {team.isError && <p role="alert" className="text-sm text-destructive">Tiimihakemistoa ei saatu. Vain jo tallennetut vastuuhenkilöt voidaan säilyttää.</p>}
    {selected && <CaseProgramme key={selected} leadId={selected} team={team.data ?? []} refreshKey={refreshKey} />}
  </section>;
}

function CaseProgramme({ leadId, team, refreshKey }: { leadId: string; team: Team; refreshKey: string }) {
  const qc = useQueryClient();
  const key = ['company_case', leadId, refreshKey];
  const q = useQuery({ queryKey: key, queryFn: async () => {
    const lead = await db.from('booking_requests').select('id,name,email,organization,owner_id,mt_personal,company_programme_id,service_key').eq('id', leadId).maybeSingle();
    if (lead.error) throw lead.error;
    const orders = await db.from('crm_orders').select('id,created_at').eq('lead_id', leadId).order('created_at');
    if (orders.error) throw orders.error;
    const snapshot = lead.data?.company_programme_id ? await workflow.read(lead.data.company_programme_id) as CompanyStaffSnapshot : null;
    const handoffs = orders.data.length ? await db.from('crm_production_handoffs').select('order_id,company_programme_id,company_state,company_return_reason').in('order_id', orders.data.map((o: any) => o.id)) : { data: [], error: null };
    if (handoffs.error) throw handoffs.error;
    const deliveries = orders.data.length ? await db.from('prod_deliveries').select('id,order_id,company_programme_id').in('order_id', orders.data.map((o: any) => o.id)) : { data: [], error: null };
    if (deliveries.error) throw deliveries.error;
    const templates = await db.from('prod_templates').select('key,name');
    const offers = await db.from('crm_offers').select('id,title,amount,status,expected_close').eq('lead_id', leadId).eq('status', 'accepted').order('created_at');
    if (offers.error) throw offers.error;
    return { lead: lead.data, orders: orders.data as any[], snapshot, handoffs: handoffs.data as any[], deliveries: deliveries.data as any[], templates: (templates.data ?? []) as any[], offers: offers.data as any[] };
  } });
  const [busy, setBusy] = useState(false); const [error, setError] = useState(''); const [result, setResult] = useState('');
  const run = async (fn: () => Promise<unknown>, ok: string) => {
    setBusy(true); setError(''); setResult('');
    try { await fn(); await qc.invalidateQueries({ queryKey: key }); await qc.refetchQueries({ queryKey: key }); setResult(ok); }
    catch (e) { setError(companyErrorText(e)); await qc.invalidateQueries({ queryKey: key }); }
    finally { setBusy(false); }
  };
  if (q.isPending) return <p role="status" className="text-sm">Ladataan yrityskoulutuksen ohjelmaa…</p>;
  if (q.isError) return <p role="alert" className="text-sm text-destructive">{companyErrorText(q.error)}</p>;
  const { lead, orders, snapshot, handoffs, deliveries, templates, offers } = q.data;
  if (!lead || lead.mt_personal) return null;
  return <>{orders.length === 0 && offers.length > 0 && <OrderForm lead={lead} offers={offers} busy={busy} run={run} />}<ProgrammeForm key={snapshot?.id ?? 'new'} lead={lead} snapshot={snapshot} team={team} orders={orders} handoffs={handoffs} deliveries={deliveries} templates={templates} busy={busy} run={run} error={error} result={result} /></>;
}

function OrderForm({ lead, offers, busy, run }: any) {
  const [offerId, setOfferId] = useState(offers[0].id); const offer = offers.find((o: any) => o.id === offerId) ?? offers[0];
  const [org, setOrg] = useState(lead.organization ?? ''); const [contact, setContact] = useState(lead.name ?? ''); const [mail, setMail] = useState(lead.email ?? '');
  const [content, setContent] = useState(offer.title ?? ''); const [amount, setAmount] = useState(String(offer.amount ?? ''));
  const [startsOn, setStartsOn] = useState(''); const [endsOn, setEndsOn] = useState(''); const [vat, setVat] = useState<'koulutus_veroton' | 'yleinen'>('koulutus_veroton');
  const [terms, setTerms] = useState('KeudaPROn yleiset sopimusehdot'); const [pay, setPay] = useState('14 päivää netto');
  const [method, setMethod] = useState<'sahkoposti' | 'allekirjoitus' | 'suullinen_muistio'>('sahkoposti'); const [note, setNote] = useState('');
  const input = { leadId: lead.id, offerId, organization: org, contactName: contact, contactEmail: mail, content, amount: Number(amount.replace(',', '.')), startsOn, endsOn, vatBasis: vat, terms, paymentTerms: pay, approvalMethod: method, approvalNote: note, serviceKey: lead.service_key };
  const missing = orderInputErrors(input);
  const f = (id: string, label: string, v: string, set: (x: string) => void, type = 'text') => <div><label htmlFor={id} className="text-xs text-muted-foreground">{label}</label><Input id={id} type={type} value={v} onChange={e => set(e.target.value)} /></div>;
  return <div className="space-y-3 rounded-lg border p-3">
    <h3 className="font-semibold text-keuda-blue">Vahvista tilaus hyväksytystä tarjouksesta</h3>
    <div className="grid gap-3 sm:grid-cols-2">
      <Pick label="Hyväksytty tarjous" value={offerId} onChange={v => { setOfferId(v); const o = offers.find((x: any) => x.id === v); if (o) { setContent(o.title); setAmount(String(o.amount)); } }} options={offers.map((o: any) => [o.id, `${o.title} · ${Number(o.amount).toLocaleString('fi-FI')} €`])} />
      {f('co-org', 'Ostaja (yritys)', org, setOrg)}{f('co-contact', 'Tilaajan yhteyshenkilö', contact, setContact)}{f('co-mail', 'Yhteyshenkilön sähköposti', mail, setMail, 'email')}
      {f('co-content', 'Sovittu sisältö', content, setContent)}{f('co-amount', 'Summa € (alv 0 %)', amount, setAmount)}
      {f('co-start', 'Alkaa', startsOn, setStartsOn, 'date')}{f('co-end', 'Päättyy', endsOn, setEndsOn, 'date')}
      <Pick label="ALV-käsittely" value={vat} onChange={v => setVat(v as any)} options={[['koulutus_veroton', 'Koulutus, veroton'], ['yleinen', 'Yleinen 25,5 %']]} />
      {f('co-terms', 'Sopimusehdot', terms, setTerms)}{f('co-pay', 'Maksuehto', pay, setPay)}
      <Pick label="Asiakkaan hyväksyntätapa" value={method} onChange={v => setMethod(v as any)} options={[['sahkoposti', 'Sähköposti'], ['allekirjoitus', 'Allekirjoitus'], ['suullinen_muistio', 'Suullinen, muistio']]} />
      {f('co-note', 'Hyväksynnän kuvaus (esim. kenen viesti ja milloin)', note, setNote)}
    </div>
    {missing.length > 0 && <p className="text-xs text-muted-foreground">Puuttuu: {missing.join(', ')}</p>}
    <Button disabled={busy || missing.length > 0} onClick={() => run(async () => { const { data } = await supabase.auth.getUser(); if (!data.user) throw new Error('Kirjaudu uudelleen'); await confirmCompanyOrder({ ...input, userId: data.user.id }); }, 'Tilaus vahvistettu ja luettu takaisin')}><Check className="mr-2 h-4 w-4" />Vahvista tilaus</Button>
  </div>;
}

function ProgrammeForm({ lead, snapshot, team, orders, handoffs, deliveries, templates, busy, run, error, result }: any) {
  const s = snapshot as CompanyStaffSnapshot | null;
  const [text, setText] = useState(s?.programme?.text ?? '');
  const [promises, setPromises] = useState(s?.promises ?? '');
  const [start, setStart] = useState(local(s?.programme?.startsAt)); const [end, setEnd] = useState(local(s?.programme?.endsAt));
  const [receiver, setReceiver] = useState(s?.production_owner_id ?? ''); const [trainer, setTrainer] = useState(s?.responsible_trainer_id ?? '');
  const [note, setNote] = useState(''); const [order, setOrder] = useState(orders[0]?.id ?? ''); const [template, setTemplate] = useState(templates.some((t: any) => t.key === 'yrityskoulutus_tilaus') ? 'yrityskoulutus_tilaus' : '');
  const known = new Set((team as Team).map(t => t.id));
  const options: [string, string][] = [...(team as Team).map(t => [t.id, t.email] as [string, string]),
    ...[s?.production_owner_id, s?.responsible_trainer_id].filter((id, i, a): id is string => !!id && !known.has(id) && a.indexOf(id) === i).map(id => [id, `Tallennettu vastuuhenkilö ${id.slice(0, 8)}`] as [string, string])];
  const email = (id?: string | null) => (team as Team).find(t => t.id === id)?.email ?? (id ? `Tunnus ${id.slice(0, 8)}` : 'Ei valittu');
  const delivery = deliveries.find((d: any) => d.order_id === order && d.company_programme_id === s?.id);
  const handoff = handoffs.find((h: any) => h.order_id === order);
  const handoffText = handoff?.company_programme_id === s?.id ? ({ submitted: 'Luovutettu, odottaa vastaanottoa', accepted: 'Tuotanto vastaanotti', returned: 'Palautettu täydennettäväksi' } as Record<string, string>)[handoff?.company_state] : undefined;
  const save = () => run(() => workflow.save(nextRevisionInput({ caseId: lead.id, current: s, text, promises, startsAt: start, endsAt: end, receiverId: receiver, trainerId: trainer, trainers: [email(trainer)] })), s ? 'Uusi revisio tallennettu ja luettu takaisin' : 'Ohjelmaluonnos tallennettu ja luettu takaisin');
  return <div className="space-y-4">
    <div className="flex flex-wrap items-center gap-2 text-sm">
      {s ? <><Badge variant="outline">Revisio {s.revision}</Badge><Badge variant={s.state === 'approved' ? 'default' : 'secondary'}>{s.state === 'approved' ? 'Ohjelma hyväksytty' : 'Luonnos'}</Badge>{s.readiness.ready ? <Badge>Aloitusvalmis</Badge> : <span className="text-muted-foreground">Aloitukselta puuttuu {s.readiness.missing.length}</span>}</> : <span className="text-muted-foreground">Ohjelmaa ei ole vielä tallennettu.</span>}
    </div>
    {s && <div className="flex flex-wrap gap-4 text-sm">{[[s.sales_owner_id, "Myyjä"], [s.responsible_trainer_id, "Kouluttaja"], [s.production_owner_id, "Tuotanto"]].map(([id, role]) => <WorkspacePerson key={role} person={(team as Team).find(t => t.id === id)} name={email(id)} role={role} />)}</div>}
    <div className="grid gap-3 sm:grid-cols-2">
      <div><label className="text-xs text-muted-foreground">Myyjä (asiakkaan vastuuhenkilö)</label><div className="mt-2"><WorkspacePerson person={(team as Team).find(t => t.id === lead.owner_id)} name={email(lead.owner_id)} /></div></div>
      <Pick label="Vastuukouluttaja" value={trainer} onChange={setTrainer} options={options} />
      <Pick label="Tuotantovastaava" value={receiver} onChange={setReceiver} options={options} />
      <div />
      <div><label htmlFor="ct-start" className="text-xs text-muted-foreground">Alkaa</label><Input id="ct-start" type="datetime-local" value={start} onChange={e => setStart(e.target.value)} /></div>
      <div><label htmlFor="ct-end" className="text-xs text-muted-foreground">Päättyy</label><Input id="ct-end" type="datetime-local" value={end} onChange={e => setEnd(e.target.value)} /></div>
    </div>
    <div><label htmlFor="ct-text" className="text-xs text-muted-foreground">Ohjelma</label><Textarea id="ct-text" rows={6} maxLength={20000} value={text} onChange={e => setText(e.target.value)} /></div>
    <div><label htmlFor="ct-promises" className="text-xs text-muted-foreground">Asiakkaalle luvattu (näkyy tuotannolle)</label><Textarea id="ct-promises" rows={2} maxLength={4000} value={promises} onChange={e => setPromises(e.target.value)} /></div>
    <Button disabled={busy || !text.trim() || !start || !end || !receiver || !trainer} onClick={save}><Save className="mr-2 h-4 w-4" />{s ? 'Tallenna uusi revisio' : 'Tallenna ohjelmaluonnos'}</Button>
    {s && <>
      {s.state !== 'approved' && <div className="flex flex-wrap items-end gap-2 border-t pt-3"><div className="flex-1 min-w-[12rem]"><label htmlFor="ct-note" className="text-xs text-muted-foreground">Tarkistusmerkintä</label><Input id="ct-note" maxLength={1000} value={note} onChange={e => setNote(e.target.value)} /></div><Button disabled={busy || !note.trim()} onClick={() => run(() => workflow.approveProgramme(s.id, note.trim()), 'Ohjelma hyväksytty ja luettu takaisin')}><Check className="mr-2 h-4 w-4" />Hyväksy ohjelma</Button></div>}
      <div className="grid gap-3 border-t pt-3 sm:grid-cols-2">
        <Pick label="Vahvistettu tilaus" value={order} onChange={setOrder} options={orders.map((o: any) => [o.id, `Tilaus ${new Date(o.created_at).toLocaleDateString('fi-FI')} · ${o.id.slice(0, 8)}`])} />
        <Pick label="Toteutuspohja" value={template} onChange={setTemplate} options={templates.map((t: any) => [t.key, t.name])} />
      </div>
      <CompanyCapacityPanel programmeId={s.id} onChanged={() => run(async () => {}, 'Kapasiteetti päivitetty')} />
      {orders.length === 0 && <p className="text-sm text-muted-foreground">Asiakkaalla ei ole vahvistettua tilausta.</p>}
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" disabled={busy || !order || !template || !!delivery} onClick={() => run(() => workflow.attachOrder(s.id, order, template), 'Tilaus kytketty toteutukseen')}><Link2 className="mr-2 h-4 w-4" />{delivery ? 'Tilaus kytketty' : 'Kytke tilaus'}</Button>
        <Button disabled={busy || !delivery || handoff?.company_programme_id === s.id && ['submitted', 'accepted'].includes(handoff?.company_state)} onClick={() => run(() => workflow.submit(s.id, order), 'Luovutettu tuotantoon ja luettu takaisin')}><Send className="mr-2 h-4 w-4" />Luovuta tuotantoon</Button>
        {handoffText && <Badge variant="outline">{handoffText}</Badge>}
      </div>
      {handoff?.company_state === 'returned' && handoff.company_programme_id === s.id && <p className="text-sm text-destructive">Palautuksen syy: {handoff.company_return_reason}</p>}
      {s.readiness.missing.length > 0 && <details className="text-xs text-muted-foreground"><summary>Aloitusvalmiuden puutteet</summary><ul className="list-disc pl-5">{s.readiness.missing.map((m, i) => <li key={i}>{readinessLabel(m)}</li>)}</ul></details>}
    </>}
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    {result && <p role="status" className="text-sm text-primary">{result}</p>}
  </div>;
}
