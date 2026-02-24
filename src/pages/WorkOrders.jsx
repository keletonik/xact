import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Wrench,
  Plus,
  Download,
  Calendar,
  Building2,
  User,
  DollarSign,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Circle,
} from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import SearchInput from '../components/common/SearchInput';
import StatusBadge from '../components/common/StatusBadge';
import EmptyState from '../components/common/EmptyState';
import Modal from '../components/common/Modal';
import DataTable from '../components/common/DataTable';
import FormField, { TextInput, TextArea, SelectInput } from '../components/common/FormField';
import { workOrders, buildings } from '../data/mockData';
import { formatDate, formatCurrency } from '../utils/helpers';

const priorityOptions = [
  { value: 'critical', label: 'Critical' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

const typeOptions = [
  { value: 'Corrective', label: 'Corrective' },
  { value: 'Preventive', label: 'Preventive' },
  { value: 'Emergency', label: 'Emergency' },
];

export default function WorkOrders() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const filtered = useMemo(() => {
    return workOrders.filter(item => {
      const matchSearch = !search ||
        item.title?.toLowerCase().includes(search.toLowerCase()) ||
        item.buildingName?.toLowerCase().includes(search.toLowerCase()) ||
        item.assignedTo?.toLowerCase().includes(search.toLowerCase());
      const matchStatus = !statusFilter || item.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [search, statusFilter]);

  const columns = [
    {
      key: 'title',
      label: 'Work Order',
      render: (val, row) => (
        <div style={{ maxWidth: 300 }}>
          <div style={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{val}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: 2 }}>
            {row.type} | {row.id}
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
      key: 'priority',
      label: 'Priority',
      render: (val) => {
        const colors = {
          critical: { bg: 'var(--color-danger-50)', text: 'var(--color-danger-700)' },
          high: { bg: '#fef2f2', text: '#b91c1c' },
          medium: { bg: 'var(--color-warning-50)', text: 'var(--color-warning-600)' },
          low: { bg: 'var(--color-info-50)', text: 'var(--color-info-600)' },
        };
        const c = colors[val] || colors.medium;
        return (
          <span style={{
            padding: '2px 8px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: c.bg,
            color: c.text,
            fontSize: '0.75rem',
            fontWeight: 600,
          }}>
            {val?.charAt(0).toUpperCase() + val?.slice(1)}
          </span>
        );
      },
    },
    { key: 'status', label: 'Status', render: (val) => <StatusBadge status={val} /> },
    {
      key: 'assignedTo',
      label: 'Assigned To',
      render: (val) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <User size={14} style={{ color: 'var(--text-tertiary)' }} />
          <span>{val || '—'}</span>
        </div>
      ),
    },
    { key: 'dueDate', label: 'Due Date', render: (val) => formatDate(val) },
    {
      key: 'estimatedCost',
      label: 'Est. Cost',
      align: 'right',
      render: (val) => val ? formatCurrency(val) : '—',
    },
  ];

  const statusCounts = {
    open: workOrders.filter(w => w.status === 'open').length,
    'in-progress': workOrders.filter(w => w.status === 'in-progress').length,
    scheduled: workOrders.filter(w => w.status === 'scheduled').length,
    completed: workOrders.filter(w => w.status === 'completed').length,
  };

  return (
    <div>
      {/* Status Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: 12,
        marginBottom: 24,
      }}>
        {[
          { label: 'Open', count: statusCounts.open, icon: Circle, color: 'var(--color-info-500)' },
          { label: 'In Progress', count: statusCounts['in-progress'], icon: Clock, color: 'var(--color-warning-500)' },
          { label: 'Scheduled', count: statusCounts.scheduled, icon: Calendar, color: 'var(--color-fire-500)' },
          { label: 'Completed', count: statusCounts.completed, icon: CheckCircle2, color: 'var(--color-success-500)' },
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
              <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{item.count}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{item.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      <Card padding={false}>
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
              <SearchInput value={search} onChange={setSearch} placeholder="Search work orders..." />
            </div>
            <div style={{ width: 160 }}>
              <SelectInput
                value={statusFilter}
                onChange={setStatusFilter}
                options={[
                  { value: 'open', label: 'Open' },
                  { value: 'in-progress', label: 'In Progress' },
                  { value: 'scheduled', label: 'Scheduled' },
                  { value: 'completed', label: 'Completed' },
                ]}
                placeholder="All Statuses"
              />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button size="sm" variant="secondary" icon={Download}>Export</Button>
            <Button size="sm" icon={Plus} onClick={() => setShowCreateModal(true)}>New Work Order</Button>
          </div>
        </div>

        {workOrders.length === 0 ? (
          <EmptyState
            icon={Wrench}
            title="No Work Orders"
            description="Create work orders to track corrective actions, preventive maintenance, and equipment repairs."
            actionLabel="Create Work Order"
            onAction={() => setShowCreateModal(true)}
          />
        ) : (
          <DataTable
            columns={columns}
            data={filtered}
            onRowClick={setSelectedItem}
            emptyMessage="No work orders match your search"
          />
        )}
      </Card>

      {/* Create Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Work Order"
        subtitle="Track maintenance and corrective actions"
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>Cancel</Button>
            <Button onClick={() => setShowCreateModal(false)}>Create Work Order</Button>
          </>
        }
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <FormField label="Title" required>
              <TextInput value="" onChange={() => {}} placeholder="Brief description of the work needed..." />
            </FormField>
          </div>
          <FormField label="Building" required>
            <SelectInput value="" onChange={() => {}} options={buildings.map(b => ({ value: b.id, label: b.name }))} placeholder="Select building..." />
          </FormField>
          <FormField label="Type" required>
            <SelectInput value="" onChange={() => {}} options={typeOptions} placeholder="Select type..." />
          </FormField>
          <FormField label="Priority" required>
            <SelectInput value="" onChange={() => {}} options={priorityOptions} placeholder="Select priority..." />
          </FormField>
          <FormField label="Due Date" required>
            <TextInput type="date" value="" onChange={() => {}} />
          </FormField>
          <FormField label="Assigned To">
            <SelectInput value="" onChange={() => {}} options={[]} placeholder="Select team member..." />
          </FormField>
          <FormField label="Estimated Cost">
            <TextInput type="number" value="" onChange={() => {}} placeholder="0.00" />
          </FormField>
          <div style={{ gridColumn: '1 / -1' }}>
            <FormField label="Description">
              <TextArea value="" onChange={() => {}} placeholder="Detailed description of the work to be done..." rows={4} />
            </FormField>
          </div>
        </div>
      </Modal>

      {/* Detail Modal */}
      <Modal
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        title={selectedItem?.title || 'Work Order Details'}
        subtitle={`${selectedItem?.type} | ${selectedItem?.id}`}
        size="lg"
      >
        {selectedItem && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            <InfoBlock label="Status" value={<StatusBadge status={selectedItem.status} />} />
            <InfoBlock label="Priority" value={selectedItem.priority} />
            <InfoBlock label="Type" value={selectedItem.type} />
            <InfoBlock label="Building" value={selectedItem.buildingName} />
            <InfoBlock label="Assigned To" value={selectedItem.assignedTo} />
            <InfoBlock label="Created By" value={selectedItem.createdBy} />
            <InfoBlock label="Created Date" value={formatDate(selectedItem.createdDate)} />
            <InfoBlock label="Due Date" value={formatDate(selectedItem.dueDate)} />
            <InfoBlock label="Completed Date" value={formatDate(selectedItem.completedDate)} />
            <InfoBlock label="Estimated Cost" value={formatCurrency(selectedItem.estimatedCost)} />
            <InfoBlock label="Actual Cost" value={selectedItem.actualCost ? formatCurrency(selectedItem.actualCost) : '—'} />
            <InfoBlock label="Labor Hours" value={selectedItem.laborHours || '—'} />
            {selectedItem.description && (
              <div style={{ gridColumn: '1 / -1', marginTop: 8 }}>
                <div style={{ fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-tertiary)', marginBottom: 4 }}>Description</div>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.6, backgroundColor: 'var(--bg-tertiary)', padding: '12px 16px', borderRadius: 'var(--radius-md)' }}>
                  {selectedItem.description}
                </p>
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
      <div style={{ fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-tertiary)', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>{value || '—'}</div>
    </div>
  );
}
