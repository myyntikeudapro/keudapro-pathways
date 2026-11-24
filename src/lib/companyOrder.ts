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

/** Hyväksytystä tarjouksesta tarjousversio + ihmisen kirjaama hyväksyntä + idempotentti tilaus (crm_confirm_order). */
export async function confirmCompanyOrder(i: CompanyOrderInput): Promise<string> {
  const errors = orderInputErrors(i); if (errors.length) throw new Error(`Puuttuu: ${errors.join(', ')}`);
  const name = i.organization.trim();
  const orgs = must(await db.from('crm_organizations').select('id').eq('name', name).limit(1)) as any[];
  const org = orgs[0]?.id ?? (must(await db.from('crm_organizations').insert({ name }).select('id').single()) as any).id;
  const contacts = must(await db.from('crm_contacts').select('id').eq('organization_id', org).eq('name', i.contactName.trim()).limit(1)) as any[];
  const contact = contacts[0]?.id ?? (must(await db.from('crm_contacts').insert({ organization_id: org, name: i.contactName.trim(), email: i.contactEmail.trim() || null }).select('id').single()) as any).id;
  const prev = must(await db.from('crm_offer_versions').select('version_no').eq('offer_id', i.offerId).order('version_no', { ascending: false }).limit(1)) as any[];
  const version = must(await db.from('crm_offer_versions').insert({
    offer_id: i.offerId, version_no: (prev[0]?.version_no ?? 0) + 1, organization_id: org, contact_id: contact, service_key: i.serviceKey || 'aly',
    content: i.content.trim(), vat_rate: i.vatBasis === 'koulutus_veroton' ? 0 : 25.5, vat_basis: i.vatBasis,
    starts_on: i.startsOn, ends_on: i.endsOn || i.startsOn, terms: i.terms.trim(), payment_terms: i.paymentTerms.trim(),
  }).select('id').single()) as any;
  must(await db.from('crm_offer_version_lines').insert({ version_id: version.id, line_no: 1, description: i.content.trim().slice(0, 200), quantity: 1, unit_price: i.amount }));
  must(await db.from('crm_offer_versions').update({ approved_at: new Date().toISOString(), approved_by: i.userId, approval_method: i.approvalMethod, approval_note: i.approvalNote.trim() }).eq('id', version.id));
  return must(await db.rpc('crm_confirm_order', { p_version_id: version.id, p_idempotency_key: `company-order-${version.id}` })) as string;
}
