/**
 * ScheduleTable — AS 1100-flavoured technical schedule table.
 *
 * Columns are headed in mono caps with a thick rule below. Rows
 * carry hairline rules. The optional `leader` prop on a column
 * inserts the tab-leader-dot pattern common in penetration
 * schedules ("PEN-001 ............ pvc 100mm").
 *
 * Hover state draws a red revision underline from left.
 */
export default function ScheduleTable({
  columns,
  rows,
  keyFn = (r) => r.id,
  onRowClick,
  empty,
  style,
}) {
  if (!rows || rows.length === 0) {
    return empty || null;
  }
  return (
    <div style={{ overflowX: 'auto', ...style }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {columns.map((c) => (
              <th
                key={c.key}
                style={{
                  textAlign: c.align || 'left',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  letterSpacing: 'var(--tracking-label)',
                  textTransform: 'uppercase',
                  color: 'var(--ink-3)',
                  fontWeight: 600,
                  padding: '8px 12px',
                  borderBottom: '1.5px solid var(--rule-ink)',
                  whiteSpace: 'nowrap',
                  width: c.width,
                  ...c.headStyle,
                }}
              >
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr
              key={keyFn(row)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className="xc-sched-row"
              style={{
                cursor: onRowClick ? 'pointer' : 'default',
                background: idx % 2 === 0 ? 'transparent' : 'rgba(14, 14, 15, 0.02)',
              }}
            >
              {columns.map((c) => (
                <td
                  key={c.key}
                  style={{
                    padding: '10px 12px',
                    fontFamily: c.mono ? 'var(--font-mono)' : 'var(--font-sans)',
                    fontSize: 13,
                    color: 'var(--ink)',
                    borderBottom: '1px solid var(--rule)',
                    whiteSpace: c.wrap ? 'normal' : 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    textAlign: c.align || 'left',
                    verticalAlign: 'middle',
                    ...(c.leader ? leaderCellStyle : null),
                    ...c.cellStyle,
                  }}
                >
                  {c.render ? c.render(row) : row[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <style>{`
        .xc-sched-row { position: relative; }
        .xc-sched-row::after {
          content: "";
          position: absolute;
          left: 0; right: 100%; bottom: 0;
          height: 1.5px;
          background: var(--accent);
          transition: right 220ms var(--geist-easing);
        }
        .xc-sched-row:hover::after { right: 0; }
        .xc-sched-row:hover { background: rgba(200, 16, 46, 0.03) !important; }
      `}</style>
    </div>
  );
}

const leaderCellStyle = {
  position: 'relative',
};
