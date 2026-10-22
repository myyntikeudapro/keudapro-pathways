import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { readAll } from '@/lib/crm';
import type { OperationsData } from '@/lib/operationsCenter';

export function useOperationsData(enabled: boolean, userId: string) {
  const leads = useQuery({ queryKey: ['mkt_leads', userId], enabled, queryFn: () => readAll((from, to) => supabase.from('booking_requests').select('*').order('created_at').order('id').range(from, to)) });
  const tasks = useQuery({ queryKey: ['crm_tasks', userId], enabled, queryFn: () => readAll((from, to) => supabase.from('crm_tasks').select('*').order('due_at').order('id').range(from, to)) });
  const offers = useQuery({ queryKey: ['crm_offers', userId], enabled, queryFn: () => readAll((from, to) => supabase.from('crm_offers').select('*').order('created_at').order('id').range(from, to)) });
  const interactions = useQuery({ queryKey: ['operations_interactions', userId], enabled, queryFn: () => readAll((from, to) => supabase.from('crm_interactions').select('lead_id,kind').order('id').range(from, to)) });
  const queries = [leads, tasks, offers, interactions];
  const data: OperationsData = { leads: leads.data ?? [], tasks: tasks.data ?? [], offers: offers.data ?? [], interactions: interactions.data ?? [] };
  return { data, pending: queries.some(q => q.isPending), error: queries.some(q => q.isError), fetching: queries.some(q => q.isFetching), refresh: () => queries.forEach(q => void q.refetch()) };
}