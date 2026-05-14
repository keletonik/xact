import { describe, expect, it } from 'vitest';
import { dollarsToCents, centsToDollars, productSchema } from './productSchema';

describe('productSchema helpers', () => {
  it('dollarsToCents tolerates $ commas spaces', () => {
    expect(dollarsToCents('$1,234.56')).toBe(123456);
    expect(dollarsToCents(' 12.5 ')).toBe(1250);
    expect(dollarsToCents(12.34)).toBe(1234);
    expect(dollarsToCents('')).toBe(0);
    expect(dollarsToCents('(5.00)')).toBe(-500);
  });
  it('centsToDollars is inverse', () => {
    expect(centsToDollars(123456)).toBe(1234.56);
  });
  it('productSchema rejects missing required fields', () => {
    const result = productSchema.safeParse({});
    expect(result.success).toBe(false);
  });
  it('productSchema accepts a complete draft', () => {
    const draft = {
      id: 'p1', sku: 'A1', name: 'Test', category: 'material', unit: 'ea',
      basePriceCents: 1000, currency: 'AUD', isCustom: true, isArchived: false,
    };
    const result = productSchema.safeParse(draft);
    expect(result.success).toBe(true);
  });
});
