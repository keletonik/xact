import { motion } from 'framer-motion';

const variants = {
  primary: {
    background: 'linear-gradient(135deg, #ea580c, #f97316)',
    color: '#ffffff',
    border: 'none',
    hoverBackground: 'linear-gradient(135deg, #c2410c, #ea580c)',
  },
  secondary: {
    background: 'var(--bg-tertiary)',
    color: 'var(--text-primary)',
    border: '1px solid var(--border-primary)',
    hoverBackground: 'var(--bg-card-hover)',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--text-secondary)',
    border: 'none',
    hoverBackground: 'var(--bg-tertiary)',
  },
  danger: {
    background: 'var(--color-danger-600)',
    color: '#ffffff',
    border: 'none',
    hoverBackground: 'var(--color-danger-700)',
  },
  success: {
    background: 'var(--color-success-600)',
    color: '#ffffff',
    border: 'none',
    hoverBackground: 'var(--color-success-700)',
  },
};

const sizes = {
  sm: { padding: '6px 12px', fontSize: '0.75rem', height: 32 },
  md: { padding: '8px 16px', fontSize: '0.8125rem', height: 38 },
  lg: { padding: '10px 20px', fontSize: '0.875rem', height: 44 },
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconRight: IconRight,
  fullWidth = false,
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  style: customStyle = {},
}) {
  const v = variants[variant] || variants.primary;
  const s = sizes[size] || sizes.md;

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        background: disabled ? 'var(--bg-tertiary)' : v.background,
        color: disabled ? 'var(--text-tertiary)' : v.color,
        border: v.border,
        borderRadius: 'var(--radius-md)',
        fontWeight: 600,
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all var(--transition-fast)',
        opacity: disabled ? 0.5 : 1,
        width: fullWidth ? '100%' : 'auto',
        ...s,
        ...customStyle,
      }}
    >
      {loading ? (
        <span style={{
          width: 16,
          height: 16,
          border: '2px solid rgba(255,255,255,0.3)',
          borderTopColor: '#fff',
          borderRadius: '50%',
          animation: 'spin 0.6s linear infinite',
        }} />
      ) : Icon ? (
        <Icon size={s.fontSize === '0.75rem' ? 14 : 16} />
      ) : null}
      {children}
      {IconRight && <IconRight size={s.fontSize === '0.75rem' ? 14 : 16} />}
    </motion.button>
  );
}
