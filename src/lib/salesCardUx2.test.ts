import { describe, it, expect } from 'vitest';
import { appendPromise, cardIssues, cardSources, conflictCount, FIX_FIELDS, issueTarget, promiseDraft, promiseSuggestions, type CardFacts, type CardSource } from './salesCard';
import { buildCardFacts, conflictCounts, type CardRaw, type FactsLead } from './salesCardData';
import { buildSourceDocs, sourceFilePath } from './offerImport';

const src = (text: string, kind: CardSource['kind'] = 'pdf', name: string | null = 'tarjous.pdf'): CardSource => ({ kind, name, text, at: '2026-11-27T10:00:00Z', stored: true, storagePath: null });
const base: CardFacts = { offer: null, order: null, programme: null, sourceText: '', sources: [], organizationLinked: true, contactLinked: true, ownerSet: true, valueSet: true };

describe('Asiakkaalle luvattu -ehdotus', () => {
  it('quotes explicit promises with their PDF/email source', () => {
    const s = promiseSuggestions([src('Hintaan sisältyy koulutusmateriaali PDF-muodossa.'), src('Lähetämme osallistujalistan pohjan viikkoa ennen.', 'email', null)]);
    expect(s.map(x => [x.source, x.quote])).toEqual([['PDF: tarjous.pdf', 'Hintaan sisältyy koulutusmateriaali PDF-muodossa.'], ['Sähköposti', 'Lähetämme osallistujalistan pohjan viikkoa ennen.']]);
  });
  it('skips negative mentions', () => {
    expect(promiseSuggestions([src('Hintaan ei sisälly tallennetta.'), src('Todistuksia emme toimita.')])).toEqual([]);
  });
  it('skips conditional and question mentions', () => {
    expect(promiseSuggestions([src('Tallenne toimitetaan, jos asiakas sitä pyytää.'), src('Voimme lähettää materiaalit tarvittaessa.'), src('Sisältyykö hintaan todistus?'), src('Todistukset saatavilla lisähintaan, toimitamme ne.')])).toEqual([]);
  });
  it('does not infer promises from bare keywords', () => {
    expect(promiseSuggestions([src('Materiaalit, tallenne ja todistus.')])).toEqual([]);
    expect(cardIssues({ ...base, sources: [src('Materiaalit, tallenne ja todistus.')] }).map(i => i.key)).not.toContain('promises');
  });
  it('leaves the draft empty when nothing is promised', () => {
    expect(promiseDraft(promiseSuggestions([src('Kiitos tarjouksesta.')]))).toBe('');
  });
  it('appends to an existing field instead of replacing it (no automatic save)', () => {
    expect(appendPromise('Materiaalit PDF', '- Tallenne')).toBe('Materiaalit PDF\n- Tallenne');
    expect(appendPromise('Olemassa oleva', '  ')).toBe('Olemassa oleva');
    expect(appendPromise('', '- Tallenne')).toBe('- Tallenne');
  });
});

describe('ristiriidan korjauskohteet', () => {
  const accepted = { status: 'accepted', vatRate: 25.5, approved: true, content: 'Toivottu ajankohta: tammikuu', startsOn: null };
  const conflicted: CardFacts = { ...base, offer: accepted, sources: [src('Kouluttaja: Maija Meikäläinen\nHintaan sisältyy materiaali.')], sourceText: 'Kouluttaja: Maija Meikäläinen', programme: null };
  it('gives every current conflict a target in the right tab and field', () => {
    const issues = cardIssues(conflicted).filter(i => i.kind === 'conflict');
    expect(issues.map(i => i.key).sort()).toEqual(['order', 'promises', 'timing', 'trainer', 'vat']);
    const t = Object.fromEntries(issues.map(i => [i.key, issueTarget(i, conflicted)]));
    expect(t.vat).toMatchObject({ tab: 'tarjous', fieldId: 'order-vat' });
    expect(t.order).toMatchObject({ tab: 'tarjous', fieldId: 'order-offer' });
    expect(t.trainer).toMatchObject({ tab: 'tuotanto', fieldId: 'ct-Vastuukouluttaja' });
    expect(t.promises).toMatchObject({ tab: 'tuotanto', fieldId: 'promise-suggestion' });
    expect(t.timing).toMatchObject({ tab: 'tuotanto', fieldId: 'ct-start' });
    for (const x of Object.values(t)) expect(FIX_FIELDS).toContain(x!.fieldId);
  });
  it('never routes a confirmed order to an editable field', () => {
    const f = { ...base, offer: accepted, order: { vatRate: 0, vatBasis: 'koulutus_veroton', startsOn: '2027-01-20' } };
    const vat = cardIssues(f).find(i => i.key === 'vat')!;
    const t = issueTarget(vat, f)!;
    expect(t.fieldId).toBe('order-review');
    expect(t.note).toContain('ei voi muokata');
  });
  it('keeps unrelated missing basics out of the target list where no safe form exists', () => {
    expect(issueTarget({ key: 'org', kind: 'missing', text: '' }, base)).toBeNull();
  });
});

describe('kanbanin ja kortin yhtenevä määrä', () => {
  const lead = (id: string, prog: string | null = null): FactsLead => ({ id, organization_id: null, contact_id: null, owner_id: null, deal_value: null, company_programme_id: prog });
  const raw: CardRaw = {
    offers: [{ id: 'o1', lead_id: 'a', status: 'accepted', created_at: '2026-11-01' }],
    versions: [{ id: 'v1', offer_id: 'o1', version_no: 1, vat_rate: 25.5, approved_at: '2026-11-02', content: null }],
    orders: [], importRows: [], programmes: [],
    docs: [{ id: 'd1', lead_id: 'a', kind: 'email', original_name: null, text_content: 'Hintaan sisältyy tallenne.', created_at: '2026-11-27T10:00:00Z', storage_path: null, file_size: null }],
  };
  it('uses the latest programme revision of the case', () => {
    const r = { ...raw, programmes: [{ id: 'p1', case_lead_id: 'a', revision: 1, promises: '', programme: {} }, { id: 'p2', case_lead_id: 'a', revision: 2, promises: 'Tallenne', programme: {} }] };
    expect(buildCardFacts(lead('a'), r, []).issues.map(i => i.key)).not.toContain('promises');
  });
  it('counts only conflicts, the same as the card', () => {
    const leads = [lead('a'), lead('b')];
    const counts = conflictCounts(leads, raw, []);
    const card = buildCardFacts(leads[0], raw, []);
    expect(counts.get('a')).toBe(conflictCount(card.issues));
    expect(counts.get('a')).toBe(3); // vat, order, promises; org/contact/owner missing are not counted
    expect(card.issues.some(i => i.kind === 'missing')).toBe(true);
    expect(counts.get('b')).toBe(0);
  });
});

describe('erilliset lähteet ja vanhat tuonnit', () => {
  it('builds separate PDF and email sources with a deterministic private path', () => {
    expect(sourceFilePath('abc-123-def')).toBe('abc-123-def/tarjous.pdf');
    expect(buildSourceDocs({ pdf: { name: 't.pdf', text: 'PDF teksti', storagePath: 'k/tarjous.pdf' }, email: '  Hei, sopii.  ' })).toEqual([
      { kind: 'pdf', name: 't.pdf', text: 'PDF teksti', storage_path: 'k/tarjous.pdf' }, { kind: 'email', name: null, text: 'Hei, sopii.', storage_path: null }]);
    expect(buildSourceDocs({ pdf: null, email: '' })).toEqual([]);
  });
  const legacy = (at: string, body: string) => [{ kind: 'email', occurred_at: at, summary: `Tuotu alkuperäinen teksti (1/1):\n${body}` }];
  it('reads old imports from history without claiming an original PDF file', () => {
    const s = cardSources([], legacy('2026-11-20T10:00:00Z', '--- Tarjous (vanha.pdf) ---\nHinta\n\n--- Sähköpostikeskustelu ---\nOk'));
    expect(s.map(x => [x.kind, x.stored, x.storagePath])).toEqual([['pdf', false, null], ['email', false, null]]);
  });
  it('shows a new import once: stored documents replace their same-transaction history copy', () => {
    const at = '2026-11-27T10:00:00.123+00:00';
    const docs = [{ kind: 'pdf' as const, original_name: 'u.pdf', text_content: 'Hinta', created_at: at, storage_path: 'k/tarjous.pdf' }];
    const s = cardSources(docs, [...legacy('2026-11-27T10:00:00.123Z', '--- Tarjous (u.pdf) ---\nHinta'), ...legacy('2026-11-01T09:00:00Z', 'Vanha teksti')]);
    expect(s.map(x => [x.kind, x.stored])).toEqual([['other', false], ['pdf', true]]);
  });
});
