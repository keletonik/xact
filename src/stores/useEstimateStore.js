import { create } from 'zustand';
import { v4 as uuid } from 'uuid';
import { ESTIMATE_STATUSES, TAX_RATE } from '../utils/constants';
import { computeEstimateTotals, computeLineTotal } from '../engine/markupCalculator';
import { createEstimateSnapshot, diffEstimateVersions } from '../engine/costEngine';
import useAuditStore from './useAuditStore';
import { generateRef } from '../utils/formatters';

const useEstimateStore = create((set, get) => ({
  estimates: [],
  selectedEstimateId: null,

  createEstimate(data) {
    const count = get().estimates.length;
    const estimate = {
      id: uuid(),
      ref: generateRef('EST', count + 1),
      projectId: data.projectId,
      name: data.name || 'New Estimate',
      status: ESTIMATE_STATUSES.DRAFT,
      lines: [],
      markups: {
        overhead: data.overhead || 0.10,
        profit: data.profit || 0.08,
        contingency: data.contingency || 0.05,
        risk: data.risk || 0.02,
      },
      taxRate: TAX_RATE,
      totals: {
        breakdown: { material: 0, labour: 0, plant: 0, subcontract: 0, permit: 0, preliminary: 0 },
        directCost: 0,
        markups: {
          overhead: { rate: 0.10, amount: 0 },
          profit: { rate: 0.08, amount: 0 },
          contingency: { rate: 0.05, amount: 0 },
          risk: { rate: 0.02, amount: 0 },
        },
        subtotalExTax: 0,
        taxRate: TAX_RATE,
        taxAmount: 0,
        totalIncTax: 0,
        effectiveMargin: 0,
        lineCount: 0,
      },
      versions: [],
      notes: data.notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    set((state) => ({
      estimates: [...state.estimates, estimate],
    }));

    useAuditStore.getState().log('estimate_created', {
      entityType: 'estimate',
      entityId: estimate.id,
      projectId: data.projectId,
      estimateId: estimate.id,
      description: `Created estimate "${estimate.ref} - ${estimate.name}"`,
    });

    return estimate;
  },

  addLine(estimateId, lineData) {
    const line = {
      id: uuid(),
      itemId: lineData.itemId || '',
      itemName: lineData.itemName || lineData.description || '',
      description: lineData.description || lineData.itemName || '',
      category: lineData.category || 'material',
      unit: lineData.unit || 'ea',
      quantity: lineData.quantity || 0,
      unitRate: lineData.unitRate || 0,
      total: computeLineTotal(lineData.quantity || 0, lineData.unitRate || 0),
      assemblyId: lineData.assemblyId || null,
      assemblyName: lineData.assemblyName || null,
      takeoffObjectId: lineData.takeoffObjectId || null,
      zone: lineData.zone || '',
      floor: lineData.floor || '',
      system: lineData.system || '',
      sortOrder: lineData.sortOrder || 0,
    };

    set((state) => {
      const estimates = state.estimates.map((est) => {
        if (est.id !== estimateId) return est;
        const lines = [...est.lines, line];
        const totals = computeEstimateTotals(lines, est.markups, est.taxRate);
        return { ...est, lines, totals, updatedAt: new Date().toISOString() };
      });
      return { estimates };
    });

    useAuditStore.getState().log('line_added', {
      entityType: 'estimate_line',
      entityId: line.id,
      estimateId,
      description: `Added line "${line.description}" (${line.quantity} ${line.unit} @ $${line.unitRate})`,
    });

    return line;
  },

  updateLine(estimateId, lineId, updates) {
    set((state) => {
      const estimates = state.estimates.map((est) => {
        if (est.id !== estimateId) return est;
        const lines = est.lines.map((l) => {
          if (l.id !== lineId) return l;
          const updated = { ...l, ...updates };
          updated.total = computeLineTotal(updated.quantity, updated.unitRate);
          return updated;
        });
        const totals = computeEstimateTotals(lines, est.markups, est.taxRate);
        return { ...est, lines, totals, updatedAt: new Date().toISOString() };
      });
      return { estimates };
    });
  },

  deleteLine(estimateId, lineId) {
    set((state) => {
      const estimates = state.estimates.map((est) => {
        if (est.id !== estimateId) return est;
        const lines = est.lines.filter((l) => l.id !== lineId);
        const totals = computeEstimateTotals(lines, est.markups, est.taxRate);
        return { ...est, lines, totals, updatedAt: new Date().toISOString() };
      });
      return { estimates };
    });
  },

  addLines(estimateId, linesData) {
    set((state) => {
      const estimates = state.estimates.map((est) => {
        if (est.id !== estimateId) return est;
        const newLines = linesData.map((ld) => ({
          id: uuid(),
          itemId: ld.itemId || '',
          itemName: ld.itemName || '',
          description: ld.description || ld.itemName || '',
          category: ld.category || 'material',
          unit: ld.unit || 'ea',
          quantity: ld.quantity || 0,
          unitRate: ld.unitRate || 0,
          total: computeLineTotal(ld.quantity || 0, ld.unitRate || 0),
          assemblyId: ld.assemblyId || null,
          assemblyName: ld.assemblyName || null,
          takeoffObjectId: ld.takeoffObjectId || null,
          zone: ld.zone || '',
          floor: ld.floor || '',
          system: ld.system || '',
          sortOrder: ld.sortOrder || 0,
        }));
        const lines = [...est.lines, ...newLines];
        const totals = computeEstimateTotals(lines, est.markups, est.taxRate);
        return { ...est, lines, totals, updatedAt: new Date().toISOString() };
      });
      return { estimates };
    });
  },

  updateMarkups(estimateId, markups, reason = '') {
    set((state) => {
      const estimates = state.estimates.map((est) => {
        if (est.id !== estimateId) return est;
        const newMarkups = { ...est.markups, ...markups };
        const totals = computeEstimateTotals(est.lines, newMarkups, est.taxRate);
        return { ...est, markups: newMarkups, totals, updatedAt: new Date().toISOString() };
      });
      return { estimates };
    });

    useAuditStore.getState().log('estimate_updated', {
      entityType: 'estimate',
      entityId: estimateId,
      estimateId,
      description: 'Updated markups',
      reason,
    });
  },

  createVersion(estimateId, reason = '') {
    const est = get().estimates.find((e) => e.id === estimateId);
    if (!est) return null;

    const snapshot = createEstimateSnapshot(est);
    const version = {
      id: uuid(),
      versionNumber: est.versions.length + 1,
      ...snapshot,
      reason,
    };

    set((state) => ({
      estimates: state.estimates.map((e) =>
        e.id === estimateId
          ? { ...e, versions: [...e.versions, version], updatedAt: new Date().toISOString() }
          : e
      ),
    }));

    useAuditStore.getState().log('estimate_version_created', {
      entityType: 'estimate',
      entityId: estimateId,
      estimateId,
      description: `Created version ${version.versionNumber}`,
      reason,
    });

    return version;
  },

  compareVersions(estimateId, versionA, versionB) {
    const est = get().estimates.find((e) => e.id === estimateId);
    if (!est) return null;

    const va = est.versions.find((v) => v.versionNumber === versionA);
    const vb = est.versions.find((v) => v.versionNumber === versionB);
    if (!va || !vb) return null;

    return diffEstimateVersions(va, vb);
  },

  updateStatus(estimateId, status, reason = '') {
    set((state) => ({
      estimates: state.estimates.map((e) =>
        e.id === estimateId ? { ...e, status, updatedAt: new Date().toISOString() } : e
      ),
    }));

    useAuditStore.getState().log(`estimate_${status}`, {
      entityType: 'estimate',
      entityId: estimateId,
      estimateId,
      description: `Estimate status changed to ${status}`,
      reason,
    });
  },

  selectEstimate(id) {
    set({ selectedEstimateId: id });
  },

  getEstimate(id) {
    return get().estimates.find((e) => e.id === id);
  },

  getEstimatesByProject(projectId) {
    return get().estimates.filter((e) => e.projectId === projectId);
  },
}));

export default useEstimateStore;
