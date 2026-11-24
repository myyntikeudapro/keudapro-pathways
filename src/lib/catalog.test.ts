import { describe, expect, it } from 'vitest';
import { cancellationShare, priceVersionFor, registrationOpen, slugify, type PriceVersion } from './catalog';

const v = (n: number, price: number, locked = true): PriceVersion => ({ id: `v${n}`, product_id: 'p', version_no: n, unit_price: price, locked_at: locked ? '2026-01-01' : null });

describe('catalog price versions', () => {
  it('reuses the latest version when the price is unchanged', () => {
    expect(priceVersionFor([v(1, 100), v(2, 250)], 'p', 250)).toEqual({ reuse: v(2, 250) });
  });
  it('creates a new version instead of editing a locked one when the price changes', () => {
    expect(priceVersionFor([v(1, 100), v(2, 250)], 'p', 300)).toEqual({ create: 3 });
  });
  it('starts from version 1 for a new product', () => {
    expect(priceVersionFor([], 'p', 90)).toEqual({ create: 1 });
  });
});

describe('catalog rules', () => {
  it('charges no fee when cancelled within the free window, otherwise the late share', () => {
    expect(cancellationShare(14, 14, 50)).toBe(0);
    expect(cancellationShare(13, 14, 50)).toBe(50);
  });
  it('registration is open only between open and close times', () => {
    const o = { reg_opens_at: '2026-01-01T00:00:00Z', reg_closes_at: '2026-02-01T00:00:00Z' };
    expect(registrationOpen(o, Date.parse('2026-01-15T00:00:00Z'))).toBe(true);
    expect(registrationOpen(o, Date.parse('2026-02-01T00:00:00Z'))).toBe(false);
  });
  it('builds URL ids from Finnish names', () => {
    expect(slugify('Ilmastointi pätevyys – Mäntsälä')).toBe('ilmastointi-patevyys-mantsala');
  });
});
