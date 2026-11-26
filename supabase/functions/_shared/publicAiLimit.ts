import { createClient } from 'npm:@supabase/supabase-js@2';
import type { PublicAiScope } from './publicAiBoundary.ts';
export async function consumePublicAi(scope: PublicAiScope, visitor: string): Promise<boolean> {
  const url = Deno.env.get('SUPABASE_URL'); const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !key) return false;
  try {
    const client = createClient(url,key,{ auth: { persistSession: false } });
    const { data, error } = await client.rpc('public_ai_consume',{ p_scope: scope, p_visitor: visitor });
    return !error && data === true;
  } catch { return false; }
}
