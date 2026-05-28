/**
 * InkStamp — an "INSTALLED" / "CERTIFIED" / "NCR" rubber-stamp marker.
 *
 * A bordered all-caps mono label with a small intentional rotation
 * and reduced fill opacity to read as ink pressed onto paper. Use
 * for asset cards, photo headers, cert pack list items.
 */
const PALETTES = {
  installed:      { ink: 'var(--status-installed-ink)',      bg: 'rgba(30, 79, 184, 0.08)' },
  certified:      { ink: 'var(--status-certified-ink)',      bg: 'rgba(27, 94, 42, 0.10)' },
  rectification:  { ink: 'var(--status-rectification-ink)',  bg: 'rgba(176, 102, 15, 0.10)' },
  nonconformance: { ink: 'var(--status-nonconformance-ink)', bg: 'rgba(200, 16, 46, 0.10)' },
  planned:        { ink: 'var(--status-planned-ink)',        bg: 'rgba(14, 14, 15, 0.05)' },
  draft:          { ink: 'var(--ink-3)',                     bg: 'rgba(14, 14, 15, 0.04)' },
  accent:         { ink: 'var(--accent)',                    bg: 'var(--accent-soft)' },
};

export default function InkStamp({
  children,
  tone = 'planned',
  size = 'md',
  rotate = -3,
  style,
}) {
  const p = PALETTES[tone] || PALETTES.planned;
  const sizing = {
    sm: { padding: '2px 8px',  fontSize: 10, borderWidth: 1.25 },
    md: { padding: '3px 10px', fontSize: 11, borderWidth: 1.5 },
    lg: { padding: '5px 14px', fontSize: 13, borderWidth: 2 },
  }[size] || { padding: '3px 10px', fontSize: 11, borderWidth: 1.5 };

  return (
    <span
      style={{
        display: 'inline-block',
        fontFamily: 'var(--font-mono)',
        textTransform: 'uppercase',
        letterSpacing: 'var(--tracking-label)',
        fontWeight: 600,
        color: p.ink,
        background: p.bg,
        border: `${sizing.borderWidth}px solid ${p.ink}`,
        transform: `rotate(${rotate}deg)`,
        transformOrigin: 'center',
        whiteSpace: 'nowrap',
        ...sizing,
        ...style,
      }}
    >
      {children}
    </span>
  );
}
