import { expect, it } from 'vitest';
import { billingEligible } from './billingReadiness';
const now = Date.parse('2026-11-26T08:00:00Z');
const sessions = [{ id: 'a', ends_at: '2026-11-24T10:00:00Z' }, { id: 'b', ends_at: '2026-11-24T13:00:00Z' }];
it('first of two actuals is not enough', () => expect(billingEligible(sessions, [{ session_id: 'a', held: true }], now)).toBe(false));
it('all ended and held sessions are eligible', () => expect(billingEligible(sessions, [{ session_id: 'a', held: true }, { session_id: 'b', held: true }], now)).toBe(true));
it('future session cannot be ready even with an actual', () => expect(billingEligible([{ id: 'a', ends_at: '2027-01-20T13:00:00Z' }], [{ session_id: 'a', held: true }], now)).toBe(false));
it('not-held actual is not completion', () => expect(billingEligible(sessions, [{ session_id: 'a', held: true }, { session_id: 'b', held: false }], now)).toBe(false));
it('no sessions is not ready', () => expect(billingEligible([], [], now)).toBe(false));