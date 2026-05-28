import Card from '../components/common/Card';
import { User } from 'lucide-react';

export default function Profile() {
  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <h1 style={{ margin: 0, fontSize: 22 }}>Profile</h1>
      <Card>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{
            width: 44, height: 44, borderRadius: 22,
            background: 'var(--geist-fg-6, #e5e7eb)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--geist-fg-2)',
          }}>
            <User size={20} />
          </div>
          <div>
            <div style={{ fontWeight: 600 }}>Current user</div>
            <div style={{ fontSize: 12, color: 'var(--geist-fg-4)' }}>Local-only session (offline-first build)</div>
          </div>
        </div>
        <p style={{ fontSize: 13, color: 'var(--geist-fg-3)', marginTop: 12 }}>
          Multi-user accounts, role assignment (office, supervisor, installer, inspector, certifier) and crew rosters come in phase 8 when backend sync lands.
        </p>
      </Card>
    </div>
  );
}
