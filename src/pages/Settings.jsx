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
  Save,
  Sun,
  Moon,
  Database,
  Upload,
  Download,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import FormField, { TextInput, SelectInput } from '../components/common/FormField';
import { useTheme } from '../hooks/useTheme';
import CSVImportWizard from '../components/csv/CSVImportWizard';
import { planFlamesafeSeed, applyFlamesafeSeed, planSupplierPriceSeed } from '../catalog/seedFlamesafe';
import { applySupplierPriceImport, planSupplierPriceImport } from '../csv/importPipeline';
import useCatalogStore from '../stores/useCatalogStore';

const tabs = [
  { id: 'general', label: 'General', icon: SettingsIcon },
  { id: 'data', label: 'Data import', icon: Database },
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
          {tabs.map((tab) => {
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
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'; }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = 'transparent'; }}
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
                    { value: 'Australia/Sydney', label: 'AEST (Sydney)' },
                    { value: 'Australia/Melbourne', label: 'AEST (Melbourne)' },
                    { value: 'Australia/Brisbane', label: 'AEST (Brisbane)' },
                    { value: 'Australia/Perth', label: 'AWST (Perth)' },
                    { value: 'Australia/Adelaide', label: 'ACST (Adelaide)' },
                  ]}
                  placeholder="Select timezone..."
                />
              </FormField>
              <FormField label="Date Format">
                <SelectInput
                  value=""
                  onChange={() => {}}
                  options={[
                    { value: 'dd/MM/yyyy', label: 'DD/MM/YYYY' },
                    { value: 'MM/dd/yyyy', label: 'MM/DD/YYYY' },
                    { value: 'yyyy-MM-dd', label: 'YYYY-MM-DD' },
                  ]}
                  placeholder="Select format..."
                />
              </FormField>
              <FormField label="Default Currency">
                <SelectInput
                  value=""
                  onChange={() => {}}
                  options={[
                    { value: 'AUD', label: 'AUD - Australian Dollar' },
                    { value: 'NZD', label: 'NZD - New Zealand Dollar' },
                    { value: 'USD', label: 'USD - US Dollar' },
                  ]}
                  placeholder="Select currency..."
                />
              </FormField>
              <FormField label="Default Tax Rate (%)">
                <TextInput type="number" value="10" onChange={() => {}} placeholder="10" />
              </FormField>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                <Button icon={Save}>Save Changes</Button>
              </div>
            </Card>
          </motion.div>
        )}

        {activeTab === 'data' && <DataImportPanel />}

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
                  PE
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
                  <TextInput type="tel" value="" onChange={() => {}} placeholder="02 9000 1234" />
                </FormField>
                <FormField label="Job Title">
                  <TextInput value="" onChange={() => {}} placeholder="e.g. Senior Estimator" />
                </FormField>
                <FormField label="Region">
                  <SelectInput
                    value=""
                    onChange={() => {}}
                    options={[
                      { value: 'nsw', label: 'New South Wales' },
                      { value: 'vic', label: 'Victoria' },
                      { value: 'qld', label: 'Queensland' },
                      { value: 'wa', label: 'Western Australia' },
                      { value: 'sa', label: 'South Australia' },
                      { value: 'tas', label: 'Tasmania' },
                      { value: 'nt', label: 'Northern Territory' },
                      { value: 'act', label: 'Australian Capital Territory' },
                    ]}
                    placeholder="Select region..."
                  />
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
                { title: 'Estimate Updates', desc: 'Notified when estimates are created, updated, or approved' },
                { title: 'Price Book Changes', desc: 'Alert when items or assemblies are modified in the Price Book' },
                { title: 'Price Scout Updates', desc: 'Notified when new pricing suggestions are pending approval' },
                { title: 'Proposal Activity', desc: 'Updates when proposals are sent, accepted, or declined' },
                { title: 'Project Pipeline', desc: 'Alerts for project status changes and due date reminders' },
                { title: 'Audit Trail', desc: 'Summary of all tracked changes across the platform' },
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
                ].map((t) => (
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
              <FormField label="ABN">
                <TextInput value="" onChange={() => {}} placeholder="Australian Business Number" />
              </FormField>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
                <FormField label="Phone">
                  <TextInput type="tel" value="" onChange={() => {}} placeholder="02 9000 1234" />
                </FormField>
                <FormField label="Email">
                  <TextInput type="email" value="" onChange={() => {}} placeholder="info@company.com" />
                </FormField>
                <FormField label="Website">
                  <TextInput value="" onChange={() => {}} placeholder="www.company.com" />
                </FormField>
                <FormField label="Default Markup (%)">
                  <TextInput type="number" value="" onChange={() => {}} placeholder="e.g. 15" />
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

function DataImportPanel() {
  const hydrate = useCatalogStore((s) => s.hydrate);
  const products = useCatalogStore((s) => s.products);
  const suppliers = useCatalogStore((s) => s.suppliers);
  const supplierPrices = useCatalogStore((s) => s.supplierPrices);

  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);
  const [showWizard, setShowWizard] = useState(null);
  const [seedPlan, setSeedPlan] = useState(null);
  const [supplierSeedPreview, setSupplierSeedPreview] = useState(null);

  const previewFlamesafe = async () => {
    setBusy(true); setError(null); setStatus(null);
    try {
      const { plan } = await planFlamesafeSeed();
      setSeedPlan(plan);
      setStatus(`Preview: ${plan.summary.creates} new, ${plan.summary.updates} updates, ${plan.summary.errors} errors.`);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const applyFlamesafe = async () => {
    if (!seedPlan) return;
    setBusy(true); setError(null);
    try {
      const batchId = await applyFlamesafeSeed(seedPlan);
      await hydrate();
      setStatus(`Imported. Batch ${batchId.slice(0, 8)} — ${seedPlan.summary.creates} created, ${seedPlan.summary.updates} updated.`);
      setSeedPlan(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const previewSupplierSeed = async () => {
    setBusy(true); setError(null); setStatus(null);
    try {
      const { parsed, mapping } = await planSupplierPriceSeed();
      const plan = await planSupplierPriceImport(parsed.rows, mapping);
      setSupplierSeedPreview({ plan, mapping, headers: parsed.headers });
      setStatus(`Preview: ${plan.summary.prices} prices for ${plan.summary.suppliers} suppliers, ${plan.summary.errors} errors.`);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const applySupplierSeed = async () => {
    if (!supplierSeedPreview) return;
    setBusy(true); setError(null);
    try {
      const batchId = await applySupplierPriceImport(supplierSeedPreview.plan);
      await hydrate();
      setStatus(`Imported supplier prices. Batch ${batchId.slice(0, 8)}.`);
      setSupplierSeedPreview(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
      <Card>
        <h2 style={{ marginTop: 0, marginBottom: 4, fontSize: 18 }}>Data import</h2>
        <p style={{ marginTop: 0, color: 'var(--color-text-tertiary, #64748b)', marginBottom: 16 }}>
          Bring product catalogues and supplier price lists into Evalax. Supports CSV, XLSX, XLS, ODS.
        </p>

        {error && (
          <div style={banner('danger')}>
            <AlertTriangle size={16} /> {error}
          </div>
        )}
        {status && !error && (
          <div style={banner('success')}>
            <CheckCircle2 size={16} /> {status}
          </div>
        )}

        <section style={section}>
          <h3 style={h3}>Quick-start: Flamesafe master catalogue</h3>
          <p style={{ marginTop: 4, color: 'var(--color-text-tertiary, #64748b)', fontSize: 13 }}>
            One-click import of <code>public/seed/flamesafe-products.csv</code> (the simPRO export shipped with the repo).
            Bumps catalogue prices to the values in that file. Existing products are matched by SKU and updated; new ones are added.
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Button icon={Database} onClick={previewFlamesafe} disabled={busy}>
              {busy && !seedPlan ? 'Reading file…' : 'Preview Flamesafe master'}
            </Button>
            {seedPlan && (
              <Button icon={Upload} onClick={applyFlamesafe} disabled={busy}>
                Apply ({seedPlan.summary.creates}+{seedPlan.summary.updates})
              </Button>
            )}
          </div>
        </section>

        <section style={section}>
          <h3 style={h3}>Quick-start: Supplier master price list</h3>
          <p style={{ marginTop: 4, color: 'var(--color-text-tertiary, #64748b)', fontSize: 13 }}>
            One-click import of <code>public/seed/supplier-price-list-master.xlsx</code>. Imports supplier prices keyed by SKU.
            Products must already exist in the catalogue (load Flamesafe master first if you haven&apos;t).
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Button icon={Database} onClick={previewSupplierSeed} disabled={busy}>
              {busy && !supplierSeedPreview ? 'Reading workbook…' : 'Preview supplier master'}
            </Button>
            {supplierSeedPreview && (
              <Button icon={Upload} onClick={applySupplierSeed} disabled={busy}>
                Apply ({supplierSeedPreview.plan.summary.prices})
              </Button>
            )}
          </div>
          {supplierSeedPreview && supplierSeedPreview.headers && (
            <details style={{ marginTop: 8 }}>
              <summary style={{ fontSize: 12, color: 'var(--color-text-tertiary, #64748b)', cursor: 'pointer' }}>
                Detected columns ({supplierSeedPreview.headers.length})
              </summary>
              <code style={{ display: 'block', fontSize: 11, marginTop: 4, color: 'var(--color-text-secondary, #475569)' }}>
                {supplierSeedPreview.headers.join(', ')}
              </code>
            </details>
          )}
        </section>

        <section style={section}>
          <h3 style={h3}>Custom import (CSV / Excel)</h3>
          <p style={{ marginTop: 4, color: 'var(--color-text-tertiary, #64748b)', fontSize: 13 }}>
            Upload any spreadsheet and map the columns yourself. Validation runs as a dry-run before writing.
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Button icon={Upload} variant="secondary" onClick={() => setShowWizard('PRODUCT')}>
              Import products
            </Button>
            <Button icon={Upload} variant="secondary" onClick={() => setShowWizard('SUPPLIER_PRICE')}>
              Import supplier prices
            </Button>
          </div>
        </section>

        <section style={section}>
          <h3 style={h3}>Catalogue snapshot</h3>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', fontSize: 13 }}>
            <span><strong>{products.length}</strong> products</span>
            <span><strong>{suppliers.length}</strong> suppliers</span>
            <span><strong>{supplierPrices.length}</strong> supplier prices</span>
          </div>
        </section>
      </Card>

      {showWizard && (
        <div style={modalBg}>
          <CSVImportWizard kind={showWizard} onCancel={() => setShowWizard(null)} onDone={() => { setShowWizard(null); hydrate(); }} />
        </div>
      )}
    </motion.div>
  );
}

const section = { marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--color-border, #e5e7eb)' };
const h3 = { margin: '0 0 8px', fontSize: 14, fontWeight: 600 };
const banner = (tone) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '6px 10px',
  borderRadius: 6,
  fontSize: 13,
  marginBottom: 12,
  background: tone === 'danger' ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.12)',
  color: tone === 'danger' ? '#b91c1c' : '#166534',
});
const modalBg = { position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 };
// keep the unused-import linter happy: Download/Key are still imported for future use elsewhere on this page
void Download; void Key;
