import { create } from 'zustand';
import { v4 as uuid } from 'uuid';
import db from '../services/db';
import useAuditStore from './useAuditStore';
import { PROJECT_STATUSES, PROJECT_TYPES, AUDIT_ACTIONS } from '../utils/constants';

const useProjectStore = create((set, get) => ({
  projects: [],
  selectedId: null,
  ready: false,

  async hydrate() {
    const projects = await db.projects.toArray();
    projects.sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
    set({ projects, ready: true });
  },

  selectProject(id) { set({ selectedId: id }); },

  async createProject(input) {
    const now = new Date().toISOString();
    const project = {
      id: input.id || uuid(),
      companyId: input.companyId || 'default',
      code: input.code || autoCode(get().projects),
      name: input.name,
      client: input.client || '',
      siteAddress: input.siteAddress || '',
      region: input.region || 'nsw',
      projectType: input.projectType || PROJECT_TYPES.NEW_INSTALL,
      status: input.status || PROJECT_STATUSES.ACTIVE,
      notes: input.notes || '',
      createdAt: now,
      updatedAt: now,
    };
    await db.projects.put(project);
    set((s) => ({ projects: [project, ...s.projects] }));
    useAuditStore.getState().log(AUDIT_ACTIONS.PROJECT_CREATED, {
      entityType: 'project', entityId: project.id,
      description: `Created project ${project.code} — ${project.name}`,
    });
    return project;
  },

  async updateProject(id, patch) {
    const current = await db.projects.get(id);
    if (!current) return null;
    const next = { ...current, ...patch, updatedAt: new Date().toISOString() };
    await db.projects.put(next);
    set((s) => ({ projects: s.projects.map((p) => (p.id === id ? next : p)) }));
    useAuditStore.getState().log(AUDIT_ACTIONS.PROJECT_UPDATED, {
      entityType: 'project', entityId: id,
      description: `Updated project ${next.code}`,
    });
    return next;
  },

  async deleteProject(id) {
    await db.projects.delete(id);
    set((s) => ({
      projects: s.projects.filter((p) => p.id !== id),
      selectedId: s.selectedId === id ? null : s.selectedId,
    }));
  },
}));

function autoCode(existing) {
  const year = new Date().getFullYear();
  const prefix = `PF${year}-`;
  const used = existing
    .map((p) => p.code)
    .filter((c) => c?.startsWith(prefix))
    .map((c) => Number.parseInt(c.slice(prefix.length), 10))
    .filter((n) => !Number.isNaN(n));
  const next = (used.length ? Math.max(...used) : 0) + 1;
  return `${prefix}${String(next).padStart(4, '0')}`;
}

export default useProjectStore;
