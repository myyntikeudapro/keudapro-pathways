import { supabase } from '@/integrations/supabase/client';

const db = supabase as any;

/** Mirror of crm_normalize_business_id: returns 1234567-8 or null. A valid checksum does not prove the company exists. */
export function normalizeBusinessId(value: string | null | undefined): string | null {
  let s = (value ?? '').replace(/\s/g, '');
  if (/^\d{8}$/.test(s)) s = `${s.slice(0, 7)}-${s[7]}`;
  if (!/^\d{7}-\d$/.test(s)) return null;
  const w = [7, 9, 10, 5, 8, 4, 2];
  const r = w.reduce((t, k, i) => t + k * Number(s[i]), 0) % 11;
  if (r === 1) return null;
  return (r === 0 ? 0 : 11 - r) === Number(s[8]) ? s : null;
}

export type OrganizationCandidate = { id: string; name: string; business_id: string | null; match: 'business_id' | 'name' };
export type LinkChoice = {
  leadId: string; expectedOrganizationId: string | null; expectedContactId: string | null;
  organization: { id: string } | { name: string; businessId: string };
  contact: { id: string } | { name: string; email: string; phone?: string } | null;
  opKey: string;
};
export type LinkResult = { lead_id: string; organization_id: string; contact_id: string | null; organization_created: boolean; contact_created: boolean; contact_pending: boolean; replayed?: boolean };

export async function findOrganizations(query: string): Promise<OrganizationCandidate[]> {
  const { data, error } = await db.rpc('crm_find_organization_candidates', { p_query: query });
  if (error) throw error;
  return data ?? [];
}

export function linkArgs(c: LinkChoice) {
  const org = c.organization; const con = c.contact;
  return {
    p_lead_id: c.leadId, p_expected_organization_id: c.expectedOrganizationId, p_expected_contact_id: c.expectedContactId,
    p_organization_id: 'id' in org ? org.id : null,
    p_new_organization_name: 'id' in org ? null : org.name.trim(),
    p_new_business_id: 'id' in org ? null : org.businessId.trim(),
    p_contact_id: con && 'id' in con ? con.id : null,
    p_new_contact_name: con && !('id' in con) ? con.name.trim() : null,
    p_new_contact_email: con && !('id' in con) ? con.email.trim() : null,
    p_new_contact_phone: con && !('id' in con) ? con.phone?.trim() || null : null,
    p_op_key: c.opKey,
  };
}

export async function linkLeadCustomer(c: LinkChoice): Promise<LinkResult> {
  const { data, error } = await db.rpc('crm_link_lead_customer', linkArgs(c));
  if (error) throw error;
  return data as LinkResult;
}

const MESSAGES: Record<string, string> = {
  LINK_CHANGED: 'Toinen käyttäjä muutti juuri tämän yhteydenoton asiakaslinkkiä. Tiedot luettiin uudelleen – tarkista valinta.',
  ORGANIZATION_EXISTS: 'Tällä Y-tunnuksella on jo organisaatio. Valitse se hakutuloksista.',
  CONTACT_EXISTS: 'Organisaatiolla on jo yhteyshenkilö tällä sähköpostilla. Valitse olemassa oleva henkilö.',
  CONTACT_ORGANIZATION_MISMATCH: 'Yhteyshenkilö ei kuulu valittuun organisaatioon.',
  CONFIRMED_BUYER_CONFLICT: 'Yhteydenotolla on jo vahvistettu tilaus toiselle ostajalle. Vahvistettua ostajaa ei muuteta tästä.',
  INVALID_BUSINESS_ID: 'Y-tunnus ei ole kelvollinen (muoto 1234567-8 ja tarkistusnumero).',
  OP_KEY_REUSED: 'Valinta muuttui kesken tallennuksen. Aloita vahvistus uudelleen.',
  PERSONAL_CASE: 'Henkilökohtaista muutosturvatapausta ei liitetä yritysrekisteriin.',
  CONTACT_EMAIL_REQUIRED: 'Uudelle yhteyshenkilölle tarvitaan kelvollinen sähköposti. Voit jättää henkilön myös keskeneräiseksi.',
  CONTACT_NAME_REQUIRED: 'Uuden yhteyshenkilön nimi puuttuu.',
  ORGANIZATION_NAME_REQUIRED: 'Uuden organisaation nimi puuttuu.',
  BUYER_NOT_LINKED: 'Liitä yhteydenotto ensin organisaatioon (Valitse asiakas).',
  CONTACT_NOT_LINKED: 'Valitse tilaajan yhteyshenkilö asiakasvalinnassa ennen tilauksen vahvistusta.',
  OFFER_NOT_ACCEPTED: 'Tarjous ei ole tämän yhteydenoton hyväksytty tarjous.',
  '42501': 'Sinulla ei ole oikeutta tähän toimintoon.',
};
export function linkErrorText(e: unknown): string {
  const err = e as { message?: string; code?: string };
  const key = Object.keys(MESSAGES).find(k => err?.message?.includes(k) || err?.code === k);
  return key ? MESSAGES[key] : err?.message || 'Tallennus epäonnistui. Mitään ei muutettu.';
}
