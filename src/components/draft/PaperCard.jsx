/**
 * PaperCard — a flat panel rendered on the drafting paper.
 *
 * No shadows, no rounded corners. The card is defined by an ink
 * hairline border with an optional revision-strip header band.
 * Use `tone="ink"` for an inverted (dark) panel inside the sheet,
 * `tone="hatch"` for the diagonal fire-rated-wall hatching.
 */
export default function PaperCard({
  children,
  title,
  meta,
  tone = 'paper',
  heavy = false,
  noPad = false,
  style,
  className = '',
  onClick,
  as: Tag = 'section',
  ...rest
}) {
  const tones = {
    paper: { bg: 'var(--paper-1)',   fg: 'var(--ink)',     border: 'var(--rule-strong)' },
    sunk:  { bg: 'var(--paper-2)',   fg: 'var(--ink)',     border: 'var(--rule-strong)' },
    ink:   { bg: 'var(--ink)',       fg: 'var(--paper-1)', border: 'var(--ink)' },
    hatch: { bg: 'transparent',      fg: 'var(--ink)',     border: 'var(--rule-strong)' },
  };
  const t = tones[tone] || tones.paper;

  const cardStyle = {
    background: t.bg,
    color: t.fg,
    border: `${heavy ? '1.5px' : '1px'} solid ${t.border}`,
    position: 'relative',
    ...(tone === 'hatch' ? {
      backgroundImage:
        'repeating-linear-gradient(45deg, rgba(14,14,15,0.06) 0 6px, transparent 6px 12px)',
    } : {}),
    ...style,
  };

  return (
    <Tag
      onClick={onClick}
      className={`xc-paper ${className}`}
      style={cardStyle}
      {...rest}
    >
      {(title || meta) && (
        <header style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          padding: '10px 14px 8px',
          borderBottom: `1px ${heavy ? 'solid' : 'dashed'} ${t.border}`,
          background: tone === 'ink' ? 'rgba(244,239,226,0.06)' : 'var(--paper-2)',
        }}>
          {title && (
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              letterSpacing: 'var(--tracking-label)',
              textTransform: 'uppercase',
              color: tone === 'ink' ? 'var(--paper-3)' : 'var(--ink-3)',
            }}>
              {title}
            </span>
          )}
          {meta && (
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              letterSpacing: '0.08em',
              color: tone === 'ink' ? 'var(--paper-3)' : 'var(--ink-3)',
            }}>
              {meta}
            </span>
          )}
        </header>
      )}
      <div style={{ padding: noPad ? 0 : 14 }}>
        {children}
      </div>
    </Tag>
  );
}
