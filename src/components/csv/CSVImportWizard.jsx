import { useCallback, useMemo, useState } from 'react';
import { ArrowRight, CheckCircle2, Upload, XCircle } from 'lucide-react';
import { parseCSV } from '../../csv/parser';
import { TARGET_FIELDS, autoMapHeaders } from '../../csv/mappingPresets';
import {
  applyProductImport, applySupplierPriceImport,
  planProductImport, planSupplierPriceImport,
} from '../../csv/importPipeline';

/**
 * Six-step CSV import wizard.
 * Props:
 *   kind: 'PRODUCT' | 'SUPPLIER_PRICE'
 *   onDone: (batchId) => void
 *   onCancel: () => void
 */
export default function CSVImportWizard({ kind = 'PRODUCT', onDone, onCancel }) {
  const [step, setStep] = useState(1);
  const [parsed, setParsed] = useState(null);
  const [mapping, setMapping] = useState({});
  const [plan, setPlan] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const targets = TARGET_FIELDS[kind];

  const handleFile = useCallback(async (csvFile) => {
    setBusy(true); setError(null);
    try {
      const result = await parseCSV(csvFile);
      setParsed(result);
      setMapping(autoMapHeaders(result.headers, kind));
      setStep(2);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }, [kind]);

  const previewRows = useMemo(() => (parsed?.rows || []).slice(0, 6), [parsed]);

  const buildPlan = useCallback(async () => {
    setBusy(true); setError(null);
    try {
      const planFn = kind === 'PRODUCT' ? planProductImport : planSupplierPriceImport;
      const p = await planFn(parsed.rows, mapping);
      setPlan(p);
      setStep(4);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }, [kind, mapping, parsed]);

  const apply = useCallback(async () => {
    setBusy(true); setError(null);
    try {
      const fn = kind === 'PRODUCT' ? applyProductImport : applySupplierPriceImport;
      const id = await fn(plan);
      setStep(5);
      onDone?.(id);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }, [kind, onDone, plan]);

  return (
    <div style={wrap} role="dialog" aria-modal="true" aria-labelledby="csv-wizard-title">
      <header style={head}>
        <h2 id="csv-wizard-title" style={{ margin: 0, fontSize: 18 }}>
          Import {kind === 'PRODUCT' ? 'products' : 'supplier prices'} from CSV
        </h2>
        <button type="button" onClick={onCancel} style={closeBtn} aria-label="Close">×</button>
      </header>
      <Stepper step={step} />
      {error && <div style={errorBox}>{error}</div>}
      <div style={body}>
        {step === 1 && (
          <DropZone busy={busy} onFile={handleFile} />
        )}
        {step === 2 && parsed && (
          <Mapping
            targets={targets}
            headers={parsed.headers}
            mapping={mapping}
            setMapping={setMapping}
            previewRows={previewRows}
            onNext={() => setStep(3)}
            onBack={() => { setParsed(null); setStep(1); }}
          />
        )}
        {step === 3 && parsed && (
          <ReviewMapping
            mapping={mapping}
            targets={targets}
            previewRows={previewRows}
            onBack={() => setStep(2)}
            onBuildPlan={buildPlan}
            busy={busy}
          />
        )}
        {step === 4 && plan && (
          <PlanReview kind={kind} plan={plan} onBack={() => setStep(3)} onApply={apply} busy={busy} />
        )}
        {step === 5 && (
          <Done kind={kind} plan={plan} onClose={onCancel} />
        )}
      </div>
    </div>
  );
}

function Stepper({ step }) {
  const steps = ['File', 'Map', 'Review', 'Plan', 'Done'];
  return (
    <ol style={stepperWrap} aria-label="Wizard steps">
      {steps.map((label, i) => {
        const n = i + 1;
        const active = n === step;
        const done = n < step;
        return (
          <li key={label} style={{ ...stepItem, ...(active ? stepActive : done ? stepDone : null) }}>
            <span style={stepNum}>{done ? <CheckCircle2 size={14} /> : n}</span>
            <span>{label}</span>
          </li>
        );
      })}
    </ol>
  );
}

function DropZone({ busy, onFile }) {
  const [dragOver, setDragOver] = useState(false);
  return (
    <label
      style={{ ...dropZone, ...(dragOver ? dropZoneHover : null) }}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files?.[0]; if (f) onFile(f); }}
    >
      <Upload size={28} />
      <p>Drop a CSV file here, or click to choose.</p>
      <p style={{ fontSize: 12, color: '#64748b' }}>{busy ? 'Parsing…' : 'Up to ~50k rows in-browser.'}</p>
      <input type="file" accept=".csv,text/csv" onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); }} style={{ display: 'none' }} />
    </label>
  );
}

function Mapping({ targets, headers, mapping, setMapping, previewRows, onNext, onBack }) {
  const missingRequired = targets.filter((t) => t.required && !mapping[t.key]);
  return (
    <div>
      <p style={hint}>Match each target field to a column in your CSV. Required fields are marked with *.</p>
      <table style={mapTable}>
        <thead>
          <tr><th style={th}>Target field</th><th style={th}>CSV column</th><th style={th}>Preview</th></tr>
        </thead>
        <tbody>
          {targets.map((t) => {
            const header = mapping[t.key] || '';
            const sample = header && previewRows[0] ? previewRows[0][header] : '';
            return (
              <tr key={t.key}>
                <td style={td}>{t.label}{t.required && <span style={{ color: '#dc2626' }}> *</span>}</td>
                <td style={td}>
                  <select value={header} onChange={(e) => setMapping({ ...mapping, [t.key]: e.target.value })} style={selectStyle}>
                    <option value="">— ignore —</option>
                    {headers.map((h) => <option key={h} value={h}>{h}</option>)}
                  </select>
                </td>
                <td style={{ ...td, color: '#64748b', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 12 }}>
                  {sample || ''}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div style={actions}>
        <button type="button" onClick={onBack} style={secondary}>Back</button>
        <button type="button" onClick={onNext} disabled={missingRequired.length > 0} style={primary}>
          Next <ArrowRight size={14} />
        </button>
      </div>
      {missingRequired.length > 0 && (
        <p style={{ fontSize: 12, color: '#dc2626' }}>Missing required: {missingRequired.map((t) => t.label).join(', ')}</p>
      )}
    </div>
  );
}

function ReviewMapping({ mapping, targets, previewRows, onBack, onBuildPlan, busy }) {
  const columns = targets.filter((t) => mapping[t.key]);
  return (
    <div>
      <p style={hint}>Quick preview of the first 6 rows with your mapping applied.</p>
      <div style={{ overflowX: 'auto' }}>
        <table style={mapTable}>
          <thead>
            <tr>{columns.map((c) => <th key={c.key} style={th}>{c.label}</th>)}</tr>
          </thead>
          <tbody>
            {previewRows.map((row, idx) => (
              <tr key={idx}>{columns.map((c) => <td key={c.key} style={td}>{row[mapping[c.key]] || ''}</td>)}</tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={actions}>
        <button type="button" onClick={onBack} style={secondary}>Back</button>
        <button type="button" onClick={onBuildPlan} disabled={busy} style={primary}>{busy ? 'Building…' : 'Build plan'}</button>
      </div>
    </div>
  );
}

function PlanReview({ kind, plan, onBack, onApply, busy }) {
  return (
    <div>
      <h3 style={{ margin: '0 0 8px', fontSize: 14 }}>Dry-run plan</h3>
      <ul style={{ margin: 0, paddingLeft: 16, lineHeight: 1.7 }}>
        <li>Rows scanned: <strong>{plan.summary.rows}</strong></li>
        {kind === 'PRODUCT' && (
          <>
            <li>New products: <strong>{plan.summary.creates}</strong></li>
            <li>Updated products: <strong>{plan.summary.updates}</strong></li>
          </>
        )}
        {kind === 'SUPPLIER_PRICE' && (
          <>
            <li>New suppliers: <strong>{plan.summary.suppliers}</strong></li>
            <li>New price rows: <strong>{plan.summary.prices}</strong></li>
          </>
        )}
        <li style={{ color: plan.summary.errors ? '#dc2626' : 'inherit' }}>
          Errors: <strong>{plan.summary.errors}</strong>
        </li>
      </ul>
      {plan.errors.length > 0 && (
        <details style={{ marginTop: 8 }}>
          <summary>{plan.errors.length} validation errors</summary>
          <ul style={{ maxHeight: 200, overflow: 'auto', margin: 0, paddingLeft: 16 }}>
            {plan.errors.slice(0, 100).map((e, i) => (
              <li key={i} style={{ fontSize: 12, color: '#dc2626' }}><XCircle size={12} style={{ verticalAlign: 'middle' }} /> Row {e.row}: {e.reason}</li>
            ))}
          </ul>
        </details>
      )}
      <div style={actions}>
        <button type="button" onClick={onBack} style={secondary}>Back</button>
        <button type="button" onClick={onApply} disabled={busy} style={primary}>{busy ? 'Importing…' : 'Apply import'}</button>
      </div>
    </div>
  );
}

function Done({ kind, plan, onClose }) {
  return (
    <div style={{ textAlign: 'center', padding: 20 }}>
      <CheckCircle2 size={40} color="#16a34a" />
      <h3 style={{ margin: '12px 0 4px' }}>Import complete</h3>
      {kind === 'PRODUCT' ? (
        <p>{plan.summary.creates} created, {plan.summary.updates} updated.</p>
      ) : (
        <p>{plan.summary.prices} prices added across {plan.summary.suppliers} new supplier(s).</p>
      )}
      <button type="button" onClick={onClose} style={primary}>Close</button>
    </div>
  );
}

// ----- styles -----
const wrap = { width: 'min(960px, 96vw)', maxHeight: '90vh', overflow: 'auto', background: 'white', borderRadius: 8, boxShadow: '0 20px 60px rgba(0,0,0,0.25)', display: 'flex', flexDirection: 'column' };
const head = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid #e5e7eb' };
const closeBtn = { border: 'none', background: 'transparent', fontSize: 24, cursor: 'pointer', lineHeight: 1 };
const stepperWrap = { display: 'flex', gap: 4, padding: '8px 16px', borderBottom: '1px solid #e5e7eb', listStyle: 'none', margin: 0 };
const stepItem = { flex: 1, display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#64748b' };
const stepActive = { color: '#0f172a', fontWeight: 600 };
const stepDone = { color: '#16a34a' };
const stepNum = { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 18, height: 18, borderRadius: 999, background: '#e5e7eb', fontSize: 11 };
const body = { padding: 16, flex: 1, minHeight: 0, overflow: 'auto' };
const errorBox = { background: '#fee2e2', color: '#b91c1c', padding: 8, fontSize: 12, margin: '8px 16px', borderRadius: 6 };
const dropZone = { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, gap: 8, border: '2px dashed #cbd5e1', borderRadius: 8, cursor: 'pointer', background: '#f8fafc' };
const dropZoneHover = { borderColor: '#0f172a', background: '#eff6ff' };
const hint = { fontSize: 13, color: '#475569' };
const mapTable = { width: '100%', borderCollapse: 'collapse', fontSize: 13 };
const th = { textAlign: 'left', padding: '6px 8px', background: '#f1f5f9', borderBottom: '1px solid #e5e7eb', fontWeight: 600 };
const td = { padding: '6px 8px', borderBottom: '1px solid #f1f5f9' };
const selectStyle = { width: '100%', padding: '4px 6px', borderRadius: 4, border: '1px solid #e5e7eb' };
const actions = { display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 };
const primary = { padding: '6px 12px', background: '#0f172a', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 };
const secondary = { padding: '6px 12px', background: 'white', color: '#0f172a', border: '1px solid #e5e7eb', borderRadius: 6, cursor: 'pointer' };
