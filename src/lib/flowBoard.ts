// Pure flow-board rules: each value-stream stage gets green/yellow/red from the age of its oldest waiting item.
import { billingEligible } from './billingReadiness';
export type Light = 'green' | 'yellow' | 'red';
export type FlowItem = { id: string; label: string; days: number; light: Light; link: string };
export type FlowStage = { key: string; title: string; rule: string; light: Light; items: FlowItem[] };
export type FlowInput = {
  offers: { id: string; lead_id: string; title: string; status: string; created_at: string }[];
  orders: { id: string; lead_id: string | null; confirmed_at: string | null; created_at: string; name: string }[];
  handoffs: { order_id: string; handed_at: string; cancelled_at: string | null; company_state: string | null; mt_state: string | null }[];
  deliveries: { id: string; order_id: string; title: string }[];
  sessions: { id: string; delivery_id: string; starts_at: string; ends_at: string }[];
  actuals: { session_id: string; held?: boolean }[];
  tasks: { delivery_id: string; blocks_start: boolean; completed_at: string | null }[];
  blockers: { delivery_id: string; resolved_at: string | null }[];
  billing: { delivery_id: string; billing_ready: boolean }[];
};

// Thresholds in days: [yellow from, red from].
export const LIMITS = { offer: [7, 14], order: [2, 5], handoff: [1, 3], held: [2, 7], billing: [3, 7] } as const;
const DAY = 86_400_000;
const age = (iso: string, now: number) => Math.max(0, (now - Date.parse(iso)) / DAY);
const light = (d: number, [y, r]: readonly [number, number]): Light => (d >= r ? 'red' : d >= y ? 'yellow' : 'green');
const worst = (items: FlowItem[]): Light => (items.some(i => i.light === 'red') ? 'red' : items.some(i => i.light === 'yellow') ? 'yellow' : 'green');
const lead = (id: string | null) => (id ? `/admin/markkinointi?tab=leads&asiakas=${id}` : '/admin/markkinointi?tab=leads');
const prod = (id: string) => `/admin/tuotanto?toteutus=${id}`;
const sort = (items: FlowItem[]) => items.sort((a, b) => b.days - a.days);

export function flowBoard(i: FlowInput, now = Date.now()): FlowStage[] {
  const live = i.handoffs.filter(h => !h.cancelled_at);
  const handed = new Set(live.map(h => h.order_id));
  const orderName = new Map(i.orders.map(o => [o.id, o]));
  const accepted = (h: FlowInput['handoffs'][number]) => h.company_state === 'accepted' || h.mt_state === 'accepted';

  const offers = i.offers.filter(o => o.status === 'draft' || o.status === 'sent').map(o => { const d = age(o.created_at, now); return { id: o.id, label: o.title, days: d, light: light(d, LIMITS.offer), link: lead(o.lead_id) }; });
  const orders = i.orders.filter(o => !handed.has(o.id)).map(o => { const d = age(o.confirmed_at ?? o.created_at, now); return { id: o.id, label: o.name, days: d, light: light(d, LIMITS.order), link: lead(o.lead_id) }; });
  const handoffs = live.filter(h => !accepted(h)).map(h => { const o = orderName.get(h.order_id); const d = age(h.handed_at, now); return { id: h.order_id, label: o?.name ?? 'Tilaus', days: d, light: light(d, LIMITS.handoff), link: lead(o?.lead_id ?? null) }; });

  const held = new Set(i.actuals.filter(a => a.held === true).map(a => a.session_id));
  const start: FlowItem[] = []; const record: FlowItem[] = []; const bill: FlowItem[] = [];
  for (const dl of i.deliveries) {
    const ss = i.sessions.filter(s => s.delivery_id === dl.id).sort((a, b) => Date.parse(a.starts_at) - Date.parse(b.starts_at));
    const ready = i.billing.find(b => b.delivery_id === dl.id)?.billing_ready;
    if (ready && billingEligible(ss, i.actuals, now)) continue;
    if (ready) { bill.push({ id: dl.id, label: `${dl.title} · laskutusmerkintä ei vastaa toteumia`, days: 0, light: 'red', link: prod(dl.id) }); }
    if (!ss.length) { start.push({ id: dl.id, label: `${dl.title} · ei sessioita`, days: 0, light: 'yellow', link: prod(dl.id) }); continue; }
    const first = Date.parse(ss[0].starts_at);
    if (first > now) {
      const open = i.tasks.some(t => t.delivery_id === dl.id && t.blocks_start && !t.completed_at) || i.blockers.some(b => b.delivery_id === dl.id && !b.resolved_at);
      if (open) { const until = (first - now) / DAY; start.push({ id: dl.id, label: `${dl.title} · alkuun ${Math.ceil(until)} vrk`, days: until, light: until <= 3 ? 'red' : until <= 7 ? 'yellow' : 'green', link: prod(dl.id) }); }
      continue;
    }
    const missing = ss.filter(s => Date.parse(s.ends_at) < now && !held.has(s.id));
    if (missing.length) { const d = age(missing[0].ends_at, now); record.push({ id: dl.id, label: `${dl.title} · ${missing.length} kirjaamatta`, days: d, light: light(d, LIMITS.held), link: prod(dl.id) }); continue; }
    if (ss.every(s => held.has(s.id))) { const d = age(ss[ss.length - 1].ends_at, now); bill.push({ id: dl.id, label: dl.title, days: d, light: light(d, LIMITS.billing), link: prod(dl.id) }); }
  }
  const stage = (key: string, title: string, rule: string, items: FlowItem[]): FlowStage => ({ key, title, rule, items: sort(items), light: worst(items) });
  return [
    stage('offer', 'Tarjous avoinna', 'Keltainen 7 vrk, punainen 14 vrk', offers),
    stage('order', 'Tilaus odottaa luovutusta', 'Keltainen 2 vrk, punainen 5 vrk vahvistuksesta', orders),
    stage('handoff', 'Luovutus odottaa tuotantoa', 'Keltainen 1 vrk, punainen 3 vrk', handoffs),
    stage('start', 'Aloitusvalmius', 'Avoin este: keltainen alle 7 vrk, punainen alle 3 vrk alkuun', start),
    stage('held', 'Toteumat kirjaamatta', 'Keltainen 2 vrk, punainen 7 vrk session jälkeen', record),
    stage('billing', 'Laskutusvalmius', 'Keltainen 3 vrk, punainen 7 vrk viimeisestä sessiosta', bill),
  ];
}
