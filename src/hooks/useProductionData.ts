import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { readAll } from '@/lib/crm';
import type { ProductionData } from '@/lib/productionCenter';

const tables = ['prod_deliveries', 'prod_sessions', 'prod_trainer_bookings', 'prod_tasks', 'prod_blockers', 'prod_quality_issues', 'prod_actuals', 'prod_billing_readiness'] as const;
const keys: (keyof ProductionData)[] = ['deliveries', 'sessions', 'bookings', 'tasks', 'blockers', 'quality', 'actuals', 'billing'];

export function useProductionData(enabled: boolean) {
  const query = useQuery({
    queryKey: ['production_data'], enabled,
    queryFn: async () => {
      const results = await Promise.all(tables.map(t => readAll((from, to) => (supabase.from(t) as any).select('*').order('id').range(from, to))));
      return Object.fromEntries(keys.map((k, i) => [k, results[i]])) as unknown as ProductionData;
    },
  });
  return query;
}
