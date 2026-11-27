import { describe, it, expect } from 'vitest';
import { flowBoard, type FlowInput } from './flowBoard';
const now = Date.parse('2026-11-25T12:00:00Z');
const ago = (d: number) => new Date(now - d * 86_400_000).toISOString();
const base: FlowInput = { offers: [], orders: [], handoffs: [], deliveries: [], sessions: [], actuals: [], tasks: [], blockers: [], billing: [] };
const st = (i: Partial<FlowInput>, k: string) => { const result = flowBoard({ ...base, ...i }, now).find(s => s.key === k); if (!result) throw new Error('stage missing'); return result; };
describe('flowBoard', () => {
  it('empty stream is green', () => { expect(flowBoard(base, now).every(s => s.light === 'green')).toBe(true); });
  it('open offer turns yellow at 7 and red at 14 days', () => {
    const o = (d: number) => ({ id: 'o', lead_id: 'l', title: 'T', status: 'sent', created_at: ago(d) });
    expect(st({ offers: [o(6)] }, 'offer').light).toBe('green');
    expect(st({ offers: [o(7)] }, 'offer').light).toBe('yellow');
    expect(st({ offers: [o(14)] }, 'offer').light).toBe('red');
    expect(st({ offers: [{ ...o(30), status: 'accepted' }] }, 'offer').items).toHaveLength(0);
  });
  it('handed-over order is not waiting; unaccepted handoff turns red after 3 days', () => {
    const orders = [{ id: 'x', lead_id: 'l', confirmed_at: ago(10), created_at: ago(10), name: 'A' }];
    const handoffs = [{ order_id: 'x', handed_at: ago(3), cancelled_at: null, company_state: 'submitted', mt_state: null }];
    expect(st({ orders, handoffs }, 'order').items).toHaveLength(0);
    expect(st({ orders, handoffs }, 'handoff').light).toBe('red');
  });
  it('open critical task is red 3 days before start', () => {
    const i = { deliveries: [{ id: 'd', order_id: 'x', title: 'D' }], sessions: [{ id: 's', delivery_id: 'd', starts_at: ago(-2), ends_at: ago(-2) }], tasks: [{ delivery_id: 'd', blocks_start: true, completed_at: null }] };
    expect(st(i, 'start').light).toBe('red');
  });
  it('creating a delivery does not hide an order still waiting for handoff', () => {
    expect(st({ orders: [{ id: 'o', lead_id: 'l', confirmed_at: ago(5), created_at: ago(5), name: 'A' }], deliveries: [{ id: 'd', order_id: 'o', title: 'D' }] }, 'order').light).toBe('red');
  });
  it('submitted company handoff still waits for production even with an existing delivery', () => {
    const i = { orders: [{ id: 'o', lead_id: 'l', confirmed_at: ago(5), created_at: ago(5), name: 'A' }], deliveries: [{ id: 'd', order_id: 'o', title: 'D' }], handoffs: [{ order_id: 'o', handed_at: ago(3), cancelled_at: null, company_state: 'submitted', mt_state: null }] };
    expect(st(i, 'handoff').light).toBe('red');
    expect(st(i, 'handoff').items[0].link).toBe('/admin/markkinointi?tab=leads&asiakas=l');
    expect(st({ ...i, handoffs: [{ ...i.handoffs[0], company_state: 'accepted' }] }, 'handoff').items).toHaveLength(0);
  });
  it('unrecorded session red after 7 days; actuals alone never imply contract billing', () => {
    const deliveries = [{ id: 'd', order_id: 'x', title: 'D' }]; const sessions = [{ id: 's', delivery_id: 'd', starts_at: ago(8), ends_at: ago(7) }];
    expect(st({ deliveries, sessions }, 'held').light).toBe('red');
    expect(st({ deliveries, sessions, actuals: [{ session_id: 's', held: true }] }, 'billing').items).toHaveLength(0);
    expect(st({ deliveries, sessions, actuals: [{ session_id: 's', held: true }], billing: [{ delivery_id: 'd', billing_ready: true }] }, 'billing').items).toHaveLength(0);
  });
  it('flags an earlier invalid billing-ready marker rather than showing green', () => {
    const deliveries = [{ id: 'd', order_id: 'x', title: 'D' }]; const sessions = [{ id: 's', delivery_id: 'd', starts_at: ago(-20), ends_at: ago(-19) }];
    expect(st({ deliveries, sessions, actuals: [{ session_id: 's', held: true }], billing: [{ delivery_id: 'd', billing_ready: true }] }, 'held').light).toBe('red');
  });
});
