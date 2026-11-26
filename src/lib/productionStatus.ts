// Display-only status wording for the production workspace. Phase, start readiness and billing
// are kept as separate signals; none of these change database rules.
export type StatusTone = 'ok' | 'warn' | 'risk' | 'neutral';

export function readinessSummary(active: number, ready: number): { tone: StatusTone; value: string; meta: string } {
  if (active === 0) return { tone: 'neutral', value: '–', meta: 'Ei arvioitavaa: ei aktiivisia projekteja' };
  const missing = active - ready;
  return missing === 0
    ? { tone: 'ok', value: `${ready} / ${active} valmis`, meta: 'Kaikki aktiiviset aloitusvalmiita' }
    : { tone: 'warn', value: `${ready} / ${active} valmis`, meta: `${missing} ei aloitusvalmis` };
}

// payment_status is chosen by hand in the workspace; it is not read from Netvisor.
export const PAYMENT_LABEL: Record<string, string> = {
  ei_laskutettu: 'Ei laskutettu',
  laskutettu: 'Merkitty laskutetuksi (käsin)',
  maksettu: 'Merkitty maksetuksi (käsin)',
};

/** Production checkpoint and manual payment are independent from contract billing eligibility. */
export function productionCheckpoint(actualsChecked: boolean, actualsEligible: boolean, paymentStatus: string | undefined) {
  return { actualsComplete: actualsChecked && actualsEligible, manualPaymentStatus: ['laskutettu','maksettu'].includes(paymentStatus ?? '') ? paymentStatus : null };
}

export const PRODUCTION_SECTIONS = [
  ['projektit', 'Koulutusprojektit'], ['paiva', 'Päivän työ'], ['luovutukset', 'Luovutukset'], ['resurssit', 'Resurssit ja kalenteri'], ['laskutus', 'Laskutusvalmiit'],
] as const;
export type ProductionSection = typeof PRODUCTION_SECTIONS[number][0];
export function productionSection(raw: string | null): ProductionSection {
  return PRODUCTION_SECTIONS.find(([k]) => k === raw)?.[0] ?? 'projektit';
}
