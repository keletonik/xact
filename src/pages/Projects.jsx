import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Plus, Search, FolderOpen, Calendar, MapPin, Building2,
  Layers, ArrowRight, Clock, DollarSign,
} from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import SearchInput from '../components/common/SearchInput';
import StatusBadge from '../components/common/StatusBadge';
import EmptyState from '../components/common/EmptyState';
import Tabs from '../components/common/Tabs';
import useProjectStore from '../stores/useProjectStore';
import useEstimateStore from '../stores/useEstimateStore';
import {
  PROJECT_STATUSES, PROJECT_STATUS_LABELS, FIRE_SCOPE_LABELS,
  BUILDING_CLASSES, RISK_CLASSIFICATIONS, REGIONS, REGION_LABELS,
} from '../utils/constants';
import { formatCurrency, formatDate, formatRelativeTime } from '../utils/formatters';

export default function Projects() {
  const { projects, createProject, selectProject } = useProjectStore();
  const estimates = useEstimateStore((s) => s.estimates);
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreate, setShowCreate] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [form, setForm] = useState({
    name: '', client: '', clientContact: '', status: PROJECT_STATUSES.QUOTING,
    address: '', suburb: '', state: 'nsw', postcode: '', buildingClass: '',
    storeys: 1, constructionType: '', riskClassification: '', estimatedValue: '',
    dueDate: '', scopes: [], notes: '',
  });

  const filtered = useMemo(() => {
    let result = projects;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((p) =>
        p.name.toLowerCase().includes(q) || p.client.toLowerCase().includes(q) || p.ref.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'all') {
      result = result.filter((p) => p.status === statusFilter);
    }
    return result;
  }, [projects, search, statusFilter]);

  const statusTabs = [
    { id: 'all', label: 'All', count: projects.length },
    { id: PROJECT_STATUSES.QUOTING, label: 'Quoting', count: projects.filter((p) => p.status === PROJECT_STATUSES.QUOTING).length },
    { id: PROJECT_STATUSES.QUOTED, label: 'Quoted', count: projects.filter((p) => p.status === PROJECT_STATUSES.QUOTED).length },
    { id: PROJECT_STATUSES.WON, label: 'Won', count: projects.filter((p) => p.status === PROJECT_STATUSES.WON).length },
  ];

  function handleCreate(e) {
    e.preventDefault();
    const project = createProject({ ...form, estimatedValue: parseFloat(form.estimatedValue) || 0 });
    setForm({ name: '', client: '', clientContact: '', status: PROJECT_STATUSES.QUOTING, address: '', suburb: '', state: 'nsw', postcode: '', buildingClass: '', storeys: 1, constructionType: '', riskClassification: '', estimatedValue: '', dueDate: '', scopes: [], notes: '' });
    setShowCreate(false);
    navigate(`/projects/${project.id}`);
  }

  function openProject(project) {
    selectProject(project.id);
    setSelectedProject(project);
  }

  return (
    <div style={{ padding: '24px 32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>Projects</h1>
          <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-tertiary)', margin: '4px 0 0' }}>
            Manage estimating projects and scopes
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)} icon={Plus}>New Project</Button>
      </div>

      <Tabs tabs={statusTabs} activeTab={statusFilter} onChange={setStatusFilter} />

      <div style={{ display: 'flex', gap: 12, margin: '16px 0' }}>
        <SearchInput value={search} onChange={setSearch} placeholder="Search projects..." />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title="No projects found"
          description={search ? 'Try adjusting your search' : 'Create your first project to get started'}
          primaryAction={!search ? { label: 'New Project', onClick: () => setShowCreate(true) } : undefined}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 16 }}>
          {filtered.map((project) => {
            const projectEstimates = estimates.filter((e) => e.projectId === project.id);
            return (
              <motion.div key={project.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <Card hover onClick={() => openProject(project)}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div>
                      <div style={{ fontSize: '0.7rem', fontFamily: 'monospace', color: 'var(--color-text-tertiary)', marginBottom: 2 }}>{project.ref}</div>
                      <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>{project.name}</div>
                    </div>
                    <StatusBadge status={project.status} />
                  </div>

                  <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginBottom: 12 }}>{project.client || 'No client assigned'}</div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, fontSize: '0.75rem', color: 'var(--color-text-tertiary)', marginBottom: 12 }}>
                    {project.address && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <MapPin size={12} /> {project.suburb || project.address}
                      </span>
                    )}
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <DollarSign size={12} /> {formatCurrency(project.estimatedValue, 0)}
                    </span>
                    {project.dueDate && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Calendar size={12} /> {formatDate(project.dueDate)}
                      </span>
                    )}
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Layers size={12} /> {projectEstimates.length} estimate{projectEstimates.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {project.scopes.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {project.scopes.map((s) => (
                        <span key={s} style={{
                          fontSize: '0.625rem', padding: '2px 8px', borderRadius: 'var(--radius-full)',
                          background: 'var(--color-fire-50)', color: 'var(--color-fire-700)', fontWeight: 500,
                        }}>
                          {FIRE_SCOPE_LABELS[s] || s}
                        </span>
                      ))}
                    </div>
                  )}

                  <div style={{ fontSize: '0.7rem', color: 'var(--color-text-tertiary)', marginTop: 12 }}>
                    Updated {formatRelativeTime(project.updatedAt)}
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Project Detail Side Panel */}
      <Modal isOpen={!!selectedProject} onClose={() => setSelectedProject(null)} title={selectedProject?.name || 'Project'} size="xl">
        {selectedProject && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
              <DetailRow label="Reference" value={selectedProject.ref} />
              <DetailRow label="Status" value={<StatusBadge status={selectedProject.status} />} />
              <DetailRow label="Client" value={selectedProject.client || '-'} />
              <DetailRow label="Contact" value={selectedProject.clientContact || '-'} />
              <DetailRow label="Estimated Value" value={formatCurrency(selectedProject.estimatedValue)} />
              <DetailRow label="Due Date" value={selectedProject.dueDate ? formatDate(selectedProject.dueDate) : '-'} />
              <DetailRow label="Building Class" value={selectedProject.buildingClass || '-'} />
              <DetailRow label="Risk Classification" value={selectedProject.riskClassification || '-'} />
              <DetailRow label="Address" value={[selectedProject.address, selectedProject.suburb, selectedProject.state?.toUpperCase(), selectedProject.postcode].filter(Boolean).join(', ') || '-'} />
              <DetailRow label="Storeys" value={selectedProject.storeys} />
            </div>

            {selectedProject.scopes.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 8 }}>Scopes</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {selectedProject.scopes.map((s) => (
                    <span key={s} style={{ fontSize: '0.75rem', padding: '4px 10px', borderRadius: 'var(--radius-full)', background: 'var(--color-fire-50)', color: 'var(--color-fire-700)', fontWeight: 500 }}>
                      {FIRE_SCOPE_LABELS[s] || s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: 8 }}>
              <Button onClick={() => { setSelectedProject(null); navigate('/takeoff'); }}>Open Takeoff</Button>
              <Button variant="secondary" onClick={() => { setSelectedProject(null); navigate('/estimates'); }}>View Estimates</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Create Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="New Project" size="lg">
        <form onSubmit={handleCreate}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Project Name *</label>
              <input style={inputStyle} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
            </div>
            <div>
              <label style={labelStyle}>Client</label>
              <input style={inputStyle} value={form.client} onChange={(e) => setForm((f) => ({ ...f, client: e.target.value }))} />
            </div>
            <div>
              <label style={labelStyle}>Estimated Value</label>
              <input style={inputStyle} type="number" step="100" value={form.estimatedValue} onChange={(e) => setForm((f) => ({ ...f, estimatedValue: e.target.value }))} />
            </div>
            <div>
              <label style={labelStyle}>State/Region</label>
              <select style={inputStyle} value={form.state} onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}>
                {Object.entries(REGION_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Due Date</label>
              <input style={inputStyle} type="date" value={form.dueDate} onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))} />
            </div>
            <div>
              <label style={labelStyle}>Building Class</label>
              <select style={inputStyle} value={form.buildingClass} onChange={(e) => setForm((f) => ({ ...f, buildingClass: e.target.value }))}>
                <option value="">Select...</option>
                {Object.entries(BUILDING_CLASSES).map(([k, v]) => (
                  <option key={k} value={v}>Class {v}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Storeys</label>
              <input style={inputStyle} type="number" min="1" value={form.storeys} onChange={(e) => setForm((f) => ({ ...f, storeys: parseInt(e.target.value) || 1 }))} />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20 }}>
            <Button variant="secondary" onClick={() => setShowCreate(false)} type="button">Cancel</Button>
            <Button type="submit">Create Project</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: '0.875rem', color: 'var(--color-text-primary)' }}>{value}</div>
    </div>
  );
}

const labelStyle = { display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 6 };
const inputStyle = {
  width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)',
  border: '1px solid var(--color-border)', background: 'var(--color-bg-input)',
  color: 'var(--color-text-primary)', fontSize: '0.8125rem', outline: 'none', boxSizing: 'border-box',
};
