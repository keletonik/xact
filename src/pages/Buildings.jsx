import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Building2,
  Plus,
  MapPin,
  Layers,
  Shield,
  Calendar,
  Phone,
  User,
  Download,
  Grid3X3,
  List,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import Card, { CardHeader } from '../components/common/Card';
import Button from '../components/common/Button';
import SearchInput from '../components/common/SearchInput';
import StatusBadge from '../components/common/StatusBadge';
import EmptyState from '../components/common/EmptyState';
import Modal from '../components/common/Modal';
import DataTable from '../components/common/DataTable';
import FormField, { TextInput, TextArea, SelectInput } from '../components/common/FormField';
import { buildings } from '../data/mockData';
import { formatDate, formatNumber } from '../utils/helpers';

const buildingTypes = [
  { value: 'Commercial High-Rise', label: 'Commercial High-Rise' },
  { value: 'Healthcare Facility', label: 'Healthcare Facility' },
  { value: 'Retail / Mall', label: 'Retail / Mall' },
  { value: 'Residential High-Rise', label: 'Residential High-Rise' },
  { value: 'Industrial / Warehouse', label: 'Industrial / Warehouse' },
  { value: 'Assembly / Convention', label: 'Assembly / Convention' },
  { value: 'Educational', label: 'Educational' },
  { value: 'Mixed Use', label: 'Mixed Use' },
];

export default function Buildings() {
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState(null);

  const filtered = useMemo(() => {
    return buildings.filter(b =>
      !search ||
      b.name?.toLowerCase().includes(search.toLowerCase()) ||
      b.address?.toLowerCase().includes(search.toLowerCase()) ||
      b.type?.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  const columns = [
    {
      key: 'name',
      label: 'Building',
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: 600 }}>{val}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: 2 }}>{row.type}</div>
        </div>
      ),
    },
    {
      key: 'address',
      label: 'Location',
      render: (val, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <MapPin size={14} style={{ color: 'var(--text-tertiary)' }} />
          <span>{`${val}, ${row.city}, ${row.state}`}</span>
        </div>
      ),
    },
    { key: 'status', label: 'Status', render: (val) => <StatusBadge status={val} /> },
    { key: 'riskLevel', label: 'Risk', render: (val) => <StatusBadge status={val === 'high' ? 'critical' : val === 'medium' ? 'warning' : 'active'} /> },
    { key: 'floors', label: 'Floors', align: 'center' },
    { key: 'sqft', label: 'Sq Ft', render: (val) => formatNumber(val), align: 'right' },
    { key: 'nextInspection', label: 'Next Inspection', render: (val) => formatDate(val) },
  ];

  return (
    <div>
      {/* Header Controls */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 24,
        gap: 16,
        flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 200 }}>
          <div style={{ width: 300 }}>
            <SearchInput value={search} onChange={setSearch} placeholder="Search buildings..." />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{
            display: 'flex',
            backgroundColor: 'var(--bg-tertiary)',
            borderRadius: 'var(--radius-md)',
            padding: 2,
          }}>
            <button
              onClick={() => setViewMode('grid')}
              style={{
                padding: '6px 10px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: viewMode === 'grid' ? 'var(--bg-card)' : 'transparent',
                color: viewMode === 'grid' ? 'var(--text-primary)' : 'var(--text-tertiary)',
                boxShadow: viewMode === 'grid' ? 'var(--shadow-sm)' : 'none',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Grid3X3 size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              style={{
                padding: '6px 10px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: viewMode === 'list' ? 'var(--bg-card)' : 'transparent',
                color: viewMode === 'list' ? 'var(--text-primary)' : 'var(--text-tertiary)',
                boxShadow: viewMode === 'list' ? 'var(--shadow-sm)' : 'none',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <List size={16} />
            </button>
          </div>
          <Button size="sm" variant="secondary" icon={Download}>Export</Button>
          <Button size="sm" icon={Plus} onClick={() => setShowCreateModal(true)}>Add Building</Button>
        </div>
      </div>

      {buildings.length === 0 ? (
        <Card>
          <EmptyState
            icon={Building2}
            title="No Buildings Added"
            description="Add your first building or property to start managing fire safety inspections, equipment, and compliance tracking."
            actionLabel="Add Building"
            onAction={() => setShowCreateModal(true)}
          />
        </Card>
      ) : viewMode === 'grid' ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
          gap: 16,
        }}>
          {filtered.map((building, i) => (
            <motion.div
              key={building.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card hover onClick={() => setSelectedBuilding(building)}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{building.name}</h3>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <MapPin size={12} />
                      {`${building.city}, ${building.state}`}
                    </div>
                  </div>
                  <StatusBadge status={building.status} />
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: 12,
                  padding: '12px 0',
                  borderTop: '1px solid var(--border-secondary)',
                  borderBottom: '1px solid var(--border-secondary)',
                  marginBottom: 12,
                }}>
                  <div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Type</div>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 500, marginTop: 2 }}>{building.type}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Floors</div>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 500, marginTop: 2 }}>{building.floors}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sq Ft</div>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 500, marginTop: 2 }}>{formatNumber(building.sqft)}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    <Calendar size={12} />
                    Next: {formatDate(building.nextInspection)}
                  </div>
                  <div style={{
                    fontSize: '0.6875rem',
                    fontWeight: 600,
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: building.riskLevel === 'high' ? 'var(--color-danger-50)' : building.riskLevel === 'medium' ? 'var(--color-warning-50)' : 'var(--color-success-50)',
                    color: building.riskLevel === 'high' ? 'var(--color-danger-600)' : building.riskLevel === 'medium' ? 'var(--color-warning-600)' : 'var(--color-success-600)',
                  }}>
                    {building.riskLevel?.toUpperCase()} RISK
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <Card padding={false}>
          <DataTable
            columns={columns}
            data={filtered}
            onRowClick={setSelectedBuilding}
            emptyMessage="No buildings match your search"
          />
        </Card>
      )}

      {/* Create Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Add New Building"
        subtitle="Register a new building or property"
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>Cancel</Button>
            <Button onClick={() => setShowCreateModal(false)}>Add Building</Button>
          </>
        }
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
          <FormField label="Building Name" required>
            <TextInput value="" onChange={() => {}} placeholder="e.g., Meridian Tower" />
          </FormField>
          <FormField label="Building Type" required>
            <SelectInput value="" onChange={() => {}} options={buildingTypes} placeholder="Select type..." />
          </FormField>
          <FormField label="Address" required>
            <TextInput value="" onChange={() => {}} placeholder="Street address" />
          </FormField>
          <FormField label="City" required>
            <TextInput value="" onChange={() => {}} placeholder="City" />
          </FormField>
          <FormField label="State" required>
            <TextInput value="" onChange={() => {}} placeholder="State" />
          </FormField>
          <FormField label="ZIP Code" required>
            <TextInput value="" onChange={() => {}} placeholder="ZIP" />
          </FormField>
          <FormField label="Number of Floors">
            <TextInput type="number" value="" onChange={() => {}} placeholder="e.g., 10" />
          </FormField>
          <FormField label="Total Sq Ft">
            <TextInput type="number" value="" onChange={() => {}} placeholder="e.g., 50000" />
          </FormField>
          <FormField label="Building Owner">
            <TextInput value="" onChange={() => {}} placeholder="Owner name" />
          </FormField>
          <FormField label="Property Manager">
            <TextInput value="" onChange={() => {}} placeholder="Manager name" />
          </FormField>
          <div style={{ gridColumn: '1 / -1' }}>
            <FormField label="Notes">
              <TextArea value="" onChange={() => {}} placeholder="Additional building information..." rows={3} />
            </FormField>
          </div>
        </div>
      </Modal>

      {/* Building Detail Modal */}
      <Modal
        isOpen={!!selectedBuilding}
        onClose={() => setSelectedBuilding(null)}
        title={selectedBuilding?.name || 'Building Details'}
        subtitle={selectedBuilding?.address}
        size="lg"
      >
        {selectedBuilding && (
          <div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: 16,
              marginBottom: 24,
            }}>
              <InfoBlock label="Type" value={selectedBuilding.type} />
              <InfoBlock label="Status" value={<StatusBadge status={selectedBuilding.status} />} />
              <InfoBlock label="Risk Level" value={selectedBuilding.riskLevel?.toUpperCase()} />
              <InfoBlock label="Floors" value={selectedBuilding.floors} />
              <InfoBlock label="Square Footage" value={formatNumber(selectedBuilding.sqft)} />
              <InfoBlock label="Occupancy" value={selectedBuilding.occupancy} />
              <InfoBlock label="Year Built" value={selectedBuilding.yearBuilt} />
              <InfoBlock label="Owner" value={selectedBuilding.owner} />
              <InfoBlock label="Manager" value={selectedBuilding.manager} />
              <InfoBlock label="Last Inspection" value={formatDate(selectedBuilding.lastInspection)} />
              <InfoBlock label="Next Inspection" value={formatDate(selectedBuilding.nextInspection)} />
              <InfoBlock label="Manager Phone" value={selectedBuilding.managerPhone} />
            </div>

            {selectedBuilding.systems?.length > 0 && (
              <div>
                <h4 style={{ fontSize: '0.8125rem', fontWeight: 600, marginBottom: 8 }}>Fire Protection Systems</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {selectedBuilding.systems.map(sys => (
                    <span key={sys} style={{
                      padding: '4px 12px',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: 'var(--bg-tertiary)',
                      fontSize: '0.75rem',
                      fontWeight: 500,
                      color: 'var(--text-secondary)',
                    }}>
                      {sys}
                    </span>
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
      <div style={{ fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-tertiary)', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>{value || '—'}</div>
    </div>
  );
}
