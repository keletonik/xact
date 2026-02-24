import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  Plus,
  Download,
  Building2,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileText,
  Award,
} from 'lucide-react';
import Card, { CardHeader } from '../components/common/Card';
import Button from '../components/common/Button';
import SearchInput from '../components/common/SearchInput';
import StatusBadge from '../components/common/StatusBadge';
import EmptyState from '../components/common/EmptyState';
import Modal from '../components/common/Modal';
import DataTable from '../components/common/DataTable';
import FormField, { TextInput, TextArea, SelectInput } from '../components/common/FormField';
import { complianceRecords, buildings } from '../data/mockData';
import { formatDate } from '../utils/helpers';

const codeOptions = [
  { value: 'NFPA 72', label: 'NFPA 72 - Fire Alarm Systems' },
  { value: 'NFPA 25', label: 'NFPA 25 - Water-Based Systems' },
  { value: 'NFPA 96', label: 'NFPA 96 - Kitchen Hood Systems' },
  { value: 'NFPA 10', label: 'NFPA 10 - Portable Extinguishers' },
  { value: 'NFPA 13', label: 'NFPA 13 - Sprinkler Installation' },
  { value: 'NFPA 20', label: 'NFPA 20 - Fire Pumps' },
  { value: 'IFC Chapter 9', label: 'IFC Chapter 9 - Fire Protection' },
];

export default function Compliance() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const filtered = useMemo(() => {
    return complianceRecords.filter(item => {
      const matchSearch = !search ||
        item.buildingName?.toLowerCase().includes(search.toLowerCase()) ||
        item.code?.toLowerCase().includes(search.toLowerCase()) ||
        item.description?.toLowerCase().includes(search.toLowerCase());
      const matchStatus = !statusFilter || item.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [search, statusFilter]);

  const compliantCount = complianceRecords.filter(c => c.status === 'compliant').length;
  const nonCompliantCount = complianceRecords.filter(c => c.status === 'non-compliant').length;
  const rate = complianceRecords.length > 0 ? Math.round((compliantCount / complianceRecords.length) * 100) : 0;

  const columns = [
    {
      key: 'code',
      label: 'Code',
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: 700, color: 'var(--color-fire-600)' }}>{val}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: 2, maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {row.description}
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
    { key: 'status', label: 'Status', render: (val) => <StatusBadge status={val} /> },
    { key: 'authority', label: 'Authority' },
    { key: 'lastVerified', label: 'Last Verified', render: (val) => formatDate(val) },
    { key: 'nextDue', label: 'Next Due', render: (val) => formatDate(val) },
    {
      key: 'certificateNumber',
      label: 'Certificate',
      render: (val) => val ? (
        <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--color-info-600)' }}>{val}</span>
      ) : (
        <span style={{ color: 'var(--text-tertiary)' }}>—</span>
      ),
    },
  ];

  return (
    <div>
      {/* Compliance Overview */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 16,
        marginBottom: 24,
      }}>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            backgroundColor: 'var(--bg-card)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-primary)',
            padding: '20px 24px',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <div style={{
            width: 56,
            height: 56,
            borderRadius: 'var(--radius-lg)',
            background: rate >= 80 ? 'linear-gradient(135deg, #16a34a, #22c55e)' : rate >= 60 ? 'linear-gradient(135deg, #d97706, #f59e0b)' : 'linear-gradient(135deg, #dc2626, #ef4444)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <ShieldCheck size={28} style={{ color: '#fff' }} />
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>{rate}%</div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Overall Compliance Rate</div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          style={{
            backgroundColor: 'var(--bg-card)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-primary)',
            padding: '20px 24px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <CheckCircle2 size={24} style={{ color: 'var(--color-success-500)' }} />
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{compliantCount}</div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Compliant</div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{
            backgroundColor: 'var(--bg-card)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-primary)',
            padding: '20px 24px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <XCircle size={24} style={{ color: 'var(--color-danger-500)' }} />
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{nonCompliantCount}</div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Non-Compliant</div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          style={{
            backgroundColor: 'var(--bg-card)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-primary)',
            padding: '20px 24px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <Award size={24} style={{ color: 'var(--color-fire-500)' }} />
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{complianceRecords.length}</div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Total Records</div>
          </div>
        </motion.div>
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
              <SearchInput value={search} onChange={setSearch} placeholder="Search compliance records..." />
            </div>
            <div style={{ width: 160 }}>
              <SelectInput
                value={statusFilter}
                onChange={setStatusFilter}
                options={[
                  { value: 'compliant', label: 'Compliant' },
                  { value: 'non-compliant', label: 'Non-Compliant' },
                ]}
                placeholder="All Statuses"
              />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button size="sm" variant="secondary" icon={Download}>Export Report</Button>
            <Button size="sm" icon={Plus} onClick={() => setShowCreateModal(true)}>Add Record</Button>
          </div>
        </div>

        {complianceRecords.length === 0 ? (
          <EmptyState
            icon={ShieldCheck}
            title="No Compliance Records"
            description="Track NFPA code compliance, certifications, and authority having jurisdiction (AHJ) requirements for all your buildings."
            actionLabel="Add Compliance Record"
            onAction={() => setShowCreateModal(true)}
          />
        ) : (
          <DataTable
            columns={columns}
            data={filtered}
            onRowClick={setSelectedRecord}
            emptyMessage="No records match your search"
          />
        )}
      </Card>

      {/* Create Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Add Compliance Record"
        subtitle="Track code compliance status"
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>Cancel</Button>
            <Button onClick={() => setShowCreateModal(false)}>Add Record</Button>
          </>
        }
      >
        <FormField label="Building" required>
          <SelectInput value="" onChange={() => {}} options={buildings.map(b => ({ value: b.id, label: b.name }))} placeholder="Select building..." />
        </FormField>
        <FormField label="Code / Standard" required>
          <SelectInput value="" onChange={() => {}} options={codeOptions} placeholder="Select code..." />
        </FormField>
        <FormField label="Authority (AHJ)">
          <TextInput value="" onChange={() => {}} placeholder="e.g., Dallas Fire Marshal" />
        </FormField>
        <FormField label="Certificate Number">
          <TextInput value="" onChange={() => {}} placeholder="Certificate or permit number" />
        </FormField>
        <FormField label="Last Verified Date">
          <TextInput type="date" value="" onChange={() => {}} />
        </FormField>
        <FormField label="Next Due Date">
          <TextInput type="date" value="" onChange={() => {}} />
        </FormField>
      </Modal>

      {/* Detail Modal */}
      <Modal
        isOpen={!!selectedRecord}
        onClose={() => setSelectedRecord(null)}
        title={selectedRecord?.code || 'Compliance Details'}
        subtitle={selectedRecord?.buildingName}
        size="md"
      >
        {selectedRecord && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <InfoBlock label="Code" value={selectedRecord.code} />
            <InfoBlock label="Status" value={<StatusBadge status={selectedRecord.status} />} />
            <div style={{ gridColumn: '1 / -1' }}>
              <InfoBlock label="Description" value={selectedRecord.description} />
            </div>
            <InfoBlock label="Building" value={selectedRecord.buildingName} />
            <InfoBlock label="Authority (AHJ)" value={selectedRecord.authority} />
            <InfoBlock label="Last Verified" value={formatDate(selectedRecord.lastVerified)} />
            <InfoBlock label="Next Due" value={formatDate(selectedRecord.nextDue)} />
            <InfoBlock label="Certificate" value={selectedRecord.certificateNumber || '—'} />
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
