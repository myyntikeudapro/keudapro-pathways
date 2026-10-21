import type { Tables } from '@/integrations/supabase/types';
export type Lead = Tables<'booking_requests'>;
export type Task = Tables<'crm_tasks'>;
export type Campaign = Tables<'marketing_campaigns'>;
export type TeamMember = { id: string; email: string };
export const CRM_SERVICES: Record<string, string> = { all: 'Koko sivusto', muutosturva: 'Muutosturva', aly: 'Äly', kasvu: 'Kasvu', hub: 'Hub', osaaminen: 'Osaaminen', muu: 'Muu' };
export const CRM_STATUSES = ['uusi', 'yhteydessä', 'kartoitus tehty', 'koulutukseen', 'ei jatkoon'];
export const money = (n: number) => new Intl.NumberFormat('fi-FI', { style: 'currency', currency: 'EUR' }).format(n);
export const dateTime = (s: string) => new Intl.DateTimeFormat('fi-FI', { timeZone: 'Europe/Helsinki', dateStyle: 'short', timeStyle: 'short' }).format(new Date(s));
export const normalizeCampaign = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
export function paidPlatform(source: string | null, medium: string | null): 'meta' | 'google' | null {
  if (!['cpc', 'ppc', 'paid', 'paid_social', 'paid-social', 'paid_search', 'display', 'cpm'].includes((medium ?? '').toLowerCase())) return null;
  if (['meta', 'facebook', 'instagram', 'fb', 'ig'].includes((source ?? '').toLowerCase())) return 'meta';
  return source?.toLowerCase() === 'google' ? 'google' : null;
}
export function campaignUrl(path: string, source: string, medium: string, campaign: string) {
  if (!path.startsWith('/') || path.startsWith('//')) throw new Error('Valitse KeudaPROn sivu.');
  const url = new URL(path, 'https://keudapro.fi');
  url.searchParams.set('utm_source', source.trim().toLowerCase());
  url.searchParams.set('utm_medium', medium.trim().toLowerCase());
  url.searchParams.set('utm_campaign', campaign.trim());
  return url.toString();
}
export function taskOverdue(task: Pick<Task, 'due_at' | 'completed_at'>, now = Date.now()) { return !task.completed_at && new Date(task.due_at).getTime() < now; }
export function salesSummary(leads: Lead[], since: string) {
  const wins = leads.filter(l => l.status === 'koulutukseen' && l.sale_closed_at && l.sale_closed_at >= since);
  const valued = wins.filter(l => l.deal_value !== null);
  return { wins: wins.length, revenue: valued.reduce((s, l) => s + Number(l.deal_value), 0), missingValues: wins.length - valued.length, openValue: leads.filter(l => !['koulutukseen', 'ei jatkoon'].includes(l.status)).reduce((s,l) => s + Number(l.deal_value ?? 0),0) };
}
export type FunnelEvent = { session_id: string; event: string; path: string | null; created_at: string };
export function orderedFunnel(events: FunnelEvent[], steps: string[], paths: string[] | null) {
  const progress = new Map<string, number>();
  const counts = steps.map(() => 0);
  for (const e of [...events].sort((a,b) => a.created_at.localeCompare(b.created_at))) {
    if (paths && (!e.path || !paths.includes(e.path))) continue;
    const stage = progress.get(e.session_id) ?? 0;
    if (stage < steps.length && steps[stage].split('|').includes(e.event)) { counts[stage]++; progress.set(e.session_id, stage + 1); }
  }
  return counts;
}
export async function readAll<T>(page: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: unknown }>): Promise<T[]> {
  const rows: T[] = [];
  for (let from = 0; ; from += 500) {
    const { data, error } = await page(from, from + 499);
    if (error) throw error;
    rows.push(...(data ?? []));
    if (!data || data.length < 500) return rows;
  }
}
