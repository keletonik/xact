import { useState } from 'react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import FormField from '../components/common/FormField';
import { useTheme } from '../hooks/useTheme';

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const [company, setCompany] = useState(() => localStorage.getItem('xact-company-name') || '');
  const [defaultFrl, setDefaultFrl] = useState(() => localStorage.getItem('xact-default-frl') || '-/120/120');

  const save = () => {
    localStorage.setItem('xact-company-name', company);
    localStorage.setItem('xact-default-frl', defaultFrl);
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
          <div>
            <Button onClick={save}>Save</Button>
          </div>
        </div>
      </Card>

      <Card>
        <strong>Appearance</strong>
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <Button variant={theme === 'light' ? 'primary' : 'ghost'} onClick={() => setTheme('light')}>Light</Button>
          <Button variant={theme === 'dark'  ? 'primary' : 'ghost'} onClick={() => setTheme('dark')}>Dark</Button>
        </div>
      </Card>

      <Card>
        <strong>Cert pack branding, signatory roster, AS 1851 frequency defaults</strong>
        <p style={{ fontSize: 13, color: 'var(--geist-fg-3)', marginTop: 6 }}>
          Land in phase 10. See <code>REBUILD.md</code> §9.
        </p>
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
