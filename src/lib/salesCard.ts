// Pure rules for the sales customer card: source-material split and display-only conflict checks.
// Nothing here writes data or changes approval state; the card only shows the results.

export type SourceInteraction = { summary: string; occurred_at: string; kind: string };
export type ImportedSource = { pdfName: string | null; pdf: string; email: string; other: string; importedAt: string | null };

const PART = /^Tuotu alkuperäinen teksti \((\d+)\/(\d+)\):\n/;

/** Re-joins chunked imported texts (oldest import first) and splits the PDF and email sections by their import markers. */
export function importedSources(rows: SourceInteraction[]): ImportedSource[] {
  const sorted = [...rows].filter(r => PART.test(r.summary)).sort((a, b) => a.occurred_at.localeCompare(b.occurred_at));
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

export type CardFacts = {
  offer: { status: string; vatRate: number | null; approved: boolean; content: string | null; startsOn: string | null } | null;
  order: { vatRate: number | null; vatBasis: string | null; startsOn: string | null } | null;
  programme: { trainers: string[]; trainerLabel: string | null; promises: string; startsAt: string | null } | null;
  sourceText: string;
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
const PROMISES: [RegExp, string][] = [[/materiaal/i, 'materiaalit'], [/tallen(ne|nus|teen)/i, 'tallenne'], [/todistu/i, 'todistukset']];
export const sourcePromises = (text: string) => PROMISES.filter(([r]) => r.test(text)).map(([, l]) => l);
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
  const promised = sourcePromises(f.sourceText);
  if (promised.length && !f.programme?.promises?.trim()) out.push({ key: 'promises', kind: 'conflict', text: `Tarjouksessa luvattu ${promised.join(', ')} – Asiakkaalle luvattu -kenttä on tyhjä` });
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
