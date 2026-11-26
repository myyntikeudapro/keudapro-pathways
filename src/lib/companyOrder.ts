import { supabase } from '@/integrations/supabase/client';

const db = supabase as any;
const must = <T,>(r: { data: T; error: any }) => { if (r.error) throw r.error; return r.data; };

export type CompanyOrderInput = {
  leadId: string; offerId: string; organization: string; contactName: string; contactEmail: string;
  content: string; amount: number; startsOn: string; endsOn?: string; vatBasis: 'koulutus_veroton' | 'yleinen';
  terms: string; paymentTerms: string; approvalMethod: 'sahkoposti' | 'allekirjoitus' | 'suullinen_muistio'; approvalNote: string; userId: string; serviceKey?: string | null;
};

export function orderInputErrors(i: Partial<CompanyOrderInput>): string[] {
  const e: string[] = [];
  if (!i.organization?.trim()) e.push('ostaja');
  if (!i.contactName?.trim()) e.push('tilaajan yhteyshenkilö');
  if (!i.content?.trim()) e.push('sovittu sisältö');
  if (!(typeof i.amount === 'number' && Number.isFinite(i.amount) && i.amount > 0)) e.push('summa');
  if (!i.startsOn) e.push('aloituspäivä');
  if (i.endsOn && i.startsOn && i.endsOn < i.startsOn) e.push('päättymispäivä ennen alkua');
  if (!i.terms?.trim() || !i.paymentTerms?.trim()) e.push('sopimus- ja maksuehdot');
  if (!i.approvalNote?.trim()) e.push('asiakkaan hyväksynnän kuvaus');
  return e;
}

/**
 * Ostaja ja yhteyshenkilö tulevat palvelimella yhteydenoton vahvistetusta asiakaslinkistä (crm_link_lead_customer);
 * selaimen yritysnimellä ei etsitä eikä perusteta organisaatiota. Sama idempotencyKey palauttaa saman tilauksen.
 */
export async function confirmCompanyOrder(i: CompanyOrderInput & { idempotencyKey: string }): Promise<string> {
  const errors = orderInputErrors(i); if (errors.length) throw new Error(`Puuttuu: ${errors.join(', ')}`);
  return must(await db.rpc('crm_confirm_company_order', {
    p_lead_id: i.leadId, p_offer_id: i.offerId, p_content: i.content.trim(), p_amount: i.amount, p_vat_basis: i.vatBasis,
    p_starts_on: i.startsOn, p_ends_on: i.endsOn || null, p_terms: i.terms.trim(), p_payment_terms: i.paymentTerms.trim(),
    p_approval_method: i.approvalMethod, p_approval_note: i.approvalNote.trim(), p_idempotency_key: i.idempotencyKey,
  })) as string;
}
