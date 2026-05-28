/**
 * RevisionStamp — small AS 1100-style revision triangle.
 *
 * Renders a red triangular tag with a revision letter, often pinned
 * to the top-right corner of a sheet, panel, or table header. Hover
 * raises the optional history popover (caller supplies content).
 */
export default function RevisionStamp({
  letter = 'A',
  date,
  note,
  size = 22,
  pulse = false,
  style,
}) {
  return (
    <span
      title={[`Rev ${letter}`, date, note].filter(Boolean).join(' · ')}
      className={pulse ? 'xc-rev-pulse' : undefined}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        ...style,
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: 0,
          height: 0,
          borderLeft: `${size / 2}px solid transparent`,
          borderRight: `${size / 2}px solid transparent`,
          borderBottom: `${size}px solid var(--accent)`,
          position: 'relative',
        }}
      />
      <span style={{
        marginLeft: -size + 2,
        marginTop: size / 6,
        fontFamily: 'var(--font-mono)',
        fontSize: size * 0.42,
        fontWeight: 600,
        color: 'var(--paper-1)',
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
      }}>
        {letter}
      </span>
    </span>
  );
}
