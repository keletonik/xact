import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ClipboardCheck,
  Plus,
  Filter,
  Download,
  Eye,
  Calendar,
  Building2,
  User,
  AlertTriangle,
  CheckCircle2,
  Clock,
  XCircle,
} from 'lucide-react';
import Card, { CardHeader } from '../components/common/Card';
import Button from '../components/common/Button';
import SearchInput from '../components/common/SearchInput';
import StatusBadge from '../components/common/StatusBadge';
import DataTable from '../components/common/DataTable';
import EmptyState from '../components/common/EmptyState';
import Modal from '../components/common/Modal';
import FormField, { TextInput, TextArea, SelectInput } from '../components/common/FormField';
import { inspections, buildings } from '../data/mockData';
import { formatDate } from '../utils/helpers';

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'completed', label: 'Completed' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'overdue', label: 'Overdue' },
];

const typeOptions = [
  { value: 'Annual Fire Inspection', label: 'Annual Fire Inspection' },
  { value: 'Quarterly Sprinkler Inspection', label: 'Quarterly Sprinkler Inspection' },
  { value: 'Semi-Annual Fire Alarm Test', label: 'Semi-Annual Fire Alarm Test' },
  { value: 'Kitchen Hood System Inspection', label: 'Kitchen Hood System Inspection' },
  { value: 'Five-Year Sprinkler Internal', label: 'Five-Year Sprinkler Internal' },
  { value: 'Quarterly Fire Pump Test', label: 'Quarterly Fire Pump Test' },
  { value: 'Monthly Visual Inspection', label: 'Monthly Visual Inspection' },
];

export default function Inspections() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedInspection, setSelectedInspection] = useState(null);

  const filtered = useMemo(() => {
    return inspections.filter(item => {
      const matchSearch = !search ||
        item.buildingName?.toLowerCase().includes(search.toLowerCase()) ||
        item.type?.toLowerCase().includes(search.toLowerCase()) ||
        item.inspector?.toLowerCase().includes(search.toLowerCase());
      const matchStatus = !statusFilter || item.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [search, statusFilter]);

  const columns = [
    {
      key: 'type',
      label: 'Inspection Type',
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{val}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: 2 }}>
            ID: {row.id}
          </div>
        </div>
      ),
    },
    {
      key: 'buildingName',
      label: 'Building',
      render: (val) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Building2 size={14} style={{ color: 'var(--text-tertiary)' }} />
          <span>{val}</span>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (val) => <StatusBadge status={val} />,
    },
    {
      key: 'result',
      label: 'Result',
      render: (val) => val ? <StatusBadge status={val} /> : <span style={{ color: 'var(--text-tertiary)' }}>—</span>,
    },
    {
      key: 'scheduledDate',
      label: 'Date',
      render: (val) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Calendar size={14} style={{ color: 'var(--text-tertiary)' }} />
          <span>{formatDate(val)}</span>
        </div>
      ),
    },
    {
      key: 'inspector',
      label: 'Inspector',
      render: (val) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <User size={14} style={{ color: 'var(--text-tertiary)' }} />
          <span>{val || '—'}</span>
        </div>
      ),
    },
    {
      key: 'score',
      label: 'Score',
      align: 'center',
      render: (val) => {
        if (!val) return <span style={{ color: 'var(--text-tertiary)' }}>—</span>;
        const color = val >= 90 ? 'var(--color-success-600)' : val >= 70 ? 'var(--color-warning-600)' : 'var(--color-danger-600)';
        return <span style={{ fontWeight: 700, color }}>{val}%</span>;
      },
    },
  ];

  const statusCounts = {
    completed: inspections.filter(i => i.status === 'completed').length,
    scheduled: inspections.filter(i => i.status === 'scheduled').length,
    'in-progress': inspections.filter(i => i.status === 'in-progress').length,
    overdue: inspections.filter(i => i.status === 'overdue').length,
  };

  return (
    <div>
      {/* Status Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: 12,
        marginBottom: 24,
      }}>
        {[
          { label: 'Completed', count: statusCounts.completed, icon: CheckCircle2, color: 'var(--color-success-500)' },
          { label: 'Scheduled', count: statusCounts.scheduled, icon: Calendar, color: 'var(--color-info-500)' },
          { label: 'In Progress', count: statusCounts['in-progress'], icon: Clock, color: 'var(--color-warning-500)' },
          { label: 'Overdue', count: statusCounts.overdue, icon: AlertTriangle, color: 'var(--color-danger-500)' },
        ].map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            style={{
              backgroundColor: 'var(--bg-card)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-primary)',
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <item.icon size={20} style={{ color: item.color }} />
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>{item.count}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{item.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content */}
      <Card padding={false}>
        {/* Toolbar */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 200 }}>
            <div style={{ width: 280 }}>
              <SearchInput value={search} onChange={setSearch} placeholder="Search inspections..." />
            </div>
            <div style={{ width: 160 }}>
              <SelectInput
                value={statusFilter}
                onChange={setStatusFilter}
                options={statusOptions.slice(1)}
                placeholder="All Statuses"
              />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button size="sm" variant="secondary" icon={Download}>Export</Button>
            <Button size="sm" icon={Plus} onClick={() => setShowCreateModal(true)}>New Inspection</Button>
          </div>
        </div>

        {/* Table */}
        {inspections.length === 0 ? (
          <EmptyState
            icon={ClipboardCheck}
            title="No Inspections Yet"
            description="Schedule your first fire safety inspection to start tracking compliance and maintaining safety standards."
            actionLabel="Schedule Inspection"
            onAction={() => setShowCreateModal(true)}
          />
        ) : (
          <DataTable
            columns={columns}
            data={filtered}
            onRowClick={setSelectedInspection}
            emptyMessage="No inspections match your search criteria"
          />
        )}
      </Card>

      {/* Create Inspection Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Schedule New Inspection"
        subtitle="Create a new fire safety inspection"
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>Cancel</Button>
            <Button onClick={() => setShowCreateModal(false)}>Schedule Inspection</Button>
          </>
        }
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
          <FormField label="Inspection Type" required>
            <SelectInput
              value=""
              onChange={() => {}}
              options={typeOptions}
              placeholder="Select type..."
            />
          </FormField>
          <FormField label="Building" required>
            <SelectInput
              value=""
              onChange={() => {}}
              options={buildings.map(b => ({ value: b.id, label: b.name }))}
              placeholder="Select building..."
            />
          </FormField>
          <FormField label="Scheduled Date" required>
            <TextInput type="date" value="" onChange={() => {}} />
          </FormField>
          <FormField label="Inspector" required>
            <SelectInput
              value=""
              onChange={() => {}}
              options={[]}
              placeholder="Select inspector..."
            />
          </FormField>
          <div style={{ gridColumn: '1 / -1' }}>
            <FormField label="Notes">
              <TextArea value="" onChange={() => {}} placeholder="Add any notes or special instructions..." rows={3} />
            </FormField>
          </div>
        </div>
      </Modal>

      {/* Inspection Detail Modal */}
      <Modal
        isOpen={!!selectedInspection}
        onClose={() => setSelectedInspection(null)}
        title={selectedInspection?.type || 'Inspection Details'}
        subtitle={selectedInspection?.buildingName}
        size="lg"
      >
        {selectedInspection && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 24 }}>
              <InfoBlock label="Status" value={<StatusBadge status={selectedInspection.status} />} />
              <InfoBlock label="Result" value={selectedInspection.result ? <StatusBadge status={selectedInspection.result} /> : '—'} />
              <InfoBlock label="Score" value={selectedInspection.score ? `${selectedInspection.score}%` : '—'} />
              <InfoBlock label="Date" value={formatDate(selectedInspection.scheduledDate)} />
              <InfoBlock label="Inspector" value={selectedInspection.inspector || '—'} />
              <InfoBlock label="Duration" value={selectedInspection.duration || '—'} />
              <InfoBlock label="Findings" value={selectedInspection.findings ?? '—'} />
              <InfoBlock label="Critical" value={selectedInspection.criticalFindings ?? '—'} />
            </div>

            {selectedInspection.notes && (
              <div style={{ marginBottom: 24 }}>
                <h4 style={{ fontSize: '0.8125rem', fontWeight: 600, marginBottom: 8, color: 'var(--text-primary)' }}>Notes</h4>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.6, backgroundColor: 'var(--bg-tertiary)', padding: '12px 16px', borderRadius: 'var(--radius-md)' }}>
                  {selectedInspection.notes}
                </p>
              </div>
            )}

            {selectedInspection.checklist?.length > 0 && (
              <div>
                <h4 style={{ fontSize: '0.8125rem', fontWeight: 600, marginBottom: 12, color: 'var(--text-primary)' }}>Checklist Items</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {selectedInspection.checklist.map((item, i) => (
                    <div key={i} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '10px 14px',
                      backgroundColor: 'var(--bg-tertiary)',
                      borderRadius: 'var(--radius-md)',
                    }}>
                      {item.status === 'passed' ? (
                        <CheckCircle2 size={16} style={{ color: 'var(--color-success-500)', flexShrink: 0 }} />
                      ) : item.status === 'failed' ? (
                        <XCircle size={16} style={{ color: 'var(--color-danger-500)', flexShrink: 0 }} />
                      ) : (
                        <Clock size={16} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
                      )}
                      <div style={{ flex: 1 }}>
                        <span style={{ fontSize: '0.8125rem', fontWeight: 500 }}>{item.item}</span>
                        {item.notes && (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginLeft: 8 }}>
                            - {item.notes}
                          </span>
                        )}
                      </div>
                      <StatusBadge status={item.status} size="xs" showDot={false} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

function InfoBlock({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-tertiary)', marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>
        {value}
      </div>
    </div>
  );
}
