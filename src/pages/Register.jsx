import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, Building2, Eye, EyeOff, ArrowRight } from 'lucide-react';
import AuthSheet from './_AuthSheet';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', company: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate('/');
    }, 600);
  };

  return (
    <AuthSheet
      stamp="auth · 02"
      headline="Open"
      headlineEm="an account."
      crumb="New drafter, new sheet set"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Field label="Name" icon={User}>
          <input
            type="text"
            value={form.name}
            onChange={(e) => set({ name: e.target.value })}
            placeholder="Kaspar Tavitian"
            style={inputStyle}
            required
            autoFocus
          />
        </Field>
        <Field label="Company / trading name" icon={Building2}>
          <input
            type="text"
            value={form.company}
            onChange={(e) => set({ company: e.target.value })}
            placeholder="e.g. Smith Passive Fire Pty Ltd"
            style={inputStyle}
            required
          />
        </Field>
        <Field label="Email" icon={Mail}>
          <input
            type="email"
            value={form.email}
            onChange={(e) => set({ email: e.target.value })}
            placeholder="you@firm.com.au"
            style={inputStyle}
            required
          />
        </Field>
        <Field
          label="Password"
          icon={Lock}
          accessory={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{ background: 'transparent', border: 'none', color: 'var(--ink-3)', cursor: 'pointer', padding: 4 }}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          }
        >
          <input
            type={showPassword ? 'text' : 'password'}
            value={form.password}
            onChange={(e) => set({ password: e.target.value })}
            placeholder="minimum 12 characters"
            style={inputStyle}
            required
            minLength={12}
          />
        </Field>

        <p style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          letterSpacing: '0.06em',
          color: 'var(--ink-4)',
          marginTop: 4,
          lineHeight: 1.5,
        }}>
          By opening an account you agree to draft AU-jurisdiction passive-fire work to AS 4072.1, AS 1530.4, AS 1851 and the NCC, and to retain every cert pack on file.
        </p>

        <button type="submit" disabled={loading} style={{ ...primaryAction, opacity: loading ? 0.7 : 1 }}>
          {loading ? 'opening…' : 'open account'} <ArrowRight size={14} />
        </button>

        <p style={{
          textAlign: 'center',
          marginTop: 4,
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          letterSpacing: 'var(--tracking-label)',
          textTransform: 'uppercase',
          color: 'var(--ink-4)',
        }}>
          existing account? <Link to="/login" style={{ color: 'var(--accent)', textDecoration: 'none' }}>sign on</Link>
        </p>
      </form>
    </AuthSheet>
  );
}

function Field({ label, icon: Icon, accessory, children }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <span style={fieldLabel}>{label}</span>
      <span style={{ position: 'relative', display: 'block' }}>
        {Icon && (
          <Icon
            size={14}
            color="var(--ink-3)"
            style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
          />
        )}
        {children}
        {accessory && (
          <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)' }}>
            {accessory}
          </span>
        )}
      </span>
    </label>
  );
}

const fieldLabel = {
  fontFamily: 'var(--font-mono)',
  fontSize: 10,
  letterSpacing: 'var(--tracking-label)',
  textTransform: 'uppercase',
  color: 'var(--ink-3)',
  fontWeight: 500,
};
const inputStyle = {
  width: '100%',
  height: 42,
  padding: '0 12px 0 36px',
  background: 'var(--paper-1)',
  border: '1px solid var(--rule-strong)',
  fontFamily: 'var(--font-sans)',
  fontSize: 14,
  color: 'var(--ink)',
  outline: 'none',
  boxSizing: 'border-box',
};
const primaryAction = {
  width: '100%',
  height: 44,
  background: 'var(--ink)',
  color: 'var(--paper-1)',
  border: '1px solid var(--ink)',
  fontFamily: 'var(--font-mono)',
  fontSize: 12,
  letterSpacing: 'var(--tracking-label)',
  textTransform: 'uppercase',
  fontWeight: 500,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
};
