import { create } from 'zustand';
import { v4 as uuid } from 'uuid';
import db from '../services/db';
import useAuditStore from './useAuditStore';
import { AUDIT_ACTIONS, ASSET_STATUSES } from '../utils/constants';

/**
 * Defect register. Defects originate from a failed InspectionResult or
 * an ad-hoc raise (manual entry by a supervisor). Lifecycle:
 *   open → in_progress → rectified → verified
 * An asset transitions out of NONCONFORMANCE when every open defect for
 * that asset is verified.
 */
const useDefectStore = create((set, get) => ({
  defects: [],
  ready: false,

  async hydrate() {
    const defects = await db.defects.toArray();
    defects.sort((a, b) => (b.raisedAt || '').localeCompare(a.raisedAt || ''));
    set({ defects, ready: true });
  },

  forAsset(assetId) {
    return get().defects.filter((d) => d.assetId === assetId);
  },

  forProject(projectId, assetsForProject) {
    const assetIds = new Set(assetsForProject.map((a) => a.id));
    return get().defects.filter((d) => assetIds.has(d.assetId));
  },

  async raiseDefect(input) {
    const now = new Date().toISOString();
    const defect = {
      id: input.id || uuid(),
      assetId: input.assetId,
      inspectionResultId: input.inspectionResultId || null,
      severity: input.severity || 'B',
      description: input.description || '',
      raisedAt: now,
      raisedById: input.raisedById || null,
      rectificationDueDate: input.rectificationDueDate || null,
      rectifiedAt: null,
      rectifiedById: null,
      rectifiedNotes: '',
      verifiedAt: null,
      verifiedById: null,
      status: 'open',
    };
    await db.defects.put(defect);
    set((s) => ({ defects: [defect, ...s.defects] }));
    useAuditStore.getState().log(AUDIT_ACTIONS.DEFECT_RAISED, {
      entityType: 'defect', entityId: defect.id,
      description: `Class ${defect.severity} defect raised on asset ${input.assetId.slice(0, 8)}`,
    });
    return defect;
  },

  async markRectified(defectId, { rectifiedById, rectifiedNotes }) {
    const current = await db.defects.get(defectId);
    if (!current) return null;
    const next = {
      ...current,
      rectifiedAt: new Date().toISOString(),
      rectifiedById: rectifiedById || null,
      rectifiedNotes: rectifiedNotes || '',
      status: 'rectified',
    };
    await db.defects.put(next);
    set((s) => ({ defects: s.defects.map((d) => (d.id === defectId ? next : d)) }));
    useAuditStore.getState().log(AUDIT_ACTIONS.DEFECT_RECTIFIED, {
      entityType: 'defect', entityId: defectId,
      description: `Defect rectified`,
    });
    return next;
  },

  /**
   * Verifying a defect closes it out. When the asset has no more open
   * defects, the asset is moved back to INSTALLED (out of NONCONFORMANCE).
   */
  async verify(defectId, { verifiedById }) {
    const current = await db.defects.get(defectId);
    if (!current) return null;
    const now = new Date().toISOString();
    const next = {
      ...current,
      verifiedAt: now,
      verifiedById: verifiedById || null,
      status: 'verified',
    };

    await db.transaction('rw', db.defects, db.assets, async () => {
      await db.defects.put(next);
      const stillOpen = await db.defects
        .where('assetId').equals(current.assetId)
        .filter((d) => d.id !== defectId && d.status !== 'verified')
        .count();
      if (stillOpen === 0) {
        const asset = await db.assets.get(current.assetId);
        if (asset && asset.status === ASSET_STATUSES.NONCONFORMANCE) {
          await db.assets.put({ ...asset, status: ASSET_STATUSES.INSTALLED, updatedAt: now });
        }
      }
    });

    set((s) => ({ defects: s.defects.map((d) => (d.id === defectId ? next : d)) }));
    return next;
  },

  async deleteDefect(defectId) {
    await db.defects.delete(defectId);
    set((s) => ({ defects: s.defects.filter((d) => d.id !== defectId) }));
  },
}));

export default useDefectStore;
