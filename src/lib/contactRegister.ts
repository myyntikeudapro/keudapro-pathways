import type { CustomerData, CustomerContact } from '@/lib/customerRegister';

export const CONTACT_PAGE_SIZE = 25;
export const MISSING = 'Ei tallennettu';
/** Marketing eligibility is never inferred from customership, offers, orders or AI imports. */
export const MARKETING_STATUS = 'Ei varmennettu peruste';
export const contactHref = (id: string) => `/admin/asiakkaat/henkilot/${encodeURIComponent(id)}`;

/** Links only through explicit contact_id / order_id keys; names and emails never establish membership. */
export function contactRecord(data: CustomerData, contact: CustomerContact) {
  const organization = data.organizations.find(o => o.id === contact.organization_id) ?? null;
  const leads = data.leads.filter(l => !l.mt_personal && l.contact_id === contact.id);
  const personal = new Set(data.leads.filter(l => l.mt_personal).map(l => l.id));
  const versions = data.versions.filter(v => v.contact_id === contact.id && !data.offers.some(o => o.id === v.offer_id && personal.has(o.lead_id)));
  const versionOfferIds = new Set(versions.map(v => v.offer_id));
  const offers = data.offers.filter(o => versionOfferIds.has(o.id));
  const orders = data.orders.filter(o => o.contact_id === contact.id && !personal.has(o.lead_id));
  const orderIds = new Set(orders.map(o => o.id));
  const deliveries = data.deliveries.filter(d => d.order_id && orderIds.has(d.order_id));
  const sameName = data.contacts.filter(c => c.id !== contact.id && norm(c.name) === norm(contact.name)).length;
  return { contact, organization, leads, versions, offers, orders, deliveries, sameName,
    phone: contact.phone?.trim() || MISSING, email: contact.email?.trim() || MISSING,
    organizationName: organization?.name ?? 'Organisaatio ei saatavilla' };
}
export type ContactRecord = ReturnType<typeof contactRecord>;
const norm = (s: string | null | undefined) => (s ?? '').trim().toLocaleLowerCase('fi');

export type ContactFilters = { search: string; organization: string };
export function filterContacts(records: ContactRecord[], f: ContactFilters) {
  const q = norm(f.search);
  return records.filter(r => (f.organization === 'all' || r.contact.organization_id === f.organization)
    && `${r.contact.name} ${r.organizationName} ${r.contact.email}`.toLocaleLowerCase('fi').includes(q))
    .sort((a, b) => a.contact.name.localeCompare(b.contact.name, 'fi') || a.organizationName.localeCompare(b.organizationName, 'fi') || a.contact.id.localeCompare(b.contact.id));
}
export function paginate<T>(items: T[], page: number, size = CONTACT_PAGE_SIZE) {
  const pages = Math.max(1, Math.ceil(items.length / size));
  const current = Math.min(Math.max(1, Number.isFinite(page) ? Math.floor(page) : 1), pages);
  return { items: items.slice((current - 1) * size, current * size), page: current, pages, total: items.length };
}
