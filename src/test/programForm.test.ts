import { describe, expect, it } from 'vitest';
import { emptyProgramForm, employerBillingMissing, programFormErrors, programFormPayload } from '@/lib/programForm';
import { phoneCountries } from '@/lib/phoneCountries';

const manager = { orientation_required: true, orientations: ['Johtaminen'], extra_info: false, payer_options: [{ key: 'self', label: 'a' }, { key: 'employer', label: 'b' }, { key: 'employer_keuda', label: 'c' }] };
const director = { orientation_required: false, orientations: [], extra_info: true, payer_options: [{ key: 'self', label: 'a' }, { key: 'employer', label: 'b' }] };
const valid = { ...emptyProgramForm(), first_name: 'Testi', last_name: 'Henkilö', email: 't@example.fi', phone_number: '401234567', street_address: 'Katu 1', postal_code: '04400', city: 'Järvenpää', orientation: 'Johtaminen', payer_option: 'employer_keuda', accept_price: true, accept_privacy: true, accept_cancellation: true };

describe('ohjelmakohtainen ilmoittautumislomake', () => {
  it('hyväksyy AI Managerin Keuda-maksajan', () => expect(programFormErrors(manager, valid)).toEqual([]));
  it('Directorissa ei ole Keuda-maksajavaihtoehtoa', () => expect(programFormErrors(director, valid)).toContain('Valitse koulutuksen maksaminen'));
  it('Managerissa toimiala on pakollinen', () => expect(programFormErrors(manager, { ...valid, orientation: '' })).toContain('Valitse toiminto tai toimiala'));
  it('peruutusehtojen hyväksyntä on pakollinen', () => expect(programFormErrors(manager, { ...valid, accept_cancellation: false })).toContain('Hyväksy koulutusmaksu, tietosuoja ja peruutusehdot'));
  it('maakoodin on oltava kansainvälinen muoto', () => expect(programFormErrors(manager, { ...valid, phone_country: '358' })).toContain('Tarkista matkapuhelinnumero ja maakoodi'));
  it('Suomi +358 on oletus ja kansainvälisessä luettelossa on Ruotsi +46', () => {
    expect(emptyProgramForm().phone_country).toBe('+358'); expect(phoneCountries.find(c => c.country === 'SE')?.code).toBe('+46'); expect(phoneCountries.length).toBeGreaterThan(200);
  });
  it('hyväksyntää odottava Keuda-vaihtoehto ei ole valittavissa', () => expect(programFormErrors({ ...manager, payer_options: manager.payer_options.map(p => ({ ...p, enabled: p.key !== 'employer_keuda' })) }, valid)).toContain('Valitse koulutuksen maksaminen'));
  it('työnantajatiedot ovat ehdollinen ehdotus, eivät ilmoittautumisen pakollisia kenttiä', () => expect(programFormErrors(manager, { ...valid, payer_option: 'employer' })).toEqual([]));
  it('itse maksavan payload ei sisällä työnantajan aiemmin täytettyjä tietoja', () => expect(programFormPayload({ ...manager, price_amount: 10 }, { ...valid, payer_option: 'self', billing_org: 'Testi Oy' }).billing_org).toBe(''));
  it('ehdotuksen minimit sisältävät yrityksen, Y-tunnuksen, osoitteen ja yhteyshenkilön', () => expect(employerBillingMissing(emptyProgramForm())).toEqual(['Yrityksen nimi', 'Y-tunnus', 'Laskutusyhteyshenkilö', 'Laskutussähköposti', 'Laskutusosoite tai verkkolaskuosoite ja välittäjä']));
  it('verkkolaskutiedot voivat korvata postiosoitteen', () => expect(employerBillingMissing({ ...emptyProgramForm(), billing_org: 'Testi Oy', billing_business_id: '1234567-1', billing_contact: 'Testi Laskutus', billing_email: 'billing@example.test', billing_einvoice: '003712345671', billing_operator: 'TESTI' })).toEqual([]));
  it('lähettää nähtävän ehtoversion tarkistettavaksi', () => expect(programFormPayload({ ...manager, price_amount: 10, terms_version: 'ai-terms-2026-10-27-dev' }, valid).terms_version_seen).toBe('ai-terms-2026-10-27-dev'));
  it('Directorin payload jättää toimialan pois ja lähettää lisätiedot', () => {
    const p = programFormPayload({ ...director, price_amount: 10 }, { ...valid, extra_info: 'x' });
    expect(p.orientation).toBeUndefined(); expect(p.extra_info).toBe('x'); expect(p.price_seen).toBe(10);
  });
});
