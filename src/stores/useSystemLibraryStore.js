import { create } from 'zustand';
import { v4 as uuid } from 'uuid';
import db from '../services/db';
import useAuditStore from './useAuditStore';
import { SYSTEM_LIBRARY_SEED } from '../domain/systemLibrary.seed';
import { searchSystems } from '../domain/passiveFire';
import { AUDIT_ACTIONS } from '../utils/constants';

const useSystemLibraryStore = create((set, get) => ({
  systems: [],
  ready: false,

  async hydrate() {
    let systems = await db.systemLibrary.toArray();
    if (systems.length === 0) {
      const now = new Date().toISOString();
      const seeded = SYSTEM_LIBRARY_SEED.map((s) => ({ ...s, createdAt: now, updatedAt: now }));
      await db.systemLibrary.bulkPut(seeded);
      systems = seeded;
    }
    set({ systems, ready: true });
  },

  async addSystem(input) {
    const now = new Date().toISOString();
    const sys = {
      id: input.id || uuid(),
      manufacturer: input.manufacturer,
      systemName: input.systemName,
      testReportNo: input.testReportNo || '',
      testStandard: input.testStandard,
      testedFrl: input.testedFrl,
      substratesSupported: input.substratesSupported || [],
      servicesSupported: input.servicesSupported || [],
      openingSizeRangeMm: input.openingSizeRangeMm || null,
      notes: input.notes || '',
      detailDrawingBlobHash: input.detailDrawingBlobHash || null,
      certificateBlobHash: input.certificateBlobHash || null,
      createdAt: now,
      updatedAt: now,
    };
    await db.systemLibrary.put(sys);
    set((s) => ({ systems: [...s.systems, sys] }));
    useAuditStore.getState().log(AUDIT_ACTIONS.SYSTEM_LIBRARY_UPDATED, {
      entityType: 'system', entityId: sys.id,
      description: `Added ${sys.manufacturer} ${sys.systemName}`,
    });
    return sys;
  },

  async updateSystem(id, patch) {
    const current = await db.systemLibrary.get(id);
    if (!current) return null;
    const next = { ...current, ...patch, updatedAt: new Date().toISOString() };
    await db.systemLibrary.put(next);
    set((s) => ({ systems: s.systems.map((x) => (x.id === id ? next : x)) }));
    return next;
  },

  async deleteSystem(id) {
    await db.systemLibrary.delete(id);
    set((s) => ({ systems: s.systems.filter((x) => x.id !== id) }));
  },

  search(query) {
    return searchSystems(get().systems, query);
  },
}));

export default useSystemLibraryStore;
