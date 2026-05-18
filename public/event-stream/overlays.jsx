// XACT — overlays: ⌘K palette, detail drawer, live cursors
const ICX = window.XACT_ICONS;
const { StatusPill } = window.XACT_UI;

// ─── ⌘K command palette ─────────────────────────────────────────────────────
function CommandPalette({ open, onClose, proposals, onOpenProposal, setScreen }) {
  const [q, setQ] = useState('');
  const [sel, setSel] = useState(0);

  const actions = [
    { id: 'new-est', label: 'New estimate', sub: 'Start a fresh proposal', cmd: 'N', kind: 'action' },
    { id: 'goto-pipe', label: 'Go to Pipeline', sub: 'Forecast view', cmd: 'G P', kind: 'nav', go: 'pipeline' },
    { id: 'goto-takeoff', label: 'Go to Takeoff', sub: 'Active jobs', cmd: 'G T', kind: 'nav', go: 'takeoff' },
    { id: 'goto-analytics', label: 'Go to Analytics', sub: 'Win/loss & forecasts', cmd: 'G A', kind: 'nav', go: 'analytics' },
    { id: 'run-calc', label: 'Run hydraulic calc', sub: 'On current estimate', cmd: 'R H', kind: 'action' },
    { id: 'import-rsm', label: 'Import RSMeans pricing', sub: 'Sync latest 2026Q2', cmd: 'I R', kind: 'action' },
    { id: 'invite', label: 'Invite teammate', sub: '8 / 12 seats used', cmd: 'I T', kind: 'action' },
  ];
  const projects = proposals.map(p => ({ id: p.id, label: p.name, sub: `${p.id} · ${p.client} · $${(p.value/1000).toFixed(0)}K`, kind: 'project', payload: p }));
  const ai = q ? [
    { id: 'ai-1', label: `Ask XACT AI: "${q}"`, sub: 'Generates summary + linked records', kind: 'ai' },
    { id: 'ai-2', label: `Find estimates similar to "${q}"`, sub: 'Vector search across 2,184 records', kind: 'ai' },
  ] : [];

  const all = [...ai, ...actions, ...projects];
  const filtered = q ? all.filter(a => a.label.toLowerCase().includes(q.toLowerCase()) || (a.sub||'').toLowerCase().includes(q.toLowerCase())) : all;

  useEffect(() => { setSel(0); }, [q, open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowDown') { e.preventDefault(); setSel(s => Math.min(filtered.length - 1, s + 1)); }
      if (e.key === 'ArrowUp') { e.preventDefault(); setSel(s => Math.max(0, s - 1)); }
      if (e.key === 'Enter') {
        const item = filtered[sel];
        if (item) {
          if (item.kind === 'nav') setScreen(item.go);
          if (item.kind === 'project') onOpenProposal(item.payload);
          onClose();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, filtered, sel, onClose, setScreen, onOpenProposal]);

  if (!open) return null;
  return (
    <div className="xc-cmd-scrim" onClick={onClose}>
      <div className="xc-cmd" onClick={e => e.stopPropagation()}>
        <div className="xc-cmd-hd">
          <span className="xc-cmd-pre">XACT ⟩</span>
          <input autoFocus value={q} onChange={e => setQ(e.target.value)}
            placeholder="Ask anything · jump to job · run command"
            className="xc-cmd-input"/>
          <kbd className="xc-kbd">esc</kbd>
        </div>
        <div className="xc-cmd-list">
          {filtered.map((it, i) => (
            <button key={it.id} className={`xc-cmd-item ${i === sel ? 'sel' : ''} kind-${it.kind}`}
              onMouseEnter={() => setSel(i)}
              onClick={() => {
                if (it.kind === 'nav') setScreen(it.go);
                if (it.kind === 'project') onOpenProposal(it.payload);
                onClose();
              }}>
              <span className="xc-cmd-kind">
                {it.kind === 'ai' && '✦'}
                {it.kind === 'project' && '◆'}
                {it.kind === 'action' && '▸'}
                {it.kind === 'nav' && '↗'}
              </span>
              <div className="xc-cmd-body">
                <div className="xc-cmd-lbl">{it.label}</div>
                <div className="xc-cmd-sub">{it.sub}</div>
              </div>
              {it.cmd && <kbd className="xc-kbd-sm">{it.cmd}</kbd>}
            </button>
          ))}
          {filtered.length === 0 && <div className="xc-cmd-empty">No results for "{q}"</div>}
        </div>
        <div className="xc-cmd-ft">
          <span><kbd className="xc-kbd-sm">↑↓</kbd> navigate</span>
          <span><kbd className="xc-kbd-sm">↵</kbd> open</span>
          <span><kbd className="xc-kbd-sm">esc</kbd> close</span>
          <span className="xc-cmd-ai">✦ XACT AI · Haiku</span>
        </div>
      </div>
    </div>
  );
}

// ─── Detail drawer ──────────────────────────────────────────────────────────
function DetailDrawer({ proposal, onClose }) {
  if (!proposal) return null;
  const p = proposal;
  return (
    <div className="xc-drawer-scrim" onClick={onClose}>
      <aside className="xc-drawer" onClick={e => e.stopPropagation()}>
        <header className="xc-dr-hd">
          <div>
            <div className="xc-dr-id"><span className="xc-mono">{p.id}</span> · {p.type}</div>
            <h2 className="xc-dr-title">{p.name}</h2>
            <div className="xc-dr-sub">{p.client} · {p.city}</div>
          </div>
          <button className="xc-icon-btn" onClick={onClose}>{ICX.x}</button>
        </header>

        <div className="xc-dr-stats">
          <div><span>Value</span><b className="xc-mono">${p.value.toLocaleString()}</b></div>
          <div><span>SQFT</span><b className="xc-mono">{p.sqft.toLocaleString()}</b></div>
          <div><span>Heads</span><b className="xc-mono">{p.heads.toLocaleString()}</b></div>
          <div><span>Due</span><b className="xc-mono">{p.due}</b></div>
        </div>

        <section className="xc-dr-section">
          <h4>Status</h4>
          <div className="xc-dr-status">
            <StatusPill status={p.status}/>
            <span className="xc-dr-conf">
              Confidence
              <span className="xc-conf-bar"><span style={{ width: `${p.confidence}%` }}/></span>
              <b className="xc-mono">{p.confidence}%</b>
            </span>
          </div>
        </section>

        <section className="xc-dr-section">
          <h4>AI Risk Signals</h4>
          <ul className="xc-dr-list">
            <li><span className="xc-dot-amber"/>Supply: AFFF concentrate lead time +6w vs. baseline</li>
            <li><span className="xc-dot-green"/>Hydraulic margin healthy at 21% residual headroom</li>
            <li><span className="xc-dot-red"/>Schedule slippage probability: 32% (vs. 19% portfolio avg)</li>
            <li><span className="xc-dot-amber"/>Comparable wins in cluster bid 4.2% lower</li>
          </ul>
        </section>

        <section className="xc-dr-section">
          <h4>Recent Activity</h4>
          <div className="xc-dr-feed">
          <div className="xc-dr-fr"><span className="xc-mono">2h</span> Pricing Engine repriced 1,840 pendents</div>
            <div className="xc-dr-fr"><span className="xc-mono">5h</span> AutoTakeoff completed sheet FP-104</div>
            <div className="xc-dr-fr"><span className="xc-mono">1d</span> Risk Monitor flagged hydraulic check needed</div>
            <div className="xc-dr-fr"><span className="xc-mono">2d</span> Estimate created from RFP intake</div>
          </div>
        </section>

        <footer className="xc-dr-ft">
          <button className="xc-btn-ghost">Open Takeoff</button>
          <button className="xc-btn-primary">Run AI Bid Review</button>
        </footer>
      </aside>
    </div>
  );
}

// ─── Live cursors ───────────────────────────────────────────────────────────
function LiveCursors({ team }) {
  const [cursors, setCursors] = useState(team.filter(t => t.cursor).map(t => ({ ...t, x: t.cursor.x, y: t.cursor.y })));
  useEffect(() => {
    const id = setInterval(() => {
      setCursors(prev => prev.map(c => ({
        ...c,
        x: Math.max(8, Math.min(88, c.x + (Math.random() - 0.5) * 3)),
        y: Math.max(12, Math.min(86, c.y + (Math.random() - 0.5) * 3)),
      })));
    }, 1400);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="xc-cursors">
      {cursors.map(c => (
        <div key={c.id} className="xc-cursor" style={{ left: c.x + '%', top: c.y + '%', color: c.color }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M2 2 L12 8 L7 9 L9 14 L7 14.5 L5 9.5 L2 12 Z"/>
          </svg>
          <span className="xc-cursor-lbl" style={{ background: c.color }}>{c.name.split(' ')[0]}</span>
        </div>
      ))}
    </div>
  );
}

window.XACT_OV = { CommandPalette, DetailDrawer, LiveCursors };
