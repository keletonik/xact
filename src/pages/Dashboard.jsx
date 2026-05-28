import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FolderOpen, ArrowRight, ShieldCheck, AlertTriangle, CalendarClock, FileBadge2,
} from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import useProjectStore from '../stores/useProjectStore';
import useAssetStore from '../stores/useAssetStore';
import {
  ASSET_STATUSES, PROJECT_STATUSES, PROJECT_TYPE_LABELS,
} from '../utils/constants';
import { formatRelativeTime } from '../utils/formatters';

export default function Dashboard() {
  const navigate = useNavigate();
  const projects = useProjectStore((s) => s.projects);
  const hydrateProjects = useProjectStore((s) => s.hydrate);
  const assets = useAssetStore((s) => s.assets);
  const hydrateAssets = useAssetStore((s) => s.hydrate);

  useEffect(() => { hydrateProjects(); hydrateAssets(); }, [hydrateProjects, hydrateAssets]);

  const stats = useMemo(() => {
    const active = projects.filter((p) => p.status === PROJECT_STATUSES.ACTIVE).length;
    const installed = assets.filter((a) => a.status === ASSET_STATUSES.INSTALLED).length;
    const certified = assets.filter((a) => a.status === ASSET_STATUSES.CERTIFIED).length;
    const ncr = assets.filter((a) => a.status === ASSET_STATUSES.NONCONFORMANCE).length;
    return { active, installed, certified, ncr };
  }, [projects, assets]);

  const recent = projects.slice(0, 6);

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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
        <Stat icon={FolderOpen}    label="Active projects"  value={stats.active} />
        <Stat icon={ShieldCheck}   label="Assets installed" value={stats.installed} />
        <Stat icon={FileBadge2}    label="Assets certified" value={stats.certified} />
        <Stat icon={AlertTriangle} label="Non-conformances" value={stats.ncr} accent="warning" />
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

      <Card>
        <strong>Phase status</strong>
        <p style={{ fontSize: 13, color: 'var(--geist-fg-3)', marginTop: 8 }}>
          Phase 1 complete: schema reset, bloat removed. SystemLibrary seeded with starter entries from Hilti, Promat, Trafalgar, Boss. Asset register and plan-pin layer land in phase 3, AS 1851 inspections in phase 5, cert pack generation in phase 7. See <code>REBUILD.md</code> for the full plan.
        </p>
      </Card>
    </motion.div>
  );
}

function Stat({ icon: Icon, label, value, accent }) {
  const colour =
    accent === 'warning' ? 'var(--geist-warning, #f59e0b)'
    : 'var(--geist-fg-2, #6b7280)';
  return (
    <Card>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Icon size={18} color={colour} />
        <div>
          <div style={{ fontSize: 22, fontWeight: 600 }}>{value}</div>
          <div style={{ fontSize: 11, color: 'var(--geist-fg-4)' }}>{label}</div>
        </div>
      </div>
    </Card>
  );
}
