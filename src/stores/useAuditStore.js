import { create } from 'zustand';
import { v4 as uuid } from 'uuid';

const useAuditStore = create((set, get) => ({
  entries: [],

  log(action, details = {}) {
    const entry = {
      id: uuid(),
      action,
      timestamp: new Date().toISOString(),
      userId: details.userId || 'current-user',
      userName: details.userName || 'Current User',
      tenantId: details.tenantId || 'default-tenant',
      projectId: details.projectId || null,
      estimateId: details.estimateId || null,
      entityType: details.entityType || null,
      entityId: details.entityId || null,
      description: details.description || '',
      previousValue: details.previousValue || null,
      newValue: details.newValue || null,
      reason: details.reason || null,
      metadata: details.metadata || {},
    };

    set((state) => ({
      entries: [entry, ...state.entries],
    }));

    return entry;
  },

  getByProject(projectId) {
    return get().entries.filter((e) => e.projectId === projectId);
  },

  getByEstimate(estimateId) {
    return get().entries.filter((e) => e.estimateId === estimateId);
  },

  getByAction(action) {
    return get().entries.filter((e) => e.action === action);
  },

  getByDateRange(startDate, endDate) {
    return get().entries.filter((e) => {
      const ts = new Date(e.timestamp);
      return ts >= new Date(startDate) && ts <= new Date(endDate);
    });
  },

  getByUser(userId) {
    return get().entries.filter((e) => e.userId === userId);
  },

  exportCSV() {
    const entries = get().entries;
    if (entries.length === 0) return '';

    const headers = ['ID', 'Timestamp', 'Action', 'User', 'Project', 'Description', 'Reason'];
    const rows = entries.map((e) => [
      e.id,
      e.timestamp,
      e.action,
      e.userName,
      e.projectId || '',
      e.description,
      e.reason || '',
    ]);

    return [headers, ...rows].map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
  },
}));

export default useAuditStore;
