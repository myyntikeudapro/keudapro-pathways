// Pure helpers for "Tuo tarjous tai keskustelu". The AI proposal is advisory:
// nothing here can mark a sale won, approve an offer version or confirm an order.

export const IMPORT_FIELDS = [
  "organization_name", "business_id", "contact_name", "contact_role", "contact_email", "contact_phone",
  "service", "implementations", "duration", "delivery", "unit_price", "vat_rate", "billing_mode",
  "preferred_timing", "approved", "approval_evidence",
] as const;
export type ImportFieldKey = (typeof IMPORT_FIELDS)[number];
export type Confidence = "varma" | "epavarma";
export interface ImportField { value: string | null; confidence: Confidence; quote: string | null; }
export type ImportFields = Record<ImportFieldKey, ImportField>;
export type BillingMode = "start" | "installments" | "end";

export const FIELD_LABELS: Record<ImportFieldKey, string> = {
  organization_name: "Yritys", business_id: "Y-tunnus", contact_name: "Yhteyshenkilö", contact_role: "Rooli",
  contact_email: "Sähköposti", contact_phone: "Puhelin", service: "Palvelu", implementations: "Toteutusten määrä",
  duration: "Kesto", delivery: "Toteutustapa", unit_price: "Hinta / toteutus (€, alv 0 %)", vat_rate: "Alv %",
  billing_mode: "Laskutustapa", preferred_timing: "Toivottu ajankohta", approved: "Hyväksynyt tarjouksen (ehdotus)",
  approval_evidence: "Hyväksynnän todiste",
};
export const BILLING_LABELS: Record<BillingMode, string> = { start: "Koulutuksen alkaessa", installments: "Osissa", end: "Koulutuksen päätyttyä" };

const squash = (s: string) => s.toLowerCase().replace(/\s+/g, " ").trim();

/** Finnish business ID with checksum, same rule as crm_normalize_business_id. */
export function normalizeBusinessId(input: string | null | undefined): string | null {
  let s = (input ?? "").replace(/\s/g, "");
  if (/^\d{8}$/.test(s)) s = `${s.slice(0, 7)}-${s.slice(7)}`;
  if (!/^\d{7}-\d$/.test(s)) return null;
  const w = [7, 9, 10, 5, 8, 4, 2];
  const r = w.reduce((t, k, i) => t + k * Number(s[i]), 0) % 11;
  if (r === 1) return null;
  const c = r === 0 ? 0 : 11 - r;
  return Number(s[8]) === c ? s : null;
}

/** "900 €", "1 200,50" → 900 / 1200.5; anything ambiguous → null. */
export function parseAmount(input: string | null | undefined): number | null {
  if (input == null) return null;
  const s = String(input).replace(/[€%]|eur(oa)?/gi, "").replace(/[\s\u00a0]/g, "").replace(",", ".");
  if (!/^\d+(\.\d{1,2})?$/.test(s)) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

export function parseVat(input: string | null | undefined): number | null {
  if (input == null) return null;
  const s = String(input).replace(/%|alv/gi, "").replace(/[\s\u00a0]/g, "").replace(",", ".");
  if (!/^\d{1,3}(\.\d{1,2})?$/.test(s)) return null;
  const n = Number(s);
  return n >= 0 && n <= 100 ? n : null;
}

export function parseCount(input: string | null | undefined): number | null {
  const m = /^\s*(\d{1,4})\s*$/.exec(String(input ?? ""));
  if (!m) return null;
  const n = Number(m[1]);
  return n >= 1 ? n : null;
}

export function parseBillingMode(input: string | null | undefined): BillingMode | null {
  const s = squash(String(input ?? ""));
  if (!s) return null;
  if (["start", "installments", "end"].includes(s)) return s as BillingMode;
  if (/osissa|erissä|erinä|osamaks/.test(s)) return "installments";
  if (/jälkeen|päätty|lopussa|jälkikäteen/.test(s)) return "end";
  if (/alkaessa|ennakko|etukäteen|alussa/.test(s)) return "start";
  return null;
}

export function parseApproval(input: string | null | undefined): boolean | null {
  const s = squash(String(input ?? ""));
  if (["kyllä", "kylla", "true", "yes"].includes(s)) return true;
  if (["ei", "false", "no"].includes(s)) return false;
  return null;
}

/** True when the quote occurs in the source text (whitespace/case-insensitive). */
export function quoteInSource(quote: string | null, source: string): boolean {
  if (!quote) return false;
  return squash(source).includes(squash(quote));
}

const empty = (): ImportField => ({ value: null, confidence: "epavarma", quote: null });

/**
 * Normalises a raw model proposal: missing/invalid fields become null, values
 * whose quote is not found in the source text are marked uncertain, and
 * structured values are canonicalised.
 */
export function normalizeExtraction(raw: unknown, source: string): ImportFields {
  const obj = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const out = {} as ImportFields;
  for (const key of IMPORT_FIELDS) {
    const r = obj[key] as Partial<ImportField> | undefined;
    if (!r || typeof r !== "object") { out[key] = empty(); continue; }
    let value = typeof r.value === "string" && r.value.trim() ? r.value.trim().slice(0, 500) : null;
    const quote = typeof r.quote === "string" && r.quote.trim() ? r.quote.trim().slice(0, 300) : null;
    let confidence: Confidence = r.confidence === "varma" ? "varma" : "epavarma";
    if (value !== null) {
      const canon =
        key === "business_id" ? normalizeBusinessId(value)
        : key === "unit_price" ? (parseAmount(value)?.toString() ?? null)
        : key === "vat_rate" ? (parseVat(value)?.toString() ?? null)
        : key === "implementations" ? (parseCount(value)?.toString() ?? null)
        : key === "billing_mode" ? parseBillingMode(value)
        : key === "approved" ? (() => { const a = parseApproval(value); return a === null ? null : a ? "kyllä" : "ei"; })()
        : key === "contact_email" ? (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value) ? value.toLowerCase() : null)
        : value;
      if (canon === null) { value = null; confidence = "epavarma"; }
      else value = canon;
    }
    if (value !== null && !quoteInSource(quote, source)) confidence = "epavarma";
    if (value === null) confidence = "epavarma";
    out[key] = { value, confidence, quote: value === null ? quote : quote };
  }
  return out;
}

export interface ImportForm {
  leadId: string | null;
  values: Record<ImportFieldKey, string>;
  expectedClose: string;
  serviceKey: string | null;
  sourceText: string;
}

export type ImportCheck = { ok: boolean; errors: string[] };

export function validateForm(f: ImportForm): ImportCheck {
  const e: string[] = [];
  const v = f.values;
  if (!v.organization_name.trim()) e.push("Yrityksen nimi puuttuu");
  if (!normalizeBusinessId(v.business_id)) e.push("Y-tunnus puuttuu tai on virheellinen – asiakas tunnistetaan Y-tunnuksella");
  if (!v.service.trim()) e.push("Palvelu puuttuu");
  if (!parseCount(v.implementations)) e.push("Toteutusten määrä puuttuu");
  if (parseAmount(v.unit_price) === null) e.push("Hinta puuttuu tai on virheellinen");
  if (v.vat_rate.trim() && parseVat(v.vat_rate) === null) e.push("Alv % on virheellinen");
  if (v.billing_mode.trim() && !parseBillingMode(v.billing_mode)) e.push("Laskutustapa on virheellinen");
  if (v.billing_mode === "installments") e.push("Osissa laskutettavat erät kirjataan tilauksen vahvistuksen jälkeen – valitse tässä alkaessa tai päätyttyä, tai jätä tyhjäksi");
  if (v.contact_email.trim() && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v.contact_email.trim())) e.push("Sähköposti on virheellinen");
  if (v.contact_email.trim() && !v.contact_name.trim()) e.push("Yhteyshenkilön nimi puuttuu");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(f.expectedClose)) e.push("Arvioitu päätöspäivä puuttuu");
  if (!f.sourceText.trim()) e.push("Alkuperäinen teksti puuttuu");
  return { ok: e.length === 0, errors: e };
}

/** The only database call an import makes. Order confirmation is a separate human action. */
export const IMPORT_RPC = "crm_import_offer" as const;
export const IMPORT_FORBIDDEN_RPCS = ["crm_confirm_company_order", "crm_confirm_order", "crm_save_billing_plan"] as const;

export function buildImportCommand(f: ImportForm, opKey: string) {
  const v = f.values;
  const p = {
    lead_id: f.leadId,
    organization_name: v.organization_name.trim(),
    business_id: normalizeBusinessId(v.business_id),
    contact_name: v.contact_name.trim() || null,
    contact_role: v.contact_role.trim() || null,
    contact_email: v.contact_email.trim().toLowerCase() || null,
    contact_phone: v.contact_phone.trim() || null,
    service_title: v.service.trim(),
    service_key: f.serviceKey,
    implementations: parseCount(v.implementations),
    duration: v.duration.trim() || null,
    delivery: v.delivery.trim() || null,
    unit_price: parseAmount(v.unit_price),
    vat_rate: parseVat(v.vat_rate),
    billing_mode: parseBillingMode(v.billing_mode),
    billing_installments: [] as { amount: number; due_on: string }[],
    preferred_timing: v.preferred_timing.trim() || null,
    expected_close: f.expectedClose,
    // Advisory only: stored as a history note, never as an approval.
    approval_suggested: parseApproval(v.approved) === true,
    approval_evidence: v.approval_evidence.trim() || null,
    source_text: f.sourceText,
  };
  return { rpc: IMPORT_RPC, args: { p, p_op_key: opKey } };
}

export function fieldsToValues(fields: ImportFields): Record<ImportFieldKey, string> {
  return Object.fromEntries(IMPORT_FIELDS.map((k) => [k, fields[k].value ?? ""])) as Record<ImportFieldKey, string>;
}

export const IMPORT_ERRORS: Record<string, string> = {
  INVALID_BUSINESS_ID: "Y-tunnus on virheellinen.",
  LEAD_LINKED_ELSEWHERE: "Valittu yhteydenotto on jo liitetty toiseen organisaatioon.",
  PERSONAL_CASE: "Henkilökohtaisia muutosturvatapauksia ei voi tuoda tällä toiminnolla.",
  CONTACT_EXISTS: "Yhteyshenkilö on jo olemassa.",
  ORGANIZATION_EXISTS: "Organisaatio luotiin juuri toisaalla – yritä uudelleen.",
  OP_KEY_REUSED: "Tuonti on jo tehty eri tiedoilla. Avaa ikkuna uudelleen.",
  BILLING_TOTAL_MISMATCH: "Laskutuserien summa ei vastaa kokonaishintaa.",
  CONFIRMED_BUYER_CONFLICT: "Yhteydenotolla on jo vahvistettu tilaus toiselle ostajalle.",
};
export function importErrorMessage(message: string | undefined): string {
  const key = Object.keys(IMPORT_ERRORS).find((k) => message?.includes(k));
  return key ? IMPORT_ERRORS[key] : "Kirjaus epäonnistui. Tietoja ei tallennettu.";
}
