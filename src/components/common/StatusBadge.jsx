import { getStatusColor } from '../../utils/helpers';

const colorMap = {
  success: {
    bg: 'var(--color-success-50)',
    text: 'var(--color-success-700)',
    dot: 'var(--color-success-500)',
  },
  warning: {
    bg: 'var(--color-warning-50)',
    text: 'var(--color-warning-600)',
    dot: 'var(--color-warning-500)',
  },
  danger: {
    bg: 'var(--color-danger-50)',
    text: 'var(--color-danger-700)',
    dot: 'var(--color-danger-500)',
  },
  info: {
    bg: 'var(--color-info-50)',
    text: 'var(--color-info-600)',
    dot: 'var(--color-info-500)',
  },
  neutral: {
    bg: 'var(--bg-tertiary)',
    text: 'var(--text-secondary)',
    dot: 'var(--text-tertiary)',
  },
};

export default function StatusBadge({ status, size = 'sm', showDot = true }) {
  const variant = getStatusColor(status);
  const colors = colorMap[variant] || colorMap.neutral;

  const label = status?.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || 'Unknown';

  const sizeStyles = {
    xs: { fontSize: '0.675rem', padding: '1px 6px' },
    sm: { fontSize: '0.75rem', padding: '2px 8px' },
    md: { fontSize: '0.8125rem', padding: '3px 10px' },
  };

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        backgroundColor: colors.bg,
        color: colors.text,
        borderRadius: 'var(--radius-full)',
        fontWeight: 600,
        whiteSpace: 'nowrap',
        ...sizeStyles[size],
      }}
    >
      {showDot && (
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            backgroundColor: colors.dot,
            flexShrink: 0,
          }}
        />
      )}
      {label}
    </span>
  );
}
