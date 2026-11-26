import { describe, it, expect } from 'vitest';
import { readinessSummary, billingLabel, PAYMENT_LABEL, productionSection } from './productionStatus';

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
  it('käsin valittu maksutila ei väitä Netvisor-lähetystä', () => {
    for (const v of Object.values(PAYMENT_LABEL)) expect(v).not.toMatch(/netvisor/i);
    expect(billingLabel(true, true, 'laskutettu')).toBe('Merkitty laskutetuksi (käsin)');
  });
  it('laskutusvalmius vaatii kuittauksen ja toteumat', () => {
    expect(billingLabel(true, false, 'ei_laskutettu')).toBe('Ei laskutusvalmis');
    expect(billingLabel(true, true, 'ei_laskutettu')).toBe('Valmis laskutukseen');
  });
  it('tuntematon osio palaa koulutusprojekteihin', () => {
    expect(productionSection(null)).toBe('projektit');
    expect(productionSection('xyz')).toBe('projektit');
    expect(productionSection('laskutus')).toBe('laskutus');
  });
});
