// Course catalog rules shared by the admin view and the public course page.
// Registration, payments and messaging are intentionally not part of this phase.

export const PRODUCT_STATUS: [string, string][] = [['luonnos', 'Luonnos'], ['tarkistettavana', 'Tarkistettavana'], ['julkaistu', 'Julkaistu'], ['arkistoitu', 'Arkistoitu']];
export const OFFERING_STATUS: [string, string][] = [['luonnos', 'Luonnos'], ['julkaistu', 'Julkaistu'], ['peruttu', 'Peruttu']];
export const SLUG_PATTERN = /^[a-z0-9-]{3,80}$/;

export type PriceVersion = { id: string; product_id: string; version_no: number; unit_price: number; locked_at: string | null };
export type PublicOffering = { id: string; starts_at: string; ends_at: string; location: string | null; reg_opens_at: string; reg_closes_at: string; capacity: number; free_seats?: number; waitlist_enabled?: boolean; registration_enabled?: boolean; free_cancel_days: number; late_cancel_pct: number; unit_price: number; vat_basis: string };
export type PublicCatalog = { slug: string; name: string; description: string; service_key: string; offerings: PublicOffering[] };

export const catalogPath = (slug: string) => `/kurssit/${slug}`;

/** Turns a course name into a URL id (ä→a, ö→o, å→a). */
export function slugify(name: string): string {
  return name.toLowerCase().replace(/[äå]/g, 'a').replace(/ö/g, 'o').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);
}

export const latestVersion = (versions: PriceVersion[], productId: string) =>
  versions.filter(v => v.product_id === productId).sort((a, b) => b.version_no - a.version_no)[0];

/**
 * Decides which price version a new offering uses. A locked (already published) version is never
 * edited: a different price always creates a new version number.
 */
export function priceVersionFor(versions: PriceVersion[], productId: string, price: number): { reuse: PriceVersion } | { create: number } {
  const latest = latestVersion(versions, productId);
  if (latest && Number(latest.unit_price) === price) return { reuse: latest };
  return { create: (latest?.version_no ?? 0) + 1 };
}

/** Cancellation fee share (%) for a cancellation made `daysBefore` days before start. */
export const cancellationShare = (daysBefore: number, freeDays: number, latePct: number) => (daysBefore >= freeDays ? 0 : latePct);

export const registrationOpen = (o: Pick<PublicOffering, 'reg_opens_at' | 'reg_closes_at'>, now = Date.now()) =>
  Date.parse(o.reg_opens_at) <= now && now < Date.parse(o.reg_closes_at);

// ---- Registration (online sign-up is opened per offering by staff) ----
export const PRIVACY_VERSION = 'ilmo-2026-11';
export const HOLD_DAYS = 7;

export type Party = { org_name?: string; business_id?: string; contact_name: string; email: string; phone?: string; einvoice_address?: string };
export type Participant = { name: string; email: string };
export type RegistrationResult = { registration_id: string; held: number; waitlisted: number; billing_details_pending?: boolean; payer_option?: string };

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
/** Client-side mirror of cat_register validation; the database remains the authority. */
export function registrationErrors(input: { seats: number; buyer: Party; billing: Party; participants: Participant[]; terms: boolean }): string[] {
  const e: string[] = [];
  if (!Number.isInteger(input.seats) || input.seats < 1 || input.seats > 50) e.push('Paikkamäärän on oltava 1–50');
  const party = (p: Party, org: boolean, label: string) => {
    if ((p.contact_name ?? '').trim().length < 2) e.push(`${label}: nimi puuttuu`);
    if (!EMAIL.test((p.email ?? '').trim())) e.push(`${label}: tarkista sähköposti`);
    if (org && (p.org_name ?? '').trim().length < 2) e.push(`${label}: organisaatio tai maksajan nimi puuttuu`);
  };
  party(input.buyer, false, 'Ilmoittaja'); party(input.billing, true, 'Laskutus');
  if (input.participants.length > input.seats) e.push('Osallistujia on enemmän kuin paikkoja');
  input.participants.forEach((p, i) => { if (p.name.trim().length < 2 || !EMAIL.test(p.email.trim())) e.push(`Osallistuja ${i + 1}: tarkista nimi ja sähköposti`); });
  if (!input.terms) e.push('Hyväksy ehdot ja tietosuojaseloste');
  return e;
}

/** Online sign-up is shown only when staff opened it and the registration window is running. */
export const canRegisterOnline = (o: { registration_enabled?: boolean; reg_opens_at: string; reg_closes_at: string; free_seats?: number; waitlist_enabled?: boolean }, now = Date.now()) =>
  !!o.registration_enabled && registrationOpen(o, now) && ((o.free_seats ?? 0) > 0 || !!o.waitlist_enabled);

export const GO_STATUS: Record<string, string> = { avoin: 'Toteutuminen avoinna', toteutuu: 'Toteutuu', peruttu: 'Ei toteudu' };
export const SEAT_STATE: Record<string, string> = { hold: 'Varattu, odottaa vahvistusta', confirmed: 'Vahvistettu', released: 'Vapautettu' };
export const REG_STATUS: Record<string, string> = { avoin: 'Odottaa vahvistusta', vahvistettu: 'Vahvistettu', peruttu: 'Peruttu' };
