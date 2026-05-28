import { useEffect, useState } from 'react';
import { Upload, Plus, Trash2 } from 'lucide-react';
import PaperCard from '../components/draft/PaperCard';
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
    <div className="xc-stagger" style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 18 }}>
      <section style={{ borderBottom: '1.5px solid var(--rule-ink)', paddingBottom: 14 }}>
        <div className="xc-stamp" style={{ marginBottom: 6 }}>system · settings</div>
        <h1 className="xc-display-italic" style={{ margin: 0, fontSize: 48, lineHeight: 1 }}>
          Cert pack branding
        </h1>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-3)', marginTop: 12 }}>
          company name · default FRL · logo · signatory roster · theme
        </p>
      </section>

      <PaperCard title="company" meta="printed on every cert pack">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <FormField label="Company name">
            <input style={inputStyle} value={company} onChange={(e) => setCompany(e.target.value)} />
          </FormField>
          <FormField label="Default required FRL" help="format: -/120/120">
            <input style={inputStyle} value={defaultFrl} onChange={(e) => setDefaultFrl(e.target.value)} placeholder="-/120/120" />
          </FormField>
          <FormField label="Company logo (cert pack header)">
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt="Company logo"
                  style={{ height: 52, border: '1px solid var(--rule-strong)', background: '#fff', padding: 6 }}
                />
              ) : (
                <div style={{
                  height: 52, width: 100,
                  border: '1px dashed var(--rule-strong)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--ink-4)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  letterSpacing: 'var(--tracking-label)',
                  textTransform: 'uppercase',
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
                <span style={ghostBtn}>
                  <Upload size={11} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                  upload
                </span>
              </label>
              {logoUrl && (
                <button type="button" onClick={removeLogo} style={{ ...ghostBtn, color: 'var(--accent)', borderColor: 'var(--accent)' }}>
                  remove
                </button>
              )}
            </div>
          </FormField>
          <div>
            <button type="button" onClick={saveCompany} style={inkBtn}>save</button>
          </div>
        </div>
      </PaperCard>

      <PaperCard
        title="signatory roster"
        meta={
          <button type="button" onClick={addSignatory} style={inkBtn}>
            <Plus size={11} /> add signatory
          </button>
        }
      >
        {roster.length === 0 ? (
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-4)', letterSpacing: '0.04em', margin: 0 }}>
            empty roster, cert packs print blank installer / supervisor / certifier signature blocks
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {roster.map((r, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '40px 1fr 1fr auto', gap: 8, alignItems: 'center' }}>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  letterSpacing: 'var(--tracking-label)',
                  color: 'var(--ink-4)',
                }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <input style={inputStyle} value={r.name} onChange={(e) => updateSignatory(i, { name: e.target.value })} placeholder="Name" />
                <input style={inputStyle} value={r.role} onChange={(e) => updateSignatory(i, { role: e.target.value })} placeholder="Role (e.g. Supervisor)" />
                <button type="button" onClick={() => removeSignatory(i)} style={iconBtn} aria-label="Remove">
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </PaperCard>

      <PaperCard title="appearance" meta="paper or board">
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            onClick={() => setTheme('light')}
            style={theme === 'light' ? inkBtn : ghostBtn}
          >
            paper (light)
          </button>
          <button
            type="button"
            onClick={() => setTheme('dark')}
            style={theme === 'dark' ? inkBtn : ghostBtn}
          >
            board (dark)
          </button>
        </div>
      </PaperCard>
    </div>
  );
}

const inputStyle = {
  width: '100%',
  background: 'var(--paper-1)',
  border: '1px solid var(--rule-strong)',
  padding: '10px 12px',
  fontFamily: 'var(--font-sans)',
  fontSize: 14,
  color: 'var(--ink)',
};
const inkBtn = {
  background: 'var(--ink)',
  color: 'var(--paper-1)',
  border: '1px solid var(--ink)',
  padding: '8px 14px',
  fontFamily: 'var(--font-mono)',
  fontSize: 11,
  letterSpacing: 'var(--tracking-label)',
  textTransform: 'uppercase',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 5,
};
const ghostBtn = {
  background: 'transparent',
  color: 'var(--ink-2)',
  border: '1px solid var(--rule-strong)',
  padding: '8px 14px',
  fontFamily: 'var(--font-mono)',
  fontSize: 11,
  letterSpacing: 'var(--tracking-label)',
  textTransform: 'uppercase',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 5,
};
const iconBtn = {
  background: 'transparent',
  border: '1px solid var(--rule-strong)',
  padding: '8px 10px',
  cursor: 'pointer',
  color: 'var(--accent)',
  borderColor: 'var(--accent)',
};
