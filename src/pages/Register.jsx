import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Building2, ArrowRight, Eye, EyeOff } from 'lucide-react';
import EvaluxLogo from '../components/common/EvaluxLogo';
import Button from '../components/common/Button';

export default function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate('/');
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
          maxWidth: 480,
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
          <h2 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
            Create your account
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Start estimating smarter with Evalux
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            <InputField icon={User} label="First Name" placeholder="First name" />
            <InputField icon={User} label="Last Name" placeholder="Last name" />
          </div>
          <InputField icon={Building2} label="Company" placeholder="Company name" />
          <InputField icon={Mail} label="Email" type="email" placeholder="your@email.com" />
          <div style={{ position: 'relative' }}>
            <InputField
              icon={Lock}
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Create a strong password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: 8,
                bottom: 12,
                padding: 4,
                color: 'var(--text-tertiary)',
                display: 'flex',
              }}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <div style={{ marginTop: 4, marginBottom: 24 }}>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, cursor: 'pointer' }}>
              <input type="checkbox" style={{ marginTop: 3 }} />
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                I agree to the Terms of Service and Privacy Policy
              </span>
            </label>
          </div>

          <Button type="submit" fullWidth loading={loading} iconRight={ArrowRight} size="lg">
            Create Account
          </Button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--color-fire-500)', fontWeight: 600 }}>
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

function InputField({ icon: Icon, label, type = 'text', placeholder }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <Icon size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
        <input
          type={type}
          placeholder={placeholder}
          style={{
            width: '100%',
            height: 42,
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
  );
}
