import { useState } from 'react';
import { Crosshair, Ruler } from 'lucide-react';
import { applyDrawingScale } from '../../markup/scale';

const PRESETS = [
  { label: '1:50',   ratio: 50 },
  { label: '1:100',  ratio: 100 },
  { label: '1:200',  ratio: 200 },
  { label: '1:500',  ratio: 500 },
  { label: '1:1000', ratio: 1000 },
];

/**
 * Quick calibration controls: drawing-scale preset dropdown (1:N) or the
 * existing two-point calibration. Either path ends with the store's
 * `calibrate` action being invoked at the page level.
 */
export default function DrawingScalePicker({
  page, dpi = 96, onApplyScale, onStartCalibration, calibrationMode,
}) {
  const [custom, setCustom] = useState('');

  const apply = (ratio) => {
    const next = applyDrawingScale(page, ratio, dpi);
    onApplyScale(next.scale.mmPerPx);
  };

  return (
    <div style={wrap}>
      <div style={head}>
        <Ruler size={14} strokeWidth={2.25} />
        <strong style={{ fontSize: 13, color: 'var(--geist-fg)' }}>Scale</strong>
      </div>
      <div style={presetsRow}>
        {PRESETS.map((p) => (
          <button key={p.label} type="button" style={chip} onClick={() => apply(p.ratio)}>{p.label}</button>
        ))}
      </div>
      <div style={customRow}>
        <span style={muted}>1 :</span>
        <input
          style={input}
          type="number"
          min="1"
          step="1"
          placeholder="custom"
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          aria-label="Custom drawing-scale ratio"
        />
        <button
          type="button"
          style={chipPrimary}
          onClick={() => {
            const r = Number.parseInt(custom, 10);
            if (Number.isFinite(r) && r > 0) apply(r);
          }}
          disabled={!custom}
        >
          Apply
        </button>
      </div>
      <button
        type="button"
        style={{ ...calibBtn, ...(calibrationMode ? calibBtnActive : null) }}
        onClick={onStartCalibration}
        aria-pressed={calibrationMode}
      >
        <Crosshair size={12} strokeWidth={2.25} />
        {calibrationMode ? 'Click two endpoints…' : '2-point calibrate'}
      </button>
      <div style={muted}>
        {page.scale.isCalibrated
          ? <>Active: <span style={mono}>{page.scale.mmPerPx.toFixed(4)} mm/px</span></>
          : 'Not calibrated yet.'}
      </div>
    </div>
  );
}

const wrap = { padding: 10, background: 'var(--geist-bg)', border: '1px solid var(--geist-border)', borderRadius: 8 };
const head = { display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 };
const presetsRow = { display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 };
const customRow = { display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8 };
const chip = { padding: '3px 8px', border: '1px solid var(--geist-border-strong)', borderRadius: 6, background: 'var(--geist-bg)', cursor: 'pointer', fontSize: 11, color: 'var(--geist-fg)' };
const chipPrimary = { ...chip, background: 'var(--geist-fg)', color: 'var(--geist-bg)', borderColor: 'var(--geist-fg)' };
const input = { width: 70, padding: '3px 6px', fontSize: 11, border: '1px solid var(--geist-border-strong)', borderRadius: 4, color: 'var(--geist-fg)', background: 'var(--geist-bg)' };
const calibBtn = { display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', border: '1px solid var(--geist-border-strong)', background: 'var(--geist-bg)', color: 'var(--geist-fg)', cursor: 'pointer', borderRadius: 6, fontSize: 12, width: '100%', justifyContent: 'center' };
const calibBtnActive = { background: 'var(--geist-accent)', color: 'var(--geist-accent-fg)', borderColor: 'var(--geist-accent)' };
const muted = { color: 'var(--geist-fg-4)', fontSize: 11, marginTop: 6 };
const mono = { fontFamily: 'var(--geist-font-mono, ui-monospace)', color: 'var(--geist-fg-2)' };
