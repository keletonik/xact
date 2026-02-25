import { motion } from 'framer-motion';
import {
  User, Mail, Phone, Building2, Shield, Calendar,
  Edit3, Award, Calculator, FolderOpen, FileText,
} from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import useProjectStore from '../stores/useProjectStore';
import useEstimateStore from '../stores/useEstimateStore';
import useProposalStore from '../stores/useProposalStore';
import { formatDateTime } from '../utils/formatters';

const currentUser = {
  id: 'USR-001',
  name: 'Project Estimator',
  email: 'estimator@evalux.com',
  phone: '02 9000 1234',
  company: 'Evalux Fire Estimating',
  role: 'Senior Estimator',
  certifications: ['CFPS', 'NFPA Certified', 'AS 2118'],
  lastLogin: new Date().toISOString(),
};

export default function Profile() {
  const projects = useProjectStore((s) => s.projects);
  const estimates = useEstimateStore((s) => s.estimates);
  const proposals = useProposalStore((s) => s.proposals);

  return (
    <div style={{ padding: '24px 32px', maxWidth: 800, margin: '0 auto' }}>
      {/* Profile Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <div style={{
              width: 88, height: 88, borderRadius: 'var(--radius-full)',
              background: 'linear-gradient(135deg, #ea580c, #f97316)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: '2rem', fontWeight: 700, flexShrink: 0,
            }}>
              {currentUser.name.split(' ').map((n) => n[0]).join('').toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: '1.375rem', fontWeight: 700, marginBottom: 4, color: 'var(--color-text-primary)' }}>
                {currentUser.name}
              </h2>
              <p style={{ fontSize: '0.9375rem', color: 'var(--color-text-secondary)', marginBottom: 8 }}>
                {currentUser.role}
              </p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {currentUser.certifications.map((cert) => (
                  <span key={cert} style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    padding: '3px 10px', borderRadius: 'var(--radius-full)',
                    backgroundColor: 'var(--color-fire-50)', color: 'var(--color-fire-600)',
                    fontSize: '0.75rem', fontWeight: 600,
                  }}>
                    <Award size={12} /> {cert}
                  </span>
                ))}
              </div>
            </div>
            <Button variant="secondary" icon={Edit3}>Edit Profile</Button>
          </div>
        </Card>
      </motion.div>

      {/* Profile Details */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: 16, color: 'var(--color-text-primary)' }}>Contact Information</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <ProfileRow icon={Mail} label="Email" value={currentUser.email} />
              <ProfileRow icon={Phone} label="Phone" value={currentUser.phone} />
              <ProfileRow icon={Building2} label="Company" value={currentUser.company} />
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: 16, color: 'var(--color-text-primary)' }}>Account Details</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <ProfileRow icon={User} label="User ID" value={currentUser.id} />
              <ProfileRow icon={Shield} label="Role" value={currentUser.role} />
              <ProfileRow icon={Calendar} label="Last Login" value={formatDateTime(currentUser.lastLogin)} />
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Activity Summary */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} style={{ marginTop: 16 }}>
        <Card>
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: 16, color: 'var(--color-text-primary)' }}>Activity Summary</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            <StatCard icon={FolderOpen} label="Projects" value={projects.length} color="var(--color-info-500)" />
            <StatCard icon={Calculator} label="Estimates" value={estimates.length} color="var(--color-success-500)" />
            <StatCard icon={FileText} label="Proposals" value={proposals.length} color="var(--color-fire-500)" />
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

function ProfileRow({ icon: Icon, label, value }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{
        width: 32, height: 32, borderRadius: 'var(--radius-md)',
        backgroundColor: 'var(--color-bg-tertiary)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <Icon size={15} style={{ color: 'var(--color-text-tertiary)' }} />
      </div>
      <div>
        <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
        <div style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--color-text-primary)', marginTop: 1 }}>{value}</div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px', borderRadius: 'var(--radius-md)', background: 'var(--color-bg-secondary)' }}>
      <div style={{
        width: 36, height: 36, borderRadius: 'var(--radius-md)',
        background: `${color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={18} style={{ color }} />
      </div>
      <div>
        <div style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>{value}</div>
        <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-tertiary)' }}>{label}</div>
      </div>
    </div>
  );
}
