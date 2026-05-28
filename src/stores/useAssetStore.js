import { create } from 'zustand';
import { v4 as uuid } from 'uuid';
import db from '../services/db';
import useAuditStore from './useAuditStore';
import { ASSET_STATUSES, ASSET_TYPES, AUDIT_ACTIONS } from '../utils/constants';

/**
 * Asset CRUD plus the per-type specialisation rows (penetrations,
 * fireDoors, fireDampers). Every write is one Dexie transaction so the
 * head row and its specialisation never desynchronise.
 */
const useAssetStore = create((set, get) => ({
  assets: [],
  specialisations: {},   // assetId -> { penetration?, fireDoor?, fireDamper? }
  ready: false,

  async hydrate() {
    const [assets, pens, doors, dampers] = await Promise.all([
      db.assets.toArray(),
      db.penetrations.toArray(),
      db.fireDoors.toArray(),
      db.fireDampers.toArray(),
    ]);
    const specialisations = {};
    for (const p of pens)    (specialisations[p.assetId] ??= {}).penetration = p;
    for (const d of doors)   (specialisations[d.assetId] ??= {}).fireDoor    = d;
    for (const d of dampers) (specialisations[d.assetId] ??= {}).fireDamper  = d;
    set({ assets, specialisations, ready: true });
  },

  forProject(projectId) {
    return get().assets.filter((a) => a.projectId === projectId);
  },

  forDrawing(drawingId) {
    return get().assets.filter((a) => a.drawingId === drawingId);
  },

  getSpecialisation(assetId) {
    return get().specialisations[assetId] || {};
  },

  async createAsset({ asset: assetInput, specialisation = null }) {
    const now = new Date().toISOString();
    const project = await db.projects.get(assetInput.projectId);
    if (!project) throw new Error(`Project ${assetInput.projectId} not found`);
    const asset = {
      id: assetInput.id || uuid(),
      projectId: assetInput.projectId,
      drawingId: assetInput.drawingId || null,
      locationOnPlan: assetInput.locationOnPlan || null,
      tag: assetInput.tag || autoTag(get().assets, assetInput.projectId, assetInput.assetType),
      assetType: assetInput.assetType || ASSET_TYPES.PENETRATION,
      substrate: assetInput.substrate || null,
      requiredFrl: assetInput.requiredFrl || '',
      achievedFrl: assetInput.achievedFrl || '',
      testedSystemId: assetInput.testedSystemId || null,
      installDate: assetInput.installDate || null,
      installerId: assetInput.installerId || null,
      supervisorSignoffId: assetInput.supervisorSignoffId || null,
      status: assetInput.status || ASSET_STATUSES.PLANNED,
      notes: assetInput.notes || '',
      createdAt: now,
      updatedAt: now,
    };

    await db.transaction('rw', db.assets, db.penetrations, db.fireDoors, db.fireDampers, async () => {
      await db.assets.put(asset);
      if (specialisation) await putSpecialisation(asset, specialisation);
    });

    set((s) => {
      const specs = { ...s.specialisations };
      if (specialisation) {
        const key = specKey(asset.assetType);
        specs[asset.id] = { ...(specs[asset.id] || {}), [key]: { assetId: asset.id, ...specialisation } };
      }
      return { assets: [...s.assets, asset], specialisations: specs };
    });

    useAuditStore.getState().log(AUDIT_ACTIONS.ASSET_CREATED, {
      entityType: 'asset', entityId: asset.id,
      description: `Created asset ${asset.tag} (${asset.assetType})`,
    });
    return asset;
  },

  async updateAsset(id, { asset: assetPatch = {}, specialisation = null }) {
    const current = await db.assets.get(id);
    if (!current) return null;
    const next = { ...current, ...assetPatch, updatedAt: new Date().toISOString() };

    await db.transaction('rw', db.assets, db.penetrations, db.fireDoors, db.fireDampers, async () => {
      await db.assets.put(next);
      if (specialisation) await putSpecialisation(next, specialisation);
    });

    set((s) => {
      const specs = { ...s.specialisations };
      if (specialisation) {
        const key = specKey(next.assetType);
        specs[id] = { ...(specs[id] || {}), [key]: { assetId: id, ...specialisation } };
      }
      return {
        assets: s.assets.map((a) => (a.id === id ? next : a)),
        specialisations: specs,
      };
    });

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
      const { [id]: _gone, ...rest } = s.specialisations;
      return {
        assets: s.assets.filter((a) => a.id !== id),
        specialisations: rest,
      };
    });
  },
}));

async function putSpecialisation(asset, specialisation) {
  const row = { assetId: asset.id, ...specialisation };
  switch (asset.assetType) {
    case ASSET_TYPES.PENETRATION:  await db.penetrations.put(row); return;
    case ASSET_TYPES.FIRE_DOOR:    await db.fireDoors.put(row);    return;
    case ASSET_TYPES.FIRE_DAMPER:  await db.fireDampers.put(row);  return;
    default: return; // smoke seal, joint seal, coating, shutter have no extra row yet
  }
}

function specKey(assetType) {
  switch (assetType) {
    case ASSET_TYPES.PENETRATION:  return 'penetration';
    case ASSET_TYPES.FIRE_DOOR:    return 'fireDoor';
    case ASSET_TYPES.FIRE_DAMPER:  return 'fireDamper';
    default: return 'unknown';
  }
}

const TYPE_PREFIX = {
  [ASSET_TYPES.PENETRATION]:        'PEN',
  [ASSET_TYPES.FIRE_DOOR]:          'DOR',
  [ASSET_TYPES.FIRE_DAMPER]:        'DMP',
  [ASSET_TYPES.FIRE_SHUTTER]:       'SHU',
  [ASSET_TYPES.JOINT_SEAL]:         'JNT',
  [ASSET_TYPES.STRUCTURAL_COATING]: 'COT',
  [ASSET_TYPES.SMOKE_SEAL]:         'SMK',
};

export function autoTag(allAssets, projectId, assetType) {
  const prefix = TYPE_PREFIX[assetType] || 'AST';
  const peers = allAssets.filter((a) => a.projectId === projectId && a.assetType === assetType);
  return `${prefix}-${String(peers.length + 1).padStart(3, '0')}`;
}

export default useAssetStore;
