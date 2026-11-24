// Course catalog rules shared by the admin view and the public course page.
// Registration, payments and messaging are intentionally not part of this phase.

export const PRODUCT_STATUS: [string, string][] = [['luonnos', 'Luonnos'], ['tarkistettavana', 'Tarkistettavana'], ['julkaistu', 'Julkaistu'], ['arkistoitu', 'Arkistoitu']];
export const OFFERING_STATUS: [string, string][] = [['luonnos', 'Luonnos'], ['julkaistu', 'Julkaistu'], ['peruttu', 'Peruttu']];
export const SLUG_PATTERN = /^[a-z0-9-]{3,80}$/;

export type PriceVersion = { id: string; product_id: string; version_no: number; unit_price: number; locked_at: string | null };
export type PublicOffering = { id: string; starts_at: string; ends_at: string; location: string | null; reg_opens_at: string; reg_closes_at: string; capacity: number; free_cancel_days: number; late_cancel_pct: number; unit_price: number; vat_basis: string };
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
