import { describe, it, expect } from 'vitest';
import { EMPTY_CUSTOMERS, type CustomerData, type Organization, type CustomerContact } from './customerRegister';
import { verifyState, contactRecord, filterContacts, paginate, MISSING, MARKETING_STATUS } from './contactRegister';

const org = (id: string, name: string): Organization => ({ id, name, business_id: null, owner_id: null, created_at: '2026-11-26', updated_at: '2026-11-26' });
const c = (id: string, name: string, organization_id: string, email = `${id}@esim.fi`, phone: string | null = null): CustomerContact => ({ id, name, organization_id, email, phone, created_at: '2026-11-26', updated_at: '2026-11-26' } as CustomerContact);
const base = (p: Partial<CustomerData>): CustomerData => ({ ...EMPTY_CUSTOMERS, organizations: [org('a', 'Alfa Oy'), org('b', 'Beta Oy')], ...p });

describe('contact register', () => {
  it('handles an empty register', () => {
    expect(filterContacts([], { search: '', organization: 'all' })).toEqual([]);
    expect(paginate([], 1)).toMatchObject({ page: 1, pages: 1, total: 0 });
  });
  it('lists several contacts of one organization and filters by organization', () => {
    const d = base({ contacts: [c('1', 'Aino', 'a'), c('2', 'Bertta', 'a'), c('3', 'Cecilia', 'b')] });
    const r = filterContacts(d.contacts.map(x => contactRecord(d, x)), { search: '', organization: 'a' });
    expect(r.map(x => x.contact.id)).toEqual(['1', '2']);
  });
  it('keeps same-named people separate and flags them', () => {
    const d = base({ contacts: [c('1', 'Matti Virtanen', 'a'), c('2', 'Matti Virtanen', 'b')], orders: [{ id: 'o', contact_id: '1', lead_id: 'l', organization_id: 'a' } as CustomerData['orders'][number]] });
    const [x, y] = d.contacts.map(k => contactRecord(d, k));
    expect(x.orders).toHaveLength(1); expect(y.orders).toHaveLength(0);
    expect(x.sameName).toBe(1);
  });
  it('searches by name, organization and email', () => {
    const d = base({ contacts: [c('1', 'Aino', 'a', 'aino@alfa.fi'), c('2', 'Bertta', 'b', 'b@beta.fi')] });
    const rs = d.contacts.map(x => contactRecord(d, x));
    expect(filterContacts(rs, { search: 'beta', organization: 'all' }).map(x => x.contact.id)).toEqual(['2']);
    expect(filterContacts(rs, { search: 'AINO@', organization: 'all' }).map(x => x.contact.id)).toEqual(['1']);
    expect(filterContacts(rs, { search: 'bert', organization: 'all' }).map(x => x.contact.id)).toEqual(['2']);
  });
  it('paginates and clamps the page', () => {
    const items = Array.from({ length: 60 }, (_, i) => i);
    expect(paginate(items, 3).items).toEqual(items.slice(50));
    expect(paginate(items, 99).page).toBe(3);
    expect(paginate(items, NaN).page).toBe(1);
  });
  it('links offers, orders and deliveries only through explicit keys, never by name or email', () => {
    const d = base({ contacts: [c('1', 'Aino', 'a', 'aino@alfa.fi')],
      leads: [{ id: 'l1', name: 'Aino', email: 'aino@alfa.fi', organization: 'Alfa Oy', organization_id: 'a', contact_id: null, mt_personal: false, status: 'uusi', service_key: null, owner_id: null, created_at: '2026-11-26' },
        { id: 'l2', name: 'X', organization: null, organization_id: 'a', contact_id: '1', mt_personal: false, status: 'uusi', service_key: null, owner_id: null, created_at: '2026-11-26' }],
      offers: [{ id: 'f1', lead_id: 'l2' }, { id: 'f2', lead_id: 'l2' }] as CustomerData['offers'],
      versions: [{ id: 'v1', offer_id: 'f1', contact_id: '1' }, { id: 'v2', offer_id: 'f2', contact_id: null }] as CustomerData['versions'],
      orders: [{ id: 'o1', contact_id: '1', lead_id: 'l2' }, { id: 'o2', contact_id: 'other', lead_id: 'l2' }] as CustomerData['orders'],
      deliveries: [{ id: 'd1', order_id: 'o1', title: 'T', production_status: 'x', production_owner_id: 'p' }, { id: 'd2', order_id: 'o2', title: 'T', production_status: 'x', production_owner_id: 'p' }] });
    const r = contactRecord(d, d.contacts[0]);
    expect(r.leads.map(x => x.id)).toEqual(['l2']);
    expect(r.offers.map(x => x.id)).toEqual(['f1']);
    expect(r.orders.map(x => x.id)).toEqual(['o1']);
    expect(r.deliveries.map(x => x.id)).toEqual(['d1']);
  });
  it('reports missing data honestly and never marks marketing as approved', () => {
    const d = base({ contacts: [c('1', 'Aino', 'a', '', null)] });
    const r = contactRecord(d, d.contacts[0]);
    expect(r.phone).toBe(MISSING); expect(r.email).toBe(MISSING);
    expect(MARKETING_STATUS).toBe('Ei varmennettu peruste');
  });
  it('shows old contacts without 1C-B details without errors', () => {
    const d = base({ contacts: [c('1', 'Aino', 'a')] });
    const r = contactRecord(d, d.contacts[0]);
    expect(r).toMatchObject({ roles: [], interests: [], jobTitle: null, isKeyPerson: false, verify: 'never' });
  });
  it('reads roles and key person only from the contact\'s current organisation', () => {
    const aff = (organization_id: string, extra = {}) => ({ id: organization_id, contact_id: '1', organization_id, job_title: 'HR-päällikkö', roles: ['hr', 'buyer'], is_key_person: true, created_at: '', updated_at: '', ...extra });
    const d = base({ contacts: [c('1', 'Aino', 'a')], affiliations: [aff('b')] });
    expect(contactRecord(d, d.contacts[0]).isKeyPerson).toBe(false);
    const d2 = base({ contacts: [c('1', 'Aino', 'a')], affiliations: [aff('a')] });
    expect(contactRecord(d2, d2.contacts[0])).toMatchObject({ isKeyPerson: true, roles: ['hr', 'buyer'], jobTitle: 'HR-päällikkö' });
  });
  it('filters by interest, key person and verification state', () => {
    const now = new Date().toISOString();
    const d = base({ contacts: [{ ...c('1', 'Aino', 'a'), interests: ['ai', 'safety'], contact_verified_at: now }, { ...c('2', 'Bertta', 'a'), interests: ['ai'] }, c('3', 'Cecilia', 'a')],
      affiliations: [{ id: 'x', contact_id: '2', organization_id: 'a', job_title: null, roles: [], is_key_person: true, created_at: '', updated_at: '' }] });
    const rs = d.contacts.map(x => contactRecord(d, x));
    const ids = (f: object) => filterContacts(rs, { search: '', organization: 'all', ...f }).map(x => x.contact.id);
    expect(ids({ interest: 'ai' })).toEqual(['1', '2']);
    expect(ids({ interest: 'safety' })).toEqual(['1']);
    expect(ids({ key: true })).toEqual(['2']);
    expect(ids({ verify: 'verified' })).toEqual(['1']);
    expect(ids({ verify: 'never' })).toEqual(['2', '3']);
  });
  it('marks verification older than a year as stale', () => {
    const now = new Date('2026-11-26T12:00:00Z');
    expect(verifyState('2026-01-01T00:00:00Z', now)).toBe('verified');
    expect(verifyState('2025-11-01T00:00:00Z', now)).toBe('stale');
    expect(verifyState(null, now)).toBe('never');
  });
});
