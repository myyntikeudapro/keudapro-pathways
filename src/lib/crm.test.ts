import { describe, it, expect } from 'vitest';
import { paidPlatform, orderedFunnel, campaignUrl, taskOverdue, salesSummary, readAll } from './crm';
import type { Lead } from './crm';
describe('CRM rules', () => {
  it('does not charge organic Google leads to ads', () => { expect(paidPlatform('google','referral')).toBeNull(); expect(paidPlatform('google','cpc')).toBe('google'); expect(paidPlatform('facebook','paid_social')).toBe('meta'); });
  it('counts each session once and requires ordered service-specific stages', () => { const e = (event:string, t:number, path='/aly') => ({event,session_id:'a',created_at:`2026-10-21T00:00:0${t}Z`,path}); expect(orderedFunnel([e('complete',0),e('page_view',1),e('start',2,'/muutosturva'),e('start',3),e('start',4),e('complete',5)], ['page_view','start','complete'], ['/aly'])).toEqual([1,1,1]); });
  it('creates first-party encoded campaign links', () => { const u = new URL(campaignUrl('/muutosturva','facebook','paid_social','syksy & talvi')); expect(u.origin).toBe('https://keudapro.fi'); expect(u.searchParams.get('utm_campaign')).toBe('syksy & talvi'); expect(() => campaignUrl('//evil.fi','x','y','z')).toThrow(); });
  it('completed tasks are never overdue', () => { expect(taskOverdue({due_at:'2026-10-20T00:00:00Z',completed_at:null},Date.parse('2026-10-21'))).toBe(true); expect(taskOverdue({due_at:'2026-10-20T00:00:00Z',completed_at:'2026-10-20'},Date.parse('2026-10-21'))).toBe(false); });
  it('sales use closing date and distinguish missing value from zero', () => { const ls = [{status:'koulutukseen',sale_closed_at:'2026-10-21',deal_value:1200},{status:'koulutukseen',sale_closed_at:'2026-10-22',deal_value:null},{status:'koulutukseen',sale_closed_at:'2026-09-01',deal_value:800},{status:'uusi',deal_value:400}] as Lead[]; expect(salesSummary(ls,'2026-10-01')).toEqual({wins:2,revenue:1200,missingValues:1,openValue:400}); });
  it('fetches beyond a single database page', async () => { expect((await readAll(async (from) => ({data: from === 0 ? Array.from({length:500},(_,i)=>i) : [500],error:null}))).length).toBe(501); });
});
