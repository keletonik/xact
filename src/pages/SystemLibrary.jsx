import { useEffect, useMemo, useState } from 'react';
import { Library } from 'lucide-react';
import Card from '../components/common/Card';
import SearchInput from '../components/common/SearchInput';
import EmptyState from '../components/common/EmptyState';
import useSystemLibraryStore from '../stores/useSystemLibraryStore';
import {
  SUBSTRATES, SUBSTRATE_LABELS,
  SERVICE_TYPES, SERVICE_TYPE_LABELS,
} from '../utils/constants';
import { searchSystems } from '../domain/passiveFire';

/**
 * Tested-system library. Matrix search comes online in phase 2; this phase 1
 * surface lists what's seeded so the UI scaffold lands now and works against
 * real (placeholder) data.
 */
export default function SystemLibraryPage() {
  const systems = useSystemLibraryStore((s) => s.systems);
  const hydrate = useSystemLibraryStore((s) => s.hydrate);
  useEffect(() => { hydrate(); }, [hydrate]);

  const [search, setSearch] = useState('');
  const [substrate, setSubstrate] = useState('all');
  const [service, setService] = useState('all');
  const [frl, setFrl] = useState('');

  const visible = useMemo(() => {
    const query = {
      requiredFrl: frl.trim() || null,
      substrate: substrate === 'all' ? null : substrate,
      serviceTypes: service === 'all' ? [] : [service],
    };
    const filtered = (frl || substrate !== 'all' || service !== 'all')
      ? searchSystems(systems, query)
      : [...systems].sort((a, b) => a.manufacturer.localeCompare(b.manufacturer));

    const q = search.trim().toLowerCase();
    return filtered.filter((s) => {
      if (!q) return true;
      return [s.manufacturer, s.systemName, s.testReportNo].some((v) => (v || '').toLowerCase().includes(q));
    });
  }, [systems, search, substrate, service, frl]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <h1 style={{ margin: 0, fontSize: 22 }}>Tested-system library</h1>
        <span style={{ fontSize: 12, color: 'var(--geist-fg-4)' }}>
          {visible.length} of {systems.length}
        </span>
      </div>

      <Card>
        <p style={{ margin: 0, fontSize: 12, color: 'var(--geist-fg-3)' }}>
          Matrix search: pick required FRL, substrate, and a service type to see which tested systems comply under AS 1530.4.
          Full editing, certificate uploads, and bulk catalogue import come in phase 2.
        </p>
      </Card>

      <Card>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 8 }}>
          <SearchInput value={search} onChange={setSearch} placeholder="Search manufacturer, system, report no" />
          <input
            value={frl}
            onChange={(e) => setFrl(e.target.value)}
            placeholder="Required FRL  -/120/120"
            style={inputStyle}
          />
          <select value={substrate} onChange={(e) => setSubstrate(e.target.value)} style={inputStyle}>
            <option value="all">Any substrate</option>
            {Object.values(SUBSTRATES).map((s) => (
              <option key={s} value={s}>{SUBSTRATE_LABELS[s]}</option>
            ))}
          </select>
          <select value={service} onChange={(e) => setService(e.target.value)} style={inputStyle}>
            <option value="all">Any service</option>
            {Object.values(SERVICE_TYPES).map((s) => (
              <option key={s} value={s}>{SERVICE_TYPE_LABELS[s]}</option>
            ))}
          </select>
        </div>
      </Card>

      {visible.length === 0 ? (
        <EmptyState
          icon={Library}
          title="No tested systems match"
          description="Loosen the matrix filters or clear the FRL field."
        />
      ) : (
        <Card>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ textAlign: 'left', color: 'var(--geist-fg-4)' }}>
                <th style={th}>Manufacturer</th>
                <th style={th}>System</th>
                <th style={th}>Test report</th>
                <th style={th}>Standard</th>
                <th style={th}>Tested FRL</th>
                <th style={th}>Substrates</th>
                <th style={th}>Services</th>
                <th style={th}>Opening (mm)</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((s) => (
                <tr key={s.id} style={{ borderTop: '1px solid var(--geist-border)' }}>
                  <td style={td}>{s.manufacturer}</td>
                  <td style={td}>{s.systemName}</td>
                  <td style={td}><code>{s.testReportNo || '—'}</code></td>
                  <td style={td}>{s.testStandard}</td>
                  <td style={td}><code style={{ fontSize: 12 }}>{s.testedFrl}</code></td>
                  <td style={td}>{s.substratesSupported?.map((k) => SUBSTRATE_LABELS[k]).join(', ')}</td>
                  <td style={td}>{s.servicesSupported?.map((k) => SERVICE_TYPE_LABELS[k]).join(', ')}</td>
                  <td style={td}>{s.openingSizeRangeMm ? `${s.openingSizeRangeMm[0]}–${s.openingSizeRangeMm[1]}` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}

const inputStyle = {
  padding: '6px 10px',
  border: '1px solid var(--geist-border-strong)',
  borderRadius: 4,
  background: 'var(--geist-bg)',
  fontSize: 12,
};
const th = { padding: '6px 10px', fontWeight: 500, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.4 };
const td = { padding: '8px 10px', verticalAlign: 'top' };
