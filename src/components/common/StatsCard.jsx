import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function StatsCard({ title, value, subtitle, icon: Icon, trend, trendValue, color = 'fire', delay = 0 }) {
  const colorMap = {
    fire: { bg: 'var(--color-fire-50)', icon: 'var(--color-fire-500)', gradient: 'linear-gradient(135deg, #ea580c, #f97316)' },
    success: { bg: 'var(--color-success-50)', icon: 'var(--color-success-500)', gradient: 'linear-gradient(135deg, #16a34a, #22c55e)' },
    warning: { bg: 'var(--color-warning-50)', icon: 'var(--color-warning-500)', gradient: 'linear-gradient(135deg, #d97706, #f59e0b)' },
    danger: { bg: 'var(--color-danger-50)', icon: 'var(--color-danger-500)', gradient: 'linear-gradient(135deg, #dc2626, #ef4444)' },
    info: { bg: 'var(--color-info-50)', icon: 'var(--color-info-500)', gradient: 'linear-gradient(135deg, #2563eb, #3b82f6)' },
  };

  const c = colorMap[color] || colorMap.fire;

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? 'var(--color-success-600)' : trend === 'down' ? 'var(--color-danger-600)' : 'var(--text-tertiary)';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay * 0.1, duration: 0.3 }}
      style={{
        backgroundColor: 'var(--bg-card)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-primary)',
        padding: '20px 24px',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
          {title}
        </span>
        {Icon && (
          <div style={{
            width: 40,
            height: 40,
            borderRadius: 'var(--radius-md)',
            backgroundColor: c.bg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Icon size={20} style={{ color: c.icon }} />
          </div>
        )}
      </div>

      <div>
        <div style={{
          fontSize: '1.75rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
          lineHeight: 1.2,
        }}>
          {value}
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          marginTop: 6,
        }}>
          {trend && (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 2,
              fontSize: '0.75rem',
              fontWeight: 600,
              color: trendColor,
            }}>
              <TrendIcon size={14} />
              {trendValue}
            </span>
          )}
          {subtitle && (
            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
              {subtitle}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
