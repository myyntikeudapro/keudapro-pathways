import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useCustomers } from '@/hooks/useCustomers';
import { supabase } from '@/integrations/supabase/client';
import { customerRecord, EMPTY_CUSTOMERS, type CustomerRecord } from '@/lib/customerRegister';
import { companyWorkflow, type CompanyStaffSnapshot } from '@/lib/companyTrainingWorkflow';
import { caseNextStep, chooseRelated } from '@/lib/workspaceNextStep';
import { NextStep } from './NextStep';

export function CustomerNextStep({ record, person }: { record: CustomerRecord; person: (id: string | null) => string }) {
  const [params, setParams] = useSearchParams();
  const chosen = chooseRelated(record.leads, params.get('tapaus'));
  return <div className="space-y-2">
    {(record.leads.length > 1 || !chosen) && <div className="space-y-1"><label htmlFor="next-case" className="text-xs text-muted-foreground">Valitse käsiteltävä myyntimahdollisuus</label><select id="next-case" className="h-10 w-full rounded-md border border-input bg-background px-2 text-sm" value={chosen?.id ?? ''} onChange={e => { const n = new URLSearchParams(params); n.set('tapaus', e.target.value); n.delete('tuotuTarjous'); n.delete('tarjous'); n.delete('tilaus'); setParams(n); }}><option value="">Valitse tapaus</option>{record.leads.map(l => <option key={l.id} value={l.id}>{l.name} · {l.service_key ?? 'Palvelu puuttuu'} · {l.created_at.slice(0, 10)}</option>)}</select></div>}
    {chosen ? <CaseNextStep leadId={chosen.id} record={record} person={person} offerId={params.get('tuotuTarjous') ?? params.get('tarjous')} /> : <NextStep step={{ stage: record.leads.length ? 'Valitse tapaus jatkaaksesi' : 'Ei liitettyjä myyntimahdollisuuksia', role: 'Myyjä', issues: [] }} />}
  </div>;
}

export function LeadNextStep({ leadId, person }: { leadId: string; person: (id: string | null) => string }) {
  const { isEditor } = useAuth();
  const q = useCustomers(isEditor);
  if (q.isPending) return <p role="status">Ladataan seuraavaa vaihetta…</p>;
  if (q.isError) return <p role="alert">Etenemisvaihetta ei voitu hakea. Mitään ei tulkita valmiiksi.</p>;
  const data = q.data ?? EMPTY_CUSTOMERS;
  const org = data.organizations.find(o => data.leads.some(l => l.id === leadId && l.organization_id === o.id));
  if (!org) {
    const lead = data.leads.find(l => l.id === leadId);
    const step = caseNextStep({ leadId, ownerId: lead?.owner_id, company: !!lead?.organization, personal: lead?.mt_personal,
      offers: data.offers.filter(o => o.lead_id === leadId), orders: [] });
    step.issues.push('Vahvistettu organisaatiolinkki puuttuu');
    return <NextStep step={step} owner={lead?.owner_id ? person(lead.owner_id) : null} />;
  }
  return <CaseNextStep leadId={leadId} record={customerRecord(data, org)} person={person} />;
}

export function CaseNextStep({ leadId, record: r, person, offerId, orderId }: { leadId: string; record: CustomerRecord; person: (id: string | null) => string; offerId?: string | null; orderId?: string | null }) {
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const lead = r.leads.find(l => l.id === leadId);
  const offers = r.offers.filter(o => o.lead_id === leadId).map(o => ({ ...o, imported: r.versions.some(v => v.offer_id === o.id && v.imported) }));
  const selectedOfferId = offerId ?? params.get('tarjous');
  const offer = chooseRelated(offers, selectedOfferId);
  const orders = r.orders.filter(o => o.lead_id === leadId).map(o => ({ ...o, offerId: r.versions.find(v => v.id === o.offer_version_id)?.offer_id }));
  const relevantOrders = offer ? orders.filter(o => o.offerId === offer.id) : orders;
  const order = chooseRelated(relevantOrders, orderId ?? params.get('tilaus'));
  const programme = [...r.programmes].filter(p => p.case_lead_id === leadId && !['cancelled', 'superseded'].includes(p.state)).sort((a, b) => b.revision - a.revision)[0];
  const snapshot = useQuery({ queryKey: ['next_step_programme', programme?.id], enabled: !!programme?.id, queryFn: async () => {
    if (!programme) throw new Error('Ohjelma puuttuu');
    const workflow = companyWorkflow(async (name, args) => { const { data, error } = await supabase.rpc(name as 'company_programme_read', args as { p_id: string }); if (error) throw error; return data; });
    return await workflow.read(programme.id) as CompanyStaffSnapshot;
  } });
  if (!lead) return <NextStep step={{ stage: 'Tapausta ei löydy', role: 'Myyjä', issues: ['Tarkista valittu myyntimahdollisuus'] }} />;
  if (programme && snapshot.isPending) return <p role="status">Ladataan seuraavaa vaihetta…</p>;
  if (snapshot.isError) return <p role="alert">Ohjelman vaihetta ei voitu hakea. Hyväksyntöjä ei päätellä puuttuvista tiedoista.</p>;
  const s = snapshot.data;
  const handoffs = r.handoffs.filter(h => h.order_id === order?.id && !h.cancelled_at);
  const h = handoffs.length === 1 ? handoffs[0] : null;
  const deliveries = r.deliveries.filter(d => d.order_id === order?.id && d.production_status !== 'peruttu');
  const d = deliveries.length === 1 ? deliveries[0] : null;
  const step = caseNextStep({ leadId, ownerId: lead.owner_id, personal: lead.mt_personal, company: !!lead.organization,
    viewerId: user?.id, offers, orders, offerId: selectedOfferId, orderId: orderId ?? params.get('tilaus'),
    programme: s ? { id: s.id, approved: s.state === 'approved', missing: s.readiness.missing, ownerId: s.production_owner_id, trainerId: s.responsible_trainer_id } : null,
    handoff: h ? { id: h.id, state: h.company_state, ownerId: h.production_owner_id, reason: h.company_return_reason, stale: h.company_programme_id !== s?.id || h.company_revision !== s?.revision } : null, delivery: d });
  if (handoffs.length > 1 || deliveries.length > 1) { step.action = undefined; step.stage = 'Useita toimituksia – valitse koulutuskortti'; step.issues.push('Avaa kyseinen tilaus tai koulutus asiakaskortilta'); }
  const select = (key: string, value: string) => { const n = new URLSearchParams(params); n.set(key, value); n.delete('tuotuTarjous'); if (key === 'tarjous') n.delete('tilaus'); setParams(n); };
  return <div className="space-y-2">
    {offers.length > 1 && <div><label htmlFor={`next-offer-${leadId}`} className="text-xs text-muted-foreground">Käsiteltävä tarjous</label><select id={`next-offer-${leadId}`} className="h-10 w-full rounded-md border border-input bg-background px-2 text-sm" value={offer?.id ?? ''} onChange={e => select('tarjous', e.target.value)}><option value="">Valitse tarjous</option>{offers.map(o => <option key={o.id} value={o.id}>{o.title}</option>)}</select></div>}
    {relevantOrders.length > 1 && <div><label htmlFor={`next-order-${leadId}`} className="text-xs text-muted-foreground">Käsiteltävä tilaus</label><select id={`next-order-${leadId}`} className="h-10 w-full rounded-md border border-input bg-background px-2 text-sm" value={order?.id ?? ''} onChange={e => select('tilaus', e.target.value)}><option value="">Valitse tilaus</option>{relevantOrders.map(o => <option key={o.id} value={o.id}>{o.starts_on} · {o.id.slice(0, 8)}</option>)}</select></div>}
    <NextStep step={step} owner={step.ownerId ? person(step.ownerId) : null} />
  </div>;
}