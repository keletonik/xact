import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, FolderOpen } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import SearchInput from '../components/common/SearchInput';
import EmptyState from '../components/common/EmptyState';
import StatusBadge from '../components/common/StatusBadge';
import FormField from '../components/common/FormField';
import useProjectStore from '../stores/useProjectStore';
import {
  PROJECT_STATUSES, PROJECT_STATUS_LABELS,
  PROJECT_TYPES, PROJECT_TYPE_LABELS,
  REGIONS, REGION_LABELS,
} from '../utils/constants';
import { formatRelativeTime } from '../utils/formatters';

export default function Projects() {
  const navigate = useNavigate();
  const projects = useProjectStore((s) => s.projects);
  const hydrate = useProjectStore((s) => s.hydrate);
  const createProject = useProjectStore((s) => s.createProject);

  useEffect(() => { hydrate(); }, [hydrate]);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showCreate, setShowCreate] = useState(false);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return projects
      .filter((p) => statusFilter === 'all' || p.status === statusFilter)
      .filter((p) => typeFilter === 'all' || p.projectType === typeFilter)
      .filter((p) => {
        if (!q) return true;
        return [p.name, p.code, p.client, p.siteAddress].some((v) => (v || '').toLowerCase().includes(q));
      });
  }, [projects, search, statusFilter, typeFilter]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 16 }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0, fontSize: 22 }}>Projects</h1>
        <Button onClick={() => setShowCreate(true)}>
          <Plus size={14} /> New project
        </Button>
      </div>

      <Card>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: 220 }}>
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search by name, code, client, address"
            />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={selectStyle}>
            <option value="all">All statuses</option>
            {Object.values(PROJECT_STATUSES).map((s) => (
              <option key={s} value={s}>{PROJECT_STATUS_LABELS[s]}</option>
            ))}
          </select>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} style={selectStyle}>
            <option value="all">All types</option>
            {Object.values(PROJECT_TYPES).map((t) => (
              <option key={t} value={t}>{PROJECT_TYPE_LABELS[t]}</option>
            ))}
          </select>
        </div>
      </Card>

      {visible.length === 0 ? (
        <EmptyState icon={FolderOpen} title="No projects" description="Create the first project to start a passive-fire job." />
      ) : (
        <Card>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ textAlign: 'left', color: 'var(--geist-fg-4)' }}>
                <th style={th}>Code</th>
                <th style={th}>Name</th>
                <th style={th}>Client</th>
                <th style={th}>Type</th>
                <th style={th}>Status</th>
                <th style={th}>Region</th>
                <th style={th}>Updated</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((p) => (
                <tr
                  key={p.id}
                  onClick={() => navigate(`/projects/${p.id}`)}
                  style={{ cursor: 'pointer', borderTop: '1px solid var(--geist-border)' }}
                >
                  <td style={td}><code>{p.code}</code></td>
                  <td style={td}>{p.name}</td>
                  <td style={td}>{p.client || '—'}</td>
                  <td style={td}>{PROJECT_TYPE_LABELS[p.projectType]}</td>
                  <td style={td}><StatusBadge status={p.status} /></td>
                  <td style={td}>{REGION_LABELS[p.region] || p.region}</td>
                  <td style={td}>{formatRelativeTime(p.updatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {showCreate && (
        <CreateProjectModal
          onClose={() => setShowCreate(false)}
          onCreate={async (input) => {
            const p = await createProject(input);
            setShowCreate(false);
            navigate(`/projects/${p.id}`);
          }}
        />
      )}
    </motion.div>
  );
}

function CreateProjectModal({ onClose, onCreate }) {
  const [form, setForm] = useState({
    name: '',
    client: '',
    siteAddress: '',
    region: REGIONS.NSW,
    projectType: PROJECT_TYPES.NEW_INSTALL,
  });
  const update = (patch) => setForm((f) => ({ ...f, ...patch }));
  const submit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    onCreate(form);
  };
  return (
    <Modal isOpen onClose={onClose} title="New project">
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <FormField label="Project name" required>
          <input style={inputStyle} value={form.name} onChange={(e) => update({ name: e.target.value })} autoFocus />
        </FormField>
        <FormField label="Client">
          <input style={inputStyle} value={form.client} onChange={(e) => update({ client: e.target.value })} />
        </FormField>
        <FormField label="Site address">
          <input style={inputStyle} value={form.siteAddress} onChange={(e) => update({ siteAddress: e.target.value })} />
        </FormField>
        <FormField label="Project type">
          <select style={inputStyle} value={form.projectType} onChange={(e) => update({ projectType: e.target.value })}>
            {Object.values(PROJECT_TYPES).map((t) => (
              <option key={t} value={t}>{PROJECT_TYPE_LABELS[t]}</option>
            ))}
          </select>
        </FormField>
        <FormField label="Region">
          <select style={inputStyle} value={form.region} onChange={(e) => update({ region: e.target.value })}>
            {Object.values(REGIONS).map((r) => (
              <option key={r} value={r}>{REGION_LABELS[r]}</option>
            ))}
          </select>
        </FormField>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
          <Button variant="ghost" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit">Create project</Button>
        </div>
      </form>
    </Modal>
  );
}

const selectStyle = {
  padding: '6px 10px',
  border: '1px solid var(--geist-border-strong)',
  borderRadius: 4,
  background: 'var(--geist-bg)',
  fontSize: 12,
};
const inputStyle = {
  padding: '8px 10px',
  border: '1px solid var(--geist-border-strong)',
  borderRadius: 4,
  background: 'var(--geist-bg)',
  color: 'var(--geist-fg)',
  fontSize: 13,
  width: '100%',
  boxSizing: 'border-box',
};
const th = { padding: '6px 10px', fontWeight: 500, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.4 };
const td = { padding: '8px 10px' };
