import { create } from 'zustand';
import { v4 as uuid } from 'uuid';
import db from '../services/db';
import useAuditStore from './useAuditStore';
import { AUDIT_ACTIONS } from '../utils/constants';

/**
 * Work order: an asset-subset assignment to a crew on a scheduled day.
 * Lifecycle: scheduled → in_progress → completed | cancelled.
 *
 * A work order pins to a specific set of asset IDs at the time of
 * issue. If the asset register changes after the order is issued
 * (asset deleted etc), missing IDs are silently dropped at render
 * time; the work order keeps the original intent intact.
 */
const useWorkOrderStore = create((set, get) => ({
  workOrders: [],
  ready: false,

  async hydrate() {
    const workOrders = await db.workOrders.toArray();
    workOrders.sort((a, b) => (b.scheduledDate || '').localeCompare(a.scheduledDate || ''));
    set({ workOrders, ready: true });
  },

  forProject(projectId) {
    return get().workOrders.filter((w) => w.projectId === projectId);
  },

  async create(input) {
    const now = new Date().toISOString();
    const wo = {
      id: input.id || uuid(),
      projectId: input.projectId,
      crewName: input.crewName || '',
      scheduledDate: input.scheduledDate || null,
      assetIds: input.assetIds || [],
      notes: input.notes || '',
      status: 'scheduled',
      createdAt: now,
      updatedAt: now,
      completedAt: null,
    };
    await db.workOrders.put(wo);
    set((s) => ({ workOrders: [wo, ...s.workOrders] }));
    return wo;
  },

  async update(id, patch) {
    const current = await db.workOrders.get(id);
    if (!current) return null;
    const next = { ...current, ...patch, updatedAt: new Date().toISOString() };
    if (patch.status === 'completed' && !current.completedAt) {
      next.completedAt = new Date().toISOString();
    }
    await db.workOrders.put(next);
    set((s) => ({ workOrders: s.workOrders.map((w) => (w.id === id ? next : w)) }));
    return next;
  },

  async cancel(id) {
    await get().update(id, { status: 'cancelled' });
  },

  async remove(id) {
    await db.workOrders.delete(id);
    set((s) => ({ workOrders: s.workOrders.filter((w) => w.id !== id) }));
  },

  /**
   * Worklist for a crew on a given date (across all projects).
   * The caller resolves asset IDs via the asset store, so this returns
   * the raw work orders only.
   */
  worklistFor(crewName, isoDate) {
    return get().workOrders.filter((w) => {
      if (w.status === 'cancelled' || w.status === 'completed') return false;
      if (crewName && w.crewName !== crewName) return false;
      if (isoDate && w.scheduledDate !== isoDate) return false;
      return true;
    });
  },
}));

export default useWorkOrderStore;
