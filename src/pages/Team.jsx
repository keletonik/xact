import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Plus,
  Mail,
  Phone,
  Shield,
  ClipboardCheck,
  MoreVertical,
} from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import StatusBadge from '../components/common/StatusBadge';
import EmptyState from '../components/common/EmptyState';
import Modal from '../components/common/Modal';
import FormField, { TextInput, SelectInput } from '../components/common/FormField';
import { teamMembers } from '../data/mockData';
import { getInitials } from '../utils/helpers';

const roleOptions = [
  { value: 'Fire Safety Director', label: 'Fire Safety Director' },
  { value: 'Senior Inspector', label: 'Senior Inspector' },
  { value: 'Inspector', label: 'Inspector' },
  { value: 'Fire Protection Engineer', label: 'Fire Protection Engineer' },
  { value: 'Technician', label: 'Technician' },
  { value: 'Administrator', label: 'Administrator' },
];

const avatarColors = [
  'linear-gradient(135deg, #ea580c, #f97316)',
  'linear-gradient(135deg, #2563eb, #3b82f6)',
  'linear-gradient(135deg, #16a34a, #22c55e)',
  'linear-gradient(135deg, #9333ea, #a855f7)',
  'linear-gradient(135deg, #dc2626, #ef4444)',
  'linear-gradient(135deg, #0891b2, #06b6d4)',
];

export default function Team() {
  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            {teamMembers.length} team member{teamMembers.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button size="sm" icon={Plus} onClick={() => setShowCreateModal(true)}>Add Team Member</Button>
      </div>

      {teamMembers.length === 0 ? (
        <Card>
          <EmptyState
            icon={Users}
            title="No Team Members"
            description="Add team members to assign inspections, manage work orders, and collaborate on fire safety tasks."
            actionLabel="Add Team Member"
            onAction={() => setShowCreateModal(true)}
          />
        </Card>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: 16,
        }}>
          {teamMembers.map((member, i) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card hover>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{
                    width: 52,
                    height: 52,
                    borderRadius: 'var(--radius-full)',
                    background: avatarColors[i % avatarColors.length],
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: '1rem',
                    fontWeight: 700,
                    flexShrink: 0,
                  }}>
                    {getInitials(member.name)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                      <h3 style={{ fontSize: '0.9375rem', fontWeight: 600 }}>{member.name}</h3>
                      <StatusBadge status={member.status} size="xs" />
                    </div>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{member.role}</p>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  marginTop: 16,
                  paddingTop: 16,
                  borderTop: '1px solid var(--border-secondary)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                    <Mail size={14} style={{ color: 'var(--text-tertiary)' }} />
                    {member.email}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                      <ClipboardCheck size={14} style={{ color: 'var(--text-tertiary)' }} />
                      {member.inspections} inspections
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Add Team Member"
        subtitle="Invite a new team member"
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>Cancel</Button>
            <Button onClick={() => setShowCreateModal(false)}>Send Invitation</Button>
          </>
        }
      >
        <FormField label="Full Name" required>
          <TextInput value="" onChange={() => {}} placeholder="First and last name" />
        </FormField>
        <FormField label="Email" required>
          <TextInput type="email" value="" onChange={() => {}} placeholder="team@evalux.com" />
        </FormField>
        <FormField label="Role" required>
          <SelectInput value="" onChange={() => {}} options={roleOptions} placeholder="Select role..." />
        </FormField>
        <FormField label="Phone">
          <TextInput type="tel" value="" onChange={() => {}} placeholder="(555) 123-4567" />
        </FormField>
      </Modal>
    </div>
  );
}
