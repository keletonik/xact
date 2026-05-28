import { create } from 'zustand';
import { v4 as uuid } from 'uuid';
import db from '../services/db';
import useAuditStore from './useAuditStore';
import { ASSET_STATUSES, ASSET_TYPES, AUDIT_ACTIONS } from '../utils/constants';

const useAssetStore = create((set, get) => ({
  assets: [],
  byId: {},
  ready: false,

  async hydrate() {
    const assets = await db.assets.toArray();
    const byId = Object.fromEntries(assets.map((a) => [a.id, a]));
    set({ assets, byId, ready: true });
  },

  forProject(projectId) {
    return get().assets.filter((a) => a.projectId === projectId);
  },

  forDrawing(drawingId) {
    return get().assets.filter((a) => a.drawingId === drawingId);
  },

  async createAsset(input) {
    const now = new Date().toISOString();
    const project = await db.projects.get(input.projectId);
    if (!project) throw new Error(`Project ${input.projectId} not found`);
    const asset = {
      id: input.id || uuid(),
      projectId: input.projectId,
      drawingId: input.drawingId || null,
      locationOnPlan: input.locationOnPlan || null,
      tag: input.tag || autoTag(project.code, get().assets, input.projectId, input.assetType),
      assetType: input.assetType || ASSET_TYPES.PENETRATION,
      substrate: input.substrate || null,
      requiredFrl: input.requiredFrl || '',
      achievedFrl: input.achievedFrl || '',
      testedSystemId: input.testedSystemId || null,
      installDate: input.installDate || null,
      installerId: input.installerId || null,
      supervisorSignoffId: input.supervisorSignoffId || null,
      status: input.status || ASSET_STATUSES.PLANNED,
      notes: input.notes || '',
      createdAt: now,
      updatedAt: now,
    };
    await db.assets.put(asset);
    set((s) => ({
      assets: [...s.assets, asset],
      byId: { ...s.byId, [asset.id]: asset },
    }));
    useAuditStore.getState().log(AUDIT_ACTIONS.ASSET_CREATED, {
      entityType: 'asset', entityId: asset.id,
      description: `Created asset ${asset.tag}`,
    });
    return asset;
  },

  async updateAsset(id, patch) {
    const current = await db.assets.get(id);
    if (!current) return null;
    const next = { ...current, ...patch, updatedAt: new Date().toISOString() };
    await db.assets.put(next);
    set((s) => ({
      assets: s.assets.map((a) => (a.id === id ? next : a)),
      byId: { ...s.byId, [id]: next },
    }));
    useAuditStore.getState().log(AUDIT_ACTIONS.ASSET_UPDATED, {
      entityType: 'asset', entityId: id,
      description: `Updated asset ${next.tag}`,
    });
    return next;
  },

  async deleteAsset(id) {
    await db.transaction('rw', db.assets, db.penetrations, db.fireDoors, db.fireDampers, db.photos, async () => {
      await db.assets.delete(id);
      await db.penetrations.delete(id);
      await db.fireDoors.delete(id);
      await db.fireDampers.delete(id);
      await db.photos.where('assetId').equals(id).delete();
    });
    set((s) => {
      const { [id]: _gone, ...rest } = s.byId;
      return { assets: s.assets.filter((a) => a.id !== id), byId: rest };
    });
  },
}));

const TYPE_PREFIX = {
  [ASSET_TYPES.PENETRATION]:        'PEN',
  [ASSET_TYPES.FIRE_DOOR]:          'DOR',
  [ASSET_TYPES.FIRE_DAMPER]:        'DMP',
  [ASSET_TYPES.FIRE_SHUTTER]:       'SHU',
  [ASSET_TYPES.JOINT_SEAL]:         'JNT',
  [ASSET_TYPES.STRUCTURAL_COATING]: 'COT',
  [ASSET_TYPES.SMOKE_SEAL]:         'SMK',
};

function autoTag(projectCode, allAssets, projectId, assetType) {
  const prefix = TYPE_PREFIX[assetType] || 'AST';
  const peers = allAssets.filter((a) => a.projectId === projectId && a.assetType === assetType);
  const next = peers.length + 1;
  return `${prefix}-${String(next).padStart(3, '0')}`;
}

export default useAssetStore;
