import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  DollarSign, TrendingUp, FolderOpen, Calculator, FileText,
  BookOpen, ArrowRight, Clock, AlertTriangle, CheckCircle,
  Users, Ruler, BarChart3, Activity,
} from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import useProjectStore from '../stores/useProjectStore';
import useEstimateStore from '../stores/useEstimateStore';
import useProposalStore from '../stores/useProposalStore';
import usePriceBookStore from '../stores/usePriceBookStore';
import useAuditStore from '../stores/useAuditStore';
import { formatCurrency, formatRelativeTime, formatPercent } from '../utils/formatters';

const CHART_COLORS = ['#f97316', '#3b82f6', '#22c55e', '#8b5cf6', '#ef4444', '#eab308'];

export default function Dashboard() {
  const navigate = useNavigate();
  const projects = useProjectStore((s) => s.projects);
  const pipelineStats = useProjectStore((s) => s.getPipelineStats());
  const estimates = useEstimateStore((s) => s.estimates);
  const proposals = useProposalStore((s) => s.proposals);
  const items = usePriceBookStore((s) => s.items);
  const pendingUpdates = usePriceBookStore((s) => s.pendingUpdates);
  const auditEntries = useAuditStore((s) => s.entries);

  const pending = pendingUpdates.filter((u) => u.status === 'pending');

  const stats = useMemo(() => {
    const totalEstimateValue = estimates.reduce((s, e) => s + e.totals.totalIncTax, 0);
    const avgMargin = estimates.length > 0
      ? estimates.reduce((s, e) => s + e.totals.effectiveMargin, 0) / estimates.length
      : 0;

    return { totalEstimateValue, avgMargin };
  }, [estimates]);

  const pipelineData = [
    { stage: 'Leads', value: pipelineStats.leads },
    { stage: 'Opps', value: pipelineStats.opportunities },
    { stage: 'Quoting', value: pipelineStats.quoting },
    { stage: 'Quoted', value: pipelineStats.quoted },
    { stage: 'Won', value: pipelineStats.won },
    { stage: 'Lost', value: pipelineStats.lost },
  ];

  const categoryBreakdown = useMemo(() => {
    const cats = { Material: 0, Labour: 0, Plant: 0, Subcontract: 0, Preliminary: 0 };
    for (const est of estimates) {
      cats.Material += est.totals.breakdown.material;
      cats.Labour += est.totals.breakdown.labour;
      cats.Plant += est.totals.breakdown.plant;
      cats.Subcontract += est.totals.breakdown.subcontract;
      cats.Preliminary += est.totals.breakdown.preliminary;
    }
    return Object.entries(cats)
      .filter(([, v]) => v > 0)
      .map(([name, value]) => ({ name, value: Math.round(value) }));
  }, [estimates]);

  const recentActivity = auditEntries.slice(0, 8);

  return (
    <div style={{ padding: '24px 32px' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>Dashboard</h1>
        <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-tertiary)', margin: '4px 0 0' }}>
          Estimating overview and activity
        </p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Pipeline Value', value: formatCurrency(pipelineStats.pipelineValue, 0), icon: DollarSign, color: 'var(--color-fire-500)', onClick: () => navigate('/opportunities') },
          { label: 'Active Estimates', value: estimates.filter((e) => e.status === 'draft').length, icon: Calculator, color: 'var(--color-info-500)', onClick: () => navigate('/estimates') },
          { label: 'Total Estimate Value', value: formatCurrency(stats.totalEstimateValue, 0), icon: TrendingUp, color: 'var(--color-success-500)' },
          { label: 'Avg. Margin', value: formatPercent(stats.avgMargin), icon: BarChart3, color: 'var(--color-warning-500)' },
          { label: 'Price Book Items', value: items.length, icon: BookOpen, color: 'var(--color-text-secondary)', onClick: () => navigate('/price-book') },
        ].map((stat) => (
          <motion.div key={stat.label} whileHover={{ y: -2 }} transition={{ duration: 0.15 }}>
            <Card hover={!!stat.onClick} onClick={stat.onClick}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--color-text-tertiary)', marginBottom: 4 }}>{stat.label}</div>
                  <div style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>{stat.value}</div>
                </div>
                <div style={{
                  width: 40, height: 40, borderRadius: 'var(--radius-md)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', background: `${stat.color}12`,
                }}>
                  <stat.icon size={20} style={{ color: stat.color }} />
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, marginBottom: 24 }}>
        {/* Pipeline Chart */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>Project Pipeline</h3>
            <Button size="sm" variant="ghost" onClick={() => navigate('/opportunities')}>View All <ArrowRight size={12} /></Button>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={pipelineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="stage" tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }} allowDecimals={false} />
              <Tooltip contentStyle={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {pipelineData.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Cost Category Breakdown */}
        <Card>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-primary)', margin: '0 0 16px' }}>Cost Breakdown</h3>
          {categoryBreakdown.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={categoryBreakdown} dataKey="value" cx="50%" cy="50%" outerRadius={60} strokeWidth={2}>
                    {categoryBreakdown.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 12 }} formatter={(v) => formatCurrency(v)} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8, justifyContent: 'center' }}>
                {categoryBreakdown.map((cat, i) => (
                  <span key={cat.name} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.7rem', color: 'var(--color-text-secondary)' }}>
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: CHART_COLORS[i % CHART_COLORS.length] }} />
                    {cat.name}
                  </span>
                ))}
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 160, color: 'var(--color-text-tertiary)', fontSize: '0.8125rem' }}>
              No estimate data yet
            </div>
          )}
        </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24 }}>
        {/* Recent Activity */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>Recent Activity</h3>
            <Button size="sm" variant="ghost" onClick={() => navigate('/admin')}>View All</Button>
          </div>
          {recentActivity.length === 0 ? (
            <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--color-text-tertiary)', fontSize: '0.8125rem' }}>No activity yet</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {recentActivity.map((entry) => (
                <div key={entry.id} style={{ display: 'flex', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--color-border)' }}>
                  <Activity size={14} style={{ color: 'var(--color-text-tertiary)', flexShrink: 0, marginTop: 2 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-primary)' }}>{entry.description}</div>
                    <div style={{ fontSize: '0.625rem', color: 'var(--color-text-tertiary)' }}>{formatRelativeTime(entry.timestamp)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Quick Actions */}
        <Card>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-primary)', margin: '0 0 12px' }}>Quick Actions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { label: 'New Project', icon: FolderOpen, path: '/projects', color: 'var(--color-info-500)' },
              { label: 'New Estimate', icon: Calculator, path: '/estimates', color: 'var(--color-success-500)' },
              { label: 'Open Takeoff', icon: Ruler, path: '/takeoff', color: 'var(--color-warning-500)' },
              { label: 'New Proposal', icon: FileText, path: '/proposals', color: 'var(--color-fire-500)' },
              { label: 'Browse Price Book', icon: BookOpen, path: '/price-book', color: 'var(--color-text-secondary)' },
            ].map((action) => (
              <button
                key={action.label}
                onClick={() => navigate(action.path)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                  borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)',
                  background: 'var(--color-bg-secondary)', cursor: 'pointer', width: '100%',
                  transition: 'all var(--transition-fast)',
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = action.color}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--color-border)'}
              >
                <action.icon size={16} style={{ color: action.color }} />
                <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--color-text-primary)', flex: 1, textAlign: 'left' }}>{action.label}</span>
                <ArrowRight size={14} style={{ color: 'var(--color-text-tertiary)' }} />
              </button>
            ))}
          </div>
        </Card>

        {/* Alerts */}
        <Card>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-primary)', margin: '0 0 12px' }}>Alerts</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {pending.length > 0 && (
              <div style={{ display: 'flex', gap: 8, padding: '10px', borderRadius: 'var(--radius-md)', background: 'var(--color-warning-50)', border: '1px solid var(--color-warning-200)' }}>
                <AlertTriangle size={16} style={{ color: 'var(--color-warning-600)', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-warning-800)' }}>{pending.length} Price Updates Pending</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--color-warning-600)' }}>Review in Price Book</div>
                </div>
              </div>
            )}

            {estimates.filter((e) => e.status === 'draft' && e.lines.length === 0).length > 0 && (
              <div style={{ display: 'flex', gap: 8, padding: '10px', borderRadius: 'var(--radius-md)', background: 'var(--color-info-50)', border: '1px solid var(--color-info-200)' }}>
                <Calculator size={16} style={{ color: 'var(--color-info-600)', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-info-800)' }}>Empty Estimates</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--color-info-600)' }}>
                    {estimates.filter((e) => e.status === 'draft' && e.lines.length === 0).length} estimates need line items
                  </div>
                </div>
              </div>
            )}

            {pending.length === 0 && estimates.filter((e) => e.status === 'draft' && e.lines.length === 0).length === 0 && (
              <div style={{ display: 'flex', gap: 8, padding: '10px', borderRadius: 'var(--radius-md)', background: 'var(--color-success-50)', border: '1px solid var(--color-success-200)' }}>
                <CheckCircle size={16} style={{ color: 'var(--color-success-600)', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-success-800)' }}>All Clear</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--color-success-600)' }}>No pending actions</div>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
