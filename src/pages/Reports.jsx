import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  FileBarChart, Download, BarChart3, TrendingUp, DollarSign,
  Calculator, FolderOpen, PieChart as PieChartIcon, Activity,
} from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import useProjectStore, { computePipelineStats } from '../stores/useProjectStore';
import useEstimateStore from '../stores/useEstimateStore';
import useProposalStore from '../stores/useProposalStore';
import usePriceBookStore from '../stores/usePriceBookStore';
import { formatCurrency, formatPercent } from '../utils/formatters';

const CHART_COLORS = ['#f97316', '#3b82f6', '#22c55e', '#8b5cf6', '#ef4444', '#eab308'];

export default function Reports() {
  const [selectedReport, setSelectedReport] = useState('overview');
  const projects = useProjectStore((s) => s.projects);
  // Derive stats from the stable `projects` reference — calling
  // `getPipelineStats()` from inside a Zustand selector returns a fresh
  // object every render and trips React 19's getSnapshot loop.
  const pipelineStats = useMemo(() => computePipelineStats(projects), [projects]);
  const estimates = useEstimateStore((s) => s.estimates);
  const proposals = useProposalStore((s) => s.proposals);
  const items = usePriceBookStore((s) => s.items);

  const stats = useMemo(() => {
    const totalEstimateValue = estimates.reduce((sum, e) => sum + e.totals.totalIncTax, 0);
    const avgMargin = estimates.length > 0
      ? estimates.reduce((sum, e) => sum + e.totals.effectiveMargin, 0) / estimates.length
      : 0;
    const totalDirectCost = estimates.reduce((sum, e) => sum + e.totals.directCost, 0);

    const wonProjects = projects.filter((p) => p.status === 'won').length;
    const lostProjects = projects.filter((p) => p.status === 'lost').length;
    const winRate = wonProjects + lostProjects > 0
      ? wonProjects / (wonProjects + lostProjects)
      : 0;

    const sentProposals = proposals.filter((p) => p.status === 'sent' || p.status === 'accepted' || p.status === 'declined').length;
    const acceptedProposals = proposals.filter((p) => p.status === 'accepted').length;
    const conversionRate = sentProposals > 0 ? acceptedProposals / sentProposals : 0;

    return { totalEstimateValue, avgMargin, totalDirectCost, winRate, conversionRate, wonProjects, lostProjects, sentProposals, acceptedProposals };
  }, [estimates, projects, proposals]);

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

  const pipelineData = [
    { stage: 'Leads', value: pipelineStats.leads },
    { stage: 'Opportunities', value: pipelineStats.opportunities },
    { stage: 'Quoting', value: pipelineStats.quoting },
    { stage: 'Quoted', value: pipelineStats.quoted },
    { stage: 'Won', value: pipelineStats.won },
    { stage: 'Lost', value: pipelineStats.lost },
  ];

  const marginData = useMemo(() => {
    return estimates.map((e) => ({
      name: e.ref,
      margin: Math.round(e.totals.effectiveMargin * 100) / 100,
      value: Math.round(e.totals.totalIncTax),
    }));
  }, [estimates]);

  const reportTabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'pipeline', label: 'Pipeline', icon: FolderOpen },
    { id: 'margins', label: 'Margin Analysis', icon: TrendingUp },
    { id: 'costs', label: 'Cost Breakdown', icon: DollarSign },
  ];

  return (
    <div style={{ padding: '24px 32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>Reports</h1>
          <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-tertiary)', margin: '4px 0 0' }}>Estimating analytics and performance insights</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {reportTabs.map((tab) => {
          const TabIcon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedReport(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 16px', borderRadius: 'var(--radius-full)',
                fontSize: '0.8125rem', fontWeight: 600,
                backgroundColor: selectedReport === tab.id ? 'var(--color-fire-500)' : 'var(--color-bg-card)',
                color: selectedReport === tab.id ? '#fff' : 'var(--color-text-secondary)',
                border: `1px solid ${selectedReport === tab.id ? 'var(--color-fire-500)' : 'var(--color-border)'}`,
                cursor: 'pointer',
              }}
            >
              <TabIcon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Overview */}
      {selectedReport === 'overview' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {/* KPI Summary */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
            {[
              { label: 'Total Estimate Value', value: formatCurrency(stats.totalEstimateValue, 0), color: 'var(--color-fire-500)' },
              { label: 'Average Margin', value: formatPercent(stats.avgMargin), color: 'var(--color-success-500)' },
              { label: 'Win Rate', value: formatPercent(stats.winRate), color: 'var(--color-info-500)' },
              { label: 'Proposal Conversion', value: formatPercent(stats.conversionRate), color: 'var(--color-warning-500)' },
            ].map((kpi) => (
              <Card key={kpi.label}>
                <div style={{ fontSize: '0.7rem', color: 'var(--color-text-tertiary)', marginBottom: 4 }}>{kpi.label}</div>
                <div style={{ fontSize: '1.375rem', fontWeight: 700, color: kpi.color }}>{kpi.value}</div>
              </Card>
            ))}
          </div>

          {/* Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            <Card>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-primary)', margin: '0 0 12px' }}>Project Pipeline</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {pipelineData.map((item, i) => (
                  <div key={item.stage} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 80, fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>{item.stage}</div>
                    <div style={{ flex: 1, height: 20, background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                      <div style={{
                        width: `${Math.min(item.value * 20, 100)}%`, height: '100%',
                        background: CHART_COLORS[i % CHART_COLORS.length], borderRadius: 'var(--radius-sm)',
                        transition: 'width 0.3s',
                      }} />
                    </div>
                    <div style={{ width: 24, fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-primary)', textAlign: 'right' }}>{item.value}</div>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-primary)', margin: '0 0 12px' }}>Quick Stats</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <StatRow label="Total Projects" value={projects.length} />
                <StatRow label="Active Estimates" value={estimates.filter((e) => e.status === 'draft').length} />
                <StatRow label="Pipeline Value" value={formatCurrency(pipelineStats.pipelineValue, 0)} />
                <StatRow label="Price Book Items" value={items.length} />
                <StatRow label="Total Direct Cost" value={formatCurrency(stats.totalDirectCost, 0)} />
                <StatRow label="Proposals Sent" value={stats.sentProposals} />
                <StatRow label="Proposals Accepted" value={stats.acceptedProposals} />
              </div>
            </Card>
          </div>
        </motion.div>
      )}

      {/* Pipeline Report */}
      {selectedReport === 'pipeline' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Card>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-primary)', margin: '0 0 16px' }}>Project Pipeline Distribution</h3>
            {projects.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
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
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, color: 'var(--color-text-tertiary)', fontSize: '0.8125rem' }}>
                No project data yet
              </div>
            )}
          </Card>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginTop: 24 }}>
            <Card>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-primary)', margin: '0 0 12px' }}>Win/Loss Summary</h3>
              <div style={{ display: 'flex', gap: 24 }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-success-500)' }}>{stats.wonProjects}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>Won</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-danger-500)' }}>{stats.lostProjects}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>Lost</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-fire-500)' }}>{formatPercent(stats.winRate)}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>Win Rate</div>
                </div>
              </div>
            </Card>

            <Card>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-primary)', margin: '0 0 12px' }}>Pipeline Value</h3>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-fire-500)' }}>
                {formatCurrency(pipelineStats.pipelineValue, 0)}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', marginTop: 4 }}>
                Across {pipelineStats.leads + pipelineStats.opportunities + pipelineStats.quoting + pipelineStats.quoted} active opportunities
              </div>
            </Card>
          </div>
        </motion.div>
      )}

      {/* Margin Analysis */}
      {selectedReport === 'margins' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
            <Card>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-primary)', margin: '0 0 4px' }}>Average Effective Margin</h3>
              <div style={{ fontSize: '2.5rem', fontWeight: 700, color: stats.avgMargin >= 15 ? 'var(--color-success-500)' : stats.avgMargin >= 10 ? 'var(--color-warning-500)' : 'var(--color-danger-500)' }}>
                {formatPercent(stats.avgMargin)}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', marginTop: 4 }}>
                {stats.avgMargin >= 15 ? 'Healthy margin' : stats.avgMargin >= 10 ? 'Margin could be improved' : 'Low margin — review pricing'}
              </div>
            </Card>

            <Card>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-primary)', margin: '0 0 4px' }}>Total Direct Cost vs Sell</h3>
              <div style={{ display: 'flex', gap: 24, marginTop: 8 }}>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--color-text-tertiary)' }}>Direct Cost</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>{formatCurrency(stats.totalDirectCost, 0)}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--color-text-tertiary)' }}>Sell (inc. GST)</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-fire-500)' }}>{formatCurrency(stats.totalEstimateValue, 0)}</div>
                </div>
              </div>
            </Card>
          </div>

          {marginData.length > 0 ? (
            <Card>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-primary)', margin: '0 0 16px' }}>Margin by Estimate</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={marginData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--color-text-tertiary)' }} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }} unit="%" />
                  <Tooltip contentStyle={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 12 }} formatter={(v) => `${v}%`} />
                  <Bar dataKey="margin" radius={[4, 4, 0, 0]} fill="#f97316" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          ) : (
            <Card>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, color: 'var(--color-text-tertiary)', fontSize: '0.8125rem' }}>
                No estimate data to analyse
              </div>
            </Card>
          )}
        </motion.div>
      )}

      {/* Cost Breakdown */}
      {selectedReport === 'costs' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            <Card>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-primary)', margin: '0 0 16px' }}>Cost Category Distribution</h3>
              {categoryBreakdown.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie data={categoryBreakdown} dataKey="value" cx="50%" cy="50%" outerRadius={80} strokeWidth={2}>
                        {categoryBreakdown.map((_, i) => (
                          <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 12 }} formatter={(v) => formatCurrency(v)} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12, justifyContent: 'center' }}>
                    {categoryBreakdown.map((cat, i) => (
                      <span key={cat.name} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                        <div style={{ width: 8, height: 8, borderRadius: 2, background: CHART_COLORS[i % CHART_COLORS.length] }} />
                        {cat.name}: {formatCurrency(cat.value, 0)}
                      </span>
                    ))}
                  </div>
                </>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, color: 'var(--color-text-tertiary)', fontSize: '0.8125rem' }}>
                  No cost data yet
                </div>
              )}
            </Card>

            <Card>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-primary)', margin: '0 0 16px' }}>Cost Summary</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {categoryBreakdown.length > 0 ? (
                  <>
                    {categoryBreakdown.map((cat, i) => {
                      const total = categoryBreakdown.reduce((sum, c) => sum + c.value, 0);
                      const pct = total > 0 ? (cat.value / total) * 100 : 0;
                      return (
                        <div key={cat.name}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                            <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>{cat.name}</span>
                            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>{formatCurrency(cat.value, 0)}</span>
                          </div>
                          <div style={{ height: 6, background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                            <div style={{ width: `${pct}%`, height: '100%', background: CHART_COLORS[i % CHART_COLORS.length], borderRadius: 'var(--radius-sm)' }} />
                          </div>
                        </div>
                      );
                    })}
                    <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 12, marginTop: 4 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>Total Direct Cost</span>
                        <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-fire-500)' }}>{formatCurrency(stats.totalDirectCost, 0)}</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, color: 'var(--color-text-tertiary)', fontSize: '0.8125rem' }}>
                    No cost data yet
                  </div>
                )}
              </div>
            </Card>
          </div>
        </motion.div>
      )}
    </div>
  );
}

function StatRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--color-border)' }}>
      <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>{label}</span>
      <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>{value}</span>
    </div>
  );
}
