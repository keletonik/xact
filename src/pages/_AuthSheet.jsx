import RevisionStamp from '../components/draft/RevisionStamp';

/**
 * AuthSheet — shared chrome for Login / Register / ForgotPassword.
 *
 * A single sheet of drafting paper floating on a deep drafting-board
 * background. The title-block strip carries the XACT mark and a stamp
 * code, the centre carries the headline + form, the footer carries
 * the AS standards bar.
 */
export default function AuthSheet({ stamp, headline, headlineEm, crumb, children }) {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--paper)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--geist-sheet-pad)',
      position: 'relative',
    }}>
      {/* Drafting-paper sheet centred on board */}
      <div style={{
        width: 'min(480px, 100%)',
        background: 'var(--paper-1)',
        border: '1.5px solid var(--rule-ink)',
        boxShadow: '0 16px 40px rgba(14, 14, 15, 0.12)',
        position: 'relative',
      }}>
        {/* corner ticks */}
        <span aria-hidden style={cornerTL} />
        <span aria-hidden style={cornerTR} />
        <span aria-hidden style={cornerBL} />
        <span aria-hidden style={cornerBR} />

        {/* title block */}
        <header style={{
          background: 'var(--ink)',
          color: 'var(--paper-1)',
          padding: '14px 22px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1.5px solid var(--rule-ink)',
        }}>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 900,
            fontSize: 20,
            lineHeight: 1,
            letterSpacing: '-0.06em',
            color: 'var(--paper-1)',
          }}>
            xact
            <span aria-hidden style={{
              display: 'inline-block',
              width: 5, height: 5,
              background: 'var(--accent)',
              marginLeft: 2,
              verticalAlign: 'top',
            }} />
          </span>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            letterSpacing: 'var(--tracking-label)',
            textTransform: 'uppercase',
            color: 'rgba(244,239,226,0.6)',
          }}>
            {stamp}
          </span>
        </header>

        {/* body */}
        <div style={{ padding: '28px 32px 32px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
            <h1 className="xc-display-italic" style={{
              margin: 0,
              fontSize: 40,
              lineHeight: 1,
              color: 'var(--ink)',
            }}>
              {headline}<br />{headlineEm}
            </h1>
            <RevisionStamp letter="B" />
          </div>
          {crumb && (
            <p style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              letterSpacing: '0.04em',
              color: 'var(--ink-3)',
              marginTop: 10,
              marginBottom: 22,
            }}>
              {crumb}
            </p>
          )}

          {children}
        </div>

        {/* footer drafting strip */}
        <footer style={{
          padding: '10px 22px',
          borderTop: '1.5px solid var(--rule-ink)',
          background: 'var(--paper-3)',
          fontFamily: 'var(--font-mono)',
          fontSize: 9,
          letterSpacing: 'var(--tracking-label)',
          textTransform: 'uppercase',
          color: 'var(--ink-3)',
          display: 'flex',
          justifyContent: 'space-between',
        }}>
          <span>AS 1530.4 · AS 4072.1 · AS 1851</span>
          <span>rev B · 29 may 2026</span>
        </footer>
      </div>
    </div>
  );
}

const cornerTL = { position: 'absolute', top: 6, left: 6, width: 10, height: 10, borderTop: '1.5px solid var(--rule-ink)', borderLeft: '1.5px solid var(--rule-ink)' };
const cornerTR = { position: 'absolute', top: 6, right: 6, width: 10, height: 10, borderTop: '1.5px solid var(--rule-ink)', borderRight: '1.5px solid var(--rule-ink)' };
const cornerBL = { position: 'absolute', bottom: 6, left: 6, width: 10, height: 10, borderBottom: '1.5px solid var(--rule-ink)', borderLeft: '1.5px solid var(--rule-ink)' };
const cornerBR = { position: 'absolute', bottom: 6, right: 6, width: 10, height: 10, borderBottom: '1.5px solid var(--rule-ink)', borderRight: '1.5px solid var(--rule-ink)' };
