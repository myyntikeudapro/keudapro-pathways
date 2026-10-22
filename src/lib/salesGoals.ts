import type { Lead } from './crm';

export const SALES_SERVICES: Record<string, string> = { muutosturva: 'Muutosturva', aly: 'Äly', kasvu: 'Kasvu', hub: 'Hub', osaaminen: 'Osaaminen', noste: 'Noste', operaattori: 'Operaattori', kumppanit: 'Kumppanit', verkosto: 'Verkosto', muu: 'Muu' };
export const localMonth = (date = new Date()) => new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Helsinki', year: 'numeric', month: '2-digit' }).format(date);
export function goalActuals(leads: Lead[], service: string, month: string) {
  const selected = leads.filter(l => (l.service_key ?? 'muu') === service);
  const inMonth = (s: string) => localMonth(new Date(s)) === month;
  const wins = selected.filter(l => l.status === 'koulutukseen' && l.sale_closed_at && inMonth(l.sale_closed_at));
  return { leads: selected.filter(l => inMonth(l.created_at)).length, wins: wins.length, revenue: wins.reduce((sum,l) => sum + Number(l.deal_value ?? 0), 0), missingValues: wins.filter(l => l.deal_value === null).length };
}
export const targetPercent = (actual: number, target: number) => target > 0 ? Math.round(actual / target * 100) : null;
export function myLeads(leads: Lead[], userId: string) { return leads.filter(l => l.owner_id === userId); }