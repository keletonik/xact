import { motion } from 'framer-motion';
import Button from './Button';

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryLabel,
  onSecondary,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 24px',
        textAlign: 'center',
      }}
    >
      {Icon && (
        <div style={{
          width: 64,
          height: 64,
          borderRadius: 'var(--radius-xl)',
          background: 'linear-gradient(135deg, var(--color-fire-50), var(--color-fire-100))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 20,
        }}>
          <Icon size={28} style={{ color: 'var(--color-fire-500)' }} />
        </div>
      )}
      <h3 style={{
        fontSize: '1.125rem',
        fontWeight: 600,
        color: 'var(--text-primary)',
        marginBottom: 8,
      }}>
        {title}
      </h3>
      {description && (
        <p style={{
          fontSize: '0.875rem',
          color: 'var(--text-secondary)',
          maxWidth: 400,
          lineHeight: 1.6,
          marginBottom: 24,
        }}>
          {description}
        </p>
      )}
      <div style={{ display: 'flex', gap: 12 }}>
        {actionLabel && (
          <Button onClick={onAction}>{actionLabel}</Button>
        )}
        {secondaryLabel && (
          <Button variant="secondary" onClick={onSecondary}>{secondaryLabel}</Button>
        )}
      </div>
    </motion.div>
  );
}
