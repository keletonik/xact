import { useMemo, useState } from 'react';
import { Plus, Trash2, ArrowLeft, ShoppingBag, Boxes } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';
import EmptyState from '../common/EmptyState';
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

const STATUS_COLOUR = {
  draft:      { bg: 'var(--geist-bg-2)',                    fg: 'var(--geist-fg-2)' },
  sent:       { bg: 'var(--geist-info-soft, #eff6ff)',      fg: 'var(--geist-info, #1d4ed8)' },
  accepted:   { bg: 'var(--geist-success-soft, #f0fdf4)',   fg: 'var(--geist-success, #15803d)' },
  declined:   { bg: 'var(--geist-error-soft, #fef2f2)',     fg: 'var(--geist-error, #b91c1c)' },
  superseded: { bg: 'var(--geist-bg-2)',                    fg: 'var(--geist-fg-4)' },
};

/**
 * Quote line-item editor. Each line carries an asset-template
 * (assetType, substrate, FRL, services) so that on Convert each line
 * materialises N planned assets with that shape.
 *
 * Money flows in dollars at the UI and converts to integer cents at
 * the store boundary so totals never drift on rounding.
 */
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
  const statusColour = STATUS_COLOUR[quote.status] || STATUS_COLOUR.draft;
  const alreadyConverted = lines.length > 0 && lines.every((l) => (l.convertedToAssetIds?.length || 0) > 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Button variant="ghost" size="sm" onClick={onBack}>
        <ArrowLeft size={12} /> Back to quotes
      </Button>

      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <strong>Quote v{quote.version}</strong>
            <div style={{ fontSize: 12, color: 'var(--geist-fg-4)', marginTop: 2 }}>
              {lines.length} line{lines.length === 1 ? '' : 's'} · {formatMoney(total)} inc GST
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              padding: '2px 10px', fontSize: 11, fontWeight: 600, borderRadius: 999,
              background: statusColour.bg, color: statusColour.fg,
            }}>
              {STATUS_LABELS[quote.status]}
            </span>
            {allowedTransitions.map((next) => (
              <Button key={next} size="sm" variant="ghost" onClick={() => onSetStatus(next)}>
                Mark {STATUS_LABELS[next].toLowerCase()}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {quote.status === 'accepted' && !alreadyConverted && lines.length > 0 && (
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong>Convert quote → planned assets</strong>
              <div style={{ fontSize: 12, color: 'var(--geist-fg-4)', marginTop: 2 }}>
                Each line item generates {lines.reduce((acc, l) => acc + l.qty, 0)} planned assets total, ready for install + photo capture.
              </div>
            </div>
            <Button onClick={onConvert}>
              <Boxes size={14} /> Convert to assets
            </Button>
          </div>
        </Card>
      )}

      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <strong>Line items</strong>
          {quote.status === 'draft' && (
            <Button size="sm" onClick={() => setAdding(true)}>
              <Plus size={12} /> Add line
            </Button>
          )}
        </div>
        {lines.length === 0 ? (
          <EmptyState
            icon={ShoppingBag}
            title="No lines yet"
            description="Add line items that map to an asset shape (penetration / door / damper) so the quote can convert into planned assets when won."
          />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ textAlign: 'left', color: 'var(--geist-fg-4)' }}>
                  <th style={th}>Item</th>
                  <th style={th}>Shape</th>
                  <th style={th}>FRL</th>
                  <th style={th}>Qty</th>
                  <th style={th}>Unit rate</th>
                  <th style={th}>Materials</th>
                  <th style={th}>Line total</th>
                  <th style={th} aria-label="Actions" />
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
                <tr style={{ borderTop: '2px solid var(--geist-border-strong)' }}>
                  <td style={{ ...td, fontWeight: 600 }} colSpan={6}>Subtotal</td>
                  <td style={{ ...td, fontWeight: 600 }}>{formatMoney(sub)}</td>
                  <td style={td} />
                </tr>
                <tr>
                  <td style={td} colSpan={6}>GST ({Math.round(TAX_RATE * 100)}%)</td>
                  <td style={td}>{formatMoney(gst)}</td>
                  <td style={td} />
                </tr>
                <tr style={{ borderTop: '1px solid var(--geist-border)' }}>
                  <td style={{ ...td, fontWeight: 700 }} colSpan={6}>Total inc GST</td>
                  <td style={{ ...td, fontWeight: 700 }}>{formatMoney(total)}</td>
                  <td style={td} />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </Card>

      {adding && (
        <AddLineForm
          onCancel={() => setAdding(false)}
          onAdd={(input) => {
            onAddLine(input);
            setAdding(false);
          }}
        />
      )}
    </div>
  );
}

function LineRow({ line, editable, onUpdate, onRemove }) {
  return (
    <tr style={{ borderTop: '1px solid var(--geist-border)' }}>
      <td style={td}>
        {editable ? (
          <input style={inputStyle} value={line.description} onChange={(e) => onUpdate({ description: e.target.value })} />
        ) : line.description}
        {line.convertedToAssetIds?.length > 0 && (
          <div style={{ fontSize: 11, color: 'var(--geist-success, #15803d)', marginTop: 2 }}>
            {line.convertedToAssetIds.length} assets created
          </div>
        )}
      </td>
      <td style={td}>
        {ASSET_TYPE_LABELS[line.assetType]}
        {line.substrate && <div style={{ fontSize: 11, color: 'var(--geist-fg-4)' }}>{SUBSTRATE_LABELS[line.substrate]}</div>}
        {line.services?.length > 0 && (
          <div style={{ fontSize: 11, color: 'var(--geist-fg-4)' }}>
            {line.services.map((s) => SERVICE_TYPE_LABELS[s]).join(', ')}
          </div>
        )}
      </td>
      <td style={td}><code>{line.requiredFrl || '—'}</code></td>
      <td style={td}>
        {editable ? (
          <input
            style={{ ...inputStyle, width: 60 }}
            type="number" min="1" value={line.qty}
            onChange={(e) => onUpdate({ qty: e.target.value })}
          />
        ) : line.qty}
      </td>
      <td style={td}>
        {editable ? (
          <input
            style={{ ...inputStyle, width: 90 }}
            value={(line.unitRateCents / 100).toFixed(2)}
            onChange={(e) => onUpdate({ unitRateCents: Math.round(Number(e.target.value) * 100) })}
          />
        ) : formatMoney(line.unitRateCents)}
      </td>
      <td style={td}>
        {editable ? (
          <input
            style={{ ...inputStyle, width: 90 }}
            value={(line.materialsCents / 100).toFixed(2)}
            onChange={(e) => onUpdate({ materialsCents: Math.round(Number(e.target.value) * 100) })}
          />
        ) : formatMoney(line.materialsCents)}
      </td>
      <td style={{ ...td, fontWeight: 600 }}>{formatMoney(line.totalCents)}</td>
      <td style={{ ...td, whiteSpace: 'nowrap' }}>
        {editable && (
          <button type="button" onClick={onRemove} style={iconBtn} aria-label="Remove line">
            <Trash2 size={14} />
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
    <Card>
      <strong style={{ display: 'block', marginBottom: 10 }}>New line item</strong>
      <form onSubmit={submit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <FormField label="Description" required>
          <input style={inputStyle} value={form.description} onChange={(e) => update({ description: e.target.value })} autoFocus />
        </FormField>
        <FormField label="Asset shape" required>
          <select style={inputStyle} value={form.assetType} onChange={(e) => update({ assetType: e.target.value })}>
            {Object.values(ASSET_TYPES).map((t) => (
              <option key={t} value={t}>{ASSET_TYPE_LABELS[t]}</option>
            ))}
          </select>
        </FormField>
        <FormField label="Substrate">
          <select style={inputStyle} value={form.substrate} onChange={(e) => update({ substrate: e.target.value })}>
            <option value="">—</option>
            {Object.values(SUBSTRATES).map((s) => (
              <option key={s} value={s}>{SUBSTRATE_LABELS[s]}</option>
            ))}
          </select>
        </FormField>
        <FormField label="Required FRL">
          <input style={inputStyle} value={form.requiredFrl} onChange={(e) => update({ requiredFrl: e.target.value })} />
        </FormField>
        {form.assetType === ASSET_TYPES.PENETRATION && (
          <FormField label="Services (for matrix later)">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {Object.values(SERVICE_TYPES).map((s) => {
                const active = form.services.includes(s);
                return (
                  <button
                    type="button"
                    key={s}
                    onClick={() => toggleService(s)}
                    style={{
                      fontSize: 11,
                      padding: '3px 8px',
                      borderRadius: 999,
                      border: '1px solid ' + (active ? 'var(--geist-fg)' : 'var(--geist-border-strong)'),
                      background: active ? 'var(--geist-fg)' : 'var(--geist-bg)',
                      color: active ? 'var(--geist-bg)' : 'var(--geist-fg-2)',
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
          <input style={inputStyle} type="number" min="1" value={form.qty} onChange={(e) => update({ qty: e.target.value })} />
        </FormField>
        <FormField label="Unit rate (AUD)">
          <input style={inputStyle} value={form.unitRate} onChange={(e) => update({ unitRate: e.target.value })} inputMode="decimal" />
        </FormField>
        <FormField label="Materials (AUD)">
          <input style={inputStyle} value={form.materials} onChange={(e) => update({ materials: e.target.value })} inputMode="decimal" />
        </FormField>
        <FormField label="Labour hours">
          <input style={inputStyle} type="number" min="0" step="0.25" value={form.labourHours} onChange={(e) => update({ labourHours: e.target.value })} />
        </FormField>
        <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <Button variant="ghost" type="button" onClick={onCancel}>Cancel</Button>
          <Button type="submit">Add line</Button>
        </div>
      </form>
    </Card>
  );
}

function formatMoney(cents) {
  const dollars = (cents || 0) / 100;
  return new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(dollars);
}

const inputStyle = {
  padding: '6px 8px',
  border: '1px solid var(--geist-border-strong)',
  borderRadius: 4,
  background: 'var(--geist-bg)',
  color: 'var(--geist-fg)',
  fontSize: 13,
  width: '100%',
  boxSizing: 'border-box',
};
const iconBtn = {
  background: 'transparent',
  border: '1px solid var(--geist-border)',
  borderRadius: 4,
  padding: 6,
  cursor: 'pointer',
  color: 'var(--geist-fg-3)',
};
const th = { padding: '6px 10px', fontWeight: 500, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.4 };
const td = { padding: '8px 10px', verticalAlign: 'middle' };
