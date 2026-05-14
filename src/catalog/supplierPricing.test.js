import { describe, expect, it } from 'vitest';
import { bestSupplierPrice, compareSuppliers, landedCentsPerUnit } from './supplierPricing';

const today = new Date().toISOString();
const yesterday = new Date(Date.now() - 86400000).toISOString();
const tomorrow = new Date(Date.now() + 86400000).toISOString();

describe('supplierPricing', () => {
  it('landedCentsPerUnit allocates freight across MOQ', () => {
    expect(landedCentsPerUnit({ unitPriceCents: 1000, freightCents: 500, moq: 10, fxRateToAUD: 1 })).toBe(1050);
  });
  it('prefers preferred supplier when effective', () => {
    const prices = [
      { id: 'a', unitPriceCents: 1000, effectiveFrom: yesterday, effectiveTo: tomorrow, isPreferred: false, fxRateToAUD: 1, moq: 1, freightCents: 0 },
      { id: 'b', unitPriceCents: 1500, effectiveFrom: yesterday, effectiveTo: tomorrow, isPreferred: true, fxRateToAUD: 1, moq: 1, freightCents: 0 },
    ];
    expect(bestSupplierPrice(prices, today).id).toBe('b');
  });
  it('falls back to cheapest landed when no preferred', () => {
    const prices = [
      { id: 'a', unitPriceCents: 1000, freightCents: 200, moq: 1, fxRateToAUD: 1, effectiveFrom: yesterday, effectiveTo: tomorrow, isPreferred: false },
      { id: 'b', unitPriceCents: 1100, freightCents: 0,   moq: 1, fxRateToAUD: 1, effectiveFrom: yesterday, effectiveTo: tomorrow, isPreferred: false },
    ];
    expect(bestSupplierPrice(prices, today).id).toBe('b');
  });
  it('compareSuppliers returns sorted with deltas', () => {
    const prices = [
      { id: 'a', supplierId: 's1', unitPriceCents: 1200, freightCents: 0, moq: 1, fxRateToAUD: 1, effectiveFrom: yesterday, effectiveTo: tomorrow },
      { id: 'b', supplierId: 's2', unitPriceCents: 1000, freightCents: 0, moq: 1, fxRateToAUD: 1, effectiveFrom: yesterday, effectiveTo: tomorrow },
    ];
    const sup = [{ id: 's1', name: 'X' }, { id: 's2', name: 'Y' }];
    const result = compareSuppliers(prices, sup);
    expect(result[0].supplierName).toBe('Y');
    expect(result[1].deltaCents).toBe(200);
  });
  it('ignores expired prices', () => {
    const prices = [
      { id: 'a', unitPriceCents: 1000, freightCents: 0, moq: 1, fxRateToAUD: 1, effectiveFrom: '2000-01-01T00:00:00Z', effectiveTo: '2001-01-01T00:00:00Z' },
    ];
    expect(bestSupplierPrice(prices, today)).toBeNull();
  });
});
