import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Plus, Search, Filter, ArrowRight, DollarSign, TrendingUp,
  Calendar, Building2, ChevronDown, MoreVertical, Phone, Mail,
} from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import SearchInput from '../components/common/SearchInput';
import StatusBadge from '../components/common/StatusBadge';
import EmptyState from '../components/common/EmptyState';
import useProjectStore from '../stores/useProjectStore';
import { PROJECT_STATUSES, PROJECT_STATUS_LABELS, FIRE_SCOPES, FIRE_SCOPE_LABELS } from '../utils/constants';
import { formatCurrency, formatDate } from '../utils/formatters';

const PIPELINE_STAGES = [
  { key: PROJECT_STATUSES.LEAD, label: 'Leads', color: '#64748b' },
  { key: PROJECT_STATUSES.OPPORTUNITY, label: 'Opportunities', color: '#3b82f6' },
  { key: PROJECT_STATUSES.QUOTING, label: 'Quoting', color: '#f59e0b' },
  { key: PROJECT_STATUSES.QUOTED, label: 'Quoted', color: '#8b5cf6' },
  { key: PROJECT_STATUSES.WON, label: 'Won', color: '#22c55e' },
  { key: PROJECT_STATUSES.LOST, label: 'Lost', color: '#ef4444' },
];

export default function Opportunities() {
  const { projects, createProject, updateProject } = useProjectStore();
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [view, setView] = useState('pipeline');
  const [form, setForm] = useState({ name: '', client: '', clientContact: '', estimatedValue: '', dueDate: '', scopes: [], status: PROJECT_STATUSES.LEAD, notes: '' });

  const stats = useProjectStore((s) => s.getPipelineStats());

  const filtered = useMemo(() => {
    if (!search) return projects;
    const q = search.toLowerCase();
    return projects.filter((p) =>
      p.name.toLowerCase().includes(q) || p.client.toLowerCase().includes(q) || p.ref.toLowerCase().includes(q)
    );
  }, [projects, search]);

  function handleCreate(e) {
    e.preventDefault();
    createProject({
      ...form,
      estimatedValue: parseFloat(form.estimatedValue) || 0,
    });
    setForm({ name: '', client: '', clientContact: '', estimatedValue: '', dueDate: '', scopes: [], status: PROJECT_STATUSES.LEAD, notes: '' });
    setShowCreate(false);
  }

  function toggleScope(scope) {
    setForm((f) => ({
      ...f,
      scopes: f.scopes.includes(scope) ? f.scopes.filter((s) => s !== scope) : [...f.scopes, scope],
    }));
  }

  return (
    <div style={{ padding: '24px 32px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>Opportunities</h1>
          <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-tertiary)', margin: '4px 0 0' }}>
            Manage your sales pipeline and project leads
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)} icon={Plus}>New Opportunity</Button>
      </div>

      {/* Pipeline Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Pipeline Value', value: formatCurrency(stats.pipelineValue, 0), icon: DollarSign, color: 'var(--color-fire-500)' },
          { label: 'Active Quotes', value: stats.quoting + stats.quoted, icon: TrendingUp, color: 'var(--color-info-500)' },
          { label: 'Won This Month', value: stats.won, icon: TrendingUp, color: 'var(--color-success-500)' },
          { label: 'Total Projects', value: projects.length, icon: Building2, color: 'var(--color-text-secondary)' },
        ].map((stat) => (
          <Card key={stat.label}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', marginBottom: 4 }}>{stat.label}</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>{stat.value}</div>
              </div>
              <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: `${stat.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <stat.icon size={20} style={{ color: stat.color }} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center' }}>
        <SearchInput value={search} onChange={setSearch} placeholder="Search opportunities..." />
        <div style={{ display: 'flex', gap: 4, background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)', padding: 2 }}>
          {['pipeline', 'list'].map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              style={{
                padding: '6px 14px',
                fontSize: '0.8125rem',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                cursor: 'pointer',
                fontWeight: view === v ? 600 : 400,
                background: view === v ? 'var(--color-bg-card)' : 'transparent',
                color: view === v ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                boxShadow: view === v ? 'var(--shadow-sm)' : 'none',
              }}
            >
              {v === 'pipeline' ? 'Pipeline' : 'List'}
            </button>
          ))}
        </div>
      </div>

      {/* Pipeline View */}
      {view === 'pipeline' ? (
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${PIPELINE_STAGES.length}, 1fr)`, gap: 12, minHeight: 400 }}>
          {PIPELINE_STAGES.map((stage) => {
            const stageProjects = filtered.filter((p) => p.status === stage.key);
            return (
              <div key={stage.key} style={{ background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)', padding: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: stage.color }} />
                    <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>{stage.label}</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', background: 'var(--color-bg-card)', padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>
                    {stageProjects.length}
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {stageProjects.map((project) => (
                    <motion.div
                      key={project.id}
                      layout
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <Card padding="12px" hover>
                        <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 4 }}>{project.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginBottom: 8 }}>{project.client}</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-fire-500)' }}>
                            {formatCurrency(project.estimatedValue, 0)}
                          </span>
                          {project.dueDate && (
                            <span style={{ fontSize: '0.7rem', color: 'var(--color-text-tertiary)' }}>
                              {formatDate(project.dueDate)}
                            </span>
                          )}
                        </div>
                        {project.scopes.length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 8 }}>
                            {project.scopes.slice(0, 2).map((s) => (
                              <span key={s} style={{ fontSize: '0.625rem', padding: '2px 6px', borderRadius: 'var(--radius-full)', background: 'var(--color-fire-50)', color: 'var(--color-fire-700)' }}>
                                {FIRE_SCOPE_LABELS[s] || s}
                              </span>
                            ))}
                            {project.scopes.length > 2 && (
                              <span style={{ fontSize: '0.625rem', padding: '2px 6px', borderRadius: 'var(--radius-full)', background: 'var(--color-bg-tertiary)', color: 'var(--color-text-tertiary)' }}>
                                +{project.scopes.length - 2}
                              </span>
                            )}
                          </div>
                        )}
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <Card padding="0">
          {filtered.length === 0 ? (
            <EmptyState
              icon={TrendingUp}
              title="No opportunities yet"
              description="Create your first opportunity to start building your pipeline"
              primaryAction={{ label: 'New Opportunity', onClick: () => setShowCreate(true) }}
            />
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                  {['Ref', 'Name', 'Client', 'Status', 'Value', 'Due Date', 'Scopes'].map((h) => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--color-border)' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-bg-secondary)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '12px 16px', fontSize: '0.8125rem', color: 'var(--color-text-tertiary)', fontFamily: 'monospace' }}>{p.ref}</td>
                    <td style={{ padding: '12px 16px', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>{p.name}</td>
                    <td style={{ padding: '12px 16px', fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>{p.client}</td>
                    <td style={{ padding: '12px 16px' }}><StatusBadge status={p.status} /></td>
                    <td style={{ padding: '12px 16px', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-fire-500)' }}>{formatCurrency(p.estimatedValue, 0)}</td>
                    <td style={{ padding: '12px 16px', fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>{p.dueDate ? formatDate(p.dueDate) : '-'}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {p.scopes.slice(0, 2).map((s) => (
                          <span key={s} style={{ fontSize: '0.625rem', padding: '2px 6px', borderRadius: 'var(--radius-full)', background: 'var(--color-fire-50)', color: 'var(--color-fire-700)' }}>
                            {FIRE_SCOPE_LABELS[s] || s}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      )}

      {/* Create Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="New Opportunity" size="lg">
        <form onSubmit={handleCreate}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Project Name *</label>
              <input style={inputStyle} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required placeholder="e.g. 123 George St - Sprinkler Upgrade" />
            </div>
            <div>
              <label style={labelStyle}>Client / Company</label>
              <input style={inputStyle} value={form.client} onChange={(e) => setForm((f) => ({ ...f, client: e.target.value }))} placeholder="Company name" />
            </div>
            <div>
              <label style={labelStyle}>Contact Person</label>
              <input style={inputStyle} value={form.clientContact} onChange={(e) => setForm((f) => ({ ...f, clientContact: e.target.value }))} placeholder="Contact name" />
            </div>
            <div>
              <label style={labelStyle}>Estimated Value</label>
              <input style={inputStyle} type="number" step="100" value={form.estimatedValue} onChange={(e) => setForm((f) => ({ ...f, estimatedValue: e.target.value }))} placeholder="0" />
            </div>
            <div>
              <label style={labelStyle}>Due Date</label>
              <input style={inputStyle} type="date" value={form.dueDate} onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Estimation Scopes</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {Object.entries(FIRE_SCOPE_LABELS).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => toggleScope(key)}
                    style={{
                      padding: '6px 12px',
                      fontSize: '0.75rem',
                      borderRadius: 'var(--radius-full)',
                      border: '1px solid',
                      borderColor: form.scopes.includes(key) ? 'var(--color-fire-500)' : 'var(--color-border)',
                      background: form.scopes.includes(key) ? 'var(--color-fire-50)' : 'transparent',
                      color: form.scopes.includes(key) ? 'var(--color-fire-700)' : 'var(--color-text-secondary)',
                      cursor: 'pointer',
                      fontWeight: form.scopes.includes(key) ? 600 : 400,
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Notes</label>
              <textarea style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }} value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} placeholder="Additional notes..." />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20 }}>
            <Button variant="secondary" onClick={() => setShowCreate(false)} type="button">Cancel</Button>
            <Button type="submit">Create Opportunity</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

const labelStyle = { display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 6 };
const inputStyle = {
  width: '100%',
  padding: '8px 12px',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--color-border)',
  background: 'var(--color-bg-input)',
  color: 'var(--color-text-primary)',
  fontSize: '0.8125rem',
  outline: 'none',
  boxSizing: 'border-box',
};
