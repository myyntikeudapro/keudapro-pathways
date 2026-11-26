import { describe, it, expect } from 'vitest';
import { linkArgs, linkErrorText, normalizeBusinessId } from '@/lib/customerLink';

describe('Y-tunnuksen tarkistus', () => {
  it('normalisoi välilyönnit ja väliviivattoman muodon', () => {
    expect(normalizeBusinessId(' 0112038-9 ')).toBe('0112038-9');
    expect(normalizeBusinessId('01120389')).toBe('0112038-9');
  });
  it('hylkää väärän tarkistusnumeron ja muodon', () => {
    expect(normalizeBusinessId('0112038-8')).toBeNull();
    expect(normalizeBusinessId('FI01120389')).toBeNull();
    expect(normalizeBusinessId('')).toBeNull();
  });
});

describe('asiakasvalinnan lähetys', () => {
  const base = { leadId: 'l', expectedOrganizationId: null, expectedContactId: null, opKey: 'op-123456' };
  it('olemassa oleva organisaatio ja henkilö lähetetään tunnisteina, ei nimillä', () => {
    const a = linkArgs({ ...base, organization: { id: 'o1' }, contact: { id: 'c1' } });
    expect(a).toMatchObject({ p_organization_id: 'o1', p_new_business_id: null, p_contact_id: 'c1', p_new_contact_email: null });
  });
  it('keskeneräinen yhteyshenkilö ei keksi sähköpostia', () => {
    const a = linkArgs({ ...base, organization: { name: 'TESTI Oy', businessId: '0112038-9' }, contact: null });
    expect(a.p_contact_id).toBeNull(); expect(a.p_new_contact_email).toBeNull(); expect(a.p_new_business_id).toBe('0112038-9');
  });
  it('kilpaileva muutos näytetään selkokielisenä', () => {
    expect(linkErrorText({ message: 'LINK_CHANGED' })).toMatch(/Toinen käyttäjä/);
  });
});
