import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FolderOpen, ArrowRight, ShieldCheck, AlertTriangle, CalendarClock,
  FileBadge2, ClipboardCheck, Bug, Wrench, Calculator,
} from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import useProjectStore from '../stores/useProjectStore';
import useAssetStore from '../stores/useAssetStore';
import useDefectStore from '../stores/useDefectStore';
import useInspectionStore from '../stores/useInspectionStore';
import useWorkOrderStore from '../stores/useWorkOrderStore';
import useCertPackStore from '../stores/useCertPackStore';
import {
  ASSET_STATUSES, ASSET_STATUS_LABELS,
  PROJECT_STATUSES, PROJECT_TYPE_LABELS,
} from '../utils/constants';
import { formatRelativeTime } from '../utils/formatters';

const STATUS_COLOURS = {
  [ASSET_STATUSES.PLANNED]:        '#94a3b8',
  [ASSET_STATUSES.INSTALLED]:      '#3b82f6',
  [ASSET_STATUSES.RECTIFICATION]:  '#f59e0b',
  [ASSET_STATUSES.CERTIFIED]:      '#22c55e',
  [ASSET_STATUSES.NONCONFORMANCE]: '#ef4444',
};

export default function Dashboard() {
  const navigate = useNavigate();
  const projects = useProjectStore((s) => s.projects);
  const hydrateProjects = useProjectStore((s) => s.hydrate);
  const assets = useAssetStore((s) => s.assets);
  const hydrateAssets = useAssetStore((s) => s.hydrate);
  const defects = useDefectStore((s) => s.defects);
  const hydrateDefects = useDefectStore((s) => s.hydrate);
  const inspections = useInspectionStore((s) => s.inspections);
  const hydrateInspections = useInspectionStore((s) => s.hydrate);
  const workOrders = useWorkOrderStore((s) => s.workOrders);
  const hydrateWO = useWorkOrderStore((s) => s.hydrate);
  const certPacks = useCertPackStore((s) => s.certPacks);
  const hydrateCerts = useCertPackStore((s) => s.hydrate);

  useEffect(() => {
    hydrateProjects(); hydrateAssets(); hydrateDefects();
    hydrateInspections(); hydrateWO(); hydrateCerts();
  }, [hydrateProjects, hydrateAssets, hydrateDefects, hydrateInspections, hydrateWO, hydrateCerts]);

  const stats = useMemo(() => {
    const activeProjects = projects.filter((p) => p.status === PROJECT_STATUSES.ACTIVE).length;
    const installed = assets.filter((a) => a.status === ASSET_STATUSES.INSTALLED).length;
    const certified = assets.filter((a) => a.status === ASSET_STATUSES.CERTIFIED).length;
    const ncr = assets.filter((a) => a.status === ASSET_STATUSES.NONCONFORMANCE).length;

    const openDefects = defects.filter((d) => d.status !== 'verified').length;
    const overdueDefects = defects.filter((d) => {
      if (d.status === 'verified') return false;
      if (!d.rectificationDueDate) return false;
      return new Date(d.rectificationDueDate) < new Date();
    }).length;
    const classADefects = defects.filter((d) => d.severity === 'A' && d.status !== 'verified').length;

    const inspectionsDue = inspections.filter((i) => {
      if (i.status === 'completed') return false;
      if (!i.scheduledDate) return false;
      return new Date(i.scheduledDate) <= new Date();
    }).length;

    const workOrdersOpen = workOrders.filter((w) => w.status === 'scheduled' || w.status === 'in_progress').length;

    return {
      activeProjects, installed, certified, ncr,
      openDefects, overdueDefects, classADefects,
      inspectionsDue, workOrdersOpen,
      certPacks: certPacks.length,
    };
  }, [projects, assets, defects, inspections, workOrders, certPacks]);

  const assetByStatus = useMemo(() => {
    const counts = {};
    for (const a of assets) counts[a.status] = (counts[a.status] || 0) + 1;
    return Object.values(ASSET_STATUSES).map((s) => ({
      name: ASSET_STATUS_LABELS[s],
      value: counts[s] || 0,
      colour: STATUS_COLOURS[s],
    })).filter((d) => d.value > 0);
  }, [assets]);

  const assetByProject = useMemo(() => {
    const counts = {};
    for (const a of assets) counts[a.projectId] = (counts[a.projectId] || 0) + 1;
    return projects
      .map((p) => ({ name: p.code, total: counts[p.id] || 0 }))
      .filter((d) => d.total > 0)
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);
  }, [assets, projects]);

  const recent = projects.slice(0, 5);

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16 }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <h1 style={{ margin: 0, fontSize: 22 }}>Dashboard</h1>
        <span style={{ color: 'var(--geist-fg-4)', fontSize: 12 }}>XACT, passive-fire ops</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10 }}>
        <Stat icon={FolderOpen}     label="Active projects"     value={stats.activeProjects} onClick={() => navigate('/projects')} />
        <Stat icon={ShieldCheck}    label="Installed"           value={stats.installed} />
        <Stat icon={FileBadge2}     label="Certified"           value={stats.certified} accent="success" />
        <Stat icon={AlertTriangle}  label="Non-conformances"    value={stats.ncr}        accent={stats.ncr > 0 ? 'warning' : 'default'} />
        <Stat icon={Bug}            label="Open defects"        value={stats.openDefects} accent={stats.classADefects > 0 ? 'danger' : (stats.openDefects > 0 ? 'warning' : 'default')} />
        <Stat icon={AlertTriangle}  label="Overdue defects"     value={stats.overdueDefects} accent={stats.overdueDefects > 0 ? 'danger' : 'default'} />
        <Stat icon={ClipboardCheck} label="Inspections due"     value={stats.inspectionsDue} accent={stats.inspectionsDue > 0 ? 'warning' : 'default'} />
        <Stat icon={Wrench}         label="Open work orders"    value={stats.workOrdersOpen} />
        <Stat icon={FileBadge2}     label="Cert packs"          value={stats.certPacks} />
      </div>

      {stats.classADefects > 0 && (
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertTriangle size={16} color="#ef4444" />
            <strong style={{ color: '#b91c1c' }}>
              {stats.classADefects} class-A defect{stats.classADefects === 1 ? '' : 's'} open — same-day rectification target.
            </strong>
          </div>
        </Card>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Card>
          <strong>Asset status distribution</strong>
          {assetByStatus.length === 0 ? (
            <p style={{ fontSize: 12, color: 'var(--geist-fg-4)', marginTop: 8 }}>No assets yet.</p>
          ) : (
            <div style={{ height: 200, marginTop: 8 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={assetByStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                    {assetByStatus.map((d, i) => <Cell key={i} fill={d.colour} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        <Card>
          <strong>Assets per project (top 10)</strong>
          {assetByProject.length === 0 ? (
            <p style={{ fontSize: 12, color: 'var(--geist-fg-4)', marginTop: 8 }}>No assets yet.</p>
          ) : (
            <div style={{ height: 200, marginTop: 8 }}>
              <ResponsiveContainer>
                <BarChart data={assetByProject}>
                  <XAxis dataKey="name" fontSize={11} />
                  <YAxis fontSize={11} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="total" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>

      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <strong>Recent projects</strong>
          <Button size="sm" variant="ghost" onClick={() => navigate('/projects')}>
            View all <ArrowRight size={14} />
          </Button>
        </div>
        {recent.length === 0 ? (
          <p style={{ color: 'var(--geist-fg-4)', fontSize: 13 }}>
            No projects yet. Create one from the Projects page to get started.
          </p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {recent.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => navigate(`/projects/${p.id}`)}
                  style={{
                    width: '100%', textAlign: 'left', padding: '8px 10px',
                    background: 'transparent', border: '1px solid var(--geist-border)',
                    borderRadius: 6, cursor: 'pointer', display: 'grid',
                    gridTemplateColumns: '90px 1fr auto auto', gap: 12, alignItems: 'center',
                    fontSize: 13,
                  }}
                >
                  <code style={{ color: 'var(--geist-fg-3)' }}>{p.code}</code>
                  <span>{p.name}</span>
                  <span style={{ color: 'var(--geist-fg-4)', fontSize: 12 }}>
                    {PROJECT_TYPE_LABELS[p.projectType]}
                  </span>
                  <span style={{ color: 'var(--geist-fg-4)', fontSize: 12 }}>
                    <CalendarClock size={11} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                    {formatRelativeTime(p.updatedAt)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </motion.div>
  );
}

function Stat({ icon: Icon, label, value, accent, onClick }) {
  const colour =
    accent === 'danger'  ? 'var(--geist-error, #b91c1c)'
    : accent === 'warning' ? 'var(--geist-warning, #f59e0b)'
    : accent === 'success' ? 'var(--geist-success, #15803d)'
    : 'var(--geist-fg-2, #6b7280)';
  const Wrap = onClick ? 'button' : 'div';
  return (
    <Wrap
      onClick={onClick}
      type={onClick ? 'button' : undefined}
      style={{
        textAlign: 'left',
        background: 'var(--geist-bg)',
        border: '1px solid var(--geist-border)',
        borderRadius: 6,
        padding: 12,
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Icon size={18} color={colour} />
        <div>
          <div style={{ fontSize: 22, fontWeight: 600, color: colour }}>{value}</div>
          <div style={{ fontSize: 11, color: 'var(--geist-fg-4)' }}>{label}</div>
        </div>
      </div>
    </Wrap>
  );
}
