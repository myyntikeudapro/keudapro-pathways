import {describe,it,expect} from 'vitest';
import {staleLeads,previousWeek,inWindow,mappedReturn} from '../../supabase/functions/_shared/crmEmailRules';
import type {EmailLead} from '../../supabase/functions/_shared/crmEmailRules';
describe('email automation rules',()=>{
 const now=Date.parse('2026-10-22T06:00:00Z');
 it('alerts at 48 hours, never before or after customer contact',()=>{const leads=[{id:'a',status:'uusi',created_at:'2026-10-20T06:00:00Z'},{id:'b',status:'uusi',created_at:'2026-10-20T06:00:01Z'},{id:'c',status:'uusi',created_at:'2026-10-19T06:00:00Z'},{id:'d',status:'yhteydessä',created_at:'2026-10-19T06:00:00Z'}] as EmailLead[];expect(staleLeads(leads,new Set(['c']),now).map(l=>l.id)).toEqual(['a']);});
 it('reports the previous complete Monday to Sunday week',()=>{expect(previousWeek(new Date('2026-10-26T07:00:00Z'))).toEqual({since:'2026-10-19',until:'2026-10-25'});});
 it('uses Helsinki dates at UTC midnight boundaries',()=>{expect(inWindow('2026-10-25T22:30:00Z','2026-10-19','2026-10-25')).toBe(false);});
 it('credits only mapped paid sales with closing dates and flags unknown values',()=>{const leads=[{status:'koulutukseen',sale_closed_at:'2026-10-22',deal_value:800,utm_source:'google',utm_medium:'cpc',utm_campaign:'mapped'},{status:'koulutukseen',sale_closed_at:'2026-10-22',deal_value:900,utm_source:'google',utm_medium:'organic',utm_campaign:'mapped'},{status:'koulutukseen',sale_closed_at:'2026-10-22',deal_value:null,utm_source:'google',utm_medium:'cpc',utm_campaign:'mapped'}] as EmailLead[];expect(mappedReturn(leads,'2026-10-19','2026-10-25','google',['mapped'])).toEqual({revenue:800,missing:1});});
});