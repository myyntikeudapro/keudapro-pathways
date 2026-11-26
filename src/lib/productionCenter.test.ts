import { describe, expect, it } from 'vitest';
import { EMPTY_PRODUCTION, exceptions, productionQueue, readiness, type ProductionData } from './productionCenter';

const now = new Date('2026-11-01T10:00:00Z');
const base = (): ProductionData => ({
  ...EMPTY_PRODUCTION,
  deliveries: [{ id: 'd1', order_id: 'o1', template_key: 'A', title: 'Testi Oy · A', production_status: 'suunnittelu', production_owner_id: 'satu', sales_owner_id: 'heikki', created_at: '2026-10-20T10:00:00Z' }],
  sessions: [{ id: 's1', delivery_id: 'd1', seq: 1, title: 'Aktivointi', starts_at: '2026-11-10T07:00:00Z', ends_at: '2026-11-10T13:00:00Z' }],
  bookings: [{ id: 'b1', session_id: 's1', trainer_id: 'tr', status: 'varattu' }],
  tasks: [{ id: 't1', delivery_id: 'd1', code: 'A1', title: 'Tila ja laitteet varattu', scope: 'specific', owner_role: 'production', owner_id: 'satu', due_at: '2026-11-03T07:00:00Z', blocks_start: true, completed_at: null }],
  billing: [{ delivery_id: 'd1', billing_ready: false, payment_status: 'ei_laskutettu' }],
});

describe('production readiness', () => {
  it('is not ready while a start-blocking task is open, ready once done', () => {
    const d = base();
    expect(readiness(d, 'd1')).toMatchObject({ ready: false, missing: ['Tila ja laitteet varattu'] });
    d.tasks[0].completed_at = '2026-11-01T09:00:00Z';
    expect(readiness(d, 'd1').ready).toBe(true);
  });
  it('requires a trainer on every session', () => {
    const d = base(); d.tasks[0].completed_at = 'x'; d.bookings[0].status = 'peruttu';
    expect(readiness(d, 'd1').missing).toEqual(['1 sessiolta puuttuu kouluttaja']);
  });
});

describe('automatic exceptions', () => {
  it('flags an overdue task and clears it when completed', () => {
    const d = base(); d.tasks[0].due_at = '2026-10-31T07:00:00Z';
    expect(exceptions(d, now).map(e => e.kind)).toEqual(['overdue_task']);
    d.tasks[0].completed_at = '2026-11-01T09:00:00Z';
    expect(exceptions(d, now)).toEqual([]);
  });
  it('flags a missing trainer only within 14 days of the session', () => {
    const d = base(); d.bookings = [];
    expect(exceptions(d, now).map(e => e.kind)).toEqual(['missing_trainer']);
    d.sessions[0].starts_at = '2026-11-20T07:00:00Z'; d.sessions[0].ends_at = '2026-11-20T13:00:00Z';
    expect(exceptions(d, now)).toEqual([]);
  });
  it('flags a held session without an actuals record', () => {
    const d = base(); d.sessions[0].starts_at = '2026-10-30T07:00:00Z'; d.sessions[0].ends_at = '2026-10-30T13:00:00Z';
    expect(exceptions(d, now).map(e => e.kind)).toEqual(['missing_actual']);
    d.actuals = [{ id: 'a1', session_id: 's1', held: true }];
    expect(exceptions(d, now)).toEqual([]);
  });
  it('flags overlapping bookings of the same trainer on both sessions', () => {
    const d = base();
    d.sessions.push({ id: 's2', delivery_id: 'd1', seq: 2, title: 'Toinen', starts_at: '2026-11-10T12:00:00Z', ends_at: '2026-11-10T15:00:00Z' });
    d.bookings.push({ id: 'b2', session_id: 's2', trainer_id: 'tr', status: 'varattu' });
    expect(exceptions(d, now).filter(e => e.kind === 'double_booking')).toHaveLength(2);
  });
  it('ignores cancelled deliveries', () => {
    const d = base(); d.tasks[0].due_at = '2026-10-01T00:00:00Z'; d.deliveries[0].production_status = 'peruttu';
    expect(exceptions(d, now)).toEqual([]);
  });
});

describe('queues match metric counts and keep states separate', () => {
  it('upcoming ready / not ready split on readiness', () => {
    const d = base();
    expect(productionQueue(d, 'upcomingNotReady', now)).toHaveLength(1);
    expect(productionQueue(d, 'upcomingReady', now)).toHaveLength(0);
  });
  it('billing ready does not depend on participant completion or production status', () => {
    const d = base();
    d.orders = [{ id: 'o1', total_net: 2400, starts_on: '2026-11-01', ends_on: '2026-12-10' }];
    d.billingPlans = [{ order_id: 'o1', mode: 'start', version: 1, total_net: 2400, starts_on: '2026-11-01', ends_on: '2026-12-10' }];
    d.billingInstallments = [{ id: 'i1', order_id: 'o1', seq: 1, amount: 2400, due_on: '2026-11-01', payment_status: 'ei_laskutettu' }];
    expect(productionQueue(d, 'billingReady', now).map(r => r.id)).toEqual(['i1']);
    expect(d.billing[0].billing_ready).toBe(false);
    d.billingInstallments[0].payment_status = 'laskutettu';
    expect(productionQueue(d, 'billingReady', now)).toEqual([]);
  });
  it('mine filter narrows to the owner only', () => {
    const d = base(); d.tasks[0].due_at = '2026-10-31T07:00:00Z';
    expect(productionQueue(d, 'overdue', now, 'satu')).toHaveLength(1);
    expect(productionQueue(d, 'overdue', now, 'heikki')).toHaveLength(0);
  });
});
