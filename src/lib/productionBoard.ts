// Per-training stage, next step and traffic light for the production work list and training card.
// Display logic only; the database remains the authority for every transition.
import { billingEligible } from './billingReadiness';
import { DAY, TRAINER_LEAD_DAYS, exceptions, readiness, type ProductionData } from './productionCenter';

export type Tone = 'ok' | 'warn' | 'risk';
export type CardTab = 'yhteenveto' | 'aikataulu' | 'tehtavat' | 'osallistujat' | 'toteumat' | 'laatu';
export type Stage = 'aikatauluttamatta' | 'valmistelu' | 'aloitusvalmis' | 'kaynnissa' | 'toteumat' | 'laskutusvalmis' | 'laskutettu' | 'paattynyt' | 'peruttu';
export const STAGE_LABEL: Record<Stage, string> = {
  aikatauluttamatta: 'Aikatauluttamatta', valmistelu: 'Valmistelu', aloitusvalmis: 'Aloitusvalmis', kaynnissa: 'Käynnissä',
  toteumat: 'Toteumat kirjaamatta', laskutusvalmis: 'Laskutusvalmis', laskutettu: 'Laskutettu', paattynyt: 'Päättynyt', peruttu: 'Peruttu',
};
export type BoardRow = { id: string; title: string; stage: Stage; tone: Tone; reason: string; next: string; tab: CardTab; firstStart: string | null; lastEnd: string | null; ownerId: string; taskOwnerIds: string[]; done: number; total: number };

export function boardRow(d: ProductionData, id: string, now: Date): BoardRow {
  const t = now.getTime();
  const del = d.deliveries.find(x => x.id === id)!;
  const sessions = d.sessions.filter(s => s.delivery_id === id).sort((a, b) => Date.parse(a.starts_at) - Date.parse(b.starts_at));
  const tasks = d.tasks.filter(x => x.delivery_id === id);
  const r = readiness(d, id);
  const exc = exceptions(d, now).filter(e => e.deliveryId === id);
  const billing = d.billing.find(b => b.delivery_id === id);
  const lastEnd = sessions.length ? sessions[sessions.length - 1].ends_at : null;
  const critical = tasks.filter(x => x.blocks_start);
  const base = { id, title: del.title, firstStart: r.firstStart, lastEnd, ownerId: del.production_owner_id, taskOwnerIds: [...new Set(tasks.filter(x => !x.completed_at && x.owner_id).map(x => x.owner_id!))], done: critical.filter(x => x.completed_at).length, total: critical.length };
  const daysTo = r.firstStart ? (Date.parse(r.firstStart) - t) / DAY : Infinity;
  if (del.production_status === 'peruttu') return { ...base, stage: 'peruttu', tone: 'ok', reason: 'Peruttu', next: 'Ei toimenpiteitä', tab: 'yhteenveto' };
  if (billing && billing.payment_status !== 'ei_laskutettu') return { ...base, stage: 'laskutettu', tone: 'ok', reason: billing.payment_status === 'maksettu' ? 'Maksettu' : 'Laskutettu Netvisorissa', next: 'Ei toimenpiteitä', tab: 'toteumat' };
  if (!sessions.length) return { ...base, stage: 'aikatauluttamatta', tone: exc.length ? 'risk' : 'warn', reason: 'Sessioita ei ole aikataulutettu', next: 'Lisää sessiot ja varaa kouluttaja', tab: 'aikataulu' };
  const allEnded = sessions.every(s => Date.parse(s.ends_at) <= t);
  if (allEnded) {
    if (billingEligible(sessions, d.actuals, t)) return billing?.billing_ready
      ? { ...base, stage: 'laskutusvalmis', tone: 'ok', reason: 'Toteumat kirjattu', next: 'Laskuta Netvisorissa ja päivitä maksutila', tab: 'toteumat' }
      : { ...base, stage: 'toteumat', tone: 'warn', reason: 'Laskutusvalmius kuittaamatta', next: 'Tarkista laskutusvalmius', tab: 'toteumat' };
    const days = lastEnd ? (t - Date.parse(lastEnd)) / DAY : 0;
    return { ...base, stage: 'toteumat', tone: days > 7 ? 'risk' : 'warn', reason: `Toteumia puuttuu (${Math.floor(days)} pv viimeisestä sessiosta)`, next: 'Kirjaa sessioiden toteumat', tab: 'toteumat' };
  }
  if (Date.parse(sessions[0].starts_at) <= t) return { ...base, stage: 'kaynnissa', tone: exc.length ? 'risk' : 'ok', reason: exc.length ? `${exc.length} poikkeamaa` : 'Etenee suunnitellusti', next: exc.length ? 'Ratkaise poikkeamat' : 'Kirjaa toteuma kunkin session jälkeen', tab: exc.length ? 'tehtavat' : 'toteumat' };
  if (r.ready) return { ...base, stage: 'aloitusvalmis', tone: exc.length ? 'warn' : 'ok', reason: exc.length ? `Valmis, ${exc.length} poikkeamaa` : 'Kaikki aloitusehdot kunnossa', next: exc.length ? 'Tarkista poikkeamat' : 'Odottaa aloitusta', tab: exc.length ? 'tehtavat' : 'yhteenveto' };
  const tone: Tone = exc.length || daysTo <= TRAINER_LEAD_DAYS ? 'risk' : daysTo <= 2 * TRAINER_LEAD_DAYS ? 'warn' : 'ok';
  const first = r.missing[0] ?? '';
  const tab: CardTab = /kouluttaja|Sessio/.test(first) ? 'aikataulu' : 'tehtavat';
  return { ...base, stage: 'valmistelu', tone, reason: `${r.missing.length} aloitusehtoa puuttuu${Number.isFinite(daysTo) ? `, alkuun ${Math.max(0, Math.ceil(daysTo))} pv` : ''}`, next: first, tab };
}

export function boardRows(d: ProductionData, now: Date, mineId?: string, includeDone = false): BoardRow[] {
  const rows = d.deliveries.map(x => boardRow(d, x.id, now)).filter(r => r.stage !== 'peruttu' && (includeDone || r.stage !== 'laskutettu'));
  const order: Record<Tone, number> = { risk: 0, warn: 1, ok: 2 };
  return (mineId ? rows.filter(r => isMine(r, mineId)) : rows).sort((a, b) => order[a.tone] - order[b.tone] || (a.firstStart ?? '9').localeCompare(b.firstStart ?? '9'));
}
// "Own" = production owner of the training or owner of any of its open tasks.
export const isMine = (r: Pick<BoardRow, 'ownerId' | 'taskOwnerIds'>, me: string) => r.ownerId === me || r.taskOwnerIds.includes(me);

// Monday-start Helsinki weeks for the timeline view.
export function weekKey(iso: string) {
  const day = new Date(new Date(iso).toLocaleString('en-US', { timeZone: 'Europe/Helsinki' }));
  day.setHours(0, 0, 0, 0); day.setDate(day.getDate() - ((day.getDay() + 6) % 7));
  return `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
}
export function timeline(d: ProductionData, ids: Set<string>) {
  const weeks = new Map<string, { sessionId: string; deliveryId: string; title: string; starts_at: string; ends_at: string; trainers: string[] }[]>();
  for (const s of [...d.sessions].sort((a, b) => a.starts_at.localeCompare(b.starts_at))) {
    if (!ids.has(s.delivery_id)) continue;
    const k = weekKey(s.starts_at);
    const trainers = d.bookings.filter(b => b.session_id === s.id && b.status !== 'peruttu').map(b => b.trainer_id);
    weeks.set(k, [...(weeks.get(k) ?? []), { sessionId: s.id, deliveryId: s.delivery_id, title: s.title, starts_at: s.starts_at, ends_at: s.ends_at, trainers }]);
  }
  return [...weeks.entries()];
}

// Gantt (Severa-style): Monday-start week columns and a training's bar position within them.
export function ganttWeeks(now: Date, before = 2, count = 14): string[] {
  const start = new Date(`${weekKey(now.toISOString())}T12:00:00`);
  start.setDate(start.getDate() - before * 7);
  return Array.from({ length: count }, (_, i) => { const d = new Date(start); d.setDate(d.getDate() + i * 7); return weekKey(d.toISOString()); });
}
export function ganttBar(weeks: string[], firstStart: string | null, lastEnd: string | null): { start: number; span: number } | null {
  if (!firstStart || !weeks.length) return null;
  const a = weekKey(firstStart), b = weekKey(lastEnd ?? firstStart);
  const last = weeks[weeks.length - 1];
  if (b < weeks[0] || a > last) return null;
  const start = a < weeks[0] ? 0 : weeks.indexOf(a);
  const end = b > last ? weeks.length - 1 : weeks.indexOf(b);
  return { start, span: end - start + 1 };
}
