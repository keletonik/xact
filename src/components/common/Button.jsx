import { motion } from 'framer-motion';

/**
 * Geist-style button: solid near-black for primary, white-on-border for
 * secondary, subtle hover, single accent (Vercel blue) for focus.
 */
const variants = {
  primary: {
    background: 'var(--geist-fg)',
    color: 'var(--geist-bg)',
    border: '1px solid var(--geist-fg)',
    hoverBackground: 'var(--geist-fg-1)',
  },
  secondary: {
    background: 'var(--geist-bg)',
    color: 'var(--geist-fg)',
    border: '1px solid var(--geist-border-strong)',
    hoverBackground: 'var(--geist-bg-1)',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--geist-fg-2)',
    border: '1px solid transparent',
    hoverBackground: 'var(--geist-bg-2)',
  },
  accent: {
    background: 'var(--geist-accent)',
    color: 'var(--geist-accent-fg)',
    border: '1px solid var(--geist-accent)',
    hoverBackground: 'var(--geist-accent-hover)',
  },
  danger: {
    background: 'var(--geist-bg)',
    color: 'var(--geist-error)',
    border: '1px solid var(--geist-error)',
    hoverBackground: 'var(--geist-error-soft)',
  },
  success: {
    background: 'var(--geist-success)',
    color: '#ffffff',
    border: '1px solid var(--geist-success)',
    hoverBackground: '#0c8a4c',
  },
};

const sizes = {
  sm: { padding: '0 12px', fontSize: '0.8125rem', height: 'var(--geist-control-sm)' },
  md: { padding: '0 16px', fontSize: '0.875rem',  height: 'var(--geist-control)' },
  lg: { padding: '0 20px', fontSize: '0.9375rem', height: 'var(--geist-control-lg)' },
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
      whileHover={disabled ? {} : { y: -1 }}
      whileTap={disabled ? {} : { y: 0 }}
      onHoverStart={(e) => { if (!disabled && e?.currentTarget) e.currentTarget.style.background = v.hoverBackground; }}
      onHoverEnd={(e) => { if (!disabled && e?.currentTarget) e.currentTarget.style.background = v.background; }}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        background: disabled ? 'var(--geist-bg-2)' : v.background,
        color: disabled ? 'var(--geist-fg-4)' : v.color,
        border: disabled ? '1px solid var(--geist-border)' : v.border,
        borderRadius: 'var(--geist-radius)',
        fontWeight: 'var(--geist-weight-medium)',
        letterSpacing: 'var(--geist-tracking-tight)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'background var(--transition-fast), color var(--transition-fast), border-color var(--transition-fast), transform var(--transition-fast)',
        opacity: disabled ? 0.55 : 1,
        width: fullWidth ? '100%' : 'auto',
        userSelect: 'none',
        whiteSpace: 'nowrap',
        ...s,
        ...customStyle,
      }}
    >
      {loading ? (
        <span style={{
          width: 14,
          height: 14,
          border: '2px solid currentColor',
          borderTopColor: 'transparent',
          borderRadius: '50%',
          animation: 'spin 0.7s linear infinite',
          opacity: 0.7,
        }} />
      ) : Icon ? (
        <Icon size={size === 'sm' ? 14 : 16} strokeWidth={2.25} />
      ) : null}
      {children}
      {IconRight && <IconRight size={size === 'sm' ? 14 : 16} strokeWidth={2.25} />}
    </motion.button>
  );
}
