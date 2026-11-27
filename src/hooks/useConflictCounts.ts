import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { fetchCardRaw, conflictCounts, type FactsLead } from '@/lib/salesCardData';

/** One batched read for all visible leads; counts come from the same rules as the open card. */
export function useConflictCounts(leads: FactsLead[], team: { id: string; email: string }[]) {
  const ids = leads.map(l => `${l.id}:${l.company_programme_id ?? ''}:${l.owner_id ?? ''}:${l.organization_id ?? ''}:${l.contact_id ?? ''}:${l.deal_value ?? ''}`).sort().join(',');
  return useQuery({
    queryKey: ['sales_conflicts', ids],
    enabled: leads.length > 0,
    queryFn: () => fetchCardRaw(supabase as any, leads),
    select: raw => conflictCounts(leads, raw, team),
  });
}
