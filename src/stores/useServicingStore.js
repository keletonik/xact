import { create } from 'zustand';
import { v4 as uuid } from 'uuid';
import { addYears } from 'date-fns';
import db from '../services/db';
import { buildWorkOrdersFromSchedule, completeWorkOrder } from '../servicing/workOrderEngine';

const useServicingStore = create((set, get) => ({
  sites: [],
  serviceAssets: [],
  workOrders: [],
  inspectionLogs: [],
  ready: false,

  async hydrate() {
    const [sites, serviceAssets, workOrders, inspectionLogs] = await Promise.all([
      db.sites.toArray(),
      db.serviceAssets.toArray(),
      db.workOrders.toArray(),
      db.inspectionLogs.toArray(),
    ]);
    set({ sites, serviceAssets, workOrders, inspectionLogs, ready: true });
  },

  async addSite(input) {
    const site = {
      id: input.id || uuid(),
      customerId: input.customerId || null,
      projectId: input.projectId || null,
      name: input.name,
      address: input.address || '',
      gpsLat: input.gpsLat || null,
      gpsLng: input.gpsLng || null,
      notes: input.notes || '',
      createdAt: new Date().toISOString(),
    };
    await db.sites.put(site);
    set((s) => ({ sites: [...s.sites, site] }));
    return site;
  },

  async addAsset(input) {
    const asset = {
      id: input.id || uuid(),
      projectId: input.projectId,
      siteId: input.siteId,
      type: input.type,
      location: input.location || '',
      locationMm: input.locationMm || null,
      manufacturer: input.manufacturer || '',
      model: input.model || '',
      serial: input.serial || '',
      installDate: input.installDate || new Date().toISOString(),
      warrantyExpiry: input.warrantyExpiry || null,
      status: input.status || 'active',
      inspectionSchedule: input.inspectionSchedule || 'as1851_default',
      lastInspectedAt: input.lastInspectedAt || null,
      nextInspectionDue: input.nextInspectionDue || null,
    };
    await db.serviceAssets.put(asset);
    set((s) => ({ serviceAssets: [...s.serviceAssets, asset] }));
    return asset;
  },

  async updateAsset(id, patch) {
    const existing = get().serviceAssets.find((a) => a.id === id);
    if (!existing) throw new Error('Asset not found');
    const updated = { ...existing, ...patch };
    await db.serviceAssets.put(updated);
    set((s) => ({ serviceAssets: s.serviceAssets.map((a) => (a.id === id ? updated : a)) }));
  },

  async retireAsset(id) {
    return get().updateAsset(id, { status: 'retired' });
  },

  /** Generate scheduled work orders for the next N months. */
  async generateScheduledWorkOrders(monthsAhead = 12) {
    const start = new Date().toISOString();
    const end = addYears(new Date(), monthsAhead / 12).toISOString();
    const drafts = buildWorkOrdersFromSchedule(get().serviceAssets, get().workOrders, start, end);
    if (drafts.length === 0) return [];
    await db.workOrders.bulkPut(drafts);
    set((s) => ({ workOrders: [...s.workOrders, ...drafts] }));
    return drafts;
  },

  async addReactiveWorkOrder(input) {
    const wo = {
      id: input.id || uuid(),
      projectId: input.projectId,
      type: input.type || 'reactive',
      scope: input.scope,
      status: 'open',
      scheduledFor: input.scheduledFor || new Date().toISOString(),
      generatedFromAssetId: input.generatedFromAssetId || null,
      generatedFromDefectId: input.generatedFromDefectId || null,
      labourTaskId: input.labourTaskId || null,
      checklistResults: [],
      partsUsed: input.partsUsed || [],
      labourMinutes: 0,
      notes: input.notes || '',
      createdAt: new Date().toISOString(),
    };
    await db.workOrders.put(wo);
    set((s) => ({ workOrders: [...s.workOrders, wo] }));
    return wo;
  },

  async completeWorkOrder(workOrderId, { partsUsed, labourMinutes, notes, defects } = {}) {
    const wo = get().workOrders.find((w) => w.id === workOrderId);
    if (!wo) throw new Error('Work order not found');
    const asset = wo.generatedFromAssetId
      ? get().serviceAssets.find((a) => a.id === wo.generatedFromAssetId)
      : null;
    const { workOrder: updatedWO, asset: updatedAsset } = completeWorkOrder(
      { ...wo, partsUsed: partsUsed ?? wo.partsUsed, labourMinutes: labourMinutes ?? wo.labourMinutes, notes: notes ?? wo.notes },
      asset,
    );
    const log = {
      id: uuid(),
      assetId: updatedAsset?.id || null,
      workOrderId,
      performedAt: updatedWO.completedAt,
      labourMinutes: updatedWO.labourMinutes,
      defects: defects || [],
      partsUsed: updatedWO.partsUsed,
      notes: updatedWO.notes,
    };
    await db.transaction('rw', db.workOrders, db.serviceAssets, db.inspectionLogs, async () => {
      await db.workOrders.put(updatedWO);
      if (updatedAsset) await db.serviceAssets.put(updatedAsset);
      await db.inspectionLogs.put(log);
    });
    set((s) => ({
      workOrders: s.workOrders.map((w) => (w.id === workOrderId ? updatedWO : w)),
      serviceAssets: updatedAsset
        ? s.serviceAssets.map((a) => (a.id === updatedAsset.id ? updatedAsset : a))
        : s.serviceAssets,
      inspectionLogs: [...s.inspectionLogs, log],
    }));
    return { workOrder: updatedWO, asset: updatedAsset, log };
  },
}));

export default useServicingStore;
