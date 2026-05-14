import { describe, expect, it } from 'vitest';
import { buildWorkOrdersFromSchedule, completeWorkOrder, defectToEstimateDraft } from './workOrderEngine';

const baseAsset = {
  id: 'a1',
  projectId: 'p1',
  type: 'extinguisher',
  status: 'active',
  installDate: '2025-01-01T00:00:00.000Z',
  lastInspectedAt: null,
};

describe('workOrderEngine', () => {
  it('generates draft work orders for an active asset', () => {
    const drafts = buildWorkOrdersFromSchedule([baseAsset], [], '2025-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z');
    expect(drafts.length).toBeGreaterThan(0);
    expect(drafts.every((d) => d.status === 'open')).toBe(true);
    expect(drafts.every((d) => d.generatedFromAssetId === 'a1')).toBe(true);
  });

  it('skips retired assets', () => {
    const drafts = buildWorkOrdersFromSchedule([{ ...baseAsset, status: 'retired' }], [], '2025-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z');
    expect(drafts).toEqual([]);
  });

  it('does not duplicate already-scheduled WOs', () => {
    const first = buildWorkOrdersFromSchedule([baseAsset], [], '2025-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z');
    const second = buildWorkOrdersFromSchedule([baseAsset], first, '2025-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z');
    expect(second).toEqual([]);
  });

  it('completeWorkOrder updates the asset lastInspectedAt', () => {
    const wo = { id: 'w1', status: 'open', generatedFromAssetId: 'a1', scheduledFor: '2025-07-01T00:00:00.000Z' };
    const { workOrder, asset } = completeWorkOrder(wo, baseAsset);
    expect(workOrder.status).toBe('completed');
    expect(workOrder.completedAt).toBeTruthy();
    expect(asset.lastInspectedAt).toBe(workOrder.completedAt);
  });

  it('defectToEstimateDraft preserves trace fields', () => {
    const draft = defectToEstimateDraft({
      description: 'Cylinder corroded',
      productId: 'p1', quantity: 2, foundAt: '2025-05-01T00:00:00.000Z', workOrderId: 'wo123',
    });
    expect(draft.description).toBe('Cylinder corroded');
    expect(draft.sourceWorkOrderId).toBe('wo123');
  });
});
