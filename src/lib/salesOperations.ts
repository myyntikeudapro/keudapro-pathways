import type { Lead, Task } from './crm';
import { paidPlatform } from './crm';
import type { Tables } from '@/integrations/supabase/types';
export type Offer = Tables<'crm_offers'>;
export function duplicateLeads(leads: Lead[], lead: Lead) {
  const email = lead.email.trim().toLowerCase();
  return leads.filter(l => l.id !== lead.id && l.email.trim().toLowerCase() === email);
}
export function dailyWork(leads: Lead[], tasks: Task[], now = Date.now()) {
  const open = leads.filter(l => !['koulutukseen','ei jatkoon'].includes(l.status));
  return { fresh: open.filter(l => l.status === 'uusi'), unassigned: open.filter(l => !l.owner_id), noNext: open.filter(l => !tasks.some(t => t.lead_id === l.id && !t.completed_at)), overdue: tasks.filter(t => !t.completed_at && Date.parse(t.due_at) < now && open.some(l => l.id === t.lead_id)) };
}
export function offerForecast(offers: Offer[]) {
  const open = offers.filter(o => ['draft','sent'].includes(o.status));
  return { count: open.length, total: open.reduce((s,o)=>s+Number(o.amount),0), weighted: open.reduce((s,o)=>s+Number(o.amount)*o.probability/100,0) };
}
export function campaignReturn(leads: Lead[], since: string, source: 'meta'|'google', keys: string[]) {
  const wins = leads.filter(l=>l.status==='koulutukseen' && l.sale_closed_at && l.sale_closed_at>=since && paidPlatform(l.utm_source,l.utm_medium)===source && l.utm_campaign && keys.includes(l.utm_campaign));
  return { count: wins.length, revenue: wins.reduce((s,l)=>s+Number(l.deal_value??0),0), missing: wins.filter(l=>l.deal_value===null).length };
}