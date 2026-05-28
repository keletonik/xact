import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FolderOpen, Search, X } from 'lucide-react';
import PaperCard from '../components/draft/PaperCard';
import CalloutBalloon from '../components/draft/CalloutBalloon';
import InkStamp from '../components/draft/InkStamp';
import RevisionStamp from '../components/draft/RevisionStamp';
import Modal from '../components/common/Modal';
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
    <div className="xc-stagger" style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 22 }}>

      {/* Sheet preamble */}
      <section style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        alignItems: 'flex-end',
        gap: 22,
        borderBottom: '1.5px solid var(--rule-ink)',
        paddingBottom: 14,
      }}>
        <div>
          <div className="xc-stamp" style={{ marginBottom: 6 }}>index · projects</div>
          <h1 className="xc-display-italic" style={{ margin: 0, fontSize: 52, lineHeight: 1, color: 'var(--ink)' }}>
            Project register
          </h1>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-3)', marginTop: 12 }}>
            {projects.length} on file · {visible.length} shown
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <RevisionStamp letter="B" />
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            style={primaryAction}
          >
            <Plus size={14} strokeWidth={2.5} />
            new project
          </button>
        </div>
      </section>

      {/* Filter ruler */}
      <PaperCard title="filter · query" meta={`${visible.length}/${projects.length}`}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr 1fr', gap: 12 }}>
          <div style={searchWrap}>
            <Search size={14} color="var(--ink-3)" style={{ marginRight: 8, flexShrink: 0 }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="name, code, client, site"
              style={searchInput}
            />
            {search && (
              <button type="button" onClick={() => setSearch('')} style={searchClear} aria-label="Clear">
                <X size={12} />
              </button>
            )}
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={selectStyle}>
            <option value="all">ALL STATUSES</option>
            {Object.values(PROJECT_STATUSES).map((s) => (
              <option key={s} value={s}>{PROJECT_STATUS_LABELS[s].toUpperCase()}</option>
            ))}
          </select>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} style={selectStyle}>
            <option value="all">ALL TYPES</option>
            {Object.values(PROJECT_TYPES).map((t) => (
              <option key={t} value={t}>{PROJECT_TYPE_LABELS[t].toUpperCase()}</option>
            ))}
          </select>
        </div>
      </PaperCard>

      <PaperCard title="project schedule" meta="click any row to open" noPad>
        {visible.length === 0 ? (
          <div style={emptyDraftStyle}>
            <FolderOpen size={20} color="var(--ink-4)" strokeWidth={2} />
            <span style={{ marginLeft: 10 }}>no projects on this filter</span>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr>
                {['Code', 'Project name', 'Client', 'Type', 'Status', 'Region', 'Updated'].map((h) => (
                  <th key={h} style={th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.map((p) => (
                <tr
                  key={p.id}
                  onClick={() => navigate(`/projects/${p.id}`)}
                  className="xc-sched-row"
                  style={{ cursor: 'pointer' }}
                >
                  <td style={tdMono}><CalloutBalloon size="md">{p.code}</CalloutBalloon></td>
                  <td style={td}>
                    <span className="xc-display-italic" style={{ fontSize: 17 }}>{p.name}</span>
                    {p.siteAddress && (
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.06em', color: 'var(--ink-4)', marginTop: 2 }}>
                        {p.siteAddress}
                      </div>
                    )}
                  </td>
                  <td style={td}>{p.client || '—'}</td>
                  <td style={tdMono}>
                    <span style={mutedStamp}>{PROJECT_TYPE_LABELS[p.projectType]}</span>
                  </td>
                  <td style={td}>
                    <InkStamp tone={stampTone(p.status)} size="sm" rotate={-2}>{p.status}</InkStamp>
                  </td>
                  <td style={tdMono}>{REGION_LABELS[p.region] || p.region}</td>
                  <td style={tdMono}>
                    <span style={{ color: 'var(--ink-3)' }}>{formatRelativeTime(p.updatedAt)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </PaperCard>

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

      <style>{`
        .xc-sched-row { position: relative; }
        .xc-sched-row::after {
          content: "";
          position: absolute;
          left: 0; right: 100%; bottom: 0;
          height: 1.5px;
          background: var(--accent);
          transition: right 220ms var(--geist-easing);
        }
        .xc-sched-row:hover::after { right: 0; }
        .xc-sched-row:hover { background: rgba(200, 16, 46, 0.03) !important; }
      `}</style>
    </div>
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
    <Modal isOpen onClose={onClose} title="New project" subtitle="A row in the project register">
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <FormField label="Project name" required>
          <input style={modalInput} value={form.name} onChange={(e) => update({ name: e.target.value })} autoFocus placeholder="e.g. tower hill medical centre" />
        </FormField>
        <FormField label="Client">
          <input style={modalInput} value={form.client} onChange={(e) => update({ client: e.target.value })} />
        </FormField>
        <FormField label="Site address">
          <input style={modalInput} value={form.siteAddress} onChange={(e) => update({ siteAddress: e.target.value })} />
        </FormField>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <FormField label="Project type">
            <select style={modalInput} value={form.projectType} onChange={(e) => update({ projectType: e.target.value })}>
              {Object.values(PROJECT_TYPES).map((t) => (
                <option key={t} value={t}>{PROJECT_TYPE_LABELS[t]}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Region">
            <select style={modalInput} value={form.region} onChange={(e) => update({ region: e.target.value })}>
              {Object.values(REGIONS).map((r) => (
                <option key={r} value={r}>{REGION_LABELS[r]}</option>
              ))}
            </select>
          </FormField>
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 6 }}>
          <button type="button" onClick={onClose} style={ghostAction}>cancel</button>
          <button type="submit" style={primaryAction}>draft project</button>
        </div>
      </form>
    </Modal>
  );
}

function stampTone(status) {
  switch (status) {
    case PROJECT_STATUSES.ACTIVE:    return 'installed';
    case PROJECT_STATUSES.COMPLETED: return 'certified';
    case PROJECT_STATUSES.ON_HOLD:   return 'rectification';
    case PROJECT_STATUSES.ARCHIVED:  return 'planned';
    default:                         return 'draft';
  }
}

const primaryAction = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  background: 'var(--ink)',
  color: 'var(--paper-1)',
  border: '1px solid var(--ink)',
  padding: '8px 14px',
  fontFamily: 'var(--font-mono)',
  fontSize: 11,
  letterSpacing: 'var(--tracking-label)',
  textTransform: 'uppercase',
  cursor: 'pointer',
};
const ghostAction = {
  background: 'transparent',
  color: 'var(--ink-2)',
  border: '1px solid var(--rule-strong)',
  padding: '8px 14px',
  fontFamily: 'var(--font-mono)',
  fontSize: 11,
  letterSpacing: 'var(--tracking-label)',
  textTransform: 'uppercase',
  cursor: 'pointer',
};

const searchWrap = {
  display: 'flex',
  alignItems: 'center',
  background: 'var(--paper-1)',
  border: '1px solid var(--rule-strong)',
  padding: '8px 10px',
};
const searchInput = {
  flex: 1,
  border: 'none',
  outline: 'none',
  background: 'transparent',
  fontSize: 13,
  color: 'var(--ink)',
  fontFamily: 'var(--font-mono)',
  letterSpacing: '0.04em',
};
const searchClear = {
  background: 'transparent',
  border: 'none',
  color: 'var(--ink-4)',
  cursor: 'pointer',
  padding: 4,
};
const selectStyle = {
  background: 'var(--paper-1)',
  border: '1px solid var(--rule-strong)',
  padding: '8px 10px',
  fontFamily: 'var(--font-mono)',
  fontSize: 11,
  letterSpacing: 'var(--tracking-label)',
  textTransform: 'uppercase',
  color: 'var(--ink)',
  appearance: 'none',
};
const modalInput = {
  width: '100%',
  background: 'var(--paper-1)',
  border: '1px solid var(--rule-strong)',
  padding: '10px 12px',
  fontFamily: 'var(--font-sans)',
  fontSize: 14,
  color: 'var(--ink)',
};
const th = {
  textAlign: 'left',
  fontFamily: 'var(--font-mono)',
  fontSize: 10,
  letterSpacing: 'var(--tracking-label)',
  textTransform: 'uppercase',
  color: 'var(--ink-3)',
  fontWeight: 600,
  padding: '10px 14px',
  borderBottom: '1.5px solid var(--rule-ink)',
  background: 'var(--paper-2)',
};
const td = {
  padding: '12px 14px',
  borderBottom: '1px solid var(--rule)',
  verticalAlign: 'middle',
};
const tdMono = {
  ...td,
  fontFamily: 'var(--font-mono)',
  fontSize: 12,
  letterSpacing: '0.04em',
};
const mutedStamp = {
  fontFamily: 'var(--font-mono)',
  fontSize: 10,
  letterSpacing: 'var(--tracking-label)',
  textTransform: 'uppercase',
  color: 'var(--ink-3)',
};
const emptyDraftStyle = {
  padding: '40px 20px',
  textAlign: 'center',
  fontFamily: 'var(--font-mono)',
  fontSize: 11,
  letterSpacing: 'var(--tracking-label)',
  textTransform: 'uppercase',
  color: 'var(--ink-4)',
};
