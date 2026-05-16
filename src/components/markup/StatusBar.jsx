import { Crosshair, Maximize2 } from 'lucide-react';
import { formatLength } from '../../markup/geometry';

/**
 * Bottom status strip — always visible while a drawing is open. Shows the
 * cursor position in real-world units (if calibrated), zoom %, page n/m,
 * calibration status, current display-units selector, and active tool.
 */
export default function StatusBar({
  page, totalPages, pageNumber, onSetPage,
  cursorMm, zoom, onZoomChange,
  displayUnit, onDisplayUnitChange,
  activeTool, selectionCount,
}) {
  const calibrated = page?.scale?.isCalibrated;
  const mmPerPx = page?.scale?.mmPerPx ?? 1;

  return (
    <div style={wrap} role="status" aria-live="polite">
      <Field>
        <Crosshair size={12} strokeWidth={2.25} />
        <span style={mono}>
          {cursorMm
            ? `${formatLength(cursorMm.x, displayUnit)} · ${formatLength(cursorMm.y, displayUnit)}`
            : '—'}
        </span>
      </Field>

      <Divider />

      <Field>
        <span style={muted}>Page</span>
        <button type="button" style={pill} onClick={() => onSetPage(Math.max(1, pageNumber - 1))} aria-label="Previous page">‹</button>
        <span style={mono}>{pageNumber} / {totalPages}</span>
        <button type="button" style={pill} onClick={() => onSetPage(Math.min(totalPages, pageNumber + 1))} aria-label="Next page">›</button>
      </Field>

      <Divider />

      <Field>
        <span style={muted}>Units</span>
        <select style={select} value={displayUnit} onChange={(e) => onDisplayUnitChange(e.target.value)} aria-label="Display units">
          <option value="mm">mm</option>
          <option value="cm">cm</option>
          <option value="m">m</option>
          <option value="ft">ft</option>
          <option value="in">in</option>
        </select>
      </Field>

      <Divider />

      <Field>
        <Maximize2 size={12} strokeWidth={2.25} />
        <select style={select} value={String(zoom)} onChange={(e) => onZoomChange(Number(e.target.value))} aria-label="Zoom level">
          <option value="0.5">50%</option>
          <option value="0.75">75%</option>
          <option value="1">100%</option>
          <option value="1.25">125%</option>
          <option value="1.5">150%</option>
          <option value="2">200%</option>
        </select>
      </Field>

      <Divider />

      <Field>
        <span style={calibrated ? pillOK : pillWarn} title={calibrated ? `${mmPerPx.toFixed(4)} mm/px` : 'Click Calibrate in the toolbar'}>
          {calibrated ? 'Calibrated' : 'Not calibrated'}
        </span>
      </Field>

      <div style={{ flex: 1 }} />

      <Field>
        {activeTool && <span style={pillAccent}>tool: {activeTool}</span>}
        {selectionCount > 0 && <span style={pillFilled}>{selectionCount} selected</span>}
      </Field>
    </div>
  );
}

function Field({ children }) {
  return <span style={field}>{children}</span>;
}
function Divider() {
  return <span style={divider} aria-hidden />;
}

const wrap = {
  position: 'sticky', bottom: 0, zIndex: 4,
  display: 'flex', alignItems: 'center', gap: 6,
  padding: '6px 12px',
  background: 'var(--geist-bg)',
  borderTop: '1px solid var(--geist-border)',
  fontSize: 'var(--geist-text-xs, 11px)',
  color: 'var(--geist-fg-2)',
};
const field = { display: 'inline-flex', alignItems: 'center', gap: 4 };
const muted = { color: 'var(--geist-fg-4)' };
const divider = { width: 1, height: 14, background: 'var(--geist-border)' };
const mono = { fontFamily: 'var(--geist-font-mono, ui-monospace)', color: 'var(--geist-fg)' };
const pill = { padding: '0 4px', background: 'var(--geist-bg-1)', border: '1px solid var(--geist-border)', borderRadius: 4, cursor: 'pointer', color: 'var(--geist-fg-2)', fontSize: 11, height: 18, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' };
const pillOK = { padding: '1px 8px', borderRadius: 999, background: 'var(--geist-success-soft)', color: 'var(--geist-success)', fontWeight: 600, fontSize: 10 };
const pillWarn = { padding: '1px 8px', borderRadius: 999, background: 'var(--geist-warning-soft)', color: 'var(--geist-warning)', fontWeight: 600, fontSize: 10 };
const pillAccent = { padding: '1px 8px', borderRadius: 999, background: 'var(--geist-accent-soft)', color: 'var(--geist-accent)', fontWeight: 600, fontSize: 10 };
const pillFilled = { padding: '1px 8px', borderRadius: 999, background: 'var(--geist-fg)', color: 'var(--geist-bg)', fontWeight: 600, fontSize: 10, marginLeft: 4 };
const select = { padding: '1px 4px', fontSize: 11, height: 20, border: '1px solid var(--geist-border)', borderRadius: 4, color: 'var(--geist-fg)', background: 'var(--geist-bg)' };
