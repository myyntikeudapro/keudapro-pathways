import { salesFlow, type FlowState } from './companyFlow';
import type { BoardRow } from './productionBoard';

export type NextTask = 'offers' | 'order' | 'programme' | 'capacity' | 'attach' | 'handoff' | 'receive';
export type NextStepState = {
  stage: string; role: string; ownerId?: string | null; waiting?: boolean;
  action?: { label: string; href: string }; issues: string[]; flow?: FlowState;
  billingHref?: string; complete?: boolean;
};
export function salesTaskHref(leadId: string, task: NextTask, offerId?: string, orderId?: string) {
  return `/admin/markkinointi?${new URLSearchParams({ tab: 'leads', asiakas: leadId, tehtava: task,
    ...(offerId ? { tarjous: offerId } : {}), ...(orderId ? { tilaus: orderId } : {}) })}`;
}
export const receiveHref = (id: string) => `/admin/tuotanto?${new URLSearchParams({ osio: 'luovutukset', luovutus: id })}`;
export const trainingTaskHref = (id: string, tab: string) => `/admin/tuotanto?${new URLSearchParams({ toteutus: id, valilehti: tab })}`;
export function importedCustomerHref(r: { organization_id?: string; lead_id?: string; offer_id?: string }) {
  if (!r.organization_id) return null;
  return `/admin/asiakkaat/${encodeURIComponent(r.organization_id)}?${new URLSearchParams({ osio: 'yhteyshenkilot',
    ...(r.lead_id ? { tapaus: r.lead_id } : {}), ...(r.offer_id ? { tuotuTarjous: r.offer_id } : {}) })}`;
}

/** No first-row guessing when more than one explicit relation is available. */
export function chooseRelated<T extends { id: string }>(rows: T[], selected?: string | null): T | null {
  if (selected) return rows.find(r => r.id === selected) ?? null;
  return rows.length === 1 ? rows[0] : null;
}
export type CaseStepInput = {
  leadId: string; ownerId?: string | null; personal?: boolean; company?: boolean; viewerId?: string;
  offers: { id: string; status: string; imported?: boolean }[];
  orders: { id: string; offerId?: string | null }[];
  offerId?: string | null; orderId?: string | null;
  programme?: { id: string; approved: boolean; missing: string[]; ownerId?: string | null; trainerId?: string | null } | null;
  handoff?: { id: string; state: string | null; ownerId?: string | null; reason?: string | null; stale?: boolean } | null;
  delivery?: { id: string } | null;
};
export function caseNextStep(i: CaseStepInput): NextStepState {
  const base: NextStepState = { stage: 'Tarjouksen tarkistus', role: 'Myyjä', ownerId: i.ownerId, waiting: !!i.ownerId && !!i.viewerId && i.ownerId !== i.viewerId, issues: i.ownerId ? [] : ['Myyntivastuuhenkilö puuttuu'] };
  const offer = chooseRelated(i.offers, i.offerId);
  const orders = offer ? i.orders.filter(o => o.offerId === offer.id) : i.orders;
  const order = chooseRelated(orders, i.orderId);
  if ((i.offerId && !offer) || (i.orderId && !order)) return { ...base, stage: 'Kohdetta ei löydy', issues: ['Valittu tarjous tai tilaus ei kuulu tähän tapaukseen'] };
  if (i.offers.length > 1 && !offer) return { ...base, stage: 'Valitse käsiteltävä tarjous', issues: ['Tapauksella on useita tarjouksia'] };
  if (orders.length > 1 && !order) return { ...base, stage: 'Valitse käsiteltävä tilaus', issues: ['Tarjouksella on useita tilauksia'] };
  const task = (key: NextTask, label: string) => ({ label, href: salesTaskHref(i.leadId, key, offer?.id, order?.id) });
  if (!order && (!offer || offer.status !== 'accepted')) return { ...base,
    stage: !offer ? 'Tarjous puuttuu' : ({ draft: 'Tarjousluonnos', sent: 'Odottaa asiakkaan hyväksyntää', declined: 'Tarjous hylätty' }[offer.status] ?? 'Tarjouksen tila tuntematon'),
    action: task('offers', offer?.imported ? 'Tarkista tuotu tarjous' : offer?.status === 'sent' ? 'Tarkista asiakkaan hyväksyntä' : 'Tarkista tarjous') };
  if (i.personal || !i.company) return { ...base, stage: 'Myynnin jatkotoimet', action: task('offers', 'Avaa tarjouksen jatkotoimet') };
  if (!order) return { ...base, stage: 'Tarjous hyväksytty – tilaus puuttuu', action: task('order', 'Vahvista tilaus') };
  const billingHref = salesTaskHref(i.leadId, 'order', offer?.id, order.id);
  const p = i.programme;
  const h = i.handoff;
  if (h?.state === 'returned' || h?.stale) return { ...base, billingHref, stage: 'Luovutus palautettu täydennettäväksi',
    issues: [...base.issues, h.reason || (h.stale ? 'Luovutus koskee aiempaa ohjelmaversiota' : 'Palautuksen syy puuttuu')], action: task('programme', 'Korjaa luovutuksen ohjelma') };
  if (h?.state === 'submitted') return { ...base, billingHref, role: 'Tuotantovastaava', ownerId: h.ownerId,
    waiting: h.ownerId !== i.viewerId, stage: 'Odottaa tuotannon vastaanottoa', issues: h.ownerId ? [] : ['Tuotantovastuuhenkilö puuttuu'],
    action: { label: 'Avaa vastaanotto', href: receiveHref(h.id) } };
  if (h?.state === 'accepted' && i.delivery) return { ...base, billingHref, role: 'Tuotantovastaava', ownerId: h.ownerId,
    waiting: !!i.viewerId && i.viewerId !== h.ownerId,
    stage: 'Tuotanto vastaanotti', issues: [], action: { label: 'Avaa koulutuksen valmistelu', href: trainingTaskHref(i.delivery.id, 'aikataulu') } };
  const flow = salesFlow({ hasOffer: offer?.status === 'accepted', hasOrder: true, programmeSaved: !!p,
    programmeApproved: p?.approved === true, missing: p?.missing ?? [], attached: !!i.delivery, handoff: h?.state });
  const current = flow.steps[flow.current]?.key;
  const map: Record<string, [NextTask, string]> = { programme: ['programme', p ? 'Tarkista ohjelman hyväksyntä' : 'Valmistele luovutus'],
    capacity: ['capacity', 'Tarkista kapasiteetti'], attach: ['attach', 'Kytke tilaus'], handoff: ['handoff', 'Valmistele luovutus'], accepted: ['receive', 'Avaa vastaanotto'] };
  const action = current ? map[current] : null;
  const stages: Record<string, string> = { programme: p ? 'Ohjelma odottaa hyväksyntää' : 'Tilaus vahvistettu – ohjelma puuttuu', capacity: 'Kapasiteetti odottaa hyväksyntää', attach: 'Tilaus odottaa kytkentää', handoff: 'Luovutus valmisteilla', accepted: 'Odottaa tuotannon vastaanottoa' };
  return { ...base, billingHref, flow, stage: stages[current ?? ''] ?? 'Luovutus käsitelty',
    role: current === 'capacity' ? 'Vastuukouluttaja / tuotantovastaava' : base.role,
    ownerId: current === 'capacity' && i.viewerId === p?.ownerId ? p.ownerId : current === 'capacity' ? p?.trainerId : base.ownerId,
    waiting: current === 'capacity' ? !!i.viewerId && i.viewerId !== p?.ownerId && i.viewerId !== p?.trainerId : base.waiting,
    issues: [...base.issues, ...(p?.missing ?? [])], action: action ? task(...action) : undefined,
    complete: flow.current === -1 };
}
/** Production guidance uses the existing board calculation, not a new readiness rule. */
export function productionNextStep(row: BoardRow, billingHref?: string): NextStepState {
  const labels: Record<string, string> = { aikataulu: 'Lisää sessiot ja kouluttajat', tehtavat: 'Tarkista valmistelutehtävät', toteumat: 'Avaa toteumien tarkistus', laatu: 'Tarkista laatu ja palaute', yhteenveto: 'Tarkista koulutuksen aikataulu' };
  return { stage: row.stage, role: 'Tuotantovastaava', ownerId: row.ownerId, issues: [row.reason], billingHref,
    complete: row.stage === 'peruttu', action: row.stage === 'peruttu' ? undefined : {
      label: labels[row.tab], href: trainingTaskHref(row.id, row.tab === 'yhteenveto' ? 'aikataulu' : row.tab) } };
}