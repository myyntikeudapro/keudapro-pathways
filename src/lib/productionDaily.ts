import type { ProductionData, Task } from './productionCenter';
import { helsinkiLocal } from './helsinkiTime';

// Severa-style daily/weekly work views. All day boundaries are Helsinki calendar days.
export const hkiDay = (iso: string) => helsinkiLocal(iso).slice(0, 10);
const addDays = (day: string, n: number) => { const d = new Date(`${day}T12:00:00Z`); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const weekEnd = (day: string) => { const dow = (new Date(`${day}T12:00:00Z`).getUTCDay() + 6) % 7; return addDays(day, 6 - dow); };
export const weekStart = (day: string) => addDays(weekEnd(day), -6);
export { addDays };

const liveIds = (d: ProductionData) => new Set(d.deliveries.filter(x => x.production_status !== 'peruttu' && x.production_status !== 'päättynyt').map(x => x.id));
const forUser = (t: Task, userId?: string) => !userId || t.owner_id === userId;

export function taskKpis(d: ProductionData, now: Date, userId?: string) {
  const today = hkiDay(now.toISOString()); const month = today.slice(0, 7); const horizon = addDays(today, 14);
  const live = liveIds(d);
  const open = d.tasks.filter(t => !t.completed_at && live.has(t.delivery_id) && forUser(t, userId));
  return {
    doneThisMonth: d.tasks.filter(t => t.completed_at && hkiDay(t.completed_at).slice(0, 7) === month && forUser(t, userId)).length,
    dueIn2Weeks: open.filter(t => t.due_at && Date.parse(t.due_at) >= now.getTime() && hkiDay(t.due_at) <= horizon).length,
    late: open.filter(t => t.due_at && Date.parse(t.due_at) < now.getTime()).length,
    openToday: open.filter(t => t.due_at && hkiDay(t.due_at) === today && Date.parse(t.due_at) >= now.getTime()).length,
  };
}

export type TaskGroup = 'myohassa' | 'tanaan' | 'viikko' | 'myohemmin';
export const TASK_GROUP_LABEL: Record<TaskGroup, string> = { myohassa: 'Myöhässä', tanaan: 'Tänään', viikko: 'Tällä viikolla', myohemmin: 'Myöhemmin / ei määräaikaa' };
export function groupTasks(d: ProductionData, now: Date, userId?: string): Record<TaskGroup, Task[]> {
  const today = hkiDay(now.toISOString()); const we = weekEnd(today); const live = liveIds(d);
  const g: Record<TaskGroup, Task[]> = { myohassa: [], tanaan: [], viikko: [], myohemmin: [] };
  const open = d.tasks.filter(t => !t.completed_at && live.has(t.delivery_id) && forUser(t, userId))
    .sort((a, b) => (a.due_at ?? '9').localeCompare(b.due_at ?? '9'));
  for (const t of open) {
    if (!t.due_at) g.myohemmin.push(t);
    else if (Date.parse(t.due_at) < now.getTime()) g.myohassa.push(t);
    else if (hkiDay(t.due_at) === today) g.tanaan.push(t);
    else if (hkiDay(t.due_at) <= we) g.viikko.push(t);
    else g.myohemmin.push(t);
  }
  return g;
}

export function daySessions(d: ProductionData, day: string, userId?: string) {
  const live = liveIds(d); const booked = d.bookings.filter(b => b.status !== 'peruttu');
  return d.sessions.filter(s => live.has(s.delivery_id) && hkiDay(s.starts_at) === day)
    .map(s => ({ ...s, trainers: booked.filter(b => b.session_id === s.id).map(b => b.trainer_id), delivery: d.deliveries.find(x => x.id === s.delivery_id)! }))
    .filter(s => !userId || s.trainers.includes(userId) || s.delivery.production_owner_id === userId)
    .sort((a, b) => a.starts_at.localeCompare(b.starts_at));
}

/** Hours and session count per trainer per weekday (Mon..Fri) of the week containing `day`. */
export function trainerLoad(d: ProductionData, day: string) {
  const start = weekStart(day); const days = [0, 1, 2, 3, 4].map(i => addDays(start, i));
  const live = liveIds(d); const sessions = new Map(d.sessions.filter(s => live.has(s.delivery_id)).map(s => [s.id, s]));
  const out = new Map<string, number[]>();
  for (const b of d.bookings) {
    const s = b.status !== 'peruttu' && sessions.get(b.session_id); if (!s) continue;
    const i = days.indexOf(hkiDay(s.starts_at)); if (i < 0) continue;
    const row = out.get(b.trainer_id) ?? [0, 0, 0, 0, 0];
    row[i] += (Date.parse(s.ends_at) - Date.parse(s.starts_at)) / 3_600_000; out.set(b.trainer_id, row);
  }
  return { days, rows: [...out.entries()].map(([trainerId, hours]) => ({ trainerId, hours })) };
}
