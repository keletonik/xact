import { useMemo } from 'react';
import { Link2, Tag, MessageSquare } from 'lucide-react';
import { formatLength, formatArea, formatAngle } from '../../markup/geometry';
import { getSymbol } from '../../markup/symbolLibrary';
import useCatalogStore from '../../stores/useCatalogStore';

const STATUSES = [
  { value: 'none',     label: '—',            colour: 'var(--geist-fg-4)' },
  { value: 'review',   label: 'Needs review', colour: 'var(--geist-warning)' },
  { value: 'approved', label: 'Approved',     colour: 'var(--geist-success)' },
  { value: 'rejected', label: 'Rejected',     colour: 'var(--geist-error)' },
];

/**
 * Right-rail panel: edits the metadata of every currently-selected markup.
 * When multiple objects are selected, only fields that all of them have are
 * editable; fields that diverge show an `—` placeholder.
 */
export default function PropertiesPanel({
  selectedObjects,
  page,
  onUpdate,
}) {
  const products = useCatalogStore((s) => s.products);

  const single = selectedObjects.length === 1 ? selectedObjects[0] : null;
  const allSameType = useMemo(() => {
    if (selectedObjects.length === 0) return null;
    const t = selectedObjects[0].type;
    return selectedObjects.every((o) => o.type === t) ? t : null;
  }, [selectedObjects]);

  if (selectedObjects.length === 0) {
    return (
      <div style={wrap}>
        <Header label="Properties" />
        <div style={emptyMsg}>
          Select a markup to edit its properties — subject, status, layer, product link, comment.
        </div>
      </div>
    );
  }

  const summary = describeMeasurement(single, page);
  const subj  = unanimous(selectedObjects.map((o) => o.metadata?.subject ?? ''));
  const note  = unanimous(selectedObjects.map((o) => o.metadata?.note ?? ''));
  const status = unanimous(selectedObjects.map((o) => o.metadata?.status ?? 'none')) ?? 'none';
  const productId = unanimous(selectedObjects.map((o) => o.metadata?.productId ?? ''));
  const qty   = unanimous(selectedObjects.map((o) => o.metadata?.quantity ?? 1));
  const url   = unanimous(selectedObjects.map((o) => o.metadata?.url ?? ''));

  const update = (patch) => {
    for (const o of selectedObjects) onUpdate(o.id, { metadata: patch });
  };

  return (
    <div style={wrap}>
      <Header label="Properties" right={`${selectedObjects.length} selected`} />

      <div style={kvRow}>
        <span style={kvKey}>Type</span>
        <span style={kvVal}>{allSameType || 'mixed'}</span>
      </div>

      {summary && (
        <div style={kvRow}>
          <span style={kvKey}>Measurement</span>
          <span style={{ ...kvVal, fontFamily: 'var(--geist-font-mono, ui-monospace)' }}>{summary}</span>
        </div>
      )}

      <Field label="Subject">
        <input style={input} value={subj ?? ''} placeholder="—" onChange={(e) => update({ subject: e.target.value })} />
      </Field>

      <Field label="Status">
        <div style={statusRow}>
          {STATUSES.map((s) => {
            const active = status === s.value;
            return (
              <button
                key={s.value}
                type="button"
                onClick={() => update({ status: s.value })}
                aria-pressed={active}
                style={{ ...statusChip, background: active ? s.colour : 'var(--geist-bg)', color: active ? '#fff' : s.colour, borderColor: active ? s.colour : 'var(--geist-border-strong)' }}
              >
                {s.label}
              </button>
            );
          })}
        </div>
      </Field>

      <Field label="Layer">
        <select
          style={input}
          value={unanimous(selectedObjects.map((o) => o.layerId)) ?? ''}
          onChange={(e) => {
            for (const o of selectedObjects) onUpdate(o.id, { layerId: e.target.value });
          }}
        >
          {(page?.layers || []).map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
        </select>
      </Field>

      <Field label="Quantity multiplier">
        <input style={input} type="number" min="0" step="0.5" value={qty ?? 1} onChange={(e) => update({ quantity: Number(e.target.value) })} />
      </Field>

      <Field label={<><Link2 size={11} strokeWidth={2.5} style={{ verticalAlign: 'middle' }} /> Link to product</>}>
        <select style={input} value={productId ?? ''} onChange={(e) => update({ productId: e.target.value || null })}>
          <option value="">— none —</option>
          {products.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.sku || p.id.slice(0, 6)})</option>)}
        </select>
      </Field>

      {single?.type === 'hyperlink' && (
        <Field label="URL">
          <input style={input} type="url" placeholder="https://…" value={url ?? ''} onChange={(e) => update({ url: e.target.value })} />
        </Field>
      )}

      {single?.metadata?.symbolId && (
        <div style={kvRow}>
          <span style={kvKey}><Tag size={11} strokeWidth={2.5} style={{ verticalAlign: 'middle' }} /> Symbol</span>
          <span style={kvVal}>{getSymbol(single.metadata.symbolId)?.name || single.metadata.symbolId}</span>
        </div>
      )}

      <Field label={<><MessageSquare size={11} strokeWidth={2.5} style={{ verticalAlign: 'middle' }} /> Note</>}>
        <textarea style={{ ...input, minHeight: 60, resize: 'vertical' }} value={note ?? ''} placeholder="—" onChange={(e) => update({ note: e.target.value })} />
      </Field>
    </div>
  );
}

function describeMeasurement(obj, page) {
  if (!obj || !page) return null;
  const unit = page.displayUnit || 'm';
  const m = obj.metadata?.measuredValueMm ?? 0;
  switch (obj.type) {
    case 'length':
    case 'perimeter':
    case 'line':
    case 'arrow':
    case 'diameter':
      return formatLength(m, unit);
    case 'area':
    case 'rectangle':
      return formatArea(m, unit);
    case 'angle':
      return formatAngle(obj.metadata?.angleDeg);
    default:
      return null;
  }
}

function unanimous(values) {
  if (values.length === 0) return undefined;
  const first = values[0];
  return values.every((v) => v === first) ? first : undefined;
}

function Header({ label, right }) {
  return (
    <div style={headerRow}>
      <strong style={{ fontSize: 13, color: 'var(--geist-fg)' }}>{label}</strong>
      {right && <span style={{ fontSize: 11, color: 'var(--geist-fg-4)' }}>{right}</span>}
    </div>
  );
}
function Field({ label, children }) {
  return (
    <label style={fieldWrap}>
      <span style={fieldLabel}>{label}</span>
      {children}
    </label>
  );
}

const wrap = { padding: 10, background: 'var(--geist-bg)', border: '1px solid var(--geist-border)', borderRadius: 8, display: 'flex', flexDirection: 'column', gap: 8, minWidth: 240 };
const headerRow = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 };
const emptyMsg = { fontSize: 12, color: 'var(--geist-fg-4)', padding: '8px 2px' };
const kvRow = { display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8, fontSize: 12 };
const kvKey = { color: 'var(--geist-fg-3)' };
const kvVal = { color: 'var(--geist-fg)' };
const fieldWrap = { display: 'flex', flexDirection: 'column', gap: 4 };
const fieldLabel = { fontSize: 11, color: 'var(--geist-fg-3)' };
const input = { padding: '5px 8px', border: '1px solid var(--geist-border-strong)', borderRadius: 4, fontSize: 12, color: 'var(--geist-fg)', background: 'var(--geist-bg)', width: '100%', boxSizing: 'border-box' };
const statusRow = { display: 'flex', flexWrap: 'wrap', gap: 4 };
const statusChip = { fontSize: 10.5, padding: '3px 8px', border: '1px solid var(--geist-border-strong)', borderRadius: 999, cursor: 'pointer' };
