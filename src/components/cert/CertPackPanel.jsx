import { useEffect, useState } from 'react';
import { FileText, Download, Trash2, Loader2 } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';
import EmptyState from '../common/EmptyState';
import FormField from '../common/FormField';
import { generateCertPack } from '../../cert/generators';
import useCertPackStore from '../../stores/useCertPackStore';
import { getBlob } from '../../services/db';
import {
  CERT_PACK_TYPES, CERT_PACK_TYPE_LABELS,
} from '../../utils/constants';
import { formatDateTime } from '../../utils/formatters';

/**
 * Generate, list, and download cert packs per project. Generation
 * runs in the foreground because jsPDF is synchronous; for large
 * projects the user sees a brief loader. Output Blob persists to
 * dexie under the same content-addressable blob table used by photos.
 */
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
        type,
        project,
        assets,
        systems,
        photos,
        defects,
        inspections,
        resultsByInspection,
      });
      const created = await record({
        projectId: project.id,
        type,
        blob,
        assetIds: assets.map((a) => a.id),
      });
      await downloadPack(created);
    } catch (err) {
      setError(err.message || 'Generation failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Card>
        <strong>Generate cert pack</strong>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 10, marginTop: 10, alignItems: 'end' }}>
          <FormField label="Type">
            <select value={type} onChange={(e) => setType(e.target.value)} style={selectStyle}>
              {Object.values(CERT_PACK_TYPES).map((t) => (
                <option key={t} value={t}>{CERT_PACK_TYPE_LABELS[t]}</option>
              ))}
            </select>
          </FormField>
          <Button onClick={generate} disabled={busy || assets.length === 0} loading={busy}>
            {busy ? <Loader2 size={14} /> : <FileText size={14} />} Generate
          </Button>
        </div>
        {assets.length === 0 && (
          <p style={{ fontSize: 12, color: 'var(--geist-fg-4)', marginTop: 6 }}>
            Add at least one asset before generating a cert pack.
          </p>
        )}
        {error && <div style={{ color: 'var(--geist-error, #b91c1c)', fontSize: 12, marginTop: 6 }}>{error}</div>}
      </Card>

      <Card>
        <strong>Generated packs</strong>
        {projectPacks.length === 0 ? (
          <div style={{ marginTop: 8 }}>
            <EmptyState
              icon={FileText}
              title="No cert packs generated"
              description="Once assets are installed with photo evidence and tested-system references, generate Form 15, Form 16, AS 1851 baseline / annual, or install certification packs here."
            />
          </div>
        ) : (
          <div style={{ marginTop: 8, overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ textAlign: 'left', color: 'var(--geist-fg-4)' }}>
                  <th style={th}>Type</th>
                  <th style={th}>Generated</th>
                  <th style={th}>Size</th>
                  <th style={th}>Assets</th>
                  <th style={th} aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {projectPacks.map((c) => (
                  <tr key={c.id} style={{ borderTop: '1px solid var(--geist-border)' }}>
                    <td style={td}>{CERT_PACK_TYPE_LABELS[c.type]}</td>
                    <td style={td}>{formatDateTime(c.generatedAt)}</td>
                    <td style={td}>{formatBytes(c.sizeBytes)}</td>
                    <td style={td}>{c.assetIds?.length || 0}</td>
                    <td style={{ ...td, whiteSpace: 'nowrap' }}>
                      <Button size="sm" variant="ghost" onClick={() => downloadPack(c)}>
                        <Download size={12} /> Download
                      </Button>{' '}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={async () => {
                          if (!window.confirm('Delete this cert pack record?')) return;
                          await deletePack(c.id);
                        }}
                      >
                        <Trash2 size={12} /> Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

async function downloadPack(c) {
  const blob = await getBlob(c.blobHash);
  if (!blob) {
    alert('Cert pack blob missing. Re-generate to recover.');
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
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(2)} MB`;
}

const selectStyle = {
  padding: '8px 10px',
  border: '1px solid var(--geist-border-strong)',
  borderRadius: 4,
  background: 'var(--geist-bg)',
  color: 'var(--geist-fg)',
  fontSize: 13,
  width: '100%',
};
const th = { padding: '6px 10px', fontWeight: 500, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.4 };
const td = { padding: '8px 10px', verticalAlign: 'middle' };
