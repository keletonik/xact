import { describe, expect, it } from 'vitest';
import { computePipelineStats } from './useProjectStore';
import { PROJECT_STATUSES } from '../utils/constants';

const proj = (status, value = 0) => ({ id: status + value, status, estimatedValue: value });

describe('computePipelineStats', () => {
  it('returns zeros for an empty pipeline', () => {
    expect(computePipelineStats([])).toEqual({
      leads: 0, opportunities: 0, quoting: 0, quoted: 0,
      won: 0, lost: 0, totalValue: 0, pipelineValue: 0,
    });
  });

  it('counts each status and sums values', () => {
    const projects = [
      proj(PROJECT_STATUSES.LEAD, 100),
      proj(PROJECT_STATUSES.OPPORTUNITY, 200),
      proj(PROJECT_STATUSES.QUOTING, 300),
      proj(PROJECT_STATUSES.QUOTING, 400),
      proj(PROJECT_STATUSES.QUOTED, 500),
      proj(PROJECT_STATUSES.WON, 600),
      proj(PROJECT_STATUSES.LOST, 700),
    ];
    const stats = computePipelineStats(projects);
    expect(stats.leads).toBe(1);
    expect(stats.opportunities).toBe(1);
    expect(stats.quoting).toBe(2);
    expect(stats.quoted).toBe(1);
    expect(stats.won).toBe(1);
    expect(stats.lost).toBe(1);
    expect(stats.totalValue).toBe(2800);
    expect(stats.pipelineValue).toBe(1200); // quoting + quoted only
  });

  it('is referentially stable for the same input array reference', () => {
    // Sanity: it's a pure function. Identity is not preserved across calls,
    // which is exactly why callers MUST useMemo on the projects reference
    // rather than calling this from inside a Zustand selector. If you change
    // computePipelineStats to memoise internally, this expectation should be
    // flipped — and the call sites no longer need useMemo.
    const projects = [proj(PROJECT_STATUSES.LEAD, 1)];
    expect(computePipelineStats(projects)).not.toBe(computePipelineStats(projects));
    expect(computePipelineStats(projects)).toEqual(computePipelineStats(projects));
  });

  it('handles missing estimatedValue defensively', () => {
    const stats = computePipelineStats([{ status: PROJECT_STATUSES.WON }]);
    expect(stats.totalValue).toBe(0);
    expect(stats.won).toBe(1);
  });
});
