import { useEffect, useState } from 'react';

/**
 * PencilProgress — a pencil stroking across a baseline as the
 * indeterminate progress indicator. Drafted as SVG so it scales
 * crisply and can be themed with current text colour.
 */
export default function PencilProgress({ label, size = 'md' }) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => (t + 1) % 100), 70);
    return () => clearInterval(id);
  }, []);
  const width = size === 'sm' ? 80 : size === 'lg' ? 220 : 140;
  const x = (tick / 100) * width;

  return (
    <div
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 6,
        fontFamily: 'var(--font-mono)',
        fontSize: 10,
        letterSpacing: 'var(--tracking-label)',
        textTransform: 'uppercase',
        color: 'var(--ink-3)',
      }}
      aria-busy="true"
      aria-label={label || 'drafting'}
    >
      <svg width={width} height={20} viewBox={`0 0 ${width} 20`}>
        <line x1="0" y1="14" x2={width} y2="14" stroke="var(--rule-strong)" strokeWidth="1" />
        <line x1="0" y1="14" x2={x} y2="14" stroke="var(--ink)" strokeWidth="1.5" />
        {/* pencil */}
        <g transform={`translate(${x - 12} 4)`}>
          <polygon points="0,5 16,0 16,10" fill="var(--ink)" />
          <rect x="16" y="0" width="6" height="10" fill="var(--accent)" />
        </g>
      </svg>
      {label && <span>{label}</span>}
    </div>
  );
}
