import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import AuthSheet from './_AuthSheet';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

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
      stamp="auth · 01"
      headline="Drafter,"
      headlineEm="sign on."
      crumb="Returning to the drawing set"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Field label="Email" icon={Mail}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--ink-3)',
                cursor: 'pointer',
                padding: 4,
              }}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          }
        >
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            style={inputStyle}
            required
          />
        </Field>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Link
            to="/forgot-password"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              letterSpacing: 'var(--tracking-label)',
              textTransform: 'uppercase',
              color: 'var(--accent)',
              textDecoration: 'none',
            }}
          >
            forgot password?
          </Link>
        </div>

        <button type="submit" disabled={loading} style={{ ...primaryAction, opacity: loading ? 0.7 : 1 }}>
          {loading ? 'signing on…' : 'sign on'} <ArrowRight size={14} />
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
          new drafter? <Link to="/register" style={{ color: 'var(--accent)', textDecoration: 'none' }}>open an account</Link>
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
