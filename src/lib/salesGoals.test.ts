import { describe, expect, it } from 'vitest';
import { goalActuals, myLeads, targetPercent } from './salesGoals';
import type { Lead } from './crm';
describe('Service goals and ownership', () => {
  const leads = [
    { id:'1', service_key:'aly', created_at:'2026-09-01T00:00:00Z', status:'koulutukseen', sale_closed_at:'2026-09-30T21:00:00Z', deal_value:1700, owner_id:'a' },
    { id:'2', service_key:'aly', created_at:'2026-10-01T00:00:00Z', status:'koulutukseen', sale_closed_at:'2026-10-22T12:00:00Z', deal_value:null, owner_id:'b' },
    { id:'3', service_key:'kasvu', created_at:'2026-10-01T00:00:00Z', status:'koulutukseen', sale_closed_at:'2026-10-22T12:00:00Z', deal_value:9000, owner_id:'a' },
    { id:'4', service_key:'aly', created_at:'2026-10-31T22:00:00Z', status:'koulutukseen', sale_closed_at:'2026-10-31T22:00:00Z', deal_value:700, owner_id:null },
  ] as Lead[];
  it('shows actuals separately by service and Helsinki closing month', () => {
    expect(goalActuals(leads,'aly','2026-10')).toEqual({leads:1,wins:2,revenue:1700,missingValues:1});
    expect(goalActuals(leads,'kasvu','2026-10').revenue).toBe(9000);
  });
  it('does not invent attainment for an unset or zero target', () => { expect(targetPercent(2000,0)).toBeNull(); expect(targetPercent(2500,2000)).toBe(125); });
  it('own customers include only the signed in owner', () => { expect(myLeads(leads,'a').map(l=>l.id)).toEqual(['1','3']); expect(myLeads(leads,'c')).toEqual([]); });
});