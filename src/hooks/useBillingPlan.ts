import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { parseBillingSnapshot } from '@/lib/contractBilling';
export function useBillingPlan(orderId: string) {
  return useQuery({ queryKey: ['billing_plan', orderId], queryFn: async () => {
    const { data, error } = await supabase.rpc('crm_read_billing_plan', { p_order_id: orderId });
    if (error) throw error;
    return parseBillingSnapshot(data);
  } });
}
