import { motion } from 'framer-motion';

/**
 * Geist-style card: white surface, thin border, no shadow at rest, subtle
 * elevation on hover when `hover` is set.
 */
export default function Card({
  children,
  className = '',
  padding = true,
  hover = false,
  onClick,
  style = {},
}) {
  const Component = hover ? motion.div : 'div';
  const motionProps = hover
    ? { whileHover: { y: -1, boxShadow: 'var(--geist-shadow-md)' }, transition: { duration: 0.18 } }
    : {};

  return (
    <Component
      className={`evalux-card ${className}`}
      onClick={onClick}
      style={{
        backgroundColor: 'var(--geist-bg)',
        borderRadius: 'var(--geist-radius-md)',
        border: '1px solid var(--geist-border)',
        overflow: 'hidden',
        transition: 'box-shadow var(--transition-fast), border-color var(--transition-fast)',
        ...(padding ? { padding: 'var(--geist-space-5)' } : {}),
        ...(onClick ? { cursor: 'pointer' } : {}),
        ...style,
      }}
      {...motionProps}
    >
      {children}
    </Component>
  );
}

export function CardHeader({ title, subtitle, action, icon: Icon }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      marginBottom: 'var(--geist-space-4)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--geist-space-3)' }}>
        {Icon && (
          <div style={{
            width: 32,
            height: 32,
            borderRadius: 'var(--geist-radius)',
            border: '1px solid var(--geist-border)',
            background: 'var(--geist-bg-1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--geist-fg)',
          }}>
            <Icon size={16} strokeWidth={2.25} />
          </div>
        )}
        <div>
          <h3 style={{
            fontSize: 'var(--geist-text-md)',
            fontWeight: 'var(--geist-weight-semibold)',
            color: 'var(--geist-fg)',
            margin: 0,
            letterSpacing: 'var(--geist-tracking-tighter)',
          }}>
            {title}
          </h3>
          {subtitle && (
            <p style={{
              fontSize: 'var(--geist-text-sm)',
              color: 'var(--geist-fg-3)',
              marginTop: 2,
              margin: 0,
            }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
