import { create } from 'zustand';
import { v4 as uuid } from 'uuid';
import { TAKEOFF_OBJECT_TYPES } from '../utils/constants';
import useAuditStore from './useAuditStore';

const useTakeoffStore = create((set, get) => ({
  planSets: [],
  takeoffPackages: [],
  selectedPackageId: null,

  createPlanSet(data) {
    const planSet = {
      id: uuid(),
      projectId: data.projectId,
      name: data.name || 'Plan Set',
      revisions: [],
      createdAt: new Date().toISOString(),
    };

    set((state) => ({
      planSets: [...state.planSets, planSet],
    }));

    return planSet;
  },

  addRevision(planSetId, data) {
    const revision = {
      id: uuid(),
      revisionCode: data.revisionCode || 'A',
      fileName: data.fileName,
      fileSize: data.fileSize || 0,
      uploadedAt: new Date().toISOString(),
      pages: data.pages || 1,
    };

    set((state) => ({
      planSets: state.planSets.map((ps) =>
        ps.id === planSetId
          ? { ...ps, revisions: [...ps.revisions, revision] }
          : ps
      ),
    }));

    return revision;
  },

  createTakeoffPackage(data) {
    const pkg = {
      id: uuid(),
      projectId: data.projectId,
      planSetId: data.planSetId,
      revisionId: data.revisionId,
      name: data.name || 'Takeoff Package',
      scale: data.scale || null,
      calibrated: false,
      layers: [],
      objects: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    set((state) => ({
      takeoffPackages: [...state.takeoffPackages, pkg],
    }));

    return pkg;
  },

  setCalibration(packageId, scale) {
    set((state) => ({
      takeoffPackages: state.takeoffPackages.map((pkg) =>
        pkg.id === packageId
          ? { ...pkg, scale, calibrated: true, updatedAt: new Date().toISOString() }
          : pkg
      ),
    }));
  },

  addLayer(packageId, data) {
    const layer = {
      id: uuid(),
      name: data.name,
      color: data.color || '#3B82F6',
      visible: true,
      trade: data.trade || '',
      system: data.system || '',
      floor: data.floor || '',
    };

    set((state) => ({
      takeoffPackages: state.takeoffPackages.map((pkg) =>
        pkg.id === packageId
          ? { ...pkg, layers: [...pkg.layers, layer], updatedAt: new Date().toISOString() }
          : pkg
      ),
    }));

    return layer;
  },

  toggleLayerVisibility(packageId, layerId) {
    set((state) => ({
      takeoffPackages: state.takeoffPackages.map((pkg) =>
        pkg.id === packageId
          ? {
              ...pkg,
              layers: pkg.layers.map((l) =>
                l.id === layerId ? { ...l, visible: !l.visible } : l
              ),
            }
          : pkg
      ),
    }));
  },

  addObject(packageId, data) {
    const obj = {
      id: uuid(),
      type: data.type || TAKEOFF_OBJECT_TYPES.COUNT,
      layerId: data.layerId,
      label: data.label || '',
      quantity: data.quantity || (data.type === TAKEOFF_OBJECT_TYPES.COUNT ? 1 : 0),
      unit: data.unit || 'ea',
      zone: data.zone || '',
      floor: data.floor || '',
      system: data.system || '',
      loop: data.loop || '',
      hazardArea: data.hazardArea || '',
      points: data.points || [],
      tags: data.tags || [],
      itemId: data.itemId || null,
      assemblyId: data.assemblyId || null,
      createdAt: new Date().toISOString(),
    };

    set((state) => ({
      takeoffPackages: state.takeoffPackages.map((pkg) =>
        pkg.id === packageId
          ? { ...pkg, objects: [...pkg.objects, obj], updatedAt: new Date().toISOString() }
          : pkg
      ),
    }));

    useAuditStore.getState().log('takeoff_object_created', {
      entityType: 'takeoff_object',
      entityId: obj.id,
      description: `Added ${obj.type} object: ${obj.label || 'unnamed'} (${obj.quantity} ${obj.unit})`,
    });

    return obj;
  },

  updateObject(packageId, objectId, updates) {
    set((state) => ({
      takeoffPackages: state.takeoffPackages.map((pkg) =>
        pkg.id === packageId
          ? {
              ...pkg,
              objects: pkg.objects.map((o) =>
                o.id === objectId ? { ...o, ...updates } : o
              ),
              updatedAt: new Date().toISOString(),
            }
          : pkg
      ),
    }));
  },

  deleteObject(packageId, objectId) {
    set((state) => ({
      takeoffPackages: state.takeoffPackages.map((pkg) =>
        pkg.id === packageId
          ? {
              ...pkg,
              objects: pkg.objects.filter((o) => o.id !== objectId),
              updatedAt: new Date().toISOString(),
            }
          : pkg
      ),
    }));
  },

  getPackagesByProject(projectId) {
    return get().takeoffPackages.filter((p) => p.projectId === projectId);
  },

  getPlanSetsByProject(projectId) {
    return get().planSets.filter((ps) => ps.projectId === projectId);
  },

  getObjectsByLayer(packageId, layerId) {
    const pkg = get().takeoffPackages.find((p) => p.id === packageId);
    if (!pkg) return [];
    return pkg.objects.filter((o) => o.layerId === layerId);
  },

  getTakeoffSummary(packageId) {
    const pkg = get().takeoffPackages.find((p) => p.id === packageId);
    if (!pkg) return { counts: 0, linear: 0, area: 0, objects: 0 };

    const objects = pkg.objects;
    return {
      counts: objects.filter((o) => o.type === TAKEOFF_OBJECT_TYPES.COUNT).reduce((s, o) => s + o.quantity, 0),
      linear: objects.filter((o) => o.type === TAKEOFF_OBJECT_TYPES.LINEAR).reduce((s, o) => s + o.quantity, 0),
      area: objects.filter((o) => o.type === TAKEOFF_OBJECT_TYPES.AREA).reduce((s, o) => s + o.quantity, 0),
      objectCount: objects.length,
    };
  },

  selectPackage(id) {
    set({ selectedPackageId: id });
  },
}));

export default useTakeoffStore;
