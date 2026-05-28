/**
 * KeyLegend — the colour key block that lives in the sheet footer
 * (and any panel that wants a self-contained legend).
 *
 * Each item is a small square swatch + mono-caps label. The square
 * carries an ink border so empty/light colours read as "off".
 */
const STATUS = [
  { label: 'planned',    fill: 'var(--paper-1)',                  border: 'var(--ink)' },
  { label: 'installed',  fill: 'var(--status-installed-ink)',     border: 'var(--ink)' },
  { label: 'certified',  fill: 'var(--status-certified-ink)',     border: 'var(--ink)' },
  { label: 'rectify',    fill: 'var(--status-rectification-ink)', border: 'var(--ink)' },
  { label: 'ncr',        fill: 'var(--status-nonconformance-ink)',border: 'var(--ink)' },
];

export default function KeyLegend({ items = STATUS, style }) {
  return (
    <div className="xc-key" style={{ display: 'flex', alignItems: 'center', gap: 14, ...style }}>
      <span style={{ color: 'var(--ink-4)', letterSpacing: 'var(--tracking-label)' }}>KEY</span>
      {items.map((it) => (
        <span key={it.label} className="xc-key-item">
          <span
            className="xc-key-dot"
            style={{ background: it.fill, borderColor: it.border }}
            aria-hidden="true"
          />
          <span style={{ marginLeft: 5 }}>{it.label}</span>
        </span>
      ))}
    </div>
  );
}

export { STATUS as DEFAULT_LEGEND };
