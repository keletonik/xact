import { motion } from 'framer-motion';

/**
 * Monochrome wordmark + minimalist shield. Matches the Geist visual register
 * (near-black ink, no gradient, single accent dot).
 */
export default function EvaluxLogo({ size = 'md', showText = true, collapsed = false }) {
  const sizes = {
    sm: { icon: 22, text: 15 },
    md: { icon: 26, text: 17 },
    lg: { icon: 34, text: 22 },
    xl: { icon: 44, text: 30 },
  };
  const s = sizes[size] || sizes.md;

  return (
    <div className="evalux-logo" style={{ display: 'flex', alignItems: 'center', gap: collapsed ? 0 : 10 }}>
      <motion.svg
        width={s.icon}
        height={s.icon}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        whileHover={{ rotate: 4 }}
        transition={{ type: 'spring', stiffness: 300 }}
        aria-hidden
      >
        {/* Geist-style monochrome triangle mark with a single accent dot */}
        <path d="M16 3 L29 27 L3 27 Z" fill="#ffffff" stroke="#ffffff" strokeWidth="1.5" strokeLinejoin="round" />
        <circle cx="16" cy="20" r="2.5" fill="var(--geist-accent)" />
      </motion.svg>

      {showText && !collapsed && (
        <motion.div
          initial={{ opacity: 0, x: -4 }}
          animate={{ opacity: 1, x: 0 }}
          style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}
        >
          <span style={{
            fontSize: s.text,
            fontWeight: 600,
            letterSpacing: 'var(--geist-tracking-tighter)',
            color: '#ffffff',
            fontFamily: 'var(--geist-font-sans)',
          }}>
            Evalax
          </span>
          {size !== 'sm' && (
            <span style={{
              fontSize: Math.round(s.text * 0.6),
              fontWeight: 500,
              color: '#888',
              letterSpacing: '0.04em',
              marginTop: 2,
              fontFamily: 'var(--geist-font-mono)',
            }}>
              estimating
            </span>
          )}
        </motion.div>
      )}
    </div>
  );
}
