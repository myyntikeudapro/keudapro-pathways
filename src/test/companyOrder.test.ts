import { describe, it, expect } from 'vitest';
import { orderInputErrors } from '@/lib/companyOrder';
const ok = { vatBasis: 'yleinen' as const, vatRate: 25.5, organization: 'Oy', contactName: 'A', content: 'Koulutus', amount: 1000, startsOn: '2027-02-10', terms: 't', paymentTerms: '14 pv', approvalNote: 'sähköposti 16.11.' };
describe('yrityskoulutuksen tilausvahvistus', () => {
  it('täydellinen tilaus kelpaa', () => expect(orderInputErrors(ok)).toEqual([]));
  it('vaatii asiakkaan hyväksynnän kuvauksen', () => expect(orderInputErrors({ ...ok, approvalNote: ' ' })).toContain('asiakkaan hyväksynnän kuvaus'));
  it('nollasumma estetään', () => expect(orderInputErrors({ ...ok, amount: 0 })).toContain('summa'));
  it('päättyminen ennen alkua estetään', () => expect(orderInputErrors({ ...ok, endsOn: '2027-02-01' })).toContain('päättymispäivä ennen alkua'));
});
