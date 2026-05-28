import { describe, it, expect, beforeEach } from 'vitest';
import 'fake-indexeddb/auto';
import db, { resetDB } from '../services/db';
import useProjectStore from './useProjectStore';
import useAssetStore, { autoTag } from './useAssetStore';
import { ASSET_TYPES, ASSET_STATUSES, SUBSTRATES } from '../utils/constants';

beforeEach(async () => {
  await resetDB();
  useProjectStore.setState({ projects: [], selectedId: null, ready: false });
  useAssetStore.setState({ assets: [], specialisations: {}, ready: false });
});

async function seedProject() {
  return useProjectStore.getState().createProject({ name: 'Test tower' });
}

describe('autoTag', () => {
  it('numbers per project per asset-type, padded to three digits', () => {
    const existing = [
      { projectId: 'p1', assetType: ASSET_TYPES.PENETRATION },
      { projectId: 'p1', assetType: ASSET_TYPES.PENETRATION },
      { projectId: 'p1', assetType: ASSET_TYPES.FIRE_DOOR },
      { projectId: 'p2', assetType: ASSET_TYPES.PENETRATION },
    ];
    expect(autoTag(existing, 'p1', ASSET_TYPES.PENETRATION)).toBe('PEN-003');
    expect(autoTag(existing, 'p1', ASSET_TYPES.FIRE_DOOR)).toBe('DOR-002');
    expect(autoTag(existing, 'p2', ASSET_TYPES.PENETRATION)).toBe('PEN-002');
    expect(autoTag([],       'p3', ASSET_TYPES.FIRE_DAMPER)).toBe('DMP-001');
  });
});

describe('useAssetStore CRUD', () => {
  it('creates a penetration with its specialisation atomically', async () => {
    const project = await seedProject();
    const asset = await useAssetStore.getState().createAsset({
      asset: {
        projectId: project.id,
        assetType: ASSET_TYPES.PENETRATION,
        substrate: SUBSTRATES.CONCRETE_SLAB,
        requiredFrl: '-/120/120',
      },
      specialisation: {
        servicesPassing: [{ type: 'pvc_pipe', size: '100', qty: 1 }],
        openingSize: 150,
        sealantDepth: 25,
        backingMaterial: 'mineral wool',
      },
    });

    const fromDb = await db.assets.get(asset.id);
    const pen = await db.penetrations.get(asset.id);
    expect(fromDb.tag).toBe('PEN-001');
    expect(pen.openingSize).toBe(150);
    expect(useAssetStore.getState().specialisations[asset.id].penetration.openingSize).toBe(150);
  });

  it('hydrate restores assets and their specialisations from dexie', async () => {
    const project = await seedProject();
    await useAssetStore.getState().createAsset({
      asset: { projectId: project.id, assetType: ASSET_TYPES.FIRE_DOOR },
      specialisation: { doorSetId: 'D-01', leafCount: 1, hingeCount: 3, intumescentSealsOk: true },
    });

    useAssetStore.setState({ assets: [], specialisations: {}, ready: false });
    await useAssetStore.getState().hydrate();

    const { assets, specialisations } = useAssetStore.getState();
    expect(assets).toHaveLength(1);
    expect(specialisations[assets[0].id].fireDoor.doorSetId).toBe('D-01');
  });

  it('deleting an asset removes the asset row, specialisation row, and photos', async () => {
    const project = await seedProject();
    const asset = await useAssetStore.getState().createAsset({
      asset: { projectId: project.id, assetType: ASSET_TYPES.PENETRATION },
      specialisation: { servicesPassing: [], openingSize: 100, sealantDepth: 20, backingMaterial: '' },
    });
    await db.photos.put({
      id: 'photo-1', assetId: asset.id, stage: 'post_install',
      blobHash: 'fakehash', takenAt: new Date().toISOString(),
    });

    await useAssetStore.getState().deleteAsset(asset.id);

    expect(await db.assets.get(asset.id)).toBeUndefined();
    expect(await db.penetrations.get(asset.id)).toBeUndefined();
    expect(await db.photos.where('assetId').equals(asset.id).count()).toBe(0);
    expect(useAssetStore.getState().assets.find((a) => a.id === asset.id)).toBeUndefined();
  });

  it('updating an asset keeps the tag and bumps updatedAt', async () => {
    const project = await seedProject();
    const created = await useAssetStore.getState().createAsset({
      asset: { projectId: project.id, assetType: ASSET_TYPES.PENETRATION, status: ASSET_STATUSES.PLANNED },
    });

    const updated = await useAssetStore.getState().updateAsset(created.id, {
      asset: { status: ASSET_STATUSES.INSTALLED, achievedFrl: '-/120/120' },
    });

    expect(updated.tag).toBe(created.tag);
    expect(updated.status).toBe(ASSET_STATUSES.INSTALLED);
    expect(updated.achievedFrl).toBe('-/120/120');
    expect(updated.updatedAt >= created.updatedAt).toBe(true);
  });

  it('drawing + locationOnPlan survive a create / hydrate roundtrip (pin overlay)', async () => {
    const project = await seedProject();
    const created = await useAssetStore.getState().createAsset({
      asset: {
        projectId: project.id,
        assetType: ASSET_TYPES.PENETRATION,
        drawingId: 'drawing-xyz',
        locationOnPlan: { x: 123.4, y: 567.8 },
      },
    });

    // Rehydrate from dexie to confirm the persistence path.
    useAssetStore.setState({ assets: [], specialisations: {}, ready: false });
    await useAssetStore.getState().hydrate();

    const reloaded = useAssetStore.getState().assets.find((a) => a.id === created.id);
    expect(reloaded.drawingId).toBe('drawing-xyz');
    expect(reloaded.locationOnPlan).toEqual({ x: 123.4, y: 567.8 });

    // Filter behaviour used by the pin layer.
    const pinsForDrawing = useAssetStore.getState().forDrawing('drawing-xyz');
    expect(pinsForDrawing).toHaveLength(1);
    expect(useAssetStore.getState().forDrawing('different-drawing')).toHaveLength(0);
  });
});
