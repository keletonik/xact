import Card from '../components/common/Card';
import { MANUFACTURERS } from '../utils/constants';

export default function Vendors() {
  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <h1 style={{ margin: 0, fontSize: 22 }}>Vendors</h1>
      <Card>
        <strong>Passive-fire suppliers</strong>
        <p style={{ fontSize: 13, color: 'var(--geist-fg-3)', marginTop: 6 }}>
          Vendor management for passive-fire suppliers, sealant brands, board manufacturers and damper makers. Full CRUD with contact details, pricing agreements and tested-system catalogue links lands in phase 8.
        </p>
        <ul style={{ marginTop: 12, paddingLeft: 18, fontSize: 13 }}>
          {Object.values(MANUFACTURERS).map((m) => (
            <li key={m} style={{ padding: '2px 0' }}>{m}</li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
