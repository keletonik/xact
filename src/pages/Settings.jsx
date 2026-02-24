import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings as SettingsIcon,
  User,
  Bell,
  Shield,
  Palette,
  Building2,
  Key,
  Globe,
  Mail,
  Save,
  Sun,
  Moon,
} from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import FormField, { TextInput, SelectInput } from '../components/common/FormField';
import { useTheme } from '../hooks/useTheme';

const tabs = [
  { id: 'general', label: 'General', icon: SettingsIcon },
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'company', label: 'Company', icon: Building2 },
];

export default function Settings() {
  const [activeTab, setActiveTab] = useState('general');
  const { theme, toggleTheme } = useTheme();

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 24 }}>
      {/* Settings Navigation */}
      <Card style={{ alignSelf: 'start' }}>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.8125rem',
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? 'var(--color-fire-600)' : 'var(--text-secondary)',
                  backgroundColor: isActive ? 'var(--color-fire-50)' : 'transparent',
                  transition: 'all var(--transition-fast)',
                  textAlign: 'left',
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </Card>

      {/* Settings Content */}
      <div>
        {activeTab === 'general' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card>
              <h2 style={{ fontSize: '1.0625rem', fontWeight: 600, marginBottom: 4 }}>General Settings</h2>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: 24 }}>
                Manage your application preferences and defaults.
              </p>

              <FormField label="Company Name">
                <TextInput value="" onChange={() => {}} placeholder="Your company name" />
              </FormField>
              <FormField label="Default Timezone">
                <SelectInput
                  value=""
                  onChange={() => {}}
                  options={[
                    { value: 'America/Chicago', label: 'Central Time (CT)' },
                    { value: 'America/New_York', label: 'Eastern Time (ET)' },
                    { value: 'America/Denver', label: 'Mountain Time (MT)' },
                    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
                  ]}
                  placeholder="Select timezone..."
                />
              </FormField>
              <FormField label="Date Format">
                <SelectInput
                  value=""
                  onChange={() => {}}
                  options={[
                    { value: 'MM/dd/yyyy', label: 'MM/DD/YYYY' },
                    { value: 'dd/MM/yyyy', label: 'DD/MM/YYYY' },
                    { value: 'yyyy-MM-dd', label: 'YYYY-MM-DD' },
                  ]}
                  placeholder="Select format..."
                />
              </FormField>
              <FormField label="Default Inspection Frequency">
                <SelectInput
                  value=""
                  onChange={() => {}}
                  options={[
                    { value: 'monthly', label: 'Monthly' },
                    { value: 'quarterly', label: 'Quarterly' },
                    { value: 'semi-annual', label: 'Semi-Annual' },
                    { value: 'annual', label: 'Annual' },
                  ]}
                  placeholder="Select frequency..."
                />
              </FormField>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                <Button icon={Save}>Save Changes</Button>
              </div>
            </Card>
          </motion.div>
        )}

        {activeTab === 'profile' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card>
              <h2 style={{ fontSize: '1.0625rem', fontWeight: 600, marginBottom: 4 }}>Profile Settings</h2>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: 24 }}>
                Update your personal information and preferences.
              </p>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 20,
                marginBottom: 24,
                padding: 20,
                backgroundColor: 'var(--bg-tertiary)',
                borderRadius: 'var(--radius-lg)',
              }}>
                <div style={{
                  width: 72,
                  height: 72,
                  borderRadius: 'var(--radius-full)',
                  background: 'linear-gradient(135deg, #ea580c, #f97316)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: '1.5rem',
                  fontWeight: 700,
                }}>
                  U
                </div>
                <div>
                  <Button size="sm" variant="secondary">Upload Photo</Button>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: 6 }}>
                    JPG, PNG or SVG. Max size 2MB.
                  </p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
                <FormField label="First Name">
                  <TextInput value="" onChange={() => {}} placeholder="First name" />
                </FormField>
                <FormField label="Last Name">
                  <TextInput value="" onChange={() => {}} placeholder="Last name" />
                </FormField>
                <FormField label="Email">
                  <TextInput type="email" value="" onChange={() => {}} placeholder="email@example.com" />
                </FormField>
                <FormField label="Phone">
                  <TextInput type="tel" value="" onChange={() => {}} placeholder="(555) 123-4567" />
                </FormField>
                <FormField label="Job Title">
                  <TextInput value="" onChange={() => {}} placeholder="Your title" />
                </FormField>
                <FormField label="Certifications">
                  <TextInput value="" onChange={() => {}} placeholder="e.g., CFPS, NICET Level IV" />
                </FormField>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                <Button icon={Save}>Save Profile</Button>
              </div>
            </Card>
          </motion.div>
        )}

        {activeTab === 'notifications' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card>
              <h2 style={{ fontSize: '1.0625rem', fontWeight: 600, marginBottom: 4 }}>Notification Preferences</h2>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: 24 }}>
                Choose what notifications you want to receive.
              </p>

              {[
                { title: 'Inspection Reminders', desc: 'Get notified before scheduled inspections' },
                { title: 'Overdue Alerts', desc: 'Alert when inspections or work orders are overdue' },
                { title: 'Compliance Warnings', desc: 'Warning when compliance deadlines approach' },
                { title: 'Work Order Updates', desc: 'Updates when work order status changes' },
                { title: 'Equipment Alerts', desc: 'Notifications for equipment service due dates' },
                { title: 'Team Activity', desc: 'Updates on team member actions and assignments' },
              ].map((item, i) => (
                <div key={i} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 0',
                  borderBottom: '1px solid var(--border-secondary)',
                }}>
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{item.title}</div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: 2 }}>{item.desc}</div>
                  </div>
                  <ToggleSwitch defaultChecked={i < 3} />
                </div>
              ))}

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
                <Button icon={Save}>Save Preferences</Button>
              </div>
            </Card>
          </motion.div>
        )}

        {activeTab === 'appearance' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card>
              <h2 style={{ fontSize: '1.0625rem', fontWeight: 600, marginBottom: 4 }}>Appearance</h2>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: 24 }}>
                Customize the look and feel of your application.
              </p>

              <h3 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: 12 }}>Theme</h3>
              <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
                {[
                  { id: 'light', label: 'Light', icon: Sun },
                  { id: 'dark', label: 'Dark', icon: Moon },
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => { if (theme !== t.id) toggleTheme(); }}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 8,
                      padding: '20px 32px',
                      borderRadius: 'var(--radius-lg)',
                      border: `2px solid ${theme === t.id ? 'var(--color-fire-500)' : 'var(--border-primary)'}`,
                      backgroundColor: theme === t.id ? 'var(--color-fire-50)' : 'transparent',
                      transition: 'all var(--transition-fast)',
                    }}
                  >
                    <t.icon size={24} style={{ color: theme === t.id ? 'var(--color-fire-500)' : 'var(--text-tertiary)' }} />
                    <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: theme === t.id ? 'var(--color-fire-600)' : 'var(--text-secondary)' }}>
                      {t.label}
                    </span>
                  </button>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {activeTab === 'security' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card>
              <h2 style={{ fontSize: '1.0625rem', fontWeight: 600, marginBottom: 4 }}>Security</h2>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: 24 }}>
                Manage your password and security preferences.
              </p>

              <FormField label="Current Password">
                <TextInput type="password" value="" onChange={() => {}} placeholder="Enter current password" />
              </FormField>
              <FormField label="New Password">
                <TextInput type="password" value="" onChange={() => {}} placeholder="Enter new password" />
              </FormField>
              <FormField label="Confirm New Password">
                <TextInput type="password" value="" onChange={() => {}} placeholder="Confirm new password" />
              </FormField>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                <Button icon={Key}>Update Password</Button>
              </div>
            </Card>
          </motion.div>
        )}

        {activeTab === 'company' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card>
              <h2 style={{ fontSize: '1.0625rem', fontWeight: 600, marginBottom: 4 }}>Company Settings</h2>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: 24 }}>
                Configure your company information and branding.
              </p>

              <FormField label="Company Name">
                <TextInput value="" onChange={() => {}} placeholder="Company name" />
              </FormField>
              <FormField label="License Number">
                <TextInput value="" onChange={() => {}} placeholder="Fire protection license #" />
              </FormField>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
                <FormField label="Phone">
                  <TextInput type="tel" value="" onChange={() => {}} placeholder="(555) 123-4567" />
                </FormField>
                <FormField label="Email">
                  <TextInput type="email" value="" onChange={() => {}} placeholder="info@company.com" />
                </FormField>
                <FormField label="Website">
                  <TextInput value="" onChange={() => {}} placeholder="www.company.com" />
                </FormField>
                <FormField label="State License">
                  <TextInput value="" onChange={() => {}} placeholder="State license number" />
                </FormField>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                <Button icon={Save}>Save Company Info</Button>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function ToggleSwitch({ defaultChecked = false }) {
  const [checked, setChecked] = useState(defaultChecked);
  return (
    <button
      onClick={() => setChecked(!checked)}
      style={{
        width: 44,
        height: 24,
        borderRadius: 12,
        backgroundColor: checked ? 'var(--color-fire-500)' : 'var(--color-slate-300)',
        position: 'relative',
        transition: 'background-color var(--transition-fast)',
        flexShrink: 0,
      }}
    >
      <motion.div
        animate={{ x: checked ? 20 : 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        style={{
          width: 20,
          height: 20,
          borderRadius: 10,
          backgroundColor: '#fff',
          position: 'absolute',
          top: 2,
          left: 2,
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        }}
      />
    </button>
  );
}
