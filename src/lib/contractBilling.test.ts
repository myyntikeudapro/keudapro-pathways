import { describe, it, expect } from 'vitest';
import { contractBilling, installmentErrors, cents, type BillingPlan, type BillingInstallment } from './contractBilling';
const order = { id: 'o', total_net: 2400, starts_on: '2026-11-26', ends_on: '2026-12-10' };
const plan = (mode: BillingPlan['mode']): BillingPlan => ({ order_id: 'o', mode, version: 1, total_net: 2400, starts_on: '2026-11-26', ends_on: '2026-12-10' });
const row = (amount = 2400, due_on = '2026-11-26', id = 'i'): BillingInstallment => ({ id, order_id: 'o', seq: id === 'i' ? 1 : 2, amount, due_on, payment_status: 'ei_laskutettu' });
describe('contract billing', () => {
 it('existing orders without a choice never become due', () => { expect(contractBilling(order, null, [], new Date('2027-01-01')).state).toBe('unconfirmed'); expect(contractBilling(order, null, []).due).toHaveLength(0); });
 it('start is due on Helsinki calendar day, not UTC day', () => { expect(contractBilling(order, plan('start'), [row()], new Date('2026-11-25T22:00:00Z')).due).toHaveLength(1); expect(contractBilling(order, plan('start'), [row()], new Date('2026-11-25T21:59:59Z')).due).toHaveLength(0); });
 it('end is due on contract end Helsinki date', () => { expect(contractBilling(order, plan('end'), [row(2400, '2026-12-10')], new Date('2026-12-09T22:00:00Z')).due).toHaveLength(1); expect(contractBilling(order, plan('end'), [row(2400, '2026-12-10')], new Date('2026-12-09T21:59:59Z')).due).toHaveLength(0); });
 it('installments use only entered dates and amounts', () => { const r = contractBilling(order, plan('installments'), [row(600, '2026-11-20'), row(1800, '2026-12-30', 'j')], new Date('2026-11-26')); expect(r.due.map(i => i.amount)).toEqual([600]); });
 it('installment sum must equal 2400 net exactly', () => { expect(installmentErrors(order, 'installments', [{ amount: 1000, due_on: '2026-11-26' }, { amount: 1399.99, due_on: '2026-12-10' }])).toHaveLength(1); });
 it('zero negative fractional cents and nonfinite amounts fail', () => { for (const n of [0, -1, 0.001, Infinity, NaN]) expect(cents(n)).toBeNull(); expect(cents(0.29)).toBe(29); });
 it('invalid and out of order calendar days fail', () => { expect(installmentErrors(order, 'installments', [{ amount: 2400, due_on: '2026-02-30' }]).length).toBeGreaterThan(0); expect(installmentErrors(order, 'installments', [{ amount: 1200, due_on: '2026-12-10' }, { amount: 1200, due_on: '2026-11-26' }]).length).toBeGreaterThan(0); });
 it('start/end cannot accept arbitrary installments', () => { expect(installmentErrors(order, 'start', [{ amount: 2400, due_on: '2026-11-20' }])).toHaveLength(1); });
 it('changed contract snapshot fails closed', () => { expect(contractBilling({ ...order, total_net: 2500 }, plan('start'), [row()], new Date('2026-12-31')).state).toBe('review'); });
 it('manual paid/invoiced installment is not pending', () => { expect(contractBilling(order, plan('start'), [{ ...row(), payment_status: 'laskutettu' }], new Date('2026-12-31')).due).toHaveLength(0); });
 it('cancelled delivery cannot be due', () => { expect(contractBilling(order, plan('start'), [row()], new Date('2026-12-31'), true).due).toHaveLength(0); });
});
