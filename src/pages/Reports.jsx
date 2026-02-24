import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileBarChart,
  Download,
  Calendar,
  Building2,
  ClipboardCheck,
  ShieldCheck,
  Wrench,
  Flame,
  FileText,
  BarChart3,
  PieChart as PieChartIcon,
  TrendingUp,
} from 'lucide-react';
import Card, { CardHeader } from '../components/common/Card';
import Button from '../components/common/Button';
import EmptyState from '../components/common/EmptyState';

const reportTemplates = [
  {
    id: 'rpt-001',
    name: 'Monthly Compliance Summary',
    description: 'Overview of compliance status across all buildings with trend analysis.',
    icon: ShieldCheck,
    category: 'Compliance',
    format: 'PDF',
  },
  {
    id: 'rpt-002',
    name: 'Inspection Activity Report',
    description: 'Detailed report of all inspections completed, scheduled, and overdue.',
    icon: ClipboardCheck,
    category: 'Inspections',
    format: 'PDF',
  },
  {
    id: 'rpt-003',
    name: 'Equipment Inventory Report',
    description: 'Complete inventory of fire safety equipment with maintenance status.',
    icon: Flame,
    category: 'Equipment',
    format: 'Excel',
  },
  {
    id: 'rpt-004',
    name: 'Work Order Summary',
    description: 'Summary of open, in-progress, and completed work orders with costs.',
    icon: Wrench,
    category: 'Work Orders',
    format: 'PDF',
  },
  {
    id: 'rpt-005',
    name: 'Building Risk Assessment',
    description: 'Risk evaluation for each building with recommendations.',
    icon: Building2,
    category: 'Buildings',
    format: 'PDF',
  },
  {
    id: 'rpt-006',
    name: 'Deficiency Tracking Report',
    description: 'All open deficiencies with resolution timelines and responsible parties.',
    icon: FileText,
    category: 'Compliance',
    format: 'Excel',
  },
  {
    id: 'rpt-007',
    name: 'Annual Fire Safety Report',
    description: 'Comprehensive annual report suitable for AHJ submission.',
    icon: FileBarChart,
    category: 'Compliance',
    format: 'PDF',
  },
  {
    id: 'rpt-008',
    name: 'Cost Analysis Report',
    description: 'Breakdown of maintenance costs, work order expenses, and budget tracking.',
    icon: BarChart3,
    category: 'Financial',
    format: 'Excel',
  },
];

export default function Reports() {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = ['all', ...new Set(reportTemplates.map(r => r.category))];

  const filtered = selectedCategory === 'all'
    ? reportTemplates
    : reportTemplates.filter(r => r.category === selectedCategory);

  return (
    <div>
      {/* Category Filter */}
      <div style={{
        display: 'flex',
        gap: 8,
        marginBottom: 24,
        flexWrap: 'wrap',
      }}>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.8125rem',
              fontWeight: 600,
              backgroundColor: selectedCategory === cat ? 'var(--color-fire-500)' : 'var(--bg-card)',
              color: selectedCategory === cat ? '#fff' : 'var(--text-secondary)',
              border: `1px solid ${selectedCategory === cat ? 'var(--color-fire-500)' : 'var(--border-primary)'}`,
              transition: 'all var(--transition-fast)',
            }}
          >
            {cat === 'all' ? 'All Reports' : cat}
          </button>
        ))}
      </div>

      {/* Report Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: 16,
      }}>
        {filtered.map((report, i) => {
          const Icon = report.icon;
          return (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card hover>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                  <div style={{
                    width: 44,
                    height: 44,
                    borderRadius: 'var(--radius-lg)',
                    background: 'linear-gradient(135deg, var(--color-fire-50), var(--color-fire-100))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <Icon size={22} style={{ color: 'var(--color-fire-600)' }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: 4 }}>{report.name}</h3>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 12 }}>
                      {report.description}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-full)',
                          backgroundColor: 'var(--bg-tertiary)',
                          fontSize: '0.6875rem',
                          fontWeight: 600,
                          color: 'var(--text-tertiary)',
                        }}>
                          {report.category}
                        </span>
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-full)',
                          backgroundColor: report.format === 'PDF' ? 'var(--color-danger-50)' : 'var(--color-success-50)',
                          fontSize: '0.6875rem',
                          fontWeight: 600,
                          color: report.format === 'PDF' ? 'var(--color-danger-600)' : 'var(--color-success-600)',
                        }}>
                          {report.format}
                        </span>
                      </div>
                      <Button size="sm" variant="secondary" icon={Download}>Generate</Button>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
