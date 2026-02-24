import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  Building2,
  Shield,
  Calendar,
  Edit3,
  Award,
} from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { currentUser } from '../data/mockData';
import { formatDateTime } from '../utils/helpers';

export default function Profile() {
  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <div style={{
              width: 88,
              height: 88,
              borderRadius: 'var(--radius-full)',
              background: 'linear-gradient(135deg, #ea580c, #f97316)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: '2rem',
              fontWeight: 700,
              flexShrink: 0,
            }}>
              {currentUser.name ? currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
            </div>
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: '1.375rem', fontWeight: 700, marginBottom: 4 }}>
                {currentUser.name || 'User'}
              </h2>
              <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', marginBottom: 8 }}>
                {currentUser.role || 'No role set'}
              </p>
              {currentUser.certifications?.length > 0 && (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {currentUser.certifications.map(cert => (
                    <span key={cert} style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      padding: '3px 10px',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: 'var(--color-fire-50)',
                      color: 'var(--color-fire-600)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                    }}>
                      <Award size={12} /> {cert}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <Button variant="secondary" icon={Edit3}>Edit Profile</Button>
          </div>
        </Card>
      </motion.div>

      {/* Profile Details */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: 16 }}>Contact Information</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <ProfileRow icon={Mail} label="Email" value={currentUser.email || 'Not set'} />
              <ProfileRow icon={Phone} label="Phone" value={currentUser.phone || 'Not set'} />
              <ProfileRow icon={Building2} label="Company" value={currentUser.company || 'Not set'} />
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: 16 }}>Account Details</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <ProfileRow icon={User} label="User ID" value={currentUser.id || 'Not set'} />
              <ProfileRow icon={Shield} label="Role" value={currentUser.role || 'Not set'} />
              <ProfileRow icon={Calendar} label="Last Login" value={currentUser.lastLogin ? formatDateTime(currentUser.lastLogin) : 'Never'} />
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

function ProfileRow({ icon: Icon, label, value }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{
        width: 32,
        height: 32,
        borderRadius: 'var(--radius-md)',
        backgroundColor: 'var(--bg-tertiary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Icon size={15} style={{ color: 'var(--text-tertiary)' }} />
      </div>
      <div>
        <div style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
        <div style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-primary)', marginTop: 1 }}>{value}</div>
      </div>
    </div>
  );
}
