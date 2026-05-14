import { describe, expect, it } from 'vitest';
import { LABOUR_TASKS, applyOnCosts, labourCost } from './productivityMatrix';

describe('productivityMatrix', () => {
  it('provides a baseline matrix', () => {
    expect(LABOUR_TASKS.length).toBeGreaterThan(10);
  });
  it('labourCost: 8 heads at 4/hr at $125/hr NSW standard = $250', () => {
    const task = LABOUR_TASKS.find((t) => t.id === 'lt_spr_head');
    expect(labourCost(task, 8, { region: 'nsw', access: 'standard' })).toBe(25000); // 25,000 cents
  });
  it('applies region multiplier', () => {
    const task = LABOUR_TASKS.find((t) => t.id === 'lt_spr_head');
    const baseline = labourCost(task, 8, { region: 'nsw', access: 'standard' });
    const wa = labourCost(task, 8, { region: 'wa', access: 'standard' });
    expect(wa).toBeGreaterThan(baseline);
  });
  it('applies access multiplier (high level)', () => {
    const task = LABOUR_TASKS.find((t) => t.id === 'lt_spr_head');
    const baseline = labourCost(task, 8, { region: 'nsw', access: 'standard' });
    const high = labourCost(task, 8, { region: 'nsw', access: 'high_level' });
    expect(high).toBeCloseTo(baseline * 1.35, 0);
  });
  it('on-costs are additive', () => {
    expect(applyOnCosts(1000, 0.35)).toBe(1350);
  });
});
