import { describe, it, expect } from 'vitest';
import { salesFlow, productionFlow } from './companyFlow';
const base = { hasOffer: false, hasOrder: false, programmeSaved: false, programmeApproved: false, missing: [] as string[], attached: false, handoff: null };
describe('companyFlow', () => {
  it('starts at offer', () => expect(salesFlow(base).steps[salesFlow(base).current].key).toBe('offer'));
  it('capacity step belongs to the trainer or production', () => {
    const f = salesFlow({ ...base, hasOffer: true, hasOrder: true, programmeSaved: true, programmeApproved: true, missing: ['capacity_unapproved'] });
    expect(f.steps[f.current].key).toBe('capacity'); expect(f.next?.who).toBe('Kouluttaja tai tuotanto');
  });
  it('done after production accepts', () => expect(salesFlow({ ...base, hasOffer: true, hasOrder: true, programmeSaved: true, programmeApproved: true, attached: true, handoff: 'accepted' }).next).toBeNull());
  it('production waits for actuals before billing', () => {
    const f = productionFlow({ sessions: 2, sessionsBooked: true, ready: true, allHeld: false, billingReady: false });
    expect(f.steps[f.current].key).toBe('held');
  });
});
