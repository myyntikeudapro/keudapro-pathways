import type { CustomerData, CustomerContact } from '@/lib/customerRegister';

/** Organisation-scoped roles: they never imply offer approver or project contact selections. */
export const CONTACT_ROLES: Record<string, string> = {
  decision_maker: 'Päätöksentekijä', buyer: 'Tilaaja', hr: 'HR-yhteyshenkilö', training_coordinator: 'Koulutuskoordinaattori',
  training_practical: 'Koulutuksen käytännön yhteyshenkilö', finance: 'Taloushallinnon yhteyshenkilö', other: 'Muu yhteyshenkilö',
};
/** Staff-selected professional interests; never inferred and never a marketing consent. */
export const CONTACT_INTERESTS: Record<string, string> = {
  ai: 'Tekoäly ja automaatio', leadership: 'Johtaminen ja esihenkilötyö', safety: 'Turvallisuusosaaminen', wellbeing: 'Työhyvinvointi',
  staff_development: 'Henkilöstön kehittäminen', recruitment: 'Rekrytointi ja työllistyminen', change_security: 'Muutosturva',
  continuing_education: 'Ammatillinen täydennyskoulutus', other: 'Muu ammatillinen kiinnostus',
};
export const VERIFY_STALE_DAYS = 365;
export const VERIFY_STATES = { verified: 'Tarkistettu', stale: 'Tarkistus vanhentunut', never: 'Ei tarkistettu' } as const;
export type VerifyState = keyof typeof VERIFY_STATES;
export function verifyState(verifiedAt: string | null | undefined, now = new Date()): VerifyState {
  if (!verifiedAt) return 'never';
  return now.getTime() - new Date(verifiedAt).getTime() > VERIFY_STALE_DAYS * 86400000 ? 'stale' : 'verified';
}

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
  const affiliation = (data.affiliations ?? []).find(a => a.contact_id === contact.id && a.organization_id === contact.organization_id) ?? null;
  const roles = (affiliation?.roles ?? []).filter(k => CONTACT_ROLES[k]);
  const interests = (contact.interests ?? []).filter(k => CONTACT_INTERESTS[k]);
  const sameName = data.contacts.filter(c => c.id !== contact.id && norm(c.name) === norm(contact.name)).length;
  return { contact, organization, affiliation, roles, interests, jobTitle: affiliation?.job_title?.trim() || null,
    isKeyPerson: Boolean(affiliation?.is_key_person), verify: verifyState(contact.contact_verified_at), leads, versions, offers, orders, deliveries, sameName,
    phone: contact.phone?.trim() || MISSING, email: contact.email?.trim() || MISSING,
    organizationName: organization?.name ?? 'Organisaatio ei saatavilla' };
}
export type ContactRecord = ReturnType<typeof contactRecord>;
const norm = (s: string | null | undefined) => (s ?? '').trim().toLocaleLowerCase('fi');

export type ContactFilters = { search: string; organization: string; interest?: string; key?: boolean; verify?: string };
export function filterContacts(records: ContactRecord[], f: ContactFilters) {
  const q = norm(f.search);
  return records.filter(r => (f.organization === 'all' || r.contact.organization_id === f.organization)
    && (!f.interest || f.interest === 'all' || r.interests.includes(f.interest))
    && (!f.key || r.isKeyPerson) && (!f.verify || f.verify === 'all' || r.verify === f.verify)
    && `${r.contact.name} ${r.organizationName} ${r.contact.email} ${r.jobTitle ?? ''}`.toLocaleLowerCase('fi').includes(q))
    .sort((a, b) => a.contact.name.localeCompare(b.contact.name, 'fi') || a.organizationName.localeCompare(b.organizationName, 'fi') || a.contact.id.localeCompare(b.contact.id));
}
export function paginate<T>(items: T[], page: number, size = CONTACT_PAGE_SIZE) {
  const pages = Math.max(1, Math.ceil(items.length / size));
  const current = Math.min(Math.max(1, Number.isFinite(page) ? Math.floor(page) : 1), pages);
  return { items: items.slice((current - 1) * size, current * size), page: current, pages, total: items.length };
}
