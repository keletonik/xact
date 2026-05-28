import { useEffect, useState } from 'react';
import { Upload, Plus, Trash2 } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import FormField from '../components/common/FormField';
import { useTheme } from '../hooks/useTheme';
import { putBlob, getBlob } from '../services/db';

const ROSTER_KEY  = 'xact-signatory-roster';
const LOGO_KEY    = 'xact-company-logo-hash';

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const [company, setCompany] = useState(() => localStorage.getItem('xact-company-name') || '');
  const [defaultFrl, setDefaultFrl] = useState(() => localStorage.getItem('xact-default-frl') || '-/120/120');
  const [logoUrl, setLogoUrl] = useState(null);
  const [roster, setRoster] = useState(() => {
    try {
      const raw = localStorage.getItem(ROSTER_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  });

  useEffect(() => {
    const hash = localStorage.getItem(LOGO_KEY);
    if (!hash) return;
    let alive = true;
    getBlob(hash).then((blob) => {
      if (alive && blob) setLogoUrl(URL.createObjectURL(blob));
    });
    return () => { alive = false; };
  }, []);

  const saveCompany = () => {
    localStorage.setItem('xact-company-name', company);
    localStorage.setItem('xact-default-frl', defaultFrl);
  };

  const handleLogo = async (file) => {
    if (!file) return;
    const hash = await putBlob(file);
    localStorage.setItem(LOGO_KEY, hash);
    setLogoUrl(URL.createObjectURL(file));
  };

  const removeLogo = () => {
    localStorage.removeItem(LOGO_KEY);
    if (logoUrl) URL.revokeObjectURL(logoUrl);
    setLogoUrl(null);
  };

  const addSignatory = () => {
    const next = [...roster, { name: '', role: 'Supervisor' }];
    setRoster(next);
    localStorage.setItem(ROSTER_KEY, JSON.stringify(next));
  };
  const updateSignatory = (idx, patch) => {
    const next = roster.map((r, i) => (i === idx ? { ...r, ...patch } : r));
    setRoster(next);
    localStorage.setItem(ROSTER_KEY, JSON.stringify(next));
  };
  const removeSignatory = (idx) => {
    const next = roster.filter((_, i) => i !== idx);
    setRoster(next);
    localStorage.setItem(ROSTER_KEY, JSON.stringify(next));
  };

  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <h1 style={{ margin: 0, fontSize: 22 }}>Settings</h1>

      <Card>
        <strong>Company</strong>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
          <FormField label="Company name (printed on cert packs)">
            <input style={inputStyle} value={company} onChange={(e) => setCompany(e.target.value)} />
          </FormField>
          <FormField label="Default required FRL">
            <input style={inputStyle} value={defaultFrl} onChange={(e) => setDefaultFrl(e.target.value)} placeholder="-/120/120" />
          </FormField>
          <FormField label="Company logo (used in cert pack header)">
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt="Company logo"
                  style={{ height: 48, border: '1px solid var(--geist-border)', borderRadius: 4, background: '#fff', padding: 4 }}
                />
              ) : (
                <div style={{
                  height: 48, width: 90,
                  border: '1px dashed var(--geist-border-strong)',
                  borderRadius: 4,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--geist-fg-4)', fontSize: 11,
                }}>
                  no logo
                </div>
              )}
              <label style={{ cursor: 'pointer' }}>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/svg+xml"
                  style={{ display: 'none' }}
                  onChange={(e) => handleLogo(e.target.files?.[0])}
                />
                <span style={pillBtn}>
                  <Upload size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                  Upload
                </span>
              </label>
              {logoUrl && (
                <Button size="sm" variant="ghost" onClick={removeLogo}>
                  Remove
                </Button>
              )}
            </div>
          </FormField>
          <div>
            <Button onClick={saveCompany}>Save</Button>
          </div>
        </div>
      </Card>

      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <strong>Signatory roster (cert pack signature page)</strong>
          <Button size="sm" onClick={addSignatory}>
            <Plus size={12} /> Add signatory
          </Button>
        </div>
        {roster.length === 0 ? (
          <p style={{ fontSize: 12, color: 'var(--geist-fg-4)', marginTop: 8 }}>
            Empty roster: cert packs print blank installer / supervisor / certifier signature blocks.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
            {roster.map((r, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 6, alignItems: 'center' }}>
                <input style={inputStyle} value={r.name} onChange={(e) => updateSignatory(i, { name: e.target.value })} placeholder="Name" />
                <input style={inputStyle} value={r.role} onChange={(e) => updateSignatory(i, { role: e.target.value })} placeholder="Role (e.g. Supervisor)" />
                <button type="button" onClick={() => removeSignatory(i)} style={iconBtn} aria-label="Remove signatory">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <strong>Appearance</strong>
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <Button variant={theme === 'light' ? 'primary' : 'ghost'} onClick={() => setTheme('light')}>Light</Button>
          <Button variant={theme === 'dark'  ? 'primary' : 'ghost'} onClick={() => setTheme('dark')}>Dark</Button>
        </div>
      </Card>
    </div>
  );
}

const inputStyle = {
  padding: '8px 10px',
  border: '1px solid var(--geist-border-strong)',
  borderRadius: 4,
  background: 'var(--geist-bg)',
  color: 'var(--geist-fg)',
  fontSize: 13,
  width: '100%',
  boxSizing: 'border-box',
};
const pillBtn = {
  padding: '6px 12px',
  border: '1px solid var(--geist-border-strong)',
  borderRadius: 4,
  background: 'var(--geist-bg)',
  color: 'var(--geist-fg-2)',
  fontSize: 12,
  display: 'inline-block',
};
const iconBtn = {
  background: 'transparent',
  border: '1px solid var(--geist-border)',
  borderRadius: 4,
  padding: 6,
  cursor: 'pointer',
  color: 'var(--geist-fg-3)',
};
