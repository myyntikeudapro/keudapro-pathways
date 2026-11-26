import { z } from 'zod';

export const BILLING_MODES = { start: 'Koulutuksen alkaessa', installments: 'Osissa', end: 'Koulutuksen päättyessä' } as const;
export type BillingMode = keyof typeof BILLING_MODES;
export type BillingOrder = { id: string; total_net: number; starts_on: string | null; ends_on: string | null; owner_id?: string };
export type BillingPlan = { order_id: string; mode: BillingMode; version: number; total_net: number; starts_on: string; ends_on: string };
export type BillingInstallment = { id: string; order_id: string; seq: number; amount: number; due_on: string; payment_status: 'ei_laskutettu' | 'laskutettu' | 'maksettu' };
export const helsinkiDay = (now: Date) => new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Helsinki', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
export function cents(value: number): number | null {
  if (!Number.isFinite(value) || value <= 0 || !Number.isSafeInteger(Math.round(value * 100)) || Math.abs(value * 100 - Math.round(value * 100)) > 1e-6) return null;
  return Math.round(value * 100);
}
export function validDay(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(`${value}T12:00:00Z`)) && new Date(`${value}T12:00:00Z`).toISOString().slice(0, 10) === value;
}
export function installmentErrors(order: BillingOrder, mode: string, rows: { amount: number; due_on: string }[]) {
  const errors: string[] = [];
  if (!Object.prototype.hasOwnProperty.call(BILLING_MODES, mode)) errors.push('Valitse laskutustapa.');
  const total = cents(Number(order.total_net));
  if (total === null) errors.push('Tilauksen arvo ei ole kelvollinen senttitarkka summa.');
  if (!order.starts_on || !order.ends_on || !validDay(order.starts_on) || !validDay(order.ends_on) || order.ends_on < order.starts_on) errors.push('Tilauksen sopimuspäivät on vahvistettava.');
  if (mode === 'installments') {
    if (rows.length < 1 || rows.length > 100) errors.push('Kirjaa 1–100 laskutuserää.');
    if (rows.some(r => cents(r.amount) === null)) errors.push('Jokaisen erän summan on oltava positiivinen ja senttitarkka.');
    if (rows.some((r, i) => !validDay(r.due_on) || (i > 0 && r.due_on < rows[i - 1].due_on))) errors.push('Kirjaa kelvolliset laskutuspäivät aikajärjestyksessä.');
    if (rows.reduce((s, r) => s + (cents(r.amount) ?? 0), 0) !== total) errors.push('Erien summan on vastattava tilauksen alv 0 % arvoa.');
  } else if (rows.length) errors.push('Alkaessa tai päättyessä laskutuspäivä tulee sopimuksesta.');
  return errors;
}
/** Same calendar and cent rules as the server; this never authorizes a write or sends an invoice. */
export function contractBilling(order: BillingOrder, plan: BillingPlan | null | undefined, installments: BillingInstallment[], now = new Date(), cancelled = false) {
  const rows = installments.filter(i => i.order_id === order.id).sort((a, b) => a.seq - b.seq);
  if (!plan) return { state: 'unconfirmed' as const, label: 'Laskutustapa vahvistamatta', due: [], rows, difference: Number(order.total_net) };
  const stale = Number(plan.total_net) !== Number(order.total_net) || plan.starts_on !== order.starts_on || plan.ends_on !== order.ends_on;
  const errors = installmentErrors(order, plan.mode, plan.mode === 'installments' ? rows : []);
  const difference = Math.round((Number(order.total_net) - rows.reduce((s, i) => s + Number(i.amount), 0)) * 100) / 100;
  const expectedDate = plan.mode === 'start' ? order.starts_on : order.ends_on;
  const invalid = errors.length > 0 || difference !== 0 || (plan.mode !== 'installments' && (rows.length !== 1 || rows[0].due_on !== expectedDate));
  const due = stale || invalid || cancelled ? [] : rows.filter(i => i.due_on <= helsinkiDay(now) && i.payment_status === 'ei_laskutettu');
  return { state: cancelled ? 'cancelled' as const : stale || invalid ? 'review' as const : due.length ? 'due' as const : 'scheduled' as const,
    label: cancelled ? 'Peruttu – ei laskutusvalmis' : stale || invalid ? 'Sopimus tai suunnitelma muuttunut – vahvista uudelleen' : due.length ? `${due.length} sopimuksen erää laskutusvalmiina` : 'Ei avoimia erääntyneitä laskutuseriä', due, rows, difference };
}
const orderSchema = z.object({ id: z.string(), total_net: z.coerce.number(), starts_on: z.string().nullable(), ends_on: z.string().nullable(), owner_id: z.string().optional() });
const planSchema = z.object({ order_id: z.string(), mode: z.enum(['start', 'installments', 'end']), version: z.number(), total_net: z.coerce.number(), starts_on: z.string(), ends_on: z.string() });
const installmentSchema = z.object({ id: z.string(), order_id: z.string(), seq: z.number(), amount: z.coerce.number(), due_on: z.string(), payment_status: z.enum(['ei_laskutettu', 'laskutettu', 'maksettu']) });
export const billingSnapshotSchema = z.object({ order: orderSchema, plan: planSchema.nullable(), installments: z.array(installmentSchema), today: z.string(), cancelled: z.boolean(), stale: z.boolean() });
export type BillingSnapshot = { order: BillingOrder; plan: BillingPlan | null; installments: BillingInstallment[]; today: string; cancelled: boolean; stale: boolean };
export function parseBillingSnapshot(value: unknown): BillingSnapshot { return billingSnapshotSchema.parse(value) as BillingSnapshot; }
export function billingError(error: unknown): string {
  const message = error instanceof Error ? error.message : typeof error === 'object' && error && 'message' in error ? String(error.message) : '';
  if (message.includes('BILLING_CHANGED')) return 'Toinen käyttäjä muutti tietoja. Lataa tallennettu suunnitelma ja tarkista valinta.';
  if (message.includes('OP_KEY_REUSED')) return 'Tallennustunnus on jo käytetty eri valintaan.';
  if (message.includes('BILLING_ALREADY_MARKED')) return 'Laskutuseriin on jo tehty käsin merkintöjä. Suunnitelmaa ei korvattu.';
  if (message.includes('BILLING_NOT_DUE')) return 'Erä ei ole sopimuksen mukaan laskutusvalmis tai sopimus on muuttunut.';
  return 'Tallennus ei onnistunut. Tarkista summat, päivät ja käyttöoikeus.';
}
