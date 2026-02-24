import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Flame,
  Plus,
  Download,
  Filter,
  Wrench,
  Calendar,
  Building2,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Search,
  Tag,
} from 'lucide-react';
import Card, { CardHeader } from '../components/common/Card';
import Button from '../components/common/Button';
import SearchInput from '../components/common/SearchInput';
import StatusBadge from '../components/common/StatusBadge';
import EmptyState from '../components/common/EmptyState';
import Modal from '../components/common/Modal';
import DataTable from '../components/common/DataTable';
import FormField, { TextInput, TextArea, SelectInput } from '../components/common/FormField';
import { equipment, buildings } from '../data/mockData';
import { formatDate } from '../utils/helpers';

const categoryOptions = [
  { value: 'Fire Alarm', label: 'Fire Alarm' },
  { value: 'Sprinkler', label: 'Sprinkler' },
  { value: 'Suppression', label: 'Suppression' },
  { value: 'Extinguisher', label: 'Extinguisher' },
  { value: 'Fire Pump', label: 'Fire Pump' },
  { value: 'Emergency Lighting', label: 'Emergency Lighting' },
  { value: 'Standpipe', label: 'Standpipe' },
  { value: 'Smoke Control', label: 'Smoke Control' },
];

export default function Equipment() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const filtered = useMemo(() => {
    return equipment.filter(item => {
      const matchSearch = !search ||
        item.name?.toLowerCase().includes(search.toLowerCase()) ||
        item.buildingName?.toLowerCase().includes(search.toLowerCase()) ||
        item.manufacturer?.toLowerCase().includes(search.toLowerCase()) ||
        item.serialNumber?.toLowerCase().includes(search.toLowerCase());
      const matchCategory = !categoryFilter || item.category === categoryFilter;
      return matchSearch && matchCategory;
    });
  }, [search, categoryFilter]);

  const columns = [
    {
      key: 'name',
      label: 'Equipment',
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: 600 }}>{val}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: 2 }}>{row.type}</div>
        </div>
      ),
    },
    { key: 'category', label: 'Category', render: (val) => (
      <span style={{
        padding: '2px 8px',
        borderRadius: 'var(--radius-full)',
        backgroundColor: 'var(--bg-tertiary)',
        fontSize: '0.75rem',
        fontWeight: 500,
      }}>{val}</span>
    )},
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
    { key: 'location', label: 'Location' },
    { key: 'status', label: 'Status', render: (val) => <StatusBadge status={val} /> },
    { key: 'condition', label: 'Condition', render: (val) => (
      <span style={{
        fontWeight: 600,
        fontSize: '0.8125rem',
        color: val === 'excellent' ? 'var(--color-success-600)' :
               val === 'good' ? 'var(--color-info-600)' :
               val === 'fair' ? 'var(--color-warning-600)' :
               'var(--color-danger-600)',
      }}>
        {val?.charAt(0).toUpperCase() + val?.slice(1)}
      </span>
    )},
    { key: 'nextServiceDate', label: 'Next Service', render: (val) => formatDate(val) },
  ];

  return (
    <div>
      {/* Summary Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: 12,
        marginBottom: 24,
      }}>
        {[
          { label: 'Total Equipment', count: equipment.length, icon: Flame, color: 'var(--color-fire-500)' },
          { label: 'Operational', count: equipment.filter(e => e.status === 'operational').length, icon: CheckCircle2, color: 'var(--color-success-500)' },
          { label: 'Needs Attention', count: equipment.filter(e => e.status === 'needs-attention').length, icon: AlertTriangle, color: 'var(--color-warning-500)' },
          { label: 'Out of Service', count: equipment.filter(e => e.status === 'out-of-service').length, icon: XCircle, color: 'var(--color-danger-500)' },
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

      {/* Main Content */}
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
              <SearchInput value={search} onChange={setSearch} placeholder="Search equipment..." />
            </div>
            <div style={{ width: 160 }}>
              <SelectInput
                value={categoryFilter}
                onChange={setCategoryFilter}
                options={categoryOptions}
                placeholder="All Categories"
              />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button size="sm" variant="secondary" icon={Download}>Export</Button>
            <Button size="sm" icon={Plus} onClick={() => setShowCreateModal(true)}>Add Equipment</Button>
          </div>
        </div>

        {equipment.length === 0 ? (
          <EmptyState
            icon={Flame}
            title="No Equipment Registered"
            description="Add fire safety equipment to track maintenance schedules, service history, and warranty information."
            actionLabel="Add Equipment"
            onAction={() => setShowCreateModal(true)}
          />
        ) : (
          <DataTable
            columns={columns}
            data={filtered}
            onRowClick={setSelectedItem}
            emptyMessage="No equipment matches your search"
          />
        )}
      </Card>

      {/* Create Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Add New Equipment"
        subtitle="Register fire safety equipment"
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>Cancel</Button>
            <Button onClick={() => setShowCreateModal(false)}>Add Equipment</Button>
          </>
        }
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
          <FormField label="Equipment Name" required>
            <TextInput value="" onChange={() => {}} placeholder="e.g., Simplex 4100ES Panel" />
          </FormField>
          <FormField label="Category" required>
            <SelectInput value="" onChange={() => {}} options={categoryOptions} placeholder="Select category..." />
          </FormField>
          <FormField label="Building" required>
            <SelectInput value="" onChange={() => {}} options={buildings.map(b => ({ value: b.id, label: b.name }))} placeholder="Select building..." />
          </FormField>
          <FormField label="Location">
            <TextInput value="" onChange={() => {}} placeholder="e.g., Floor 3 - East Wing" />
          </FormField>
          <FormField label="Manufacturer">
            <TextInput value="" onChange={() => {}} placeholder="Manufacturer name" />
          </FormField>
          <FormField label="Model">
            <TextInput value="" onChange={() => {}} placeholder="Model number" />
          </FormField>
          <FormField label="Serial Number">
            <TextInput value="" onChange={() => {}} placeholder="Serial number" />
          </FormField>
          <FormField label="Install Date">
            <TextInput type="date" value="" onChange={() => {}} />
          </FormField>
          <div style={{ gridColumn: '1 / -1' }}>
            <FormField label="Notes">
              <TextArea value="" onChange={() => {}} placeholder="Additional equipment details..." rows={3} />
            </FormField>
          </div>
        </div>
      </Modal>

      {/* Detail Modal */}
      <Modal
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        title={selectedItem?.name || 'Equipment Details'}
        subtitle={selectedItem?.buildingName}
        size="lg"
      >
        {selectedItem && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            <InfoBlock label="Type" value={selectedItem.type} />
            <InfoBlock label="Category" value={selectedItem.category} />
            <InfoBlock label="Status" value={<StatusBadge status={selectedItem.status} />} />
            <InfoBlock label="Condition" value={selectedItem.condition} />
            <InfoBlock label="Building" value={selectedItem.buildingName} />
            <InfoBlock label="Location" value={selectedItem.location} />
            <InfoBlock label="Manufacturer" value={selectedItem.manufacturer} />
            <InfoBlock label="Model" value={selectedItem.model} />
            <InfoBlock label="Serial Number" value={selectedItem.serialNumber} />
            <InfoBlock label="Install Date" value={formatDate(selectedItem.installDate)} />
            <InfoBlock label="Warranty Expiry" value={formatDate(selectedItem.warrantyExpiry)} />
            <InfoBlock label="Last Service" value={formatDate(selectedItem.lastServiceDate)} />
            <InfoBlock label="Next Service" value={formatDate(selectedItem.nextServiceDate)} />
            {selectedItem.notes && (
              <div style={{ gridColumn: '1 / -1', marginTop: 8 }}>
                <div style={{ fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-tertiary)', marginBottom: 4 }}>Notes</div>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.6, backgroundColor: 'var(--bg-tertiary)', padding: '12px 16px', borderRadius: 'var(--radius-md)' }}>
                  {selectedItem.notes}
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
