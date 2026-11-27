import { type BillingPlan, type BillingInstallment } from './contractBilling';
import { orderBillingQueue, type QueueOrder } from './billingQueue';
// Shared production calculations. The production page and the operations center both use these,
// so a metric count always equals the rows of its linked queue.
import { billingEligible } from './billingReadiness';
export type Delivery = { id: string; order_id: string; template_key: string; title: string; production_status: string; production_owner_id: string; sales_owner_id: string; created_at: string };
export type Session = { id: string; delivery_id: string; seq: number; title: string; starts_at: string; ends_at: string; location?: string | null };
export type Booking = { id: string; session_id: string; trainer_id: string; status: string };
export type Task = { id: string; delivery_id: string; code: string; title: string; scope: string; owner_role: string; owner_id: string | null; due_at: string | null; blocks_start: boolean; completed_at: string | null };
export type Blocker = { id: string; delivery_id: string; description: string; owner_id: string; resolved_at: string | null };
export type QualityIssue = { id: string; delivery_id: string; severity: string; description: string; owner_id: string; closed_at: string | null };
export type Actual = { id: string; session_id: string; held?: boolean };
export type Billing = { delivery_id: string; billing_ready: boolean; payment_status: string };
export type ProductionData = { deliveries: Delivery[]; sessions: Session[]; bookings: Booking[]; tasks: Task[]; blockers: Blocker[]; quality: QualityIssue[]; actuals: Actual[]; billing: Billing[]; orders?: QueueOrder[]; billingPlans?: BillingPlan[]; billingInstallments?: BillingInstallment[] };

export const EMPTY_PRODUCTION: ProductionData = { deliveries: [], sessions: [], bookings: [], tasks: [], blockers: [], quality: [], actuals: [], billing: [] };
export const DAY = 86_400_000;
export const TRAINER_LEAD_DAYS = 14;
export const UPCOMING_DAYS = 30;

export type ExceptionKind = 'overdue_task' | 'missing_trainer' | 'missing_actual' | 'double_booking' | 'unowned_task' | 'open_blocker' | 'open_quality';
export type ProductionException = { key: string; kind: ExceptionKind; deliveryId: string; label: string; ownerId: string | null };
export const EXCEPTION_LABEL: Record<ExceptionKind, string> = {
  overdue_task: 'Myöhästynyt valmistelu', missing_trainer: 'Kouluttaja puuttuu', missing_actual: 'Toteumakirjaus puuttuu',
  double_booking: 'Päällekkäinen kouluttajavaraus', unowned_task: 'Tehtävältä puuttuu vastuuhenkilö', open_blocker: 'Avoin estävä tekijä', open_quality: 'Avoin laatupoikkeama',
};

const activeBookings = (d: ProductionData) => d.bookings.filter(b => b.status !== 'peruttu');
const isLive = (x: Delivery) => x.production_status !== 'peruttu';

export function exceptions(d: ProductionData, now: Date): ProductionException[] {
  const t = now.getTime();
  const live = new Map(d.deliveries.filter(isLive).map(x => [x.id, x]));
  const sessions = new Map(d.sessions.map(s => [s.id, s]));
  const booked = new Set(activeBookings(d).map(b => b.session_id));
  const recorded = new Set(d.actuals.filter(a => a.held === true).map(a => a.session_id));
  const out: ProductionException[] = [];
  for (const task of d.tasks) {
    if (!live.has(task.delivery_id) || task.completed_at) continue;
    if (task.due_at && Date.parse(task.due_at) < t) out.push({ key: `overdue:${task.id}`, kind: 'overdue_task', deliveryId: task.delivery_id, label: task.title, ownerId: task.owner_id });
    if (!task.owner_id) out.push({ key: `unowned:${task.id}`, kind: 'unowned_task', deliveryId: task.delivery_id, label: task.title, ownerId: live.get(task.delivery_id)!.production_owner_id });
  }
  for (const s of d.sessions) {
    const del = live.get(s.delivery_id); if (!del) continue;
    const start = Date.parse(s.starts_at);
    if (!booked.has(s.id) && start - t <= TRAINER_LEAD_DAYS * DAY) out.push({ key: `trainer:${s.id}`, kind: 'missing_trainer', deliveryId: s.delivery_id, label: s.title, ownerId: del.production_owner_id });
    if (Date.parse(s.ends_at) < t && !recorded.has(s.id)) out.push({ key: `actual:${s.id}`, kind: 'missing_actual', deliveryId: s.delivery_id, label: s.title, ownerId: del.production_owner_id });
  }
  const byTrainer = new Map<string, Session[]>();
  for (const b of activeBookings(d)) { const s = sessions.get(b.session_id); if (s && live.has(s.delivery_id)) byTrainer.set(b.trainer_id, [...(byTrainer.get(b.trainer_id) ?? []), s]); }
  for (const list of byTrainer.values()) {
    list.sort((a, b) => Date.parse(a.starts_at) - Date.parse(b.starts_at));
    for (let i = 0; i < list.length; i++) for (let j = i + 1; j < list.length && Date.parse(list[j].starts_at) < Date.parse(list[i].ends_at); j++) {
      for (const s of [list[i], list[j]]) out.push({ key: `double:${s.id}:${list[i].id === s.id ? list[j].id : list[i].id}`, kind: 'double_booking', deliveryId: s.delivery_id, label: s.title, ownerId: live.get(s.delivery_id)!.production_owner_id });
    }
  }
  for (const b of d.blockers) if (!b.resolved_at && live.has(b.delivery_id)) out.push({ key: `blocker:${b.id}`, kind: 'open_blocker', deliveryId: b.delivery_id, label: b.description, ownerId: b.owner_id });
  for (const q of d.quality) if (!q.closed_at && live.has(q.delivery_id)) out.push({ key: `quality:${q.id}`, kind: 'open_quality', deliveryId: q.delivery_id, label: `${q.severity}: ${q.description}`, ownerId: q.owner_id });
  return out;
}

export type Readiness = { ready: boolean; missing: string[]; firstStart: string | null };
export function readiness(d: ProductionData, deliveryId: string): Readiness {
  const sessions = d.sessions.filter(s => s.delivery_id === deliveryId).sort((a, b) => Date.parse(a.starts_at) - Date.parse(b.starts_at));
  const booked = new Set(activeBookings(d).map(b => b.session_id));
  const missing: string[] = [];
  if (!sessions.length) missing.push('Sessioita ei ole aikataulutettu');
  const noTrainer = sessions.filter(s => !booked.has(s.id)).length;
  if (noTrainer) missing.push(`${noTrainer} sessiolta puuttuu kouluttaja`);
  for (const t of d.tasks) if (t.delivery_id === deliveryId && t.blocks_start && !t.completed_at) missing.push(t.title);
  const blockers = d.blockers.filter(b => b.delivery_id === deliveryId && !b.resolved_at).length;
  if (blockers) missing.push(`${blockers} avointa estävää tekijää`);
  return { ready: missing.length === 0, missing, firstStart: sessions[0]?.starts_at ?? null };
}

export const PRODUCTION_QUEUES: Record<string, string> = {
  running: 'Käynnissä olevat toteutukset', upcomingReady: 'Aloitusvalmiit (alkaa 30 pv sisällä)', upcomingNotReady: 'Ei aloitusvalmiit (alkaa 30 pv sisällä)',
  overdue: 'Myöhästyneet valmistelut', exceptions: 'Avoimet poikkeamat', billingReady: 'Laskutusvalmiit',
};
export const PRODUCTION_FORMULAS: Record<string, string> = {
  running: 'Toteutukset, joiden tuotannon tila on käynnissä',
  upcomingReady: 'Ensimmäinen sessio seuraavan 30 päivän aikana ja kaikki aloitusehdot täyttyvät',
  upcomingNotReady: 'Ensimmäinen sessio seuraavan 30 päivän aikana ja jokin aloitusehto puuttuu',
  overdue: 'Tekemättömät valmistelutehtävät, joiden määräaika on ohitettu',
  exceptions: 'Poikkeamien määrä: myöhästymiset, puuttuvat kouluttajat/toteumat/vastuut, päällekkäiset varaukset, avoimet estävät tekijät ja laatupoikkeamat',
  billingReady: 'Vahvistetun sopimussuunnitelman avoimet erät Helsingin laskutuspäivään mennessä; ei koulutuksen valmistumismittari',
};

export type QueueRow = { id: string; deliveryId: string | null; title: string; detail: string; ownerId: string | null; href?: string };
export function productionQueue(d: ProductionData, key: string, now: Date, mineId?: string): QueueRow[] {
  const t = now.getTime();
  const byId = new Map(d.deliveries.map(x => [x.id, x]));
  const live = d.deliveries.filter(isLive);
  let rows: QueueRow[] = [];
  if (key === 'running') rows = live.filter(x => x.production_status === 'käynnissä').map(x => ({ id: x.id, deliveryId: x.id, title: x.title, detail: 'Käynnissä', ownerId: x.production_owner_id }));
  else if (key === 'upcomingReady' || key === 'upcomingNotReady') rows = live.filter(x => x.production_status === 'suunnittelu').flatMap(x => {
    const r = readiness(d, x.id); if (!r.firstStart) return [];
    const start = Date.parse(r.firstStart); if (start < t || start > t + UPCOMING_DAYS * DAY) return [];
    if (r.ready !== (key === 'upcomingReady')) return [];
    return [{ id: x.id, deliveryId: x.id, title: x.title, detail: r.ready ? 'Valmis aloitukseen' : r.missing.join(' · '), ownerId: x.production_owner_id }];
  });
  else if (key === 'overdue' || key === 'exceptions') rows = exceptions(d, now).filter(e => key === 'exceptions' || e.kind === 'overdue_task').map(e => ({ id: e.key, deliveryId: e.deliveryId, title: `${EXCEPTION_LABEL[e.kind]}: ${e.label}`, detail: byId.get(e.deliveryId)?.title ?? '', ownerId: e.ownerId }));
  else if (key === 'billingReady') rows = orderBillingQueue(d, now);
  return mineId ? rows.filter(r => r.ownerId === mineId) : rows;
}
