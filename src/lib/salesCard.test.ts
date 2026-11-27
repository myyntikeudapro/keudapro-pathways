import { describe, it, expect } from 'vitest';
import { cardIssues, importedSources, tabForTask, type CardFacts } from './salesCard';

const base: CardFacts = { offer: null, order: null, programme: null, sourceText: '', organizationLinked: true, contactLinked: true, ownerSet: true, valueSet: true };
const keys = (f: Partial<CardFacts>) => cardIssues({ ...base, ...f }).map(i => i.key);
const offer = { status: 'accepted', vatRate: 25.5, approved: true, content: null, startsOn: null };

describe('sales card conflicts', () => {
  it('flags offer VAT 25,5 % against a tax-free order', () => {
    expect(keys({ offer, order: { vatRate: 0, vatBasis: 'koulutus_veroton', startsOn: '2027-01-20' } })).toContain('vat');
  });
  it('flags offer VAT when the order VAT is still unselected', () => {
    expect(cardIssues({ ...base, offer }).find(i => i.key === 'vat')?.text).toContain('25,5 %');
  });
  it('does not flag VAT when the order matches', () => {
    expect(keys({ offer, order: { vatRate: 25.5, vatBasis: 'yleinen', startsOn: '2027-01-20' } })).not.toContain('vat');
  });
  it('flags an accepted offer without a confirmed order', () => {
    expect(keys({ offer })).toContain('order');
    expect(keys({ offer, order: { vatRate: 25.5, vatBasis: 'yleinen', startsOn: '2027-01-20' } })).not.toContain('order');
  });
  it('flags source trainers that differ from the programme trainer', () => {
    const sourceText = 'Kouluttaja: Maija Meikäläinen';
    expect(keys({ sourceText, programme: { trainers: ['kouluttaja-testi@example.com'], trainerLabel: null, promises: 'x', startsAt: null } })).toContain('trainer');
    expect(keys({ sourceText, programme: { trainers: ['maija.meikalainen@example.com'], trainerLabel: null, promises: 'x', startsAt: null } })).not.toContain('trainer');
    expect(keys({ sourceText })).toContain('trainer');
  });
  it('flags promised materials, recording or certificates with an empty promises field', () => {
    const i = cardIssues({ ...base, sourceText: 'Hintaan sisältyy materiaalit, tallenne ja todistukset.' }).find(x => x.key === 'promises');
    expect(i?.text).toContain('materiaalit, tallenne, todistukset');
    expect(keys({ sourceText: 'materiaalit', programme: { trainers: [], trainerLabel: null, promises: 'Materiaalit PDF', startsAt: null } })).not.toContain('promises');
  });
  it('flags a preliminary timing without a confirmed date', () => {
    const o = { ...offer, content: 'Toivottu ajankohta: tammikuun puolivälin jälkeen klo 13–15' };
    expect(keys({ offer: o })).toContain('timing');
    expect(keys({ offer: o, programme: { trainers: [], trainerLabel: null, promises: '', startsAt: '2027-01-20T11:00:00Z' } })).not.toContain('timing');
  });
  it('lists missing organisation, contact and owner', () => {
    expect(keys({ organizationLinked: false, contactLinked: false, ownerSet: false })).toEqual(expect.arrayContaining(['org', 'contact', 'owner']));
  });
});

describe('imported source material', () => {
  it('re-joins chunks and separates the PDF from the email thread', () => {
    const full = '--- Tarjous (t.pdf) ---\nHinta 900 €\n\n--- Sähköpostikeskustelu ---\nHei, sopii.';
    const rows = [
      { kind: 'email', occurred_at: '2026-11-27T10:00:01Z', summary: `Tuotu alkuperäinen teksti (2/2):\n${full.slice(20)}` },
      { kind: 'email', occurred_at: '2026-11-27T10:00:00Z', summary: `Tuotu alkuperäinen teksti (1/2):\n${full.slice(0, 20)}` },
      { kind: 'call', occurred_at: '2026-11-27T11:00:00Z', summary: 'Puhelu' },
    ];
    expect(importedSources(rows)).toEqual([{ pdfName: 't.pdf', pdf: 'Hinta 900 €', email: 'Hei, sopii.', other: '', importedAt: '2026-11-27T10:00:00Z' }]);
  });
});

describe('tab for next-step tasks', () => {
  it('opens offer/order tasks on the offer tab and production tasks on the production tab', () => {
    expect(tabForTask('order', null)).toBe('tarjous');
    expect(tabForTask('handoff', null)).toBe('tuotanto');
    expect(tabForTask(null, null)).toBe('yhteenveto');
    expect(tabForTask('order', 'tuotanto')).toBe('tuotanto');
  });
});
