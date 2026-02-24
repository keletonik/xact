import { motion } from 'framer-motion';

export default function EvaluxLogo({ size = 'md', showText = true, collapsed = false }) {
  const sizes = {
    sm: { icon: 28, text: 16 },
    md: { icon: 36, text: 20 },
    lg: { icon: 48, text: 28 },
    xl: { icon: 64, text: 36 },
  };

  const s = sizes[size] || sizes.md;

  return (
    <div className="evalux-logo" style={{ display: 'flex', alignItems: 'center', gap: collapsed ? 0 : 10 }}>
      <motion.svg
        width={s.icon}
        height={s.icon}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        whileHover={{ scale: 1.05 }}
        transition={{ type: 'spring', stiffness: 300 }}
      >
        <defs>
          <linearGradient id="fireGrad" x1="32" y1="56" x2="32" y2="8" gradientUnits="userSpaceOnUse">
            <stop stopColor="#E8430A" />
            <stop offset="0.5" stopColor="#F97316" />
            <stop offset="1" stopColor="#FBBF24" />
          </linearGradient>
          <linearGradient id="innerGrad" x1="32" y1="48" x2="32" y2="28" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FDE68A" />
            <stop offset="1" stopColor="#FCD34D" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        {/* Shield shape */}
        <path
          d="M32 4L8 16V32C8 46.4 18.4 59.2 32 62C45.6 59.2 56 46.4 56 32V16L32 4Z"
          fill="#0f172a"
          stroke="url(#fireGrad)"
          strokeWidth="2"
        />
        {/* Outer flame */}
        <path
          d="M32 14C32 14 20 26 20 38C20 44.627 25.373 50 32 50C38.627 50 44 44.627 44 38C44 26 32 14 32 14Z"
          fill="url(#fireGrad)"
          filter="url(#glow)"
        />
        {/* Inner flame */}
        <path
          d="M32 28C32 28 26 34 26 40C26 43.314 28.686 46 32 46C35.314 46 38 43.314 38 40C38 34 32 28 32 28Z"
          fill="url(#innerGrad)"
        />
      </motion.svg>

      {showText && !collapsed && (
        <motion.div
          initial={{ opacity: 0, x: -5 }}
          animate={{ opacity: 1, x: 0 }}
          style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}
        >
          <span style={{
            fontSize: s.text,
            fontWeight: 800,
            letterSpacing: '-0.02em',
            background: 'linear-gradient(135deg, #F97316, #FBBF24)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            EVALUX
          </span>
          {size !== 'sm' && (
            <span style={{
              fontSize: s.text * 0.42,
              fontWeight: 500,
              color: 'var(--text-tertiary)',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              marginTop: 2,
            }}>
              Fire Safety
            </span>
          )}
        </motion.div>
      )}
    </div>
  );
}
