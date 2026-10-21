import { describe,it,expect } from 'vitest';
import { dailyWork,duplicateLeads,offerForecast,campaignReturn } from './salesOperations';
import type { Lead } from './crm';
import type { Offer } from './salesOperations';
describe('sales operations',()=>{
 it('matches duplicate email without merging customers',()=>{const l=[{id:'1',email:'A@example.fi'},{id:'2',email:' a@example.fi '},{id:'3',email:'b@example.fi'}] as Lead[];expect(duplicateLeads(l,l[0]).map(x=>x.id)).toEqual(['2']);});
 it('excludes closed customers from missing next action',()=>{const l=[{id:'1',status:'uusi',owner_id:null},{id:'2',status:'koulutukseen'}] as Lead[];expect(dailyWork(l,[]).noNext.map(x=>x.id)).toEqual(['1']);});
 it('weights only open offers by probability',()=>{expect(offerForecast([{status:'sent',amount:2000,probability:25},{status:'accepted',amount:900,probability:100}] as Offer[])).toEqual({count:1,total:2000,weighted:500});});
 it('credits only paid mapped closed sales and flags missing values',()=>{const l=[{status:'koulutukseen',sale_closed_at:'2026-10-22',utm_source:'google',utm_medium:'cpc',utm_campaign:'x',deal_value:800},{status:'koulutukseen',sale_closed_at:'2026-10-22',utm_source:'google',utm_medium:'social',utm_campaign:'x',deal_value:500}] as Lead[];expect(campaignReturn(l,'2026-10-01','google',['x'])).toEqual({count:1,revenue:800,missing:0});});
});