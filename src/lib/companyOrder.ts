import { vatErrors, type VatBasis, type ContractLine } from './orderReview';
import { supabase } from '@/integrations/supabase/client';

const db = supabase as any;
const must = <T,>(r: { data: T; error: any }) => { if (r.error) throw r.error; return r.data; };

export type CompanyOrderInput = {
  leadId: string; offerId: string; organization: string; contactName: string; contactEmail: string;
  content: string; amount: number; startsOn: string; endsOn?: string; vatBasis: VatBasis | ''; vatRate?: number | null; vatReason?: string; sourceVersionId?: string; lines?: ContractLine[]; expectedOrganizationId?: string; expectedContactId?: string; billingMode?: string | null; billingInstallments?: { amount: number; due_on: string }[]; changeAccepted?: boolean; changeMethod?: string; changeReference?: string;
  terms: string; paymentTerms: string; approvalMethod: 'sahkoposti' | 'allekirjoitus' | 'suullinen_muistio'; approvalNote: string; userId: string; serviceKey?: string | null;
};

export function orderInputErrors(i: Partial<CompanyOrderInput>): string[] {
  const e: string[] = [...vatErrors(i.vatBasis, i.vatRate, i.vatReason)];
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
    p_source_version_id: i.sourceVersionId, p_vat_rate: i.vatRate, p_vat_reason: i.vatReason || null, p_lines: i.lines, p_billing_mode: i.billingMode || null, p_billing_installments: i.billingInstallments ?? [], p_change_accepted: i.changeAccepted ?? false, p_change_method: i.changeMethod || null, p_change_reference: i.changeReference || null, p_expected_organization_id: i.expectedOrganizationId, p_expected_contact_id: i.expectedContactId,
    p_approval_method: i.approvalMethod, p_approval_note: i.approvalNote.trim(), p_idempotency_key: i.idempotencyKey,
  })) as string;
}
