import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  ClipboardCheck,
  ShieldCheck,
  Wrench,
  AlertTriangle,
  Flame,
  TrendingUp,
  Calendar,
  ChevronRight,
  Plus,
  ArrowUpRight,
  Activity,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
  Legend,
} from 'recharts';
import StatsCard from '../components/common/StatsCard';
import Card, { CardHeader } from '../components/common/Card';
import Button from '../components/common/Button';
import EmptyState from '../components/common/EmptyState';
import StatusBadge from '../components/common/StatusBadge';
import {
  dashboardStats,
  monthlyInspections,
  complianceByCategory,
  buildingRiskDistribution,
  workOrderTrend,
  recentActivity,
  inspections,
  buildings,
  workOrders,
} from '../data/mockData';
import { formatDate, timeAgo } from '../utils/helpers';

const CHART_COLORS = ['#f97316', '#22c55e', '#3b82f6', '#a855f7', '#ef4444', '#14b8a6'];

export default function Dashboard() {
  const navigate = useNavigate();
  const stats = dashboardStats;

  const hasData = buildings.length > 0;

  return (
    <div>
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
          borderRadius: 'var(--radius-xl)',
          padding: '28px 32px',
          marginBottom: 24,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontSize: '1.375rem', fontWeight: 700, color: '#fff', marginBottom: 6 }}>
            Welcome to Evalux
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.7)', maxWidth: 500, lineHeight: 1.6 }}>
            Your comprehensive fire safety management platform. Monitor inspections, track compliance, and manage equipment all in one place.
          </p>
          <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
            <Button size="sm" icon={Plus} onClick={() => navigate('/inspections')}>
              New Inspection
            </Button>
            <Button size="sm" variant="ghost" icon={Calendar} onClick={() => navigate('/schedule')}
              style={{ color: 'rgba(255,255,255,0.8)', border: '1px solid rgba(255,255,255,0.2)' }}>
              View Schedule
            </Button>
          </div>
        </div>
        {/* Decorative flame element */}
        <div style={{
          position: 'absolute',
          right: 32,
          top: '50%',
          transform: 'translateY(-50%)',
          opacity: 0.08,
        }}>
          <Flame size={140} />
        </div>
      </motion.div>

      {/* KPI Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 16,
        marginBottom: 24,
      }}>
        <StatsCard
          title="Total Buildings"
          value={stats.totalBuildings}
          subtitle="properties managed"
          icon={Building2}
          color="fire"
          delay={0}
        />
        <StatsCard
          title="Inspections"
          value={stats.completedInspections}
          subtitle={`of ${stats.totalInspections} total`}
          icon={ClipboardCheck}
          color="info"
          delay={1}
        />
        <StatsCard
          title="Compliance Rate"
          value={`${stats.complianceRate}%`}
          subtitle="across all properties"
          icon={ShieldCheck}
          color={stats.complianceRate >= 80 ? 'success' : stats.complianceRate >= 60 ? 'warning' : 'danger'}
          delay={2}
        />
        <StatsCard
          title="Open Work Orders"
          value={stats.openWorkOrders}
          subtitle={stats.criticalWorkOrders > 0 ? `${stats.criticalWorkOrders} critical` : 'none critical'}
          icon={Wrench}
          color={stats.criticalWorkOrders > 0 ? 'danger' : 'warning'}
          delay={3}
        />
      </div>

      {!hasData ? (
        /* Empty State for new users */
        <Card>
          <EmptyState
            icon={Flame}
            title="Get Started with Evalux"
            description="Add your first building to start managing fire safety inspections, equipment, and compliance. Your dashboard analytics will appear here once you have data."
            actionLabel="Add Building"
            onAction={() => navigate('/buildings')}
            secondaryLabel="Explore Demo"
            onSecondary={() => {}}
          />
        </Card>
      ) : (
        /* Charts & Data Grid */
        <>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr',
            gap: 16,
            marginBottom: 24,
          }}>
            {/* Inspections Chart */}
            <Card>
              <CardHeader
                title="Inspection Activity"
                subtitle="Monthly completed vs scheduled"
                icon={Activity}
                action={
                  <Button size="sm" variant="ghost" iconRight={ChevronRight} onClick={() => navigate('/inspections')}>
                    View All
                  </Button>
                }
              />
              {monthlyInspections.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={monthlyInspections}>
                    <defs>
                      <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorScheduled" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" />
                    <XAxis dataKey="month" tick={{ fill: 'var(--text-tertiary)', fontSize: 12 }} />
                    <YAxis tick={{ fill: 'var(--text-tertiary)', fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--bg-card)',
                        border: '1px solid var(--border-primary)',
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                    />
                    <Area type="monotone" dataKey="scheduled" stroke="#3b82f6" fill="url(#colorScheduled)" strokeWidth={2} />
                    <Area type="monotone" dataKey="completed" stroke="#f97316" fill="url(#colorCompleted)" strokeWidth={2} />
                    <Legend />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)', fontSize: '0.8125rem' }}>
                  No inspection data available yet
                </div>
              )}
            </Card>

            {/* Risk Distribution */}
            <Card>
              <CardHeader
                title="Building Risk Levels"
                subtitle="Current risk assessment"
                icon={AlertTriangle}
              />
              {buildingRiskDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={buildingRiskDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={95}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {buildingRiskDistribution.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--bg-card)',
                        border: '1px solid var(--border-primary)',
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)', fontSize: '0.8125rem' }}>
                  No buildings added yet
                </div>
              )}
            </Card>
          </div>

          {/* Work Orders + Compliance Charts */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 16,
            marginBottom: 24,
          }}>
            <Card>
              <CardHeader
                title="Work Order Trend"
                subtitle="Opened vs closed per month"
                icon={Wrench}
              />
              {workOrderTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={workOrderTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" />
                    <XAxis dataKey="month" tick={{ fill: 'var(--text-tertiary)', fontSize: 12 }} />
                    <YAxis tick={{ fill: 'var(--text-tertiary)', fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--bg-card)',
                        border: '1px solid var(--border-primary)',
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                    />
                    <Bar dataKey="opened" fill="#ef4444" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="closed" fill="#22c55e" radius={[4, 4, 0, 0]} />
                    <Legend />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)', fontSize: '0.8125rem' }}>
                  No work order data yet
                </div>
              )}
            </Card>

            <Card>
              <CardHeader
                title="Compliance by Category"
                subtitle="NFPA code compliance status"
                icon={ShieldCheck}
              />
              {complianceByCategory.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={complianceByCategory} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" />
                    <XAxis type="number" tick={{ fill: 'var(--text-tertiary)', fontSize: 11 }} />
                    <YAxis dataKey="name" type="category" tick={{ fill: 'var(--text-tertiary)', fontSize: 11 }} width={130} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--bg-card)',
                        border: '1px solid var(--border-primary)',
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                    />
                    <Bar dataKey="compliant" fill="#22c55e" stackId="a" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="nonCompliant" fill="#ef4444" stackId="a" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)', fontSize: '0.8125rem' }}>
                  No compliance data yet
                </div>
              )}
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader
              title="Recent Activity"
              subtitle="Latest actions across all modules"
              icon={TrendingUp}
            />
            {recentActivity.length > 0 ? (
              <div>
                {recentActivity.map((item, i) => (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 16,
                      padding: '12px 0',
                      borderBottom: i < recentActivity.length - 1 ? '1px solid var(--border-secondary)' : 'none',
                    }}
                  >
                    <div style={{
                      width: 36,
                      height: 36,
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-tertiary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <Activity size={16} style={{ color: 'var(--color-fire-500)' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {item.action}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                        {item.detail}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                        {timeAgo(item.time)}
                      </div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', marginTop: 2 }}>
                        {item.user}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.8125rem' }}>
                No recent activity to display
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
