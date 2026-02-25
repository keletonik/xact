import { create } from 'zustand';
import { v4 as uuid } from 'uuid';
import useAuditStore from './useAuditStore';
import { generateRef } from '../utils/formatters';

const useProposalStore = create((set, get) => ({
  proposals: [],
  templates: [
    {
      id: 'tpl-standard',
      name: 'Standard Proposal',
      description: 'Standard format with executive summary, scope, and pricing',
      sections: ['cover', 'executive_summary', 'scope', 'pricing_summary', 'inclusions', 'exclusions', 'assumptions', 'terms', 'acceptance'],
    },
    {
      id: 'tpl-detailed',
      name: 'Detailed Breakdown',
      description: 'Detailed proposal with full line-item breakdown by trade',
      sections: ['cover', 'executive_summary', 'scope', 'pricing_detailed', 'inclusions', 'exclusions', 'assumptions', 'program', 'terms', 'acceptance'],
    },
    {
      id: 'tpl-executive',
      name: 'Executive Summary',
      description: 'High-level proposal for senior stakeholders',
      sections: ['cover', 'executive_summary', 'scope', 'pricing_summary', 'terms', 'acceptance'],
    },
  ],

  inclusionsLibrary: [
    'Supply and installation of all specified equipment',
    'Commissioning and testing in accordance with Australian Standards',
    'As-built documentation and completion certificates',
    'Project management and site supervision',
    'All statutory approvals and certifications',
    'Warranty period as per manufacturer specifications',
    'Clean-up and removal of waste materials',
  ],

  exclusionsLibrary: [
    'Builder works including penetrations, chasing, and making good',
    'Electrical supply to equipment (by others)',
    'Water supply connections (by others)',
    'Council or authority application fees',
    'After-hours work unless specified',
    'Asbestos removal or hazardous material handling',
    'Structural modifications',
    'Fire engineering consultancy',
  ],

  createProposal(data) {
    const count = get().proposals.length;
    const proposal = {
      id: uuid(),
      ref: generateRef('PRP', count + 1),
      projectId: data.projectId,
      estimateId: data.estimateId,
      templateId: data.templateId || 'tpl-standard',
      name: data.name || 'Proposal',
      status: 'draft',
      clientName: data.clientName || '',
      clientCompany: data.clientCompany || '',
      clientEmail: data.clientEmail || '',
      validityDays: data.validityDays || 30,
      inclusions: data.inclusions || [],
      exclusions: data.exclusions || [],
      assumptions: data.assumptions || [],
      options: data.options || [],
      notes: data.notes || '',
      sentAt: null,
      acceptedAt: null,
      declinedAt: null,
      signatureData: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    set((state) => ({
      proposals: [...state.proposals, proposal],
    }));

    useAuditStore.getState().log('proposal_generated', {
      entityType: 'proposal',
      entityId: proposal.id,
      projectId: data.projectId,
      estimateId: data.estimateId,
      description: `Generated proposal "${proposal.ref}"`,
    });

    return proposal;
  },

  updateProposal(id, updates) {
    set((state) => ({
      proposals: state.proposals.map((p) =>
        p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
      ),
    }));
  },

  sendProposal(id) {
    set((state) => ({
      proposals: state.proposals.map((p) =>
        p.id === id ? { ...p, status: 'sent', sentAt: new Date().toISOString(), updatedAt: new Date().toISOString() } : p
      ),
    }));

    useAuditStore.getState().log('proposal_sent', {
      entityType: 'proposal',
      entityId: id,
      description: `Sent proposal`,
    });
  },

  acceptProposal(id, signatureData = null) {
    set((state) => ({
      proposals: state.proposals.map((p) =>
        p.id === id
          ? { ...p, status: 'accepted', acceptedAt: new Date().toISOString(), signatureData, updatedAt: new Date().toISOString() }
          : p
      ),
    }));

    useAuditStore.getState().log('proposal_accepted', {
      entityType: 'proposal',
      entityId: id,
      description: `Proposal accepted`,
    });
  },

  declineProposal(id, reason = '') {
    set((state) => ({
      proposals: state.proposals.map((p) =>
        p.id === id
          ? { ...p, status: 'declined', declinedAt: new Date().toISOString(), declineReason: reason, updatedAt: new Date().toISOString() }
          : p
      ),
    }));
  },

  getProposalsByProject(projectId) {
    return get().proposals.filter((p) => p.projectId === projectId);
  },

  getProposal(id) {
    return get().proposals.find((p) => p.id === id);
  },
}));

export default useProposalStore;
