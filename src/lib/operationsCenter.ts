import type { Lead, Task } from './crm';
import type { Offer } from './salesOperations';
import { helsinkiDay, staleLeads } from '../../supabase/functions/_shared/crmEmailRules';

export type OperationsData = { leads: Lead[]; tasks: Task[]; offers: Offer[]; interactions: { lead_id: string; kind: string }[] };
export type QueueRow = { id: string; lead: Lead; title: string; date: string; amount?: number | null };
export type QueueFilter = { service: string; mine: boolean; userId: string; since: string; until: string };
export const QUEUES: Record<string, string> = {
  fresh: 'Uudet yhteydenotot', open: 'Avoimet asiakkuudet', offers: 'Avoimet tarjoukset', wins: 'Kirjatut kaupat',
  revenue: 'Kirjattu myynti · alv 0 %', overdue: 'Erääntyneet tehtävät', unassigned: 'Ilman vastuuhenkilöä',
  noNext: 'Seuraava tehtävä puuttuu', stale: 'Käsittelemättä vähintään 48 tuntia', lateOffers: 'Tarjouksen päätöspäivä ohittunut',
  missingValue: 'Kaupan arvo puuttuu', ownTasks: 'Omat avoimet tehtävät', age: 'Avoimien asiakkuuksien ikä', cycle: 'Saapumisesta kauppaan',
  'stage-uusi': 'Uusi', 'stage-yhteydessä': 'Yhteydessä', 'stage-kartoitus tehty': 'Kartoitus tehty',
};
const openLead = (l: Lead) => !['koulutukseen', 'ei jatkoon'].includes(l.status);
const stamp = (s: string) => Date.parse(s);
export function periodStart(days: number, now = new Date()) {
  const day = helsinkiDay(now);
  const d = new Date(`${day}T12:00:00Z`); d.setUTCDate(d.getUTCDate() - days + 1);
  const date = d.toISOString().slice(0, 10);
  const offset = new Intl.DateTimeFormat('en', { timeZone: 'Europe/Helsinki', timeZoneName: 'shortOffset' }).format(new Date(`${date}T00:00:00Z`)).includes('GMT+3') ? '+03:00' : '+02:00';
  return new Date(`${date}T00:00:00${offset}`).toISOString();
}
export function queueRows(data: OperationsData, key: string, f: QueueFilter): QueueRow[] {
  const now = stamp(f.until);
  const inPeriod = (s: string) => stamp(s) >= stamp(f.since) && stamp(s) <= now;
  const serviceLeads = data.leads.filter(l => f.service === 'all' || (l.service_key ?? 'muu') === f.service);
  const leads = serviceLeads.filter(l => !f.mine || l.owner_id === f.userId);
  const open = leads.filter(l => openLead(l) && stamp(l.created_at) <= now);
  const row = (l: Lead): QueueRow => ({ id: l.id, lead: l, title: l.status, date: l.created_at, amount: l.deal_value });
  if (['overdue', 'ownTasks'].includes(key)) {
    return data.tasks.filter(t => !t.completed_at && (key !== 'ownTasks' || t.owner_id === f.userId) && (!f.mine || t.owner_id === f.userId) && (key !== 'overdue' || stamp(t.due_at) < now)).flatMap(t => {
      const lead = serviceLeads.find(l => l.id === t.lead_id);
      return lead ? [{ id: t.id, lead, title: t.title, date: t.due_at }] : [];
    }).sort((a, b) => a.date.localeCompare(b.date));
  }
  if (['offers', 'lateOffers'].includes(key)) {
    return data.offers.filter(o => ['draft', 'sent'].includes(o.status) && stamp(o.created_at) <= now && (key !== 'lateOffers' || o.expected_close < helsinkiDay(new Date(now)))).flatMap(o => {
      const lead = leads.find(l => l.id === o.lead_id);
      return lead ? [{ id: o.id, lead, title: o.title, date: o.expected_close, amount: Number(o.amount) }] : [];
    });
  }
  const wins = leads.filter(l => l.status === 'koulutukseen' && l.sale_closed_at && inPeriod(l.sale_closed_at));
  if (key === 'missingValue') return wins.filter(l => l.deal_value === null).map(row);
  if (['wins', 'revenue'].includes(key)) return wins.map(l => ({ ...row(l), date: l.sale_closed_at ?? l.created_at }));
  if (key === 'cycle') return wins.filter(l => l.sale_closed_at && stamp(l.sale_closed_at) >= stamp(l.created_at)).map(l => ({ ...row(l), date: l.sale_closed_at ?? l.created_at }));
  if (key === 'fresh') return leads.filter(l => l.status === 'uusi' && inPeriod(l.created_at)).map(row);
  if (key === 'unassigned') return open.filter(l => !l.owner_id).map(row);
  if (key === 'noNext') return open.filter(l => !data.tasks.some(t => t.lead_id === l.id && !t.completed_at)).map(row);
  if (key === 'stale') return staleLeads(open, new Set(data.interactions.filter(h => ['call', 'email', 'meeting'].includes(h.kind)).map(h => h.lead_id)), now).map(row);
  if (key.startsWith('stage-')) return open.filter(l => l.status === key.slice(6)).map(row);
  return open.map(row);
}
export function meanDays(rows: QueueRow[], until?: string): number | null {
  if (!rows.length) return null;
  return rows.reduce((s, r) => s + (stamp(until ?? r.date) - stamp(r.lead.created_at)) / 86400000, 0) / rows.length;
}
export function queueLink(key: string, f: QueueFilter) {
  const p = new URLSearchParams({ tab: 'leads', jono: key, palvelu: f.service, alku: f.since, loppu: f.until });
  if (f.mine) p.set('oma', '1');
  return `/admin/markkinointi?${p}`;
}