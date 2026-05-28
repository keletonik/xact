import { create } from 'zustand';
import { v4 as uuid } from 'uuid';
import db, { putBlob } from '../services/db';
import useAuditStore from './useAuditStore';
import { AUDIT_ACTIONS } from '../utils/constants';

const useCertPackStore = create((set, get) => ({
  certPacks: [],
  ready: false,

  async hydrate() {
    const certPacks = await db.certPacks.toArray();
    certPacks.sort((a, b) => (b.generatedAt || '').localeCompare(a.generatedAt || ''));
    set({ certPacks, ready: true });
  },

  forProject(projectId) {
    return get().certPacks.filter((c) => c.projectId === projectId);
  },

  async record({ projectId, type, blob, assetIds, signatories = [] }) {
    const blobHash = await putBlob(blob);
    const record = {
      id: uuid(),
      projectId,
      type,
      generatedAt: new Date().toISOString(),
      blobHash,
      sizeBytes: blob.size,
      assetIds: assetIds || [],
      signatories,
    };
    await db.certPacks.put(record);
    set((s) => ({ certPacks: [record, ...s.certPacks] }));
    useAuditStore.getState().log(AUDIT_ACTIONS.CERT_PACK_GENERATED, {
      entityType: 'cert_pack', entityId: record.id,
      description: `Generated ${type} cert pack for project ${projectId.slice(0, 8)}`,
    });
    return record;
  },

  async deletePack(id) {
    await db.certPacks.delete(id);
    set((s) => ({ certPacks: s.certPacks.filter((c) => c.id !== id) }));
  },
}));

export default useCertPackStore;
