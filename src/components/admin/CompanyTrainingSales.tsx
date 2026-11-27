import { BillingPlanPanel } from './BillingPlanPanel';
import { salesFlow } from '@/lib/companyFlow';
import { FlowStepper } from './FlowStepper';
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
import { OrderConfirmationForm } from './OrderConfirmationForm';
import type { Contract } from '@/lib/orderReview';
import { CustomerLinkDialog } from '@/components/admin/CustomerLinkDialog';
import { CompanyCapacityPanel } from '@/components/admin/CompanyTrainingProduction';
import { helsinkiLocal as local } from '@/lib/helsinkiTime';

const db = supabase as any;
// All writes go through server checkpoints; UI shows only state read back after each command.
const workflow = companyWorkflow(async (name, args) => {
  const { data, error } = await db.rpc(name, args);
  if (error) throw new Error(error.message || 'rpc_failed');
  return data;
});
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
    const lead = await db.from('booking_requests').select('id,name,email,organization,organization_id,contact_id,owner_id,mt_personal,company_programme_id,service_key').eq('id', leadId).maybeSingle();
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
    const offerIds = (offers.data ?? []).map((o: any) => o.id);
    const versions = offerIds.length ? await db.from('crm_offer_versions').select('*').in('offer_id', offerIds).not('approved_at', 'is', null).order('version_no', { ascending: false }) : { data: [], error: null };
    if (versions.error) throw versions.error;
    const versionIds = versions.data.map((v: any) => v.id);
    const lines = versionIds.length ? await db.from('crm_offer_version_lines').select('*').in('version_id', versionIds).order('line_no') : { data: [], error: null };
    if (lines.error) throw lines.error;
    const acceptedOffers = (offers.data ?? []).map((o: any) => { const v = versions.data.find((v: any) => v.offer_id === o.id); const rows = lines.data.filter((l: any) => l.version_id === v?.id); return { ...o, versionId: v?.id ?? null, approvalMethod: v?.approval_method ?? null, approvalNote: v?.approval_note ?? null, contract: v ? { amount: rows.reduce((sum: number,l: any) => sum + Number(l.quantity)*Number(l.unit_price),0), vat_basis: v.vat_basis, vat_rate: v.vat_rate === null ? null : Number(v.vat_rate), vat_reason: v.vat_reason, content: v.content, lines: rows.map((l: any) => ({line_no:l.line_no,description:l.description,quantity:Number(l.quantity),unit_price:Number(l.unit_price)})), starts_on:v.starts_on, ends_on:v.ends_on, terms:v.terms, payment_terms:v.payment_terms, billing_mode:v.billing_mode, billing_installments:v.billing_installments ?? [] } as Contract : null }; });
    const org = lead.data?.organization_id ? await db.from('crm_organizations').select('id,name,business_id').eq('id', lead.data.organization_id).maybeSingle() : { data: null, error: null };
    if (org.error) throw org.error;
    const contact = lead.data?.contact_id ? await db.from('crm_contacts').select('id,name,email').eq('id', lead.data.contact_id).maybeSingle() : { data: null, error: null };
    if (contact.error) throw contact.error;
    return { buyer: org.data, buyerContact: contact.data, lead: lead.data, orders: orders.data as any[], snapshot, handoffs: handoffs.data as any[], deliveries: deliveries.data as any[], templates: (templates.data ?? []) as any[], offers: acceptedOffers };
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
  const { lead, orders, snapshot, handoffs, deliveries, templates, offers, buyer, buyerContact } = q.data;
  if (!lead || lead.mt_personal) return null;
  return <>{orders.map((o: { id: string }) => <BillingPlanPanel key={o.id} orderId={o.id} />)}{orders.length > 0 && <p className="rounded-md border bg-muted/40 p-2 text-sm">Tilaus on vahvistettu ({new Date(orders[0].created_at).toLocaleDateString('fi-FI')}). Jatka alla olevan Seuraava askel -ohjeen mukaan.</p>}{orders.length === 0 && offers.length === 0 && <p className="rounded-md border border-dashed p-2 text-sm text-muted-foreground">Vahvista tilaus -lomake ilmestyy tähän, kun asiakkaan tarjouksen tila on Hyväksytty.</p>}{orders.length === 0 && offers.length > 0 && <OrderConfirmationForm lead={lead} buyer={buyer} buyerContact={buyerContact} offers={offers} busy={busy} run={run} onLinked={() => qc.invalidateQueries({ queryKey: key })} />}<ProgrammeForm hasOffer={offers.length > 0} key={snapshot?.id ?? 'new'} lead={lead} snapshot={snapshot} team={team} orders={orders} handoffs={handoffs} deliveries={deliveries} templates={templates} busy={busy} run={run} error={error} result={result} /></>;
}

function ProgrammeForm({ hasOffer, lead, snapshot, team, orders, handoffs, deliveries, templates, busy, run, error, result }: any) {
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
  const flow = salesFlow({ hasOffer, hasOrder: orders.length > 0, programmeSaved: !!s, programmeApproved: s?.state === 'approved', missing: s?.readiness.missing ?? [], attached: !!delivery, handoff: handoff?.company_programme_id === s?.id ? handoff?.company_state : null });
  return <div className="space-y-4">
    <FlowStepper title="Yrityskoulutuksen eteneminen" flow={flow} />
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
