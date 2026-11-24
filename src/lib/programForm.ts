// Client mirror of the server checks in cat_register_program. The server config (cat_program_form) is the source of truth.
import { callingCodes } from '@/lib/phoneCountries';
export type PayerOption = { key: string; label: string; enabled?: boolean };
export type ProgramFormConfig = {
  version: string; program: string; form_title: string; offering_id: string; starts_at: string; ends_at: string;
  orientation_required: boolean; orientations?: string[]; extra_info: boolean; payer_options: PayerOption[];
  privacy_url: string | null; cancellation_url: string | null; price_amount: number; vat_basis: string;
  terms_version?: string; terms_review_status?: string;
};
export type ProgramFormValues = {
  first_name: string; last_name: string; email: string; phone_country: string; phone_number: string;
  street_address: string; postal_code: string; city: string; orientation: string; extra_info: string; payer_option: string;
  accept_price: boolean; accept_privacy: boolean; accept_cancellation: boolean;
  billing_org: string; billing_business_id: string; billing_address: string; billing_postal_code: string; billing_city: string;
  billing_einvoice: string; billing_operator: string; billing_contact: string; billing_email: string; billing_reference: string;
};
export const emptyProgramForm = (): ProgramFormValues => ({ first_name: '', last_name: '', email: '', phone_country: '+358', phone_number: '', street_address: '', postal_code: '', city: '', orientation: '', extra_info: '', payer_option: '', accept_price: false, accept_privacy: false, accept_cancellation: false, billing_org: '', billing_business_id: '', billing_address: '', billing_postal_code: '', billing_city: '', billing_einvoice: '', billing_operator: '', billing_contact: '', billing_email: '', billing_reference: '' });
export function employerBillingMissing(v: Pick<ProgramFormValues, 'billing_org' | 'billing_business_id' | 'billing_address' | 'billing_postal_code' | 'billing_city' | 'billing_einvoice' | 'billing_operator' | 'billing_contact' | 'billing_email'>) {
  return [!v.billing_org.trim() && 'Yrityksen nimi', !/^\d{7}-\d$/.test(v.billing_business_id.trim()) && 'Y-tunnus',
    !v.billing_contact.trim() && 'Laskutusyhteyshenkilö', !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v.billing_email.trim()) && 'Laskutussähköposti',
    !((v.billing_address.trim() && v.billing_postal_code.trim() && v.billing_city.trim()) || (v.billing_einvoice.trim() && v.billing_operator.trim())) && 'Laskutusosoite tai verkkolaskuosoite ja välittäjä'].filter((x): x is string => typeof x === 'string');
}

export function programFormErrors(cfg: Pick<ProgramFormConfig, 'orientation_required' | 'orientations' | 'extra_info' | 'payer_options'>, v: ProgramFormValues): string[] {
  const e: string[] = [];
  const len = (s: string, a: number, b: number) => s.trim().length >= a && s.trim().length <= b;
  if (!len(v.first_name, 1, 60) || !len(v.last_name, 1, 60)) e.push('Tarkista etu- ja sukunimi');
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v.email.trim()) || v.email.length > 255) e.push('Tarkista sähköposti');
  if (!callingCodes.has(v.phone_country) || !/^[0-9]{4,15}$/.test(v.phone_number.replace(/[\s-]/g, ''))) e.push('Tarkista matkapuhelinnumero ja maakoodi');
  if (!len(v.street_address, 2, 120) || !/^[A-Za-z0-9 -]{3,10}$/.test(v.postal_code.trim()) || !len(v.city, 2, 60)) e.push('Tarkista osoitetiedot');
  if (cfg.orientation_required && !(cfg.orientations ?? []).includes(v.orientation)) e.push('Valitse toiminto tai toimiala');
  if (cfg.extra_info && v.extra_info.length > 1000) e.push('Lisätiedot ovat liian pitkät');
  if (!cfg.payer_options.some(p => p.key === v.payer_option && p.enabled !== false)) e.push('Valitse koulutuksen maksaminen');
  if (Object.entries(v).some(([k, value]) => k.startsWith('billing_') && String(value).length > 160)) e.push('Laskutustieto on liian pitkä');
  if (!v.accept_price || !v.accept_privacy || !v.accept_cancellation) e.push('Hyväksy koulutusmaksu, tietosuoja ja peruutusehdot');
  return e;
}

export function programFormPayload(cfg: Pick<ProgramFormConfig, 'orientation_required' | 'extra_info' | 'price_amount' | 'terms_version'>, v: ProgramFormValues) {
  const billing = Object.fromEntries(Object.entries(v).filter(([k]) => k.startsWith('billing_')).map(([k, value]) => [k, v.payer_option === 'employer' ? value : '']));
  return { ...v, ...billing, orientation: cfg.orientation_required ? v.orientation : undefined, extra_info: cfg.extra_info && v.extra_info.trim() ? v.extra_info : undefined, price_seen: cfg.price_amount, terms_version_seen: cfg.terms_version };
}
