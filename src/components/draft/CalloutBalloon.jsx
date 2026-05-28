/**
 * CalloutBalloon — a drawing-callout style label box used for asset
 * tags, FRL readouts, and any short technical token.
 *
 * Square ink border, monospace caps, single-line. Optional ink fill
 * inverts the chrome for the strongest emphasis.
 */
export default function CalloutBalloon({
  children,
  size = 'md',
  tone = 'paper',
  monospace = true,
  style,
}) {
  const tones = {
    paper: { bg: 'var(--paper-1)', fg: 'var(--ink)',     border: 'var(--ink)'   },
    sunk:  { bg: 'var(--paper-2)', fg: 'var(--ink)',     border: 'var(--rule-strong)' },
    ink:   { bg: 'var(--ink)',     fg: 'var(--paper-1)', border: 'var(--ink)'   },
    accent:{ bg: 'var(--accent)',  fg: 'var(--paper-1)', border: 'var(--accent)'},
  };
  const t = tones[tone] || tones.paper;
  const sizing = {
    sm: { padding: '1px 5px', fontSize: 10 },
    md: { padding: '2px 7px', fontSize: 11 },
    lg: { padding: '3px 10px', fontSize: 13 },
  }[size] || { padding: '2px 7px', fontSize: 11 };

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        background: t.bg,
        color: t.fg,
        border: `1px solid ${t.border}`,
        fontFamily: monospace ? 'var(--font-mono)' : 'var(--font-sans)',
        letterSpacing: monospace ? '0.04em' : '-0.005em',
        fontWeight: 500,
        lineHeight: 1,
        whiteSpace: 'nowrap',
        ...sizing,
        ...style,
      }}
    >
      {children}
    </span>
  );
}
