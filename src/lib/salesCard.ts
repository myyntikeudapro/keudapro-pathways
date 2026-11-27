// Pure rules for the sales customer card: source-material split and display-only conflict checks.
// Nothing here writes data or changes approval state; the card only shows the results.

export type SourceInteraction = { summary: string; occurred_at: string; kind: string };
export type ImportedSource = { pdfName: string | null; pdf: string; email: string; other: string; importedAt: string | null };

const PART = /^Tuotu alkuperäinen teksti \((\d+)\/(\d+)\):\n/;

/** Re-joins chunked imported texts (oldest import first) and splits the PDF and email sections by their import markers. */
export function importedSources(rows: SourceInteraction[]): ImportedSource[] {
  const partNo = (r: SourceInteraction) => Number(r.summary.match(PART)?.[1] ?? 0);
  // Chunks of one import share a transaction timestamp, so the part number breaks ties.
  const sorted = [...rows].filter(r => PART.test(r.summary)).sort((a, b) => a.occurred_at.localeCompare(b.occurred_at) || partNo(a) - partNo(b));
  const groups: { at: string; parts: string[] }[] = [];
  for (const r of sorted) {
    const [, n] = r.summary.match(PART)!;
    if (n === '1' || !groups.length) groups.push({ at: r.occurred_at, parts: [] });
    groups[groups.length - 1].parts.push(r.summary.replace(PART, ''));
  }
  return groups.map(g => {
    const text = g.parts.join('');
    const pdfM = text.match(/--- Tarjous \(([^)]*)\) ---\n([\s\S]*?)(?=\n*--- Sähköpostikeskustelu ---|$)/);
    const mailM = text.match(/--- Sähköpostikeskustelu ---\n([\s\S]*)$/);
    const other = pdfM || mailM ? '' : text;
    return { pdfName: pdfM?.[1] ?? null, pdf: pdfM?.[2]?.trim() ?? '', email: mailM?.[1]?.trim() ?? '', other: other.trim(), importedAt: g.at };
  });
}

/** One separately shown source: a stored document (UX-2) or a legacy import section re-split for display only. */
export type CardSource = { kind: 'pdf' | 'email' | 'other'; name: string | null; text: string; at: string | null; stored: boolean; storagePath: string | null };
export type StoredSourceDoc = { kind: 'pdf' | 'email'; original_name: string | null; text_content: string; created_at: string; storage_path: string | null };

const sameInstant = (a: string | null, b: string | null) => !!a && !!b && Date.parse(a) === Date.parse(b);
/**
 * Stored documents first; legacy chunked imports are kept as a read fallback. A legacy group written in the
 * same transaction as stored documents (identical timestamp) is that import's history copy and is not shown twice.
 * Legacy text is never presented as an original PDF file.
 */
export function cardSources(docs: StoredSourceDoc[], rows: SourceInteraction[]): CardSource[] {
  const stored: CardSource[] = [...docs].sort((a, b) => a.created_at.localeCompare(b.created_at) || a.kind.localeCompare(b.kind))
    .map(d => ({ kind: d.kind, name: d.original_name, text: d.text_content, at: d.created_at, stored: true, storagePath: d.storage_path }));
  const legacy: CardSource[] = importedSources(rows).filter(g => !docs.some(d => sameInstant(d.created_at, g.importedAt))).flatMap(g => [
    g.pdf ? { kind: 'pdf' as const, name: g.pdfName, text: g.pdf, at: g.importedAt, stored: false, storagePath: null } : null,
    g.email ? { kind: 'email' as const, name: null, text: g.email, at: g.importedAt, stored: false, storagePath: null } : null,
    g.other ? { kind: 'other' as const, name: null, text: g.other, at: g.importedAt, stored: false, storagePath: null } : null,
  ].filter((x): x is CardSource => !!x));
  return [...stored, ...legacy].sort((a, b) => (a.at ?? '').localeCompare(b.at ?? ''));
}
export const sourceLabel = (s: Pick<CardSource, 'kind' | 'name'>) => s.kind === 'pdf' ? `PDF${s.name ? `: ${s.name}` : ''}` : s.kind === 'email' ? 'Sähköposti' : 'Tuotu teksti';

export type PromiseSuggestion = { text: string; quote: string; kind: CardSource['kind']; source: string };
// A promise needs an explicit commitment verb; bare topic words (materiaali, tallenne, todistus) are never enough.
const COMMIT = /(sisält(ää|yy|yvät|äen)|saatte|saavat|saa käyttöönsä|toimitamme|toimitetaan|lähetämme|lähetetään|luovutamme|annamme|annetaan|myönnetään|järjestämme|tarjoamme|takaamme|lupaamme|kuuluu hintaan|kuuluvat hintaan)/i;
const NEGATIVE = /(^|[^\p{L}])(ei|eivät|emme|en|eikä|ilman)([^\p{L}]|$)/iu;
const CONDITIONAL = /(^|[^\p{L}])(jos|mikäli|tarvittaessa|pyydettäessä|halutessanne|haluttaessa|sovittaessa|erikseen|lisähintaan|lisämaksusta|lisämaksua|voidaan|voimme|voisimme|mahdollisesti|optio\w*|tilauksesta)([^\p{L}]|$)/iu;

/** Sentences from the source that explicitly promise something; negative, conditional and question sentences are skipped. */
export function promiseSuggestions(sources: CardSource[]): PromiseSuggestion[] {
  const out: PromiseSuggestion[] = []; const seen = new Set<string>();
  for (const src of sources) {
    for (const raw of src.text.split(/\n+|(?<=[.!?])\s+/)) {
      const sentence = raw.replace(/^[>\s•*–-]+/, '').replace(/\s+/g, ' ').trim();
      if (sentence.length < 8 || sentence.length > 300 || sentence.endsWith('?')) continue;
      if (!COMMIT.test(sentence) || NEGATIVE.test(sentence) || CONDITIONAL.test(sentence)) continue;
      const key = norm(sentence).replace(/[^a-z0-9]+/g, ' ').trim();
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({ text: sentence.replace(/[.!]+$/, ''), quote: sentence, kind: src.kind, source: sourceLabel(src) });
    }
  }
  return out;
}
/** Draft text for the existing "Asiakkaalle luvattu" field; returned for review only, never saved here. */
export const promiseDraft = (items: PromiseSuggestion[]) => items.map(i => `- ${i.text} (lähde: ${i.source})`).join('\n');
/** Appends a reviewed draft without replacing what the field already holds. */
export const appendPromise = (current: string, draft: string) => !draft.trim() ? current : current.trim() ? `${current.trimEnd()}\n${draft.trim()}` : draft.trim();

export type CardFacts = {
  offer: { status: string; vatRate: number | null; approved: boolean; content: string | null; startsOn: string | null } | null;
  order: { vatRate: number | null; vatBasis: string | null; startsOn: string | null } | null;
  programme: { trainers: string[]; trainerLabel: string | null; promises: string; startsAt: string | null } | null;
  sourceText: string;
  sources?: CardSource[];
  organizationLinked: boolean; contactLinked: boolean; ownerSet: boolean; valueSet: boolean;
};
export type CardIssue = { key: string; kind: 'conflict' | 'missing'; text: string };

const pct = (v: number) => `${String(v).replace('.', ',')} %`;
const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

/** Names after "Kouluttaja:"/"Kouluttajat:" in the source material. */
export function sourceTrainers(text: string): string[] {
  const out: string[] = [];
  for (const m of text.matchAll(/kouluttaj\w*\s*[:–-]\s*([^\n]+)/gi))
    for (const n of m[1].split(/,| ja | sekä /)) { const t = n.trim().replace(/[.;]+$/, ''); if (t.length > 2 && !out.includes(t)) out.push(t); }
  return out;
}
export function preferredTiming(f: CardFacts): string | null {
  const fromOffer = f.offer?.content?.match(/Toivottu ajankohta:\s*([^\n]+)/)?.[1]?.trim();
  return fromOffer || null;
}

export function cardIssues(f: CardFacts): CardIssue[] {
  const out: CardIssue[] = [];
  if (!f.organizationLinked) out.push({ key: 'org', kind: 'missing', text: 'Organisaatiota ei ole liitetty' });
  if (!f.contactLinked) out.push({ key: 'contact', kind: 'missing', text: 'Yhteyshenkilöä ei ole liitetty' });
  if (!f.ownerSet) out.push({ key: 'owner', kind: 'missing', text: 'Myyntivastaava puuttuu' });
  if (!f.valueSet && !f.offer) out.push({ key: 'value', kind: 'missing', text: 'Arvo puuttuu' });
  const offerVat = f.offer?.vatRate ?? null;
  if (offerVat !== null && offerVat > 0) {
    if (f.order && (f.order.vatRate ?? 0) === 0) out.push({ key: 'vat', kind: 'conflict', text: `Tarjouksen ALV ${pct(offerVat)}, mutta tilaus on kirjattu verottomaksi` });
    else if (!f.order && f.offer?.status === 'accepted') out.push({ key: 'vat', kind: 'conflict', text: `Tarjouksen ALV ${pct(offerVat)} – tilauksen ALV on vielä valitsematta` });
  }
  if (f.offer && (f.offer.status === 'accepted' || f.offer.approved) && !f.order) out.push({ key: 'order', kind: 'conflict', text: 'Tarjous on hyväksytty, mutta vahvistettu tilaus puuttuu' });
  const src = sourceTrainers(f.sourceText);
  if (src.length) {
    const prog = norm([...(f.programme?.trainers ?? []), f.programme?.trainerLabel ?? ''].join(' '));
    if (!prog.trim()) out.push({ key: 'trainer', kind: 'conflict', text: `Lähdeaineistossa kouluttaja: ${src.join(', ')} – ohjelman vastuukouluttaja puuttuu` });
    else if (!src.some(n => norm(n).split(/\s+/).some(p => p.length > 2 && prog.includes(p)))) out.push({ key: 'trainer', kind: 'conflict', text: `Lähdeaineistossa kouluttaja: ${src.join(', ')} – ohjelmassa eri vastuukouluttaja` });
  }
  const promised = promiseSuggestions(f.sources ?? (f.sourceText ? [{ kind: 'other', name: null, text: f.sourceText, at: null, stored: false, storagePath: null }] : []));
  if (promised.length && !f.programme?.promises?.trim()) out.push({ key: 'promises', kind: 'conflict', text: `Lähdeaineistossa luvattu ${promised.length} asiaa (esim. ”${promised[0].text.slice(0, 80)}”) – Asiakkaalle luvattu -kenttä on tyhjä` });
  const pref = preferredTiming(f);
  const confirmed = f.order?.startsOn || f.programme?.startsAt;
  if (pref && !confirmed) out.push({ key: 'timing', kind: 'conflict', text: `Alustava ajankohta "${pref}" – toteutuspäivää ei ole vahvistettu` });
  return out;
}

export type CardTab = 'yhteenveto' | 'tarjous' | 'tuotanto';
/** Flow-task URLs from the next-step guidance land on the tab that holds the task. */
export function tabForTask(task: string | null, explicit: string | null): CardTab {
  if (explicit === 'tarjous' || explicit === 'tuotanto' || explicit === 'yhteenveto') return explicit;
  if (task === 'offers' || task === 'order') return 'tarjous';
  if (task && ['programme', 'capacity', 'attach', 'handoff', 'receive'].includes(task)) return 'tuotanto';
  return 'yhteenveto';
}

/** Conflicts only (missing basics excluded); the kanban badge and the open card share this count. */
export const conflictCount = (issues: CardIssue[]) => issues.filter(i => i.kind === 'conflict').length;

export type IssueTarget = { tab: CardTab; task: string | null; fieldId: string; action: string; note: string | null };
/**
 * Where each issue is corrected. Navigation only: opening a target never saves. A confirmed order is never
 * edited from the card, so its VAT conflict points to the read-only order review with a truthful note.
 */
export function issueTarget(issue: CardIssue, f: CardFacts): IssueTarget | null {
  switch (issue.key) {
    case 'vat': return f.order
      ? { tab: 'tarjous', task: null, fieldId: 'order-review', action: 'Tarkista tilaus', note: 'Vahvistettua tilausta ei voi muokata kortilta. ALV-virhe korjataan tilauksen muutosprosessissa, ei tällä painikkeella.' }
      : { tab: 'tarjous', task: 'order', fieldId: 'order-vat', action: 'Valitse ALV', note: 'ALV valitaan tilauksen vahvistuslomakkeella. Mitään ei tallennu ennen Vahvista tilaus -painiketta.' };
    case 'order': return { tab: 'tarjous', task: 'order', fieldId: 'order-offer', action: 'Vahvista tilaus', note: 'Lomake avautuu tarkistettavaksi. Tilaus vahvistetaan vain lomakkeen omalla painikkeella.' };
    case 'trainer': return { tab: 'tuotanto', task: null, fieldId: 'ct-Vastuukouluttaja', action: 'Korjaa kouluttaja', note: 'Muutos tallentuu ohjelman uutena revisiona vasta tallennuspainikkeella.' };
    case 'promises': return { tab: 'tuotanto', task: null, fieldId: 'promise-suggestion', action: 'Tarkista ehdotus', note: null };
    case 'timing': return { tab: 'tuotanto', task: null, fieldId: 'ct-start', action: 'Kirjaa ajankohta', note: 'Toteutuspäivä tallentuu ohjelman revisiona vasta tallennuspainikkeella.' };
    case 'owner': return { tab: 'yhteenveto', task: null, fieldId: 'lead-owner', action: 'Valitse vastuuhenkilö', note: null };
    case 'value': return { tab: 'yhteenveto', task: null, fieldId: 'deal-value', action: 'Kirjaa arvo', note: null };
    default: return null;
  }
}
/** Only these field ids may be addressed from the URL. */
export const FIX_FIELDS = ['order-review', 'order-vat', 'order-offer', 'ct-Vastuukouluttaja', 'promise-suggestion', 'ct-start', 'lead-owner', 'deal-value', 'card-issues'] as const;
