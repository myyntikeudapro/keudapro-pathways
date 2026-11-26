import type { Tables } from '@/integrations/supabase/types';
import { CRM_SERVICES } from '@/lib/crm';

export const serviceLabel = (key: string | null) => key ? CRM_SERVICES[key] ?? key : 'Palvelu puuttuu';
export const shortDate = (value: string | null | undefined) => value ? new Intl.DateTimeFormat('fi-FI', { timeZone: 'Europe/Helsinki', dateStyle: 'short' }).format(new Date(value)) : '–';

export type Organization = Tables<'crm_organizations'>;
export type CustomerContact = Tables<'crm_contacts'>;
export type CustomerLead = Pick<Tables<'booking_requests'>, 'id' | 'name' | 'organization' | 'organization_id' | 'contact_id' | 'mt_personal' | 'status' | 'service_key' | 'owner_id' | 'created_at'> & { email?: string | null };
export type CustomerOffer = Tables<'crm_offers'>;
export type CustomerVersion = Tables<'crm_offer_versions'>;
export type CustomerOrder = Tables<'crm_orders'>;
export type CustomerDelivery = Pick<Tables<'prod_deliveries'>, 'id' | 'order_id' | 'title' | 'production_status' | 'production_owner_id'>;
export type CustomerProgramme = Pick<Tables<'prod_programme_versions'>, 'id' | 'case_lead_id' | 'state' | 'revision' | 'created_at'>;
export type CustomerData = {
  organizations: Organization[]; contacts: CustomerContact[]; leads: CustomerLead[];
  offers: CustomerOffer[]; versions: CustomerVersion[]; orders: CustomerOrder[];
  deliveries: CustomerDelivery[]; programmes: CustomerProgramme[];
  handoffs: Tables<'crm_production_handoffs'>[];
  tasks: Tables<'crm_tasks'>[]; interactions: Tables<'crm_interactions'>[];
};
export const EMPTY_CUSTOMERS: CustomerData = { organizations: [], contacts: [], leads: [], offers: [], versions: [], orders: [], deliveries: [], programmes: [], handoffs: [], tasks: [], interactions: [] };
export const CUSTOMER_STATES = { prospect: 'Prospekti', active: 'Asiakas – avoin toimitus', previous: 'Aiemmin ostanut', unknown: 'Tilanne ei arvioitavissa' } as const;
export type CustomerState = keyof typeof CUSTOMER_STATES;
/** Unlinked contacts remain a work queue, never synthetic organization records. */
export function unlinkedLeads(leads: CustomerLead[]) {
  return leads.filter(l => !l.organization_id && !l.mt_personal).sort((a, b) => b.created_at.localeCompare(a.created_at) || a.id.localeCompare(b.id));
}
export const leadHref = (id: string) => `/admin/markkinointi?tab=leads&asiakas=${encodeURIComponent(id)}`;
export const deliveryHref = (id: string) => `/admin/tuotanto?toteutus=${encodeURIComponent(id)}`;
const openLead = (status: string) => !['koulutukseen', 'ei jatkoon'].includes(status);
const openOffer = (status: string) => ['draft', 'sent', 'accepted'].includes(status);
const closedDelivery = (status: string) => ['päättynyt', 'peruttu'].includes(status);

/** Only identifiers link history; names and email addresses never establish membership. */
export function customerRecord(data: CustomerData, organization: Organization, now = Date.now()) {
  const personal = new Set(data.leads.filter(l => l.mt_personal).map(l => l.id));
  const orders = data.orders.filter(o => o.organization_id === organization.id && !personal.has(o.lead_id));
  const versions = data.versions.filter(v => v.organization_id === organization.id && !data.offers.some(o => o.id === v.offer_id && personal.has(o.lead_id)));
  const versionOffers = new Set(versions.map(v => v.offer_id));
  const indirectIds = new Set([...orders.map(o => o.lead_id), ...data.offers.filter(o => versionOffers.has(o.id)).map(o => o.lead_id)]);
  const leads = data.leads.filter(l => !l.mt_personal && (l.organization_id === organization.id || (!l.organization_id && indirectIds.has(l.id))));
  const leadIds = new Set(leads.map(l => l.id));
  const offers = data.offers.filter(o => leadIds.has(o.lead_id));
  const orderIds = new Set(orders.map(o => o.id));
  const deliveries = data.deliveries.filter(d => d.order_id && orderIds.has(d.order_id));
  const tasks = data.tasks.filter(t => leadIds.has(t.lead_id)).sort((a, b) => a.due_at.localeCompare(b.due_at));
  const pendingTasks = tasks.filter(t => !t.completed_at);
  const programmes = data.programmes.filter(p => leadIds.has(p.case_lead_id));
  const openOffers = offers.filter(o => openOffer(o.status) && !data.orders.some(order => data.versions.some(v => v.id === order.offer_version_id && v.offer_id === o.id)));
  const hasOpenDelivery = orders.some(o => { const ds = deliveries.filter(d => d.order_id === o.id); return !ds.length || ds.some(d => !closedDelivery(d.production_status)); });
  const state: CustomerState = orders.length ? hasOpenDelivery ? 'active' : 'previous' : leads.length || versions.length ? 'prospect' : 'unknown';
  const issues: string[] = [];
  if (!organization.business_id?.trim()) issues.push('Y-tunnus puuttuu');
  if (!organization.owner_id) issues.push('Asiakkuusvastaava puuttuu');
  const indirect = leads.filter(l => !l.organization_id);
  if (indirect.length) issues.push(`${indirect.length} yhteydenoton organisaatiolinkki puuttuu`);
  const conflicts = data.leads.filter(l => !l.mt_personal && indirectIds.has(l.id) && l.organization_id && l.organization_id !== organization.id);
  if (conflicts.length) issues.push('Sopimuksen ja yhteydenoton organisaatiot eroavat');
  const contactIds = new Set(data.contacts.filter(c => c.organization_id === organization.id).map(c => c.id));
  if (leads.some(l => l.contact_id && !contactIds.has(l.contact_id))) issues.push('Yhteyshenkilön organisaatiolinkki vaatii tarkistuksen');
  const overdue = pendingTasks.filter(t => Date.parse(t.due_at) < now);
  const noNext = leads.filter(l => openLead(l.status) && !pendingTasks.some(t => t.lead_id === l.id));
  const services = [...new Set([...leads.map(l => l.service_key), ...orders.map(o => o.service_key), ...versions.map(v => v.service_key)].filter((s): s is string => Boolean(s)))];
  return { organization, contacts: data.contacts.filter(c => c.organization_id === organization.id), leads, offers, openOffers, versions, orders, deliveries, programmes, tasks,
    handoffs: data.handoffs.filter(h => orderIds.has(h.order_id)),
    interactions: data.interactions.filter(i => leadIds.has(i.lead_id)).sort((a, b) => b.occurred_at.localeCompare(a.occurred_at)),
    state, services, issues, overdue, noNext, needsContact: overdue.length > 0 || noNext.length > 0,
    nextTask: pendingTasks[0], totalNet: orders.reduce((sum, o) => sum + Number(o.total_net), 0),
    lastOrder: [...orders].sort((a, b) => b.confirmed_at.localeCompare(a.confirmed_at))[0],
  };
}
export type CustomerRecord = ReturnType<typeof customerRecord>;
export type CustomerFilters = { search: string; owner: string; service: string; state: string; attention: boolean };
export function filterCustomers(records: CustomerRecord[], f: CustomerFilters) {
  const search = f.search.trim().toLocaleLowerCase('fi');
  return records.filter(r => (f.owner === 'all' || (f.owner === 'none' ? !r.organization.owner_id : r.organization.owner_id === f.owner))
    && (f.service === 'all' || r.services.includes(f.service)) && (f.state === 'all' || r.state === f.state) && (!f.attention || r.needsContact)
    && `${r.organization.name} ${r.organization.business_id ?? ''} ${r.contacts.map(c => `${c.name} ${c.email}`).join(' ')}`.toLocaleLowerCase('fi').includes(search));
}