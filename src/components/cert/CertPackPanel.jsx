import { useEffect, useState } from 'react';
import { FileText, Download, Trash2, Loader2 } from 'lucide-react';
import PaperCard from '../draft/PaperCard';
import InkStamp from '../draft/InkStamp';
import FormField from '../common/FormField';
import { generateCertPack } from '../../cert/generators';
import useCertPackStore from '../../stores/useCertPackStore';
import { getBlob } from '../../services/db';
import {
  CERT_PACK_TYPES, CERT_PACK_TYPE_LABELS,
} from '../../utils/constants';
import { formatDateTime } from '../../utils/formatters';

export default function CertPackPanel({
  project, assets, systems, photos, defects, inspections, resultsByInspection,
}) {
  const certPacks = useCertPackStore((s) => s.certPacks);
  const hydrate = useCertPackStore((s) => s.hydrate);
  const record = useCertPackStore((s) => s.record);
  const deletePack = useCertPackStore((s) => s.deletePack);

  useEffect(() => { hydrate(); }, [hydrate]);

  const projectPacks = certPacks.filter((c) => c.projectId === project.id);

  const [type, setType] = useState(CERT_PACK_TYPES.INSTALL_CERTIFICATION);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const generate = async () => {
    setError(null);
    setBusy(true);
    try {
      const blob = await generateCertPack({
        type, project, assets, systems, photos, defects,
        inspections, resultsByInspection,
      });
      const created = await record({
        projectId: project.id, type, blob,
        assetIds: assets.map((a) => a.id),
      });
      await downloadPack(created);
    } catch (err) {
      setError(err.message || 'generation failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <PaperCard title="generate cert pack" meta="reads logo + signatory roster from settings">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 12, alignItems: 'end' }}>
          <FormField label="Type">
            <select value={type} onChange={(e) => setType(e.target.value)} style={selectStyle}>
              {Object.values(CERT_PACK_TYPES).map((t) => (
                <option key={t} value={t}>{CERT_PACK_TYPE_LABELS[t]}</option>
              ))}
            </select>
          </FormField>
          <button type="button" onClick={generate} disabled={busy || assets.length === 0} style={{ ...inkBtn, opacity: (busy || assets.length === 0) ? 0.5 : 1 }}>
            {busy ? <Loader2 size={12} /> : <FileText size={12} />}
            {busy ? 'drafting' : 'generate'}
          </button>
        </div>
        {assets.length === 0 && (
          <p style={{ marginTop: 8, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-4)', letterSpacing: '0.04em' }}>
            add at least one asset before generating a cert pack.
          </p>
        )}
        {error && (
          <div style={errBanner}>
            {error}
          </div>
        )}
      </PaperCard>

      <PaperCard title="generated packs" meta={`${projectPacks.length} on file`} noPad>
        {projectPacks.length === 0 ? (
          <div style={emptyDraft}>
            <FileText size={20} color="var(--ink-4)" strokeWidth={2} />
            <span style={{ marginLeft: 10 }}>no cert packs filed</span>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr>
                  {['Type', 'Generated', 'Size', 'Assets', ''].map((h, i) => (
                    <th key={i} style={th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {projectPacks.map((c) => (
                  <tr key={c.id} className="xc-sched-row">
                    <td style={td}>
                      <InkStamp tone="certified" size="sm" rotate={-3}>
                        {CERT_PACK_TYPE_LABELS[c.type]}
                      </InkStamp>
                    </td>
                    <td style={tdMono}>{formatDateTime(c.generatedAt)}</td>
                    <td style={tdMono}>{formatBytes(c.sizeBytes)}</td>
                    <td style={tdMono}>{c.assetIds?.length || 0}</td>
                    <td style={{ ...td, whiteSpace: 'nowrap', textAlign: 'right' }}>
                      <button type="button" onClick={() => downloadPack(c)} style={inkBtn}>
                        <Download size={11} /> download
                      </button>
                      {' '}
                      <button
                        type="button"
                        onClick={async () => {
                          if (!window.confirm('Delete this cert pack record?')) return;
                          await deletePack(c.id);
                        }}
                        style={{ ...ghostBtn, color: 'var(--accent)', borderColor: 'var(--accent)' }}
                        aria-label="Delete"
                      >
                        <Trash2 size={11} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </PaperCard>

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

async function downloadPack(c) {
  const blob = await getBlob(c.blobHash);
  if (!blob) {
    alert('cert pack blob missing. re-generate to recover.');
    return;
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `xact-${c.type}-${c.generatedAt.slice(0, 10)}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}

function formatBytes(n) {
  if (!n) return '—';
  const kb = n / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} kb`;
  return `${(kb / 1024).toFixed(2)} mb`;
}

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
const td = { padding: '12px 14px', borderBottom: '1px solid var(--rule)', verticalAlign: 'middle' };
const tdMono = { ...td, fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.04em', color: 'var(--ink-2)' };
const selectStyle = {
  width: '100%',
  background: 'var(--paper-1)',
  border: '1px solid var(--rule-strong)',
  padding: '10px 12px',
  fontFamily: 'var(--font-sans)',
  fontSize: 13,
  color: 'var(--ink)',
};
const inkBtn = {
  background: 'var(--ink)',
  color: 'var(--paper-1)',
  border: '1px solid var(--ink)',
  padding: '8px 14px',
  fontFamily: 'var(--font-mono)',
  fontSize: 11,
  letterSpacing: 'var(--tracking-label)',
  textTransform: 'uppercase',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
};
const ghostBtn = {
  background: 'transparent',
  color: 'var(--ink-2)',
  border: '1px solid var(--rule-strong)',
  padding: '6px 10px',
  fontFamily: 'var(--font-mono)',
  fontSize: 10,
  letterSpacing: 'var(--tracking-label)',
  textTransform: 'uppercase',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 5,
};
const errBanner = {
  marginTop: 10,
  padding: '8px 12px',
  border: '1px solid var(--accent)',
  color: 'var(--accent)',
  background: 'var(--paper-1)',
  fontFamily: 'var(--font-mono)',
  fontSize: 11,
  letterSpacing: '0.04em',
};
const emptyDraft = {
  padding: '40px 20px',
  textAlign: 'center',
  fontFamily: 'var(--font-mono)',
  fontSize: 11,
  letterSpacing: 'var(--tracking-label)',
  textTransform: 'uppercase',
  color: 'var(--ink-4)',
};
