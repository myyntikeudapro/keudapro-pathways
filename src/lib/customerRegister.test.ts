import { describe, it, expect } from 'vitest';
import { EMPTY_CUSTOMERS, customerRecord, filterCustomers, unlinkedLeads, type CustomerData, type Organization } from './customerRegister';

const org: Organization = { id: 'org', name: 'Testiakatemia Oy', business_id: '1234567-1', owner_id: 'heikki', created_at: '2026-11-26', updated_at: '2026-11-26' };
const lead = (id: string, organization_id: string | null = org.id) => ({ id, name: 'Testihenkilö', organization: org.name, organization_id, contact_id: null, mt_personal: false, status: 'uusi', service_key: 'aly', owner_id: 'myyja', created_at: '2026-11-26' });
const data = (patch: Partial<CustomerData>): CustomerData => ({ ...EMPTY_CUSTOMERS, organizations: [org], ...patch });
const order = { id: 'order', lead_id: 'lead', organization_id: org.id, offer_version_id: 'version', total_net: 1700, service_key: 'aly', confirmed_at: '2026-11-26' } as CustomerData['orders'][number];

describe('shared customer register', () => {
  it('keeps unlinked leads in a separate queue when the organization register is empty', () => {
    const d = data({ organizations: [], leads: [lead('unlinked', null), lead('linked')] });
    expect(d.organizations).toHaveLength(0);
    expect(unlinkedLeads(d.leads).map(l => l.id)).toEqual(['unlinked']);
  });
  it('collects multiple contacts, offers, orders and deliveries without counting an order twice', () => {
    const leads = [lead('lead'), lead('lead-2')];
    const orders = [order, { ...order, id: 'order-2', lead_id: 'lead-2', offer_version_id: 'version-2', total_net: 2300 }];
    const contacts = ['c1', 'c2'].map(id => ({ id, organization_id: org.id, name: id, email: `${id}@example.invalid`, phone: null, created_at: '', updated_at: '' }));
    const offers = ['lead', 'lead-2'].map((lead_id, i) => ({ id: `offer-${i}`, lead_id, status: 'accepted', amount: 1700 } as CustomerData['offers'][number]));
    const deliveries = orders.map((o, i) => ({ id: `d${i}`, order_id: o.id, title: 'Koulutus', production_status: 'käynnissä', production_owner_id: 'satu' }));
    const r = customerRecord(data({ leads, orders, contacts, offers, deliveries }), org);
    expect(r.leads).toHaveLength(2); expect(r.contacts).toHaveLength(2); expect(r.offers).toHaveLength(2); expect(r.orders).toHaveLength(2); expect(r.deliveries).toHaveLength(2); expect(r.totalNet).toBe(4000);
  });
  it('does not put personal change-security cases in the organization-linking queue', () => {
    expect(unlinkedLeads([lead('company', null), { ...lead('personal', null), mt_personal: true }]).map(l => l.id)).toEqual(['company']);
  });
  it('keeps an order-associated lead in the queue until its own organization link is confirmed', () => {
    const d = data({ leads: [lead('lead', null)], orders: [order] });
    expect(customerRecord(d, org).leads.map(l => l.id)).toEqual(['lead']);
    expect(unlinkedLeads(d.leads).map(l => l.id)).toEqual(['lead']);
  });
  it('collects multiple leads under one organization without name-based merging', () => {
    const r = customerRecord(data({ leads: [lead('a'), lead('b'), lead('same-name', 'other'), lead('unlinked', null)] }), org);
    expect(r.leads.map(l => l.id)).toEqual(['a', 'b']);
  });
  it('reads an order-linked lead once without rewriting its missing organization link', () => {
    const r = customerRecord(data({ leads: [lead('lead', null)], orders: [order] }), org);
    expect(r.leads.map(l => l.id)).toEqual(['lead']); expect(r.leads[0].organization_id).toBeNull(); expect(r.issues).toContain('1 yhteydenoton organisaatiolinkki puuttuu');
  });
  it('excludes personal cases even when an organization link exists', () => {
    const r = customerRecord(data({ leads: [{ ...lead('lead'), mt_personal: true }], orders: [order] }), org);
    expect(r.leads).toHaveLength(0); expect(r.orders).toHaveLength(0); expect(r.state).toBe('unknown');
  });
  it('keeps purchase history and an open offer alongside an active training', () => {
    const offer = { id: 'new-offer', lead_id: 'new-lead', status: 'sent', amount: 9000 } as CustomerData['offers'][number];
    const r = customerRecord(data({ leads: [lead('lead'), lead('new-lead')], orders: [order], offers: [offer], deliveries: [{ id: 'd', order_id: 'order', title: 'Koulutus', production_status: 'käynnissä', production_owner_id: 'satu' }] }), org);
    expect(r.state).toBe('active'); expect(r.openOffers).toHaveLength(1); expect(r.totalNet).toBe(1700); expect(r.organization.owner_id).toBe('heikki'); expect(r.deliveries[0].production_owner_id).toBe('satu');
  });
  it('counts confirmed orders only, never offers or lead deal values', () => {
    const r = customerRecord(data({ leads: [lead('lead')], orders: [order], offers: [{ id: 'offer', lead_id: 'lead', amount: 1700, status: 'accepted' } as CustomerData['offers'][number]], versions: [{ id: 'version', offer_id: 'offer', organization_id: org.id } as CustomerData['versions'][number]] }), org);
    expect(r.totalNet).toBe(1700); expect(r.openOffers).toHaveLength(0); expect(r.leads).toHaveLength(1);
  });
  it('includes all organization contacts and service types in filters', () => {
    const r = customerRecord(data({ leads: [lead('a'), { ...lead('b'), service_key: 'kasvu' }], contacts: ['a', 'b'].map(id => ({ id, organization_id: org.id, name: id, email: `${id}@test.invalid`, phone: null, created_at: '', updated_at: '' })) }), org);
    expect(r.contacts).toHaveLength(2);
    expect(filterCustomers([r], { search: 'b@test.invalid', owner: 'heikki', service: 'kasvu', state: 'prospect', attention: false })).toHaveLength(1);
    expect(filterCustomers([r], { search: '', owner: 'myyja', service: 'all', state: 'all', attention: false })).toHaveLength(0);
  });
  it('marks a confirmed order without a delivery as open, not completed', () => {
    expect(customerRecord(data({ leads: [lead('lead')], orders: [order] }), org).state).toBe('active');
    expect(customerRecord(data({ leads: [lead('lead')], orders: [order], deliveries: [{ id: 'd', order_id: 'order', title: 'Koulutus', production_status: 'päättynyt', production_owner_id: 'satu' }] }), org).state).toBe('previous');
  });
  it('uses exact offer-version identifiers for indirect history', () => {
    const r = customerRecord(data({ leads: [lead('lead', null)], offers: [{ id: 'offer', lead_id: 'lead', status: 'sent' } as CustomerData['offers'][number]], versions: [{ id: 'version', offer_id: 'offer', organization_id: org.id } as CustomerData['versions'][number]] }), org);
    expect(r.leads.map(l => l.id)).toEqual(['lead']); expect(r.offers).toHaveLength(1);
  });
  it('does not merge history from a lead explicitly linked to another organization', () => {
    const r = customerRecord(data({ leads: [lead('lead', 'other')], orders: [order] }), org);
    expect(r.leads).toHaveLength(0); expect(r.issues).toContain('Sopimuksen ja yhteydenoton organisaatiot eroavat');
  });
  it('derives contact attention from overdue tasks or open opportunities lacking follow-up', () => {
    const task = { id: 'task', lead_id: 'lead', title: 'Soita', due_at: '2026-11-27T10:00:00Z', completed_at: null } as CustomerData['tasks'][number];
    const now = Date.parse('2026-11-26T10:00:00Z');
    expect(customerRecord(data({ leads: [lead('lead')], tasks: [task] }), org, now).needsContact).toBe(false);
    expect(customerRecord(data({ leads: [lead('lead')], tasks: [{ ...task, due_at: '2026-11-25T10:00:00Z' }] }), org, now).overdue.map(t => t.id)).toEqual(['task']);
    expect(customerRecord(data({ leads: [lead('lead')] }), org, now).noNext.map(l => l.id)).toEqual(['lead']);
  });
});