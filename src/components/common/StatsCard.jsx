import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

/**
 * Stat tile in the Geist register: monochrome surface, single accent for the
 * icon chip, mono-typeface numerals.
 */
export default function StatsCard({ title, value, subtitle, icon: Icon, trend, trendValue, color = 'fg', delay = 0 }) {
  // Map legacy colour keys onto the new flat palette. All chips are the same
  // light grey at rest — the *icon stroke* is the only differentiator.
  const iconColor = {
    fire:    'var(--geist-fg)',
    fg:      'var(--geist-fg)',
    success: 'var(--geist-success)',
    warning: 'var(--geist-warning)',
    danger:  'var(--geist-error)',
    info:    'var(--geist-accent)',
  }[color] || 'var(--geist-fg)';

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up'
    ? 'var(--geist-success)'
    : trend === 'down'
    ? 'var(--geist-error)'
    : 'var(--geist-fg-3)';

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay * 0.08, duration: 0.24 }}
      style={{
        backgroundColor: 'var(--geist-bg)',
        borderRadius: 'var(--geist-radius-md)',
        border: '1px solid var(--geist-border)',
        padding: 'var(--geist-space-5)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--geist-space-3)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{
          fontSize: 'var(--geist-text-sm)',
          fontWeight: 'var(--geist-weight-medium)',
          color: 'var(--geist-fg-3)',
          letterSpacing: 0,
          textTransform: 'none',
        }}>
          {title}
        </span>
        {Icon && (
          <div style={{
            width: 28, height: 28,
            borderRadius: 'var(--geist-radius)',
            border: '1px solid var(--geist-border)',
            background: 'var(--geist-bg-1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: iconColor,
          }}>
            <Icon size={16} strokeWidth={2.25} />
          </div>
        )}
      </div>

      <div>
        <div style={{
          fontFamily: 'var(--geist-font-mono)',
          fontSize: 'var(--geist-text-3xl)',
          fontWeight: 'var(--geist-weight-semibold)',
          color: 'var(--geist-fg)',
          letterSpacing: 'var(--geist-tracking-tighter)',
          lineHeight: 1.1,
        }}>
          {value}
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--geist-space-2)',
          marginTop: 'var(--geist-space-2)',
        }}>
          {trend && (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 2,
              fontSize: 'var(--geist-text-xs)',
              fontWeight: 'var(--geist-weight-semibold)',
              color: trendColor,
              fontFamily: 'var(--geist-font-mono)',
            }}>
              <TrendIcon size={12} strokeWidth={2.5} />
              {trendValue}
            </span>
          )}
          {subtitle && (
            <span style={{ fontSize: 'var(--geist-text-xs)', color: 'var(--geist-fg-4)' }}>
              {subtitle}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
