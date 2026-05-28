import { User } from 'lucide-react';
import PaperCard from '../components/draft/PaperCard';
import InkStamp from '../components/draft/InkStamp';

export default function Profile() {
  return (
    <div className="xc-stagger" style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 18 }}>
      <section style={{ borderBottom: '1.5px solid var(--rule-ink)', paddingBottom: 14 }}>
        <div className="xc-stamp" style={{ marginBottom: 6 }}>system · profile</div>
        <h1 className="xc-display-italic" style={{ margin: 0, fontSize: 48, lineHeight: 1 }}>
          Drafter at work
        </h1>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-3)', marginTop: 12 }}>
          single-user session · offline-first build
        </p>
      </section>

      <PaperCard title="current user" meta="local only">
        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
          <div style={{
            width: 56, height: 56,
            border: '1.5px solid var(--ink)',
            background: 'var(--paper-2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--ink-2)',
          }}>
            <User size={24} strokeWidth={1.5} />
          </div>
          <div>
            <div className="xc-display-italic" style={{ fontSize: 22, color: 'var(--ink)' }}>
              You
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.04em', marginTop: 4 }}>
              role · drafter / office · region AU
            </div>
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <InkStamp tone="installed" size="md" rotate={-3}>local session</InkStamp>
          </div>
        </div>
      </PaperCard>

      <PaperCard title="multi-user accounts" meta="backend sync · phase 8">
        <p style={{ fontSize: 13, color: 'var(--ink-2)', margin: 0 }}>
          Role assignment (office, supervisor, installer, inspector, certifier) and crew rosters land when backend sync arrives. Today the app runs entirely on local dexie storage.
        </p>
      </PaperCard>
    </div>
  );
}
