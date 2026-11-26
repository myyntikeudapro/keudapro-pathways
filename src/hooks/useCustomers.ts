import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { readAll } from '@/lib/crm';
import { EMPTY_CUSTOMERS, type CustomerData } from '@/lib/customerRegister';

/** Read-only staff projection. Every collection is paginated; failures never become zeros. */
export function useCustomers(enabled: boolean) {
  return useQuery<CustomerData>({ queryKey: ['customer_register'], enabled, queryFn: async () => {
    const [organizations, leads] = await Promise.all([
      readAll((f, t) => supabase.from('crm_organizations').select('*').order('id').range(f, t)),
      readAll((f, t) => supabase.from('booking_requests').select('id,name,email,organization,organization_id,contact_id,mt_personal,status,service_key,owner_id,created_at').eq('mt_personal', false).order('id').range(f, t)),
    ]);
    if (!organizations.length) return { ...EMPTY_CUSTOMERS, organizations, leads };
    const [contacts, affiliations, offers, versions, orders, deliveries, programmes, handoffs, tasks, interactions] = await Promise.all([
      readAll((f, t) => supabase.from('crm_contacts').select('*').order('id').range(f, t)),
      readAll((f, t) => supabase.from('crm_contact_affiliations').select('*').order('id').range(f, t)),
      readAll((f, t) => supabase.from('crm_offers').select('*').order('id').range(f, t)),
      readAll((f, t) => supabase.from('crm_offer_versions').select('*').order('id').range(f, t)),
      readAll((f, t) => supabase.from('crm_orders').select('*').order('id').range(f, t)),
      readAll((f, t) => supabase.from('prod_deliveries').select('id,order_id,title,production_status,production_owner_id').order('id').range(f, t)),
      readAll((f, t) => supabase.from('prod_programme_versions').select('id,case_lead_id,state,revision,created_at').order('id').range(f, t)),
      readAll((f, t) => supabase.from('crm_production_handoffs').select('*').order('id').range(f, t)),
      readAll((f, t) => supabase.from('crm_tasks').select('*').order('id').range(f, t)),
      readAll((f, t) => supabase.from('crm_interactions').select('*').order('id').range(f, t)),
    ]);
    return { organizations, contacts, affiliations, leads, offers, versions, orders, deliveries, programmes, handoffs, tasks, interactions };
  } });
}