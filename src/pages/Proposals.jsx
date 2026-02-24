import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  FileText, Plus, Search, Send, Check, X, Eye,
  Download, Copy, Clock, DollarSign, Mail,
} from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import SearchInput from '../components/common/SearchInput';
import StatusBadge from '../components/common/StatusBadge';
import EmptyState from '../components/common/EmptyState';
import useProposalStore from '../stores/useProposalStore';
import useEstimateStore from '../stores/useEstimateStore';
import useProjectStore from '../stores/useProjectStore';
import { formatCurrency, formatDate, formatRelativeTime } from '../utils/formatters';

const STATUS_COLORS = {
  draft: { bg: 'var(--color-bg-tertiary)', color: 'var(--color-text-secondary)' },
  sent: { bg: 'var(--color-info-50)', color: 'var(--color-info-700)' },
  accepted: { bg: 'var(--color-success-50)', color: 'var(--color-success-700)' },
  declined: { bg: 'var(--color-danger-50)', color: 'var(--color-danger-700)' },
};

export default function Proposals() {
  const { proposals, templates, inclusionsLibrary, exclusionsLibrary, createProposal, sendProposal, updateProposal } = useProposalStore();
  const estimates = useEstimateStore((s) => s.estimates);
  const projects = useProjectStore((s) => s.projects);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [showPreview, setShowPreview] = useState(null);
  const [form, setForm] = useState({
    projectId: '', estimateId: '', templateId: 'tpl-standard',
    name: '', clientName: '', clientCompany: '', clientEmail: '',
    validityDays: 30, inclusions: [], exclusions: [],
  });

  const filtered = useMemo(() => {
    if (!search) return proposals;
    const q = search.toLowerCase();
    return proposals.filter((p) =>
      p.name.toLowerCase().includes(q) || p.ref.toLowerCase().includes(q) || p.clientCompany.toLowerCase().includes(q)
    );
  }, [proposals, search]);

  function handleCreate(e) {
    e.preventDefault();
    createProposal(form);
    setForm({ projectId: '', estimateId: '', templateId: 'tpl-standard', name: '', clientName: '', clientCompany: '', clientEmail: '', validityDays: 30, inclusions: [], exclusions: [] });
    setShowCreate(false);
  }

  function toggleInclusion(text) {
    setForm((f) => ({
      ...f,
      inclusions: f.inclusions.includes(text)
        ? f.inclusions.filter((i) => i !== text)
        : [...f.inclusions, text],
    }));
  }

  function toggleExclusion(text) {
    setForm((f) => ({
      ...f,
      exclusions: f.exclusions.includes(text)
        ? f.exclusions.filter((i) => i !== text)
        : [...f.exclusions, text],
    }));
  }

  return (
    <div style={{ padding: '24px 32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>Proposals</h1>
          <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-tertiary)', margin: '4px 0 0' }}>Generate, send, and track client proposals</p>
        </div>
        <Button onClick={() => setShowCreate(true)} icon={Plus}>New Proposal</Button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Draft', count: proposals.filter((p) => p.status === 'draft').length, color: 'var(--color-text-secondary)' },
          { label: 'Sent', count: proposals.filter((p) => p.status === 'sent').length, color: 'var(--color-info-500)' },
          { label: 'Accepted', count: proposals.filter((p) => p.status === 'accepted').length, color: 'var(--color-success-500)' },
          { label: 'Declined', count: proposals.filter((p) => p.status === 'declined').length, color: 'var(--color-danger-500)' },
        ].map((s) => (
          <Card key={s.label}>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: s.color }}>{s.count}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>{s.label}</div>
          </Card>
        ))}
      </div>

      <SearchInput value={search} onChange={setSearch} placeholder="Search proposals..." />

      {filtered.length === 0 ? (
        <div style={{ marginTop: 24 }}>
          <EmptyState
            icon={FileText}
            title="No proposals yet"
            description="Create a proposal from an estimate to send to your client"
            primaryAction={{ label: 'New Proposal', onClick: () => setShowCreate(true) }}
          />
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 16, marginTop: 16 }}>
          {filtered.map((proposal) => {
            const estimate = estimates.find((e) => e.id === proposal.estimateId);
            const project = projects.find((p) => p.id === proposal.projectId);
            const sc = STATUS_COLORS[proposal.status] || STATUS_COLORS.draft;
            return (
              <motion.div key={proposal.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <Card hover>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div>
                      <div style={{ fontSize: '0.7rem', fontFamily: 'monospace', color: 'var(--color-text-tertiary)' }}>{proposal.ref}</div>
                      <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>{proposal.name || 'Untitled Proposal'}</div>
                    </div>
                    <span style={{
                      fontSize: '0.6875rem', padding: '3px 10px', borderRadius: 'var(--radius-full)',
                      background: sc.bg, color: sc.color, fontWeight: 600, textTransform: 'capitalize',
                    }}>
                      {proposal.status}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginBottom: 4 }}>{proposal.clientCompany || proposal.clientName || '-'}</div>
                  {project && <div style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', marginBottom: 8 }}>{project.name}</div>}

                  {estimate && (
                    <div style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-fire-500)', marginBottom: 8 }}>
                      {formatCurrency(estimate.totals.totalIncTax)}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 8, fontSize: '0.75rem', color: 'var(--color-text-tertiary)', marginBottom: 12 }}>
                    <span>Valid {proposal.validityDays} days</span>
                    {proposal.sentAt && <span>Sent {formatDate(proposal.sentAt)}</span>}
                  </div>

                  <div style={{ display: 'flex', gap: 6 }}>
                    <Button size="sm" variant="secondary" icon={Eye} onClick={() => setShowPreview(proposal)}>Preview</Button>
                    {proposal.status === 'draft' && (
                      <Button size="sm" icon={Send} onClick={() => sendProposal(proposal.id)}>Send</Button>
                    )}
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="New Proposal" size="lg">
        <form onSubmit={handleCreate}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Proposal Name</label>
              <input style={inputStyle} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Fire Sprinkler Upgrade - Proposal" />
            </div>
            <div>
              <label style={labelStyle}>Project</label>
              <select style={inputStyle} value={form.projectId} onChange={(e) => setForm((f) => ({ ...f, projectId: e.target.value }))}>
                <option value="">Select...</option>
                {projects.map((p) => (<option key={p.id} value={p.id}>{p.name}</option>))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Estimate</label>
              <select style={inputStyle} value={form.estimateId} onChange={(e) => setForm((f) => ({ ...f, estimateId: e.target.value }))}>
                <option value="">Select...</option>
                {estimates.map((e) => (<option key={e.id} value={e.id}>{e.ref} - {e.name}</option>))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Client Name</label>
              <input style={inputStyle} value={form.clientName} onChange={(e) => setForm((f) => ({ ...f, clientName: e.target.value }))} />
            </div>
            <div>
              <label style={labelStyle}>Client Company</label>
              <input style={inputStyle} value={form.clientCompany} onChange={(e) => setForm((f) => ({ ...f, clientCompany: e.target.value }))} />
            </div>
            <div>
              <label style={labelStyle}>Client Email</label>
              <input style={inputStyle} type="email" value={form.clientEmail} onChange={(e) => setForm((f) => ({ ...f, clientEmail: e.target.value }))} />
            </div>
            <div>
              <label style={labelStyle}>Template</label>
              <select style={inputStyle} value={form.templateId} onChange={(e) => setForm((f) => ({ ...f, templateId: e.target.value }))}>
                {templates.map((t) => (<option key={t.id} value={t.id}>{t.name}</option>))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Validity (days)</label>
              <input style={inputStyle} type="number" value={form.validityDays} onChange={(e) => setForm((f) => ({ ...f, validityDays: parseInt(e.target.value) || 30 }))} />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Inclusions</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 120, overflowY: 'auto' }}>
                {inclusionsLibrary.map((text) => (
                  <label key={text} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.75rem', color: 'var(--color-text-secondary)', cursor: 'pointer' }}>
                    <input type="checkbox" checked={form.inclusions.includes(text)} onChange={() => toggleInclusion(text)} />
                    {text}
                  </label>
                ))}
              </div>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Exclusions</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 120, overflowY: 'auto' }}>
                {exclusionsLibrary.map((text) => (
                  <label key={text} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.75rem', color: 'var(--color-text-secondary)', cursor: 'pointer' }}>
                    <input type="checkbox" checked={form.exclusions.includes(text)} onChange={() => toggleExclusion(text)} />
                    {text}
                  </label>
                ))}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
            <Button variant="secondary" onClick={() => setShowCreate(false)} type="button">Cancel</Button>
            <Button type="submit">Create Proposal</Button>
          </div>
        </form>
      </Modal>

      {/* Preview Modal */}
      <Modal isOpen={!!showPreview} onClose={() => setShowPreview(null)} title="Proposal Preview" size="xl">
        {showPreview && (
          <div style={{ fontFamily: 'Georgia, serif' }}>
            <div style={{ textAlign: 'center', padding: '32px 0', borderBottom: '2px solid var(--color-fire-500)' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text-primary)', margin: '0 0 8px' }}>PROPOSAL</h2>
              <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>{showPreview.ref}</div>
            </div>
            <div style={{ padding: '24px 0' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-tertiary)', marginBottom: 8 }}>Prepared For</div>
                  <div style={{ fontSize: '0.9375rem', fontWeight: 600 }}>{showPreview.clientName || 'Client Name'}</div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>{showPreview.clientCompany}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-tertiary)', marginBottom: 8 }}>Details</div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>Date: {formatDate(showPreview.createdAt)}</div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>Valid for: {showPreview.validityDays} days</div>
                </div>
              </div>

              {showPreview.inclusions.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: 8 }}>Inclusions</div>
                  <ul style={{ paddingLeft: 20, margin: 0 }}>
                    {showPreview.inclusions.map((inc, i) => (
                      <li key={i} style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginBottom: 4 }}>{inc}</li>
                    ))}
                  </ul>
                </div>
              )}

              {showPreview.exclusions.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: 8 }}>Exclusions</div>
                  <ul style={{ paddingLeft: 20, margin: 0 }}>
                    {showPreview.exclusions.map((exc, i) => (
                      <li key={i} style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginBottom: 4 }}>{exc}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div style={{ textAlign: 'center', padding: '24px', background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)', marginTop: 24 }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', marginBottom: 4 }}>Acceptance Signature</div>
                <div style={{ height: 60, border: '1px dashed var(--color-border)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-tertiary)', fontSize: '0.8125rem' }}>
                  Sign here
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

const labelStyle = { display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 6 };
const inputStyle = {
  width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)',
  border: '1px solid var(--color-border)', background: 'var(--color-bg-input)',
  color: 'var(--color-text-primary)', fontSize: '0.8125rem', outline: 'none', boxSizing: 'border-box',
};
