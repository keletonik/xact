import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderOpen, AlertTriangle, ClipboardCheck, Bug, Wrench, FileBadge2,
  ShieldCheck, ArrowUpRight,
} from 'lucide-react';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import PaperCard from '../components/draft/PaperCard';
import InkStamp from '../components/draft/InkStamp';
import HatchPanel from '../components/draft/HatchPanel';
import CalloutBalloon from '../components/draft/CalloutBalloon';
import RevisionStamp from '../components/draft/RevisionStamp';
import useProjectStore from '../stores/useProjectStore';
import useAssetStore from '../stores/useAssetStore';
import useDefectStore from '../stores/useDefectStore';
import useInspectionStore from '../stores/useInspectionStore';
import useWorkOrderStore from '../stores/useWorkOrderStore';
import useCertPackStore from '../stores/useCertPackStore';
import {
  ASSET_STATUSES, PROJECT_STATUSES, PROJECT_TYPE_LABELS,
} from '../utils/constants';
import { formatRelativeTime } from '../utils/formatters';

/**
 * Dashboard rendered as the master sheet's information panel.
 * The top is a "KPI schedule" with mono callout values, the middle
 * is the asset-distribution chart drafted as a histogram, and the
 * lower band is the recent-projects ledger.
 */
export default function Dashboard() {
  const navigate = useNavigate();
  const projects   = useProjectStore((s) => s.projects);
  const hydrateP   = useProjectStore((s) => s.hydrate);
  const assets     = useAssetStore((s) => s.assets);
  const hydrateA   = useAssetStore((s) => s.hydrate);
  const defects    = useDefectStore((s) => s.defects);
  const hydrateD   = useDefectStore((s) => s.hydrate);
  const inspections= useInspectionStore((s) => s.inspections);
  const hydrateI   = useInspectionStore((s) => s.hydrate);
  const workOrders = useWorkOrderStore((s) => s.workOrders);
  const hydrateW   = useWorkOrderStore((s) => s.hydrate);
  const certPacks  = useCertPackStore((s) => s.certPacks);
  const hydrateC   = useCertPackStore((s) => s.hydrate);

  useEffect(() => {
    hydrateP(); hydrateA(); hydrateD(); hydrateI(); hydrateW(); hydrateC();
  }, [hydrateP, hydrateA, hydrateD, hydrateI, hydrateW, hydrateC]);

  const stats = useMemo(() => {
    const active = projects.filter((p) => p.status === PROJECT_STATUSES.ACTIVE).length;
    const installed = assets.filter((a) => a.status === ASSET_STATUSES.INSTALLED).length;
    const certified = assets.filter((a) => a.status === ASSET_STATUSES.CERTIFIED).length;
    const ncr = assets.filter((a) => a.status === ASSET_STATUSES.NONCONFORMANCE).length;
    const openDefects = defects.filter((d) => d.status !== 'verified').length;
    const overdueDefects = defects.filter((d) => {
      if (d.status === 'verified') return false;
      if (!d.rectificationDueDate) return false;
      return new Date(d.rectificationDueDate) < new Date();
    }).length;
    const classA = defects.filter((d) => d.severity === 'A' && d.status !== 'verified').length;
    const inspectionsDue = inspections.filter((i) => {
      if (i.status === 'completed') return false;
      if (!i.scheduledDate) return false;
      return new Date(i.scheduledDate) <= new Date();
    }).length;
    const workOrdersOpen = workOrders.filter((w) => w.status === 'scheduled' || w.status === 'in_progress').length;
    return {
      active, installed, certified, ncr,
      openDefects, overdueDefects, classA,
      inspectionsDue, workOrdersOpen,
      certPacks: certPacks.length,
    };
  }, [projects, assets, defects, inspections, workOrders, certPacks]);

  const byStatus = useMemo(() => {
    const counts = {};
    for (const a of assets) counts[a.status] = (counts[a.status] || 0) + 1;
    return [
      { name: 'Planned',   value: counts.planned || 0,        fill: 'var(--status-planned-ink)' },
      { name: 'Installed', value: counts.installed || 0,      fill: 'var(--status-installed-ink)' },
      { name: 'Rectify',   value: counts.rectification || 0,  fill: 'var(--status-rectification-ink)' },
      { name: 'Certified', value: counts.certified || 0,      fill: 'var(--status-certified-ink)' },
      { name: 'NCR',       value: counts.nonconformance || 0, fill: 'var(--status-nonconformance-ink)' },
    ];
  }, [assets]);

  const byProject = useMemo(() => {
    const counts = {};
    for (const a of assets) counts[a.projectId] = (counts[a.projectId] || 0) + 1;
    return projects
      .map((p) => ({ name: p.code, total: counts[p.id] || 0 }))
      .filter((d) => d.total > 0)
      .sort((a, b) => b.total - a.total)
      .slice(0, 8);
  }, [assets, projects]);

  const recent = projects.slice(0, 6);

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
          <div className="xc-stamp" style={{ marginBottom: 6 }}>master · dashboard</div>
          <h1 className="xc-display-italic" style={{ margin: 0, fontSize: 56, lineHeight: 1, color: 'var(--ink)' }}>
            Drawing the line<br/>on passive fire.
          </h1>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-3)', marginTop: 14 }}>
            {projects.length} projects on register · {assets.length} assets · {stats.openDefects} defects open · {certPacks.length} cert packs filed
          </p>
        </div>
        <RevisionStamp letter="B" date={new Date().toLocaleDateString('en-AU')} pulse={stats.classA > 0} />
      </section>

      {/* Class-A defect alarm: a hatched warning panel that
          replaces the generic banner. Only renders when needed. */}
      {stats.classA > 0 && (
        <HatchPanel tone="danger" title={`${stats.classA} class-a defect${stats.classA === 1 ? '' : 's'} live`} icon={AlertTriangle}>
          Same-day rectification target per AS 1851. Open the defects tab on the affected projects and clear class-A before the day closes.
        </HatchPanel>
      )}

      {/* KPI schedule: nine cells drafted as a single ruled
          grid, not nine floating cards. */}
      <PaperCard title="kpi schedule · 29.05.2026" meta="open · live">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gridAutoRows: '92px',
          borderTop: '1px solid var(--rule)',
          borderLeft: '1px solid var(--rule)',
        }}>
          <KpiCell label="Active projects" value={stats.active} icon={FolderOpen} onClick={() => navigate('/projects')} accent="ink" />
          <KpiCell label="Installed"       value={stats.installed} icon={ShieldCheck} accent="info" />
          <KpiCell label="Certified"       value={stats.certified} icon={FileBadge2}  accent="success" />
          <KpiCell label="Non-conform"     value={stats.ncr}       icon={AlertTriangle} accent={stats.ncr ? 'danger' : 'mute'} />
          <KpiCell label="Open defects"    value={stats.openDefects} icon={Bug} accent={stats.classA ? 'danger' : (stats.openDefects ? 'warning' : 'mute')} />
          <KpiCell label="Overdue"         value={stats.overdueDefects} icon={AlertTriangle} accent={stats.overdueDefects ? 'danger' : 'mute'} />
          <KpiCell label="Inspect. due"    value={stats.inspectionsDue} icon={ClipboardCheck} accent={stats.inspectionsDue ? 'warning' : 'mute'} />
          <KpiCell label="Open work ord."  value={stats.workOrdersOpen} icon={Wrench} accent="info" />
          <KpiCell label="Cert packs"      value={stats.certPacks} icon={FileBadge2} accent="success" />
          <KpiCell label="Total assets"    value={assets.length} icon={ShieldCheck} accent="ink" />
        </div>
      </PaperCard>

      {/* Two-pane: distribution histogram + per-project schedule */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
        <PaperCard title="status distribution" meta={`${assets.length} total`}>
          {assets.length === 0 ? (
            <EmptyDraft note="no assets drawn yet" />
          ) : (
            <div style={{ height: 220 }}>
              <ResponsiveContainer>
                <BarChart data={byStatus} margin={{ top: 6, right: 6, bottom: 6, left: 0 }}>
                  <XAxis dataKey="name" fontSize={10} stroke="var(--ink-3)" tickLine={false} axisLine={{ stroke: 'var(--rule-strong)' }} />
                  <YAxis fontSize={10} stroke="var(--ink-3)" tickLine={false} axisLine={{ stroke: 'var(--rule-strong)' }} allowDecimals={false} />
                  <Tooltip
                    cursor={{ fill: 'rgba(14,14,15,0.04)' }}
                    contentStyle={{
                      background: 'var(--paper-1)',
                      border: '1px solid var(--ink)',
                      borderRadius: 0,
                      fontFamily: 'var(--font-mono)',
                      fontSize: 11,
                      letterSpacing: '0.06em',
                    }}
                  />
                  <Bar dataKey="value" radius={0} maxBarSize={48}>
                    {byStatus.map((d, i) => (
                      <Bar key={i} dataKey="value" fill={d.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </PaperCard>

        <PaperCard title="assets per project · top 8" meta="descending">
          {byProject.length === 0 ? (
            <EmptyDraft note="no projects with assets" />
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
              <tbody>
                {byProject.map((p, i) => (
                  <tr key={p.name} style={{ borderTop: i === 0 ? '1px solid var(--rule)' : '1px solid var(--rule)' }}>
                    <td style={{ padding: '8px 10px 8px 0', color: 'var(--ink-3)', width: 26 }}>{String(i + 1).padStart(2, '0')}</td>
                    <td style={{ padding: '8px 10px', whiteSpace: 'nowrap' }}>
                      <CalloutBalloon size="sm">{p.name}</CalloutBalloon>
                    </td>
                    <td style={{ padding: '8px 10px', width: '100%' }}>
                      <div style={{
                        height: 6,
                        background: 'var(--paper-3)',
                        position: 'relative',
                      }}>
                        <div style={{
                          position: 'absolute', inset: 0,
                          width: `${Math.min(100, (p.total / (byProject[0].total || 1)) * 100)}%`,
                          background: 'var(--ink)',
                        }} />
                      </div>
                    </td>
                    <td style={{ padding: '8px 0 8px 10px', textAlign: 'right', color: 'var(--ink)' }}>{p.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </PaperCard>
      </div>

      {/* Recent ledger */}
      <PaperCard title="recent projects" meta={`${recent.length} shown · click to open`}>
        {recent.length === 0 ? (
          <EmptyDraft note="no projects drawn yet, start one from the project register" />
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr>
                {['Code', 'Name', 'Type', 'Status', 'Updated', ''].map((h, i) => (
                  <th key={i} style={{
                    textAlign: i === 5 ? 'right' : 'left',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 10,
                    letterSpacing: 'var(--tracking-label)',
                    textTransform: 'uppercase',
                    color: 'var(--ink-3)',
                    fontWeight: 600,
                    padding: '8px 12px',
                    borderBottom: '1.5px solid var(--rule-ink)',
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recent.map((p) => (
                <tr
                  key={p.id}
                  onClick={() => navigate(`/projects/${p.id}`)}
                  className="xc-sched-row"
                  style={{ cursor: 'pointer' }}
                >
                  <td style={cell()}><CalloutBalloon size="sm">{p.code}</CalloutBalloon></td>
                  <td style={cell()}>
                    <span className="xc-display-italic" style={{ fontSize: 18 }}>{p.name}</span>
                  </td>
                  <td style={cell()}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-3)' }}>
                      {PROJECT_TYPE_LABELS[p.projectType]}
                    </span>
                  </td>
                  <td style={cell()}>
                    <InkStamp tone={stampTone(p.status)} size="sm" rotate={-2}>{p.status}</InkStamp>
                  </td>
                  <td style={cell()}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-3)' }}>
                      {formatRelativeTime(p.updatedAt)}
                    </span>
                  </td>
                  <td style={{ ...cell(), textAlign: 'right' }}>
                    <ArrowUpRight size={14} color="var(--ink-3)" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </PaperCard>

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

function KpiCell({ label, value, icon: Icon, accent = 'ink', onClick }) {
  const tone = {
    ink:     { fg: 'var(--ink)',                          ic: 'var(--ink-3)' },
    info:    { fg: 'var(--status-installed-ink)',         ic: 'var(--status-installed-ink)' },
    success: { fg: 'var(--status-certified-ink)',         ic: 'var(--status-certified-ink)' },
    warning: { fg: 'var(--status-rectification-ink)',     ic: 'var(--status-rectification-ink)' },
    danger:  { fg: 'var(--accent)',                       ic: 'var(--accent)' },
    mute:    { fg: 'var(--ink-3)',                        ic: 'var(--ink-4)' },
  }[accent] || { fg: 'var(--ink)', ic: 'var(--ink-3)' };

  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        textAlign: 'left',
        background: 'transparent',
        border: 'none',
        borderRight: '1px solid var(--rule)',
        borderBottom: '1px solid var(--rule)',
        padding: '14px 16px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        cursor: onClick ? 'pointer' : 'default',
        position: 'relative',
        minWidth: 0,
      }}
    >
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 9,
        letterSpacing: 'var(--tracking-label)',
        textTransform: 'uppercase',
        color: 'var(--ink-3)',
      }}>
        {label}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
        <span style={{
          fontFamily: 'var(--font-display)',
          fontStyle: 'italic',
          fontSize: 38,
          lineHeight: 1,
          color: tone.fg,
        }}>
          {value}
        </span>
        {Icon && <Icon size={14} color={tone.ic} strokeWidth={2.25} />}
      </div>
    </button>
  );
}

function EmptyDraft({ note }) {
  return (
    <div style={{
      padding: '36px 20px',
      textAlign: 'center',
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      letterSpacing: 'var(--tracking-label)',
      textTransform: 'uppercase',
      color: 'var(--ink-4)',
    }}>
      <span aria-hidden="true" style={{ display: 'block', fontSize: 28, lineHeight: 1, color: 'var(--ink-5)', marginBottom: 4 }}>―</span>
      {note}
    </div>
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

const cell = () => ({
  padding: '10px 12px',
  borderBottom: '1px solid var(--rule)',
  verticalAlign: 'middle',
});
