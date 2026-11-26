import { describe, it, expect } from 'vitest';
import { EMPTY_PRODUCTION } from './productionCenter';
import { taskKpis, groupTasks, daySessions, trainerLoad } from './productionDaily';

const now = new Date('2026-11-26T09:00:00Z'); // Thu 11:00 Helsinki
const task = (id: string, due_at: string | null, extra = {}) => ({ id, delivery_id: 'd1', code: id, title: id, scope: 'general', owner_role: 'tuotanto', owner_id: 'satu', due_at, blocks_start: false, completed_at: null, ...extra });
const data = { ...EMPTY_PRODUCTION,
  deliveries: [{ id: 'd1', order_id: 'o', template_key: 'A', title: 'TESTI', production_status: 'suunnittelu', production_owner_id: 'satu', sales_owner_id: 'heikki', created_at: '' }],
  tasks: [task('late', '2026-11-20T10:00:00Z'), task('today', '2026-11-26T14:00:00Z'), task('week', '2026-11-29T10:00:00Z'), task('later', '2026-12-20T10:00:00Z'), task('none', null), task('done', '2026-11-10T10:00:00Z', { completed_at: '2026-11-05T10:00:00Z' }), task('heikki', '2026-11-20T10:00:00Z', { owner_id: 'heikki' })],
  sessions: [{ id: 's1', delivery_id: 'd1', seq: 1, title: 'S1', starts_at: '2026-11-26T07:00:00Z', ends_at: '2026-11-26T10:00:00Z' }],
  bookings: [{ id: 'b1', session_id: 's1', trainer_id: 'kouluttaja', status: 'varattu' }],
} as any;

describe('productionDaily', () => {
  it('counts Severa-style KPIs', () => expect(taskKpis(data, now)).toEqual({ doneThisMonth: 1, dueIn2Weeks: 2, late: 2, openToday: 1 }));
  it('filters KPIs by user', () => expect(taskKpis(data, now, 'heikki').late).toBe(1));
  it('groups tasks by Helsinki day and week ending Sunday', () => {
    const g = groupTasks(data, now, 'satu');
    expect(g.myohassa.map(t => t.id)).toEqual(['late']); expect(g.tanaan.map(t => t.id)).toEqual(['today']);
    expect(g.viikko.map(t => t.id)).toEqual(['week']); expect(g.myohemmin.map(t => t.id)).toEqual(['later', 'none']);
  });
  it('lists day sessions with trainers', () => expect(daySessions(data, '2026-11-26')[0].trainers).toEqual(['kouluttaja']));
  it('sums trainer hours per weekday', () => expect(trainerLoad(data, '2026-11-26').rows).toEqual([{ trainerId: 'kouluttaja', hours: [0, 0, 0, 3, 0] }]));
});
