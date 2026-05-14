import { describe, expect, it } from 'vitest';
import { advanceDate, dueInspectionsFor } from './schedules';

describe('servicing schedules', () => {
  it('advanceDate handles common cadences', () => {
    const start = '2025-01-01T00:00:00.000Z';
    expect(new Date(advanceDate(start, '6m')).getUTCMonth()).toBe(6);
    expect(new Date(advanceDate(start, '12m')).getUTCFullYear()).toBe(2026);
    expect(new Date(advanceDate(start, '5y')).getUTCFullYear()).toBe(2030);
  });
  it('dueInspectionsFor: extinguisher produces multiple cadences within a year', () => {
    const asset = { id: 'a', type: 'extinguisher', installDate: '2025-01-01T00:00:00.000Z', lastInspectedAt: null };
    const due = dueInspectionsFor(asset, '2025-01-01T00:00:00.000Z', '2026-12-31T23:59:59.000Z');
    const freqs = new Set(due.map((d) => d.frequency));
    expect(freqs.has('6m')).toBe(true);
    expect(freqs.has('12m')).toBe(true);
  });
  it('unknown asset type returns no inspections', () => {
    const asset = { id: 'x', type: 'unknown_type', installDate: '2025-01-01T00:00:00.000Z' };
    expect(dueInspectionsFor(asset)).toEqual([]);
  });
});
