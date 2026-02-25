import { create } from 'zustand';
import { v4 as uuid } from 'uuid';
import { PROJECT_STATUSES } from '../utils/constants';
import useAuditStore from './useAuditStore';

const useProjectStore = create((set, get) => ({
  projects: [],
  contacts: [],
  selectedProjectId: null,

  createProject(data) {
    const project = {
      id: uuid(),
      ref: `PRJ-${String(get().projects.length + 1).padStart(4, '0')}`,
      name: data.name,
      client: data.client || '',
      clientContact: data.clientContact || '',
      status: data.status || PROJECT_STATUSES.LEAD,
      scopes: data.scopes || [],
      region: data.region || 'nsw',
      estimatedValue: data.estimatedValue || 0,
      dueDate: data.dueDate || null,
      notes: data.notes || '',
      tags: data.tags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    set((state) => ({
      projects: [...state.projects, project],
    }));

    useAuditStore.getState().log('project_created', {
      entityType: 'project',
      entityId: project.id,
      description: `Created project "${project.name}"`,
    });

    return project;
  },

  updateProject(id, updates) {
    const prev = get().projects.find((p) => p.id === id);
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
      ),
    }));

    useAuditStore.getState().log('project_updated', {
      entityType: 'project',
      entityId: id,
      projectId: id,
      description: `Updated project "${prev?.name}"`,
      previousValue: prev,
      newValue: { ...prev, ...updates },
    });
  },

  deleteProject(id) {
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== id),
      selectedProjectId: state.selectedProjectId === id ? null : state.selectedProjectId,
    }));
  },

  selectProject(id) {
    set({ selectedProjectId: id });
  },

  getProject(id) {
    return get().projects.find((p) => p.id === id);
  },

  getProjectsByStatus(status) {
    return get().projects.filter((p) => p.status === status);
  },

  addContact(data) {
    const contact = {
      id: uuid(),
      name: data.name,
      email: data.email || '',
      phone: data.phone || '',
      company: data.company || '',
      role: data.role || '',
      projectIds: data.projectIds || [],
      createdAt: new Date().toISOString(),
    };
    set((state) => ({
      contacts: [...state.contacts, contact],
    }));
    return contact;
  },

  getPipelineStats() {
    const projects = get().projects;
    return {
      leads: projects.filter((p) => p.status === PROJECT_STATUSES.LEAD).length,
      opportunities: projects.filter((p) => p.status === PROJECT_STATUSES.OPPORTUNITY).length,
      quoting: projects.filter((p) => p.status === PROJECT_STATUSES.QUOTING).length,
      quoted: projects.filter((p) => p.status === PROJECT_STATUSES.QUOTED).length,
      won: projects.filter((p) => p.status === PROJECT_STATUSES.WON).length,
      lost: projects.filter((p) => p.status === PROJECT_STATUSES.LOST).length,
      totalValue: projects.reduce((sum, p) => sum + (p.estimatedValue || 0), 0),
      pipelineValue: projects
        .filter((p) => [PROJECT_STATUSES.QUOTING, PROJECT_STATUSES.QUOTED].includes(p.status))
        .reduce((sum, p) => sum + (p.estimatedValue || 0), 0),
    };
  },
}));

export default useProjectStore;
