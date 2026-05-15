import { Component } from 'react';

/**
 * Root error boundary. Stops uncaught render-phase errors from leaving the
 * page as a blank `<div id="root">`. In production, the user sees a
 * recoverable error card instead of nothing. The error is also written to
 * the console so the deploy logs / browser DevTools still capture it.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('Evalax root error boundary:', error, info?.componentStack);
  }

  handleReset = () => {
    this.setState({ error: null });
  };

  handleHardReset = () => {
    try { window.localStorage.clear(); } catch { /* ignore */ }
    if (window.indexedDB && typeof window.indexedDB.databases === 'function') {
      window.indexedDB.databases().then((dbs) => {
        for (const db of dbs) if (db.name) window.indexedDB.deleteDatabase(db.name);
        window.location.reload();
      }).catch(() => window.location.reload());
    } else {
      window.location.reload();
    }
  };

  render() {
    if (!this.state.error) return this.props.children;

    const message = this.state.error?.message || String(this.state.error);
    const stack = this.state.error?.stack || '';
    return (
      <div style={wrap} role="alert" aria-live="assertive">
        <div style={card}>
          <h1 style={h1}>Something went wrong</h1>
          <p style={p}>The app hit an unexpected error while rendering. Your data is safe in this browser.</p>
          <pre style={pre}>{message}</pre>
          {stack && <details style={{ marginTop: 12 }}><summary>Stack</summary><pre style={pre}>{stack}</pre></details>}
          <div style={actions}>
            <button type="button" style={btn} onClick={this.handleReset}>Try again</button>
            <button type="button" style={btnDanger} onClick={this.handleHardReset}>Clear data &amp; reload</button>
          </div>
        </div>
      </div>
    );
  }
}

const wrap = { minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24, background: '#0f172a' };
const card = { maxWidth: 640, background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 10px 30px rgba(0,0,0,0.25)' };
const h1 = { margin: '0 0 8px', fontSize: 20, color: '#0f172a' };
const p = { margin: '0 0 12px', color: '#475569' };
const pre = { background: '#f1f5f9', padding: 12, borderRadius: 8, overflow: 'auto', fontSize: 12, color: '#0f172a', whiteSpace: 'pre-wrap' };
const actions = { display: 'flex', gap: 8, marginTop: 16, justifyContent: 'flex-end' };
const btn = { padding: '8px 14px', background: '#0f172a', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer' };
const btnDanger = { ...btn, background: '#b91c1c' };
