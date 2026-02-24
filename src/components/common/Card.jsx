import { motion } from 'framer-motion';

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
    ? { whileHover: { y: -2, boxShadow: 'var(--shadow-lg)' }, transition: { duration: 0.2 } }
    : {};

  return (
    <Component
      className={`evalux-card ${className}`}
      onClick={onClick}
      style={{
        backgroundColor: 'var(--bg-card)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-primary)',
        boxShadow: 'var(--shadow-sm)',
        overflow: 'hidden',
        ...(padding ? { padding: '20px 24px' } : {}),
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
      marginBottom: 16,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {Icon && (
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-fire-50)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Icon size={18} style={{ color: 'var(--color-fire-600)' }} />
          </div>
        )}
        <div>
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            {title}
          </h3>
          {subtitle && (
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: 2 }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
