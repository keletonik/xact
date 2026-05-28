import { useState } from 'react';
import { Plus, Trash2, ArrowLeft, Boxes } from 'lucide-react';
import PaperCard from '../draft/PaperCard';
import CalloutBalloon from '../draft/CalloutBalloon';
import InkStamp from '../draft/InkStamp';
import HatchPanel from '../draft/HatchPanel';
import FormField from '../common/FormField';
import {
  ASSET_TYPES, ASSET_TYPE_LABELS,
  SUBSTRATES, SUBSTRATE_LABELS,
  SERVICE_TYPES, SERVICE_TYPE_LABELS,
  TAX_RATE,
} from '../../utils/constants';

const STATUS_TRANSITIONS = {
  draft:      ['sent'],
  sent:       ['accepted', 'declined', 'draft'],
  accepted:   ['superseded'],
  declined:   ['draft'],
  superseded: [],
};

const STATUS_LABELS = {
  draft: 'Draft', sent: 'Sent', accepted: 'Accepted',
  declined: 'Declined', superseded: 'Superseded',
};

function statusTone(s) {
  switch (s) {
    case 'draft':      return 'draft';
    case 'sent':       return 'installed';
    case 'accepted':   return 'certified';
    case 'declined':   return 'nonconformance';
    case 'superseded': return 'planned';
    default:           return 'draft';
  }
}

function formatMoney(cents) {
  const dollars = (cents || 0) / 100;
  return new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(dollars);
}

export default function QuoteEditor({
  quote, lines, onBack,
  onAddLine, onUpdateLine, onRemoveLine,
  onSetStatus, onConvert,
}) {
  const [adding, setAdding] = useState(false);
  const sub = lines.reduce((acc, l) => acc + (l.totalCents || 0), 0);
  const gst = Math.round(sub * TAX_RATE);
  const total = sub + gst;

  const allowedTransitions = STATUS_TRANSITIONS[quote.status] || [];
  const alreadyConverted = lines.length > 0 && lines.every((l) => (l.convertedToAssetIds?.length || 0) > 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <button type="button" onClick={onBack} style={crumbBtn}>
        <ArrowLeft size={11} /> back to quotes
      </button>

      <PaperCard
        title={`quote v${quote.version}`}
        meta={
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <InkStamp tone={statusTone(quote.status)} size="sm" rotate={-3}>{quote.status}</InkStamp>
            {lines.length} line{lines.length === 1 ? '' : 's'} · {formatMoney(total)} inc gst
          </span>
        }
      >
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {allowedTransitions.length === 0 && (
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-4)', letterSpacing: 'var(--tracking-label)', textTransform: 'uppercase' }}>
              no further transitions
            </span>
          )}
          {allowedTransitions.map((next) => (
            <button key={next} type="button" onClick={() => onSetStatus(next)} style={ghostBtn}>
              mark {STATUS_LABELS[next].toLowerCase()}
            </button>
          ))}
        </div>
      </PaperCard>

      {quote.status === 'accepted' && !alreadyConverted && lines.length > 0 && (
        <HatchPanel tone="info" title="convert quote to planned assets" icon={Boxes}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 14 }}>
            <span>
              Each line item materialises {lines.reduce((acc, l) => acc + l.qty, 0)} planned assets total, ready to walk through install + photo capture.
            </span>
            <button type="button" onClick={onConvert} style={inkBtn}>
              <Boxes size={12} /> convert
            </button>
          </div>
        </HatchPanel>
      )}

      <PaperCard title="line items" meta={quote.status === 'draft' ? 'editable' : 'locked'} noPad>
        {lines.length === 0 ? (
          <div style={emptyDraft}>no lines on this quote. add asset-shaped items.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr>
                  {['Item', 'Shape', 'FRL', 'Qty', 'Unit rate', 'Materials', 'Line total', ''].map((h, i) => (
                    <th key={i} style={th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {lines.map((l) => (
                  <LineRow
                    key={l.id}
                    line={l}
                    editable={quote.status === 'draft'}
                    onUpdate={(patch) => onUpdateLine(l.id, patch)}
                    onRemove={() => onRemoveLine(l.id)}
                  />
                ))}
              </tbody>
              <tfoot>
                <tr style={{ borderTop: '1.5px solid var(--rule-ink)' }}>
                  <td style={{ ...tdMono, fontWeight: 600, color: 'var(--ink-2)' }} colSpan={6}>SUBTOTAL</td>
                  <td style={{ ...tdMono, fontWeight: 600, color: 'var(--ink)' }}>{formatMoney(sub)}</td>
                  <td style={tdMono} />
                </tr>
                <tr>
                  <td style={tdMono} colSpan={6}>GST ({Math.round(TAX_RATE * 100)}%)</td>
                  <td style={tdMono}>{formatMoney(gst)}</td>
                  <td style={tdMono} />
                </tr>
                <tr style={{ borderTop: '1px solid var(--rule)' }}>
                  <td style={{ ...tdMono, fontWeight: 700, color: 'var(--ink)', textTransform: 'uppercase' }} colSpan={6}>TOTAL INC GST</td>
                  <td style={{ ...tdMono, fontWeight: 700, color: 'var(--ink)' }}>{formatMoney(total)}</td>
                  <td style={tdMono} />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
        {quote.status === 'draft' && (
          <div style={{ padding: 14, borderTop: '1px solid var(--rule)' }}>
            <button type="button" onClick={() => setAdding(true)} style={inkBtn}>
              <Plus size={11} /> add line
            </button>
          </div>
        )}
      </PaperCard>

      {adding && (
        <PaperCard title="new line item" meta="enter quantities + rates">
          <AddLineForm
            onCancel={() => setAdding(false)}
            onAdd={(input) => { onAddLine(input); setAdding(false); }}
          />
        </PaperCard>
      )}
    </div>
  );
}

function LineRow({ line, editable, onUpdate, onRemove }) {
  return (
    <tr className="xc-sched-row">
      <td style={td}>
        {editable ? (
          <input style={cellInput} value={line.description} onChange={(e) => onUpdate({ description: e.target.value })} />
        ) : line.description}
        {line.convertedToAssetIds?.length > 0 && (
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            color: 'var(--status-certified-ink)',
            marginTop: 4,
            letterSpacing: 'var(--tracking-label)',
            textTransform: 'uppercase',
          }}>
            ▸ {line.convertedToAssetIds.length} assets materialised
          </div>
        )}
      </td>
      <td style={tdMono}>
        {ASSET_TYPE_LABELS[line.assetType]}
        {line.substrate && <div style={{ fontSize: 10, color: 'var(--ink-4)' }}>{SUBSTRATE_LABELS[line.substrate]}</div>}
        {line.services?.length > 0 && (
          <div style={{ fontSize: 10, color: 'var(--ink-4)' }}>
            {line.services.map((s) => SERVICE_TYPE_LABELS[s]).join(', ')}
          </div>
        )}
      </td>
      <td style={tdMono}>{line.requiredFrl || '—'}</td>
      <td style={tdMono}>
        {editable ? (
          <input style={{ ...cellInput, width: 60 }} type="number" min="1" value={line.qty} onChange={(e) => onUpdate({ qty: e.target.value })} />
        ) : line.qty}
      </td>
      <td style={tdMono}>
        {editable ? (
          <input style={{ ...cellInput, width: 90 }} value={(line.unitRateCents / 100).toFixed(2)} onChange={(e) => onUpdate({ unitRateCents: Math.round(Number(e.target.value) * 100) })} />
        ) : `$${(line.unitRateCents / 100).toFixed(2)}`}
      </td>
      <td style={tdMono}>
        {editable ? (
          <input style={{ ...cellInput, width: 90 }} value={(line.materialsCents / 100).toFixed(2)} onChange={(e) => onUpdate({ materialsCents: Math.round(Number(e.target.value) * 100) })} />
        ) : `$${(line.materialsCents / 100).toFixed(2)}`}
      </td>
      <td style={{ ...tdMono, fontWeight: 600, color: 'var(--ink)' }}>
        {new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format((line.totalCents || 0) / 100)}
      </td>
      <td style={{ ...td, textAlign: 'right' }}>
        {editable && (
          <button type="button" onClick={onRemove} style={iconBtn} aria-label="Remove line">
            <Trash2 size={12} />
          </button>
        )}
      </td>
    </tr>
  );
}

function AddLineForm({ onCancel, onAdd }) {
  const [form, setForm] = useState({
    description: '',
    assetType: ASSET_TYPES.PENETRATION,
    substrate: '',
    requiredFrl: localStorage.getItem('xact-default-frl') || '-/120/120',
    services: [],
    qty: 1,
    unitRate: '0.00',
    materials: '0.00',
    labourHours: 0,
  });
  const update = (patch) => setForm((f) => ({ ...f, ...patch }));
  const toggleService = (v) => {
    update({
      services: form.services.includes(v)
        ? form.services.filter((s) => s !== v)
        : [...form.services, v],
    });
  };
  const submit = (e) => {
    e.preventDefault();
    if (!form.description.trim()) return;
    onAdd({
      description: form.description.trim(),
      assetType: form.assetType,
      substrate: form.substrate || null,
      requiredFrl: form.requiredFrl,
      services: form.services,
      qty: Number(form.qty) || 1,
      unitRateCents: Math.round(Number(form.unitRate) * 100),
      materialsCents: Math.round(Number(form.materials) * 100),
      labourHours: Number(form.labourHours) || 0,
    });
  };
  return (
    <form onSubmit={submit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
      <FormField label="Description" required>
        <input style={modalInput} value={form.description} onChange={(e) => update({ description: e.target.value })} autoFocus />
      </FormField>
      <FormField label="Asset shape" required>
        <select style={modalInput} value={form.assetType} onChange={(e) => update({ assetType: e.target.value })}>
          {Object.values(ASSET_TYPES).map((t) => (
            <option key={t} value={t}>{ASSET_TYPE_LABELS[t]}</option>
          ))}
        </select>
      </FormField>
      <FormField label="Substrate">
        <select style={modalInput} value={form.substrate} onChange={(e) => update({ substrate: e.target.value })}>
          <option value="">—</option>
          {Object.values(SUBSTRATES).map((s) => (
            <option key={s} value={s}>{SUBSTRATE_LABELS[s]}</option>
          ))}
        </select>
      </FormField>
      <FormField label="Required FRL">
        <input style={modalInput} value={form.requiredFrl} onChange={(e) => update({ requiredFrl: e.target.value })} />
      </FormField>
      {form.assetType === ASSET_TYPES.PENETRATION && (
        <FormField label="Services" help="for matrix later">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {Object.values(SERVICE_TYPES).map((s) => {
              const active = form.services.includes(s);
              return (
                <button
                  type="button"
                  key={s}
                  onClick={() => toggleService(s)}
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 10,
                    letterSpacing: 'var(--tracking-label)',
                    textTransform: 'uppercase',
                    padding: '4px 8px',
                    border: '1px solid ' + (active ? 'var(--ink)' : 'var(--rule-strong)'),
                    background: active ? 'var(--ink)' : 'var(--paper-1)',
                    color: active ? 'var(--paper-1)' : 'var(--ink-2)',
                    cursor: 'pointer',
                  }}
                >
                  {SERVICE_TYPE_LABELS[s]}
                </button>
              );
            })}
          </div>
        </FormField>
      )}
      <FormField label="Qty">
        <input style={modalInput} type="number" min="1" value={form.qty} onChange={(e) => update({ qty: e.target.value })} />
      </FormField>
      <FormField label="Unit rate (AUD)">
        <input style={modalInput} value={form.unitRate} onChange={(e) => update({ unitRate: e.target.value })} inputMode="decimal" />
      </FormField>
      <FormField label="Materials (AUD)">
        <input style={modalInput} value={form.materials} onChange={(e) => update({ materials: e.target.value })} inputMode="decimal" />
      </FormField>
      <FormField label="Labour hours">
        <input style={modalInput} type="number" min="0" step="0.25" value={form.labourHours} onChange={(e) => update({ labourHours: e.target.value })} />
      </FormField>
      <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
        <button type="button" onClick={onCancel} style={ghostBtn}>cancel</button>
        <button type="submit" style={inkBtn}>add line</button>
      </div>
    </form>
  );
}

const crumbBtn = {
  background: 'transparent',
  border: 'none',
  color: 'var(--ink-3)',
  fontFamily: 'var(--font-mono)',
  fontSize: 11,
  letterSpacing: 'var(--tracking-label)',
  textTransform: 'uppercase',
  padding: 0,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 5,
  textAlign: 'left',
};
const th = {
  textAlign: 'left',
  fontFamily: 'var(--font-mono)',
  fontSize: 10,
  letterSpacing: 'var(--tracking-label)',
  textTransform: 'uppercase',
  color: 'var(--ink-3)',
  fontWeight: 600,
  padding: '10px 14px',
  borderBottom: '1.5px solid var(--rule-ink)',
  background: 'var(--paper-2)',
};
const td = { padding: '10px 14px', borderBottom: '1px solid var(--rule)', verticalAlign: 'middle' };
const tdMono = { ...td, fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.04em', color: 'var(--ink-2)' };
const cellInput = {
  border: '1px solid var(--rule-strong)',
  background: 'var(--paper-1)',
  padding: '4px 6px',
  fontFamily: 'var(--font-mono)',
  fontSize: 12,
  color: 'var(--ink)',
};
const modalInput = {
  width: '100%',
  background: 'var(--paper-1)',
  border: '1px solid var(--rule-strong)',
  padding: '10px 12px',
  fontFamily: 'var(--font-sans)',
  fontSize: 14,
  color: 'var(--ink)',
};
const inkBtn = {
  background: 'var(--ink)',
  color: 'var(--paper-1)',
  border: '1px solid var(--ink)',
  padding: '7px 12px',
  fontFamily: 'var(--font-mono)',
  fontSize: 10,
  letterSpacing: 'var(--tracking-label)',
  textTransform: 'uppercase',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 5,
};
const ghostBtn = {
  background: 'transparent',
  color: 'var(--ink-2)',
  border: '1px solid var(--rule-strong)',
  padding: '7px 12px',
  fontFamily: 'var(--font-mono)',
  fontSize: 10,
  letterSpacing: 'var(--tracking-label)',
  textTransform: 'uppercase',
  cursor: 'pointer',
};
const iconBtn = {
  background: 'transparent',
  border: '1px solid var(--rule-strong)',
  padding: '5px 8px',
  cursor: 'pointer',
  color: 'var(--accent)',
  borderColor: 'var(--accent)',
};
const emptyDraft = {
  padding: '36px 20px',
  textAlign: 'center',
  fontFamily: 'var(--font-mono)',
  fontSize: 11,
  letterSpacing: 'var(--tracking-label)',
  textTransform: 'uppercase',
  color: 'var(--ink-4)',
};
