import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import EvaluxLogo from '../components/common/EvaluxLogo';
import Button from '../components/common/Button';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 800);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      padding: 24,
    }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          width: '100%',
          maxWidth: 440,
          backgroundColor: 'var(--bg-primary)',
          borderRadius: 'var(--radius-2xl)',
          padding: '40px 40px',
          boxShadow: 'var(--shadow-xl)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
            <EvaluxLogo size="lg" />
          </div>

          {submitted ? (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
              <div style={{
                width: 56,
                height: 56,
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--color-success-50)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}>
                <CheckCircle2 size={28} style={{ color: 'var(--color-success-500)' }} />
              </div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
                Check your email
              </h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 24 }}>
                We've sent password reset instructions to <strong>{email}</strong>. Check your inbox and follow the link to reset your password.
              </p>
              <Link to="/login" style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                fontSize: '0.875rem',
                color: 'var(--color-fire-500)',
                fontWeight: 600,
              }}>
                <ArrowLeft size={16} /> Back to sign in
              </Link>
            </motion.div>
          ) : (
            <>
              <h2 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
                Reset your password
              </h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                Enter your email and we'll send you instructions to reset your password.
              </p>
            </>
          )}
        </div>

        {!submitted && (
          <>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
                  Email
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    style={{
                      width: '100%',
                      height: 44,
                      paddingLeft: 40,
                      paddingRight: 12,
                      backgroundColor: 'var(--bg-input)',
                      border: '1px solid var(--border-primary)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--text-primary)',
                      fontSize: '0.875rem',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              <Button type="submit" fullWidth loading={loading} size="lg">
                Send Reset Instructions
              </Button>
            </form>

            <p style={{ textAlign: 'center', marginTop: 24 }}>
              <Link to="/login" style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                fontSize: '0.8125rem',
                color: 'var(--text-secondary)',
                fontWeight: 500,
              }}>
                <ArrowLeft size={16} /> Back to sign in
              </Link>
            </p>
          </>
        )}
      </motion.div>
    </div>
  );
}
