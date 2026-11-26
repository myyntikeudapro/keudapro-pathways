import { describe, it, expect } from 'vitest';
import { boardRow, boardRows, weekKey } from './productionBoard';
import { EMPTY_PRODUCTION, type ProductionData } from './productionCenter';

const now = new Date('2027-01-10T10:00:00Z');
const del = { id: 'd', order_id: 'o', template_key: 'x', title: 'TESTI', production_status: 'suunnittelu', production_owner_id: 'satu', sales_owner_id: 'heikki', created_at: '2026-12-01' };
const mk = (p: Partial<ProductionData>): ProductionData => ({ ...EMPTY_PRODUCTION, deliveries: [del], ...p });
const sess = (starts: string, ends: string, id = 's1') => ({ id, delivery_id: 'd', seq: 1, title: 'S', starts_at: starts, ends_at: ends });

describe('productionBoard', () => {
  it('unscheduled training goes to schedule tab', () => {
    const r = boardRow(mk({}), 'd', now);
    expect(r.stage).toBe('aikatauluttamatta'); expect(r.tab).toBe('aikataulu');
  });
  it('missing trainer within 14 days is red', () => {
    const r = boardRow(mk({ sessions: [sess('2027-01-15T07:00:00Z', '2027-01-15T13:00:00Z')] }), 'd', now);
    expect(r.stage).toBe('valmistelu'); expect(r.tone).toBe('risk');
  });
  it('ready training is green', () => {
    const r = boardRow(mk({ sessions: [sess('2027-03-15T07:00:00Z', '2027-03-15T13:00:00Z')], bookings: [{ id: 'b', session_id: 's1', trainer_id: 't', status: 'varattu' }] }), 'd', now);
    expect(r.stage).toBe('aloitusvalmis'); expect(r.tone).toBe('ok');
  });
  it('actuals missing over 7 days after last session is red', () => {
    const r = boardRow(mk({ sessions: [sess('2026-12-20T07:00:00Z', '2026-12-20T13:00:00Z')], bookings: [{ id: 'b', session_id: 's1', trainer_id: 't', status: 'varattu' }] }), 'd', now);
    expect(r.stage).toBe('toteumat'); expect(r.tone).toBe('risk');
  });
  it('critical task progress counts real tasks', () => {
    const task = (id: string, done: boolean) => ({ id, delivery_id: 'd', code: id, title: id, scope: 'general', owner_role: 'x', owner_id: 'kouluttaja', due_at: null, blocks_start: true, completed_at: done ? '2027-01-01' : null });
    const r = boardRow(mk({ tasks: [task('a', true), task('b', false), task('c', false)] }), 'd', now);
    expect([r.done, r.total]).toEqual([1, 3]);
  });
  it('own filter includes open task owners', () => {
    const task = { id: 'a', delivery_id: 'd', code: 'a', title: 'a', scope: 'general', owner_role: 'x', owner_id: 'kouluttaja', due_at: null, blocks_start: false, completed_at: null };
    expect(boardRows(mk({ tasks: [task] }), now, 'kouluttaja')).toHaveLength(1);
    expect(boardRows(mk({ tasks: [task] }), now, 'muu')).toHaveLength(0);
  });
  it('weeks start on Monday in Helsinki', () => {
    expect(weekKey('2027-01-10T21:30:00Z')).toBe('2027-01-04'); // Sunday 23:30 Helsinki
    expect(weekKey('2027-01-10T22:30:00Z')).toBe('2027-01-11'); // Monday 00:30 Helsinki
  });
});
