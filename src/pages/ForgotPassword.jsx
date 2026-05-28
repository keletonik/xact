import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, ArrowLeft } from 'lucide-react';
import AuthSheet from './_AuthSheet';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 500);
  };

  return (
    <AuthSheet
      stamp="auth · recover"
      headline={sent ? 'Reset' : 'Lost'}
      headlineEm={sent ? 'in the post.' : 'your key?'}
      crumb={sent ? 'Check the inbox you registered' : 'Issue a reset link to your registered email'}
    >
      {sent ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p style={{ fontSize: 14, color: 'var(--ink-2)', margin: 0 }}>
            A reset link has been issued to <strong>{email}</strong>. Follow the link inside the email to draft a new password.
          </p>
          <Link to="/login" style={ghostAction}>
            <ArrowLeft size={14} /> back to sign on
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Field label="Registered email" icon={Mail}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@firm.com.au"
              style={inputStyle}
              required
              autoFocus
            />
          </Field>

          <button type="submit" disabled={loading} style={{ ...primaryAction, opacity: loading ? 0.7 : 1 }}>
            {loading ? 'sending…' : 'send reset link'} <ArrowRight size={14} />
          </button>

          <Link to="/login" style={{
            textAlign: 'center',
            marginTop: 4,
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            letterSpacing: 'var(--tracking-label)',
            textTransform: 'uppercase',
            color: 'var(--ink-4)',
            textDecoration: 'none',
          }}>
            <ArrowLeft size={11} style={{ verticalAlign: 'middle', marginRight: 4 }} />
            back to sign on
          </Link>
        </form>
      )}
    </AuthSheet>
  );
}

function Field({ label, icon: Icon, children }) {
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
const ghostAction = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 6,
  padding: '12px 16px',
  background: 'transparent',
  color: 'var(--ink-2)',
  border: '1px solid var(--rule-strong)',
  fontFamily: 'var(--font-mono)',
  fontSize: 12,
  letterSpacing: 'var(--tracking-label)',
  textTransform: 'uppercase',
  textDecoration: 'none',
};
