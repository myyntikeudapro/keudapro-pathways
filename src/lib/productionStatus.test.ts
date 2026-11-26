import { describe, it, expect } from 'vitest';
import { readinessSummary, productionCheckpoint, productionSection } from './productionStatus';

describe('productionStatus', () => {
  it('0 aktiivista ei ole vihreä onnistumistila', () => {
    const r = readinessSummary(0, 0);
    expect(r.tone).toBe('neutral');
    expect(r.value).not.toContain('0 / 0');
  });
  it('kaikki valmiit = ok, osa puuttuu = warn', () => {
    expect(readinessSummary(3, 3).tone).toBe('ok');
    expect(readinessSummary(3, 1)).toMatchObject({ tone: 'warn', meta: '2 ei aloitusvalmis' });
  });
  it('käsin tehty maksumerkintä ei vahvista tuotannon toteumia', () => {
    expect(productionCheckpoint(false, false, 'laskutettu')).toEqual({ actualsComplete: false, manualPaymentStatus: 'laskutettu' });
    expect(productionCheckpoint(false, false, 'maksettu')).toEqual({ actualsComplete: false, manualPaymentStatus: 'maksettu' });
  });
  it('tuotannon tarkistus vaatii kuittauksen ja toteumat, ei laskun merkintää', () => {
    expect(productionCheckpoint(true, false, 'ei_laskutettu').actualsComplete).toBe(false);
    expect(productionCheckpoint(false, true, 'ei_laskutettu').actualsComplete).toBe(false);
    expect(productionCheckpoint(true, true, 'ei_laskutettu')).toEqual({ actualsComplete: true, manualPaymentStatus: null });
  });
  it('tuntematon osio palaa koulutusprojekteihin', () => {
    expect(productionSection(null)).toBe('projektit');
    expect(productionSection('xyz')).toBe('projektit');
    expect(productionSection('laskutus')).toBe('laskutus');
  });
});
