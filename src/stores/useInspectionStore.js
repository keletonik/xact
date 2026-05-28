import { create } from 'zustand';
import { v4 as uuid } from 'uuid';
import db from '../services/db';
import useAuditStore from './useAuditStore';
import useDefectStore from './useDefectStore';
import {
  AUDIT_ACTIONS, INSPECTION_FREQUENCIES, ASSET_STATUSES,
} from '../utils/constants';

/**
 * AS 1851 inspection lifecycle.
 *
 * Inspection statuses: scheduled → in_progress → completed.
 * One Inspection contains many InspectionResult rows (one per asset
 * walked). A FAIL result raises a Defect by side-effect through
 * useDefectStore so the defect register stays the canonical source
 * of truth on rectification work.
 *
 * Inspection results carry no `passed_on` timestamp because they are
 * captured at completion time; rely on inspection.performedDate.
 */
const useInspectionStore = create((set, get) => ({
  inspections: [],
  resultsByInspection: {}, // inspectionId -> InspectionResult[]
  ready: false,

  async hydrate() {
    const [inspections, results] = await Promise.all([
      db.inspections.toArray(),
      db.inspectionResults.toArray(),
    ]);
    inspections.sort((a, b) => (b.scheduledDate || '').localeCompare(a.scheduledDate || ''));
    const resultsByInspection = {};
    for (const r of results) (resultsByInspection[r.inspectionId] ??= []).push(r);
    set({ inspections, resultsByInspection, ready: true });
  },

  forProject(projectId) {
    return get().inspections.filter((i) => i.projectId === projectId);
  },

  async scheduleInspection(input) {
    const now = new Date().toISOString();
    const inspection = {
      id: input.id || uuid(),
      projectId: input.projectId,
      frequency: input.frequency || INSPECTION_FREQUENCIES.ANNUAL,
      scheduledDate: input.scheduledDate || null,
      performedDate: null,
      performedById: null,
      status: 'scheduled',
      notes: input.notes || '',
      createdAt: now,
      updatedAt: now,
    };
    await db.inspections.put(inspection);
    set((s) => ({ inspections: [inspection, ...s.inspections] }));
    return inspection;
  },

  /**
   * Atomically: persist the inspection (status=completed, performedDate),
   * write every result row, raise a Defect for every FAIL.
   */
  async completeInspection(inspectionId, { performedDate, performedById, notes = '', results }) {
    const inspection = await db.inspections.get(inspectionId);
    if (!inspection) throw new Error(`Inspection ${inspectionId} not found`);

    const now = new Date().toISOString();
    const nextInspection = {
      ...inspection,
      performedDate: performedDate || now,
      performedById: performedById || null,
      status: 'completed',
      notes,
      updatedAt: now,
    };

    const resultRows = results.map((r) => ({
      id: r.id || uuid(),
      inspectionId,
      assetId: r.assetId,
      result: r.result,
      defectClass: r.result === 'fail' ? (r.defectClass || 'B') : null,
      notes: r.notes || '',
      photoId: r.photoId || null,
      capturedAt: now,
    }));

    await db.transaction('rw', db.inspections, db.inspectionResults, db.assets, async () => {
      await db.inspections.put(nextInspection);
      for (const row of resultRows) await db.inspectionResults.put(row);
      for (const row of resultRows) {
        const asset = await db.assets.get(row.assetId);
        if (!asset) continue;
        const nextStatus = row.result === 'fail'
          ? ASSET_STATUSES.NONCONFORMANCE
          : (asset.status === ASSET_STATUSES.NONCONFORMANCE ? ASSET_STATUSES.INSTALLED : asset.status);
        if (nextStatus !== asset.status) {
          await db.assets.put({ ...asset, status: nextStatus, updatedAt: now });
        }
      }
    });

    // Raise defects for every FAIL via the defect store so the register
    // gets the audit log entries and timeline.
    for (const row of resultRows.filter((r) => r.result === 'fail')) {
      await useDefectStore.getState().raiseDefect({
        assetId: row.assetId,
        inspectionResultId: row.id,
        severity: row.defectClass,
        description: row.notes || 'Failed AS 1851 inspection',
        rectificationDueDate: deriveDueDate(row.defectClass, nextInspection.performedDate),
      });
    }

    set((s) => ({
      inspections: s.inspections.map((i) => (i.id === inspectionId ? nextInspection : i)),
      resultsByInspection: { ...s.resultsByInspection, [inspectionId]: resultRows },
    }));

    useAuditStore.getState().log(AUDIT_ACTIONS.INSPECTION_PERFORMED, {
      entityType: 'inspection', entityId: inspectionId,
      description: `Completed ${nextInspection.frequency} inspection, ${resultRows.filter((r) => r.result === 'fail').length} fail / ${resultRows.length} total`,
    });

    return nextInspection;
  },

  async cancelInspection(inspectionId) {
    await db.inspections.delete(inspectionId);
    await db.inspectionResults.where('inspectionId').equals(inspectionId).delete();
    set((s) => {
      const { [inspectionId]: _gone, ...rest } = s.resultsByInspection;
      return {
        inspections: s.inspections.filter((i) => i.id !== inspectionId),
        resultsByInspection: rest,
      };
    });
  },

  resultsFor(inspectionId) {
    return get().resultsByInspection[inspectionId] || [];
  },
}));

/**
 * AS 1851 defect class default rectification windows.
 * Class A (immediate / safety critical): same-day rectification target.
 * Class B (programmed): 30 calendar days from inspection date.
 * Class C (observation): 90 days; effectively next service cycle.
 *
 * These are typical industry defaults rather than literal standard
 * mandates; the Settings page lets the user override per company.
 */
export function deriveDueDate(defectClass, fromDateIso) {
  if (!fromDateIso) return null;
  const days = defectClass === 'A' ? 1 : defectClass === 'B' ? 30 : 90;
  const base = new Date(fromDateIso);
  base.setDate(base.getDate() + days);
  return base.toISOString().slice(0, 10);
}

export default useInspectionStore;
