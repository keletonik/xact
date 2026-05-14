import { v4 as uuid } from 'uuid';
import { dueInspectionsFor } from './schedules';

/**
 * Convert a list of inspection-due events into draft work orders. Dedupe by
 * (assetId, scheduledFor, frequency) so we never create duplicate scheduled WOs.
 */
export function buildWorkOrdersFromSchedule(assets, existingWorkOrders, windowStartIso, windowEndIso) {
  const existingKey = new Set(
    existingWorkOrders
      .filter((wo) => wo.type === 'scheduled' && wo.generatedFromAssetId)
      .map((wo) => keyFor(wo.generatedFromAssetId, wo.scheduledFor, wo.frequency)),
  );
  const draftWOs = [];
  for (const asset of assets) {
    if (asset.status !== 'active') continue;
    const due = dueInspectionsFor(asset, windowStartIso, windowEndIso);
    for (const d of due) {
      const k = keyFor(d.assetId, d.scheduledFor, d.frequency);
      if (existingKey.has(k)) continue;
      draftWOs.push({
        id: uuid(),
        projectId: asset.projectId,
        type: 'scheduled',
        scope: d.task,
        status: 'open',
        scheduledFor: d.scheduledFor,
        frequency: d.frequency,
        generatedFromAssetId: asset.id,
        labourTaskId: d.labourTaskId,
        checklistResults: [],
        partsUsed: [],
        labourMinutes: 0,
        notes: '',
        createdAt: new Date().toISOString(),
      });
    }
  }
  return draftWOs;
}

function keyFor(assetId, scheduledFor, frequency) {
  return `${assetId}::${scheduledFor}::${frequency || ''}`;
}

/**
 * Mark a work order complete; recompute nextInspectionDue on the asset.
 */
export function completeWorkOrder(workOrder, asset) {
  const completedAt = new Date().toISOString();
  const updatedWO = {
    ...workOrder,
    status: 'completed',
    completedAt,
  };
  const updatedAsset = asset
    ? {
        ...asset,
        lastInspectedAt: completedAt,
      }
    : null;
  return { workOrder: updatedWO, asset: updatedAsset };
}

/**
 * Convert a defect raised during a service visit into an estimate line draft
 * (caller wires it to the estimates store).
 */
export function defectToEstimateDraft(defect) {
  return {
    description: defect.description,
    productId: defect.productId ?? null,
    quantity: defect.quantity ?? 1,
    notes: `Raised from work order ${defect.workOrderId} on ${defect.foundAt}`,
    sourceWorkOrderId: defect.workOrderId,
  };
}
