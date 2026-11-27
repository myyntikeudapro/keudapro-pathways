import { describe, it, expect } from 'vitest';
import { caseNextStep, chooseRelated, importedCustomerHref, productionNextStep, salesTaskHref, type CaseStepInput } from './workspaceNextStep';
import type { BoardRow } from './productionBoard';
const base: CaseStepInput = { leadId: 'lead-1', ownerId: 'seller', viewerId: 'seller', company: true, offers: [{ id: 'offer-1', status: 'draft', imported: true }], orders: [] };
const accepted: CaseStepInput = { ...base, offers: [{ id: 'offer-1', status: 'accepted' }] };
const ordered: CaseStepInput = { ...accepted, orders: [{ id: 'order-1', offerId: 'offer-1' }] };
const programmed: CaseStepInput = { ...ordered, programme: { id: 'p-1', approved: true, missing: [], ownerId: 'producer', trainerId: 'trainer' } };
describe('next task navigation, not approval commands', () => {
  it('import retains explicit offer and lead identities on every customer tab', () => {
    const url = importedCustomerHref({ organization_id: 'org-1', lead_id: 'lead-1', offer_id: 'offer-1' });
    const params = new URL(url ?? '', 'https://example.com').searchParams;
    expect(params.get('tapaus')).toBe('lead-1'); expect(params.get('tuotuTarjous')).toBe('offer-1'); expect(params.get('osio')).toBe('yhteyshenkilot');
  });
  it('imported draft is only opened for review, never routed to order', () => {
    expect(caseNextStep(base).action?.href).toBe(salesTaskHref('lead-1', 'offers', 'offer-1'));
    expect(base.offers[0].status).toBe('draft');
  });
  it('sent offer is not treated as accepted', () => expect(caseNextStep({ ...base, offers: [{ id: 'offer-1', status: 'sent' }] }).action?.href).toBe(salesTaskHref('lead-1', 'offers', 'offer-1')));
  it('declined offer does not open order confirmation', () => expect(new URL(caseNextStep({ ...base, offers: [{ id: 'offer-1', status: 'declined' }] }).action?.href ?? '', 'https://example.com').searchParams.get('tehtava')).toBe('offers'));
  it('accepted offer without order opens its existing order form', () => expect(caseNextStep(accepted).action?.href).toBe(salesTaskHref('lead-1', 'order', 'offer-1')));
  it('confirmed order without programme opens preparation', () => expect(caseNextStep(ordered).action?.href).toBe(salesTaskHref('lead-1', 'programme', 'offer-1', 'order-1')));
  it('unapproved programme cannot skip to attachment', () => expect(caseNextStep({ ...programmed, programme: { ...programmed.programme, id: 'p-1', approved: false, missing: [] } }).action?.href).toBe(salesTaskHref('lead-1', 'programme', 'offer-1', 'order-1')));
  it('missing capacity opens capacity, not submission', () => expect(caseNextStep({ ...programmed, programme: { id: 'p-1', approved: true, missing: ['capacity_unapproved'], trainerId: 'trainer' } }).action?.href).toBe(salesTaskHref('lead-1', 'capacity', 'offer-1', 'order-1')));
  it('named producer can open capacity on behalf of trainer without a false waiting state', () => {
    const s = caseNextStep({ ...programmed, viewerId: 'producer', programme: { id: 'p-1', approved: true, missing: ['capacity_unapproved'], ownerId: 'producer', trainerId: 'trainer' } });
    expect(s.waiting).toBe(false); expect(s.ownerId).toBe('producer');
  });
  it('seller must wait for the named capacity owners', () => {
    const s = caseNextStep({ ...programmed, viewerId: 'seller', programme: { id: 'p-1', approved: true, missing: ['capacity_unapproved'], ownerId: 'producer', trainerId: 'trainer' } });
    expect(s.waiting).toBe(true); expect(s.ownerId).toBe('trainer');
  });
  it('approved programme and capacity need attachment before handoff', () => expect(caseNextStep(programmed).action?.href).toBe(salesTaskHref('lead-1', 'attach', 'offer-1', 'order-1')));
  it('attached order still needs human handoff', () => expect(caseNextStep({ ...programmed, delivery: { id: 'delivery-1' } }).action?.href).toBe(salesTaskHref('lead-1', 'handoff', 'offer-1', 'order-1')));
  it('submitted handoff targets exact receiving row and indicates another owner', () => {
    const s = caseNextStep({ ...programmed, handoff: { id: 'handoff-1', state: 'submitted', ownerId: 'producer' } });
    expect(s.action?.href).toBe('/admin/tuotanto?osio=luovutukset&luovutus=handoff-1'); expect(s.waiting).toBe(true); expect(s.ownerId).toBe('producer');
  });
  it('receiver sees own receiving task without a fabricated owner', () => expect(caseNextStep({ ...programmed, viewerId: 'producer', handoff: { id: 'h-1', state: 'submitted', ownerId: 'producer' } }).waiting).toBe(false));
  it('returned handoff opens corrections and carries the stored reason', () => {
    const s = caseNextStep({ ...programmed, handoff: { id: 'h-1', state: 'returned', reason: 'Ajankohta korjattava' } });
    expect(s.action?.href).toBe(salesTaskHref('lead-1', 'programme', 'offer-1', 'order-1')); expect(s.issues).toContain('Ajankohta korjattava');
  });
  it('stale handoff cannot jump to receiving', () => expect(caseNextStep({ ...programmed, handoff: { id: 'h-1', state: 'submitted', stale: true } }).action?.href).toBe(salesTaskHref('lead-1', 'programme', 'offer-1', 'order-1')));
  it('accepted delivery opens its own schedule, not generic production list', () => expect(caseNextStep({ ...programmed, handoff: { id: 'h-1', state: 'accepted', ownerId: 'producer' }, delivery: { id: 'delivery-1' } }).action?.href).toBe('/admin/tuotanto?toteutus=delivery-1&valilehti=aikataulu'));
  it('unknown offer status never implies acceptance', () => expect(new URL(caseNextStep({ ...base, offers: [{ id: 'offer-1', status: 'unknown' }] }).action?.href ?? '', 'https://example.com').searchParams.get('tehtava')).toBe('offers'));
  it('missing owner is not replaced with Heikki or Satu', () => expect(caseNextStep({ ...base, ownerId: null }).ownerId).toBeNull());
  it('several cases require an explicit choice', () => { expect(chooseRelated([{ id: 'a' }, { id: 'b' }])).toBeNull(); expect(chooseRelated([{ id: 'a' }, { id: 'b' }], 'b')?.id).toBe('b'); });
  it('several offers never choose arbitrary order', () => expect(caseNextStep({ ...accepted, offers: [...accepted.offers, { id: 'offer-2', status: 'accepted' }] }).action).toBeUndefined());
  it('an unrelated offer ID never opens a task', () => expect(caseNextStep({ ...accepted, offerId: 'foreign' }).action).toBeUndefined());
  it('an unrelated order ID never opens a task', () => expect(caseNextStep({ ...ordered, orderId: 'foreign' }).action).toBeUndefined());
  it('personal cases cannot enter the company order chain', () => expect(new URL(caseNextStep({ ...accepted, personal: true }).action?.href ?? '', 'https://example.com').searchParams.get('tehtava')).toBe('offers'));
  it('billing is available before production completion and remains independent', () => { const s = caseNextStep(ordered); expect(s.billingHref).toBe(salesTaskHref('lead-1', 'order', 'offer-1', 'order-1')); expect(s.complete).not.toBe(true); });
  it('completed production opens inspection, not an invoice or payment command', () => {
    const row: BoardRow = { id: 'd-1', title: 'Testi', stage: 'paattynyt', tone: 'ok', reason: 'Kirjattu', next: '', tab: 'toteumat', firstStart: null, lastEnd: null, ownerId: 'producer', taskOwnerIds: [], done: 1, total: 1 };
    expect(productionNextStep(row).action?.href).toBe('/admin/tuotanto?toteutus=d-1&valilehti=toteumat');
  });
  it('cancelled production offers no next execution task', () => {
    const row = { id: 'd-1', stage: 'peruttu', ownerId: 'producer', reason: 'Peruttu' } as BoardRow;
    expect(productionNextStep(row).action).toBeUndefined(); expect(productionNextStep(row).complete).toBe(true);
  });
});