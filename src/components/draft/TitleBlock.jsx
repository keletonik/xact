/**
 * TitleBlock — the dark sheet header strip rendering project meta.
 *
 * Renders four meta cells (PROJ, CLIENT/NAME, REV, DATE) plus an
 * optional actions slot. Pages that aren't project-scoped pass a
 * placeholder string ("MASTER", "INDEX") so the chrome stays visible
 * throughout the app.
 */
export default function TitleBlock({
  code = 'MASTER',
  name,
  client,
  revision = 'A',
  date,
  sheetN,
  sheetOf,
  actions,
}) {
  const today = date || new Date().toLocaleDateString('en-AU', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
  return (
    <header className="xc-title">
      <div className="xc-title-logo">
        <span className="xc-mark">xact<span className="xc-mark-tag">passive fire</span></span>
      </div>

      <div className="xc-title-meta">
        <div className="xc-meta-cell">
          <span className="xc-label">PROJ</span>
          <span className="xc-value">{code}</span>
        </div>
        <div className="xc-meta-cell">
          <span className="xc-label">NAME</span>
          <span className="xc-value-em">{name || 'No project selected'}</span>
        </div>
        <div className="xc-meta-cell">
          <span className="xc-label">CLIENT</span>
          <span className="xc-value">{client || '—'}</span>
        </div>
        <div className="xc-meta-cell">
          <span className="xc-label">REV · DATE · SHEET</span>
          <span className="xc-value">
            {revision} · {today}{sheetN ? ` · ${sheetN}/${sheetOf || '—'}` : ''}
          </span>
        </div>
      </div>

      {actions && (
        <div className="xc-title-actions">{actions}</div>
      )}
    </header>
  );
}
