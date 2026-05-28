/**
 * HatchPanel — a panel marked with diagonal fire-rated-wall
 * hatching. Used for danger / warning / NCR banners that need
 * to read as a working-drawing call-out, not a generic toast.
 */
export default function HatchPanel({
  children,
  tone = 'danger',
  title,
  icon: Icon,
  style,
}) {
  const tones = {
    danger:  { ink: 'var(--accent)',                       hatch: 'rgba(200, 16, 46, 0.08)' },
    warning: { ink: 'var(--status-rectification-ink)',     hatch: 'rgba(176, 102, 15, 0.10)' },
    info:    { ink: 'var(--status-installed-ink)',         hatch: 'rgba(30, 79, 184, 0.08)' },
  };
  const t = tones[tone] || tones.danger;
  return (
    <div
      style={{
        position: 'relative',
        border: `1.5px solid ${t.ink}`,
        color: t.ink,
        padding: '12px 16px',
        backgroundImage: `repeating-linear-gradient(45deg, ${t.hatch} 0 8px, transparent 8px 16px)`,
        backgroundColor: 'var(--paper-1)',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        ...style,
      }}
      role="alert"
    >
      {Icon && <Icon size={18} strokeWidth={2.5} />}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
        {title && (
          <strong style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            letterSpacing: 'var(--tracking-label)',
            textTransform: 'uppercase',
            fontWeight: 600,
            color: t.ink,
          }}>
            {title}
          </strong>
        )}
        <div style={{ fontSize: 13, color: 'var(--ink)' }}>{children}</div>
      </div>
    </div>
  );
}
