// XACT — UI primitives
const { useState, useEffect, useRef, useMemo, useCallback } = React;
const I = window.XACT_ICONS;

// ─── Sparkline ──────────────────────────────────────────────────────────────
function Sparkline({ data, color = 'currentColor', fill = true, height = 36, width = 120, strokeWidth = 1.5 }) {
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => [(i / (data.length - 1)) * width, height - ((v - min) / range) * (height - 4) - 2]);
  const path = pts.map(([x, y], i) => (i === 0 ? `M${x},${y}` : `L${x},${y}`)).join(' ');
  const area = path + ` L${width},${height} L0,${height} Z`;
  const last = pts[pts.length - 1];
  return (
    <svg width={width} height={height} style={{ display: 'block', overflow: 'visible' }}>
      {fill && <path d={area} fill={color} opacity="0.12" />}
      <path d={path} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={last[0]} cy={last[1]} r="2.5" fill={color} />
      <circle cx={last[0]} cy={last[1]} r="5" fill={color} opacity="0.2" />
    </svg>
  );
}

// ─── Animated number counter ────────────────────────────────────────────────
function Counter({ value, prefix = '', suffix = '', decimals = 0, duration = 1200 }) {
  const [v, setV] = useState(0);
  const startRef = useRef(null);
  useEffect(() => {
    let raf;
    const start = performance.now();
    const from = 0;
    const animate = (t) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setV(from + (value - from) * eased);
      if (p < 1) raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  const formatted = decimals > 0 ? v.toFixed(decimals) : Math.round(v).toLocaleString();
  return <span style={{ fontVariantNumeric: 'tabular-nums' }}>{prefix}{formatted}{suffix}</span>;
}

// ─── KPI card ───────────────────────────────────────────────────────────────
function KpiCard({ label, value, prefix, suffix, decimals, delta, deltaLabel, spark, color, sub, density = 'comfy' }) {
  const pad = density === 'compact' ? '14px 16px' : density === 'spacious' ? '24px 26px' : '18px 20px';
  const big = density === 'compact' ? 28 : density === 'spacious' ? 44 : 36;
  return (
    <div className="xc-card xc-kpi" style={{ padding: pad }}>
      <div className="xc-kpi-hd">
        <span className="xc-kpi-lbl">{label}</span>
        {delta != null && (
          <span className="xc-pill" data-pos={delta >= 0}>
            {delta >= 0 ? '▲' : '▼'} {Math.abs(delta).toFixed(1)}%
          </span>
        )}
      </div>
      <div className="xc-kpi-val" style={{ fontSize: big }}>
        <Counter value={value} prefix={prefix} suffix={suffix} decimals={decimals} />
      </div>
      <div className="xc-kpi-foot">
        <span className="xc-kpi-sub">{sub || deltaLabel}</span>
        {spark && <Sparkline data={spark} color={color || 'var(--accent)'} width={96} height={28} />}
      </div>
    </div>
  );
}

// ─── Sidebar ────────────────────────────────────────────────────────────────
function Sidebar({ collapsed, onToggle, screen, setScreen, dense }) {
  const items = [
    { id: 'dash', label: 'Dashboard', icon: I.dash },
    { id: 'estimates', label: 'Estimates', icon: I.estimate, badge: 24 },
    { id: 'takeoff', label: 'Takeoff', icon: I.takeoff },
    { id: 'pipeline', label: 'Pipeline', icon: I.pipeline },
    { id: 'pricing', label: 'Pricing', icon: I.pricing },
    { id: 'analytics', label: 'Analytics', icon: I.analytics },
  ];
  return (
    <aside className={`xc-sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="xc-side-hd">
        <Logo collapsed={collapsed} />
        <button className="xc-icon-btn xc-collapse" onClick={onToggle} aria-label="Collapse">
          {I.collapse}
        </button>
      </div>
      <nav className="xc-nav">
        {items.map(it => (
          <button key={it.id} className={`xc-nav-item ${screen === it.id ? 'active' : ''}`}
            onClick={() => setScreen(it.id)} title={collapsed ? it.label : ''}>
            <span className="xc-nav-ic">{it.icon}</span>
            {!collapsed && <span className="xc-nav-lbl">{it.label}</span>}
            {!collapsed && it.badge && <span className="xc-nav-badge">{it.badge}</span>}
          </button>
        ))}
      </nav>
      <div className="xc-side-ft">
        {!collapsed && (
          <div className="xc-side-meter">
            <div className="xc-meter-row">
              <span>Compute</span>
              <span className="xc-mono">62%</span>
            </div>
            <div className="xc-meter-bar"><div style={{ width: '62%' }}/></div>
            <div className="xc-meter-row">
              <span>Seats</span>
              <span className="xc-mono">8 / 12</span>
            </div>
          </div>
        )}
        <button className={`xc-nav-item ${screen === 'settings' ? 'active' : ''}`} onClick={() => setScreen('settings')}>
          <span className="xc-nav-ic">{I.settings}</span>
          {!collapsed && <span className="xc-nav-lbl">Settings</span>}
        </button>
      </div>
    </aside>
  );
}

// ─── Logo — Event Stream wordmark (XACT with C-cut + accent dot) ──────────
function Logo({ collapsed }) {
  if (collapsed) {
    return (
      <div className="xc-logo collapsed">
        <svg width="36" height="36" viewBox="0 0 100 100" fill="none" aria-label="XACT">
          <text x="50" y="80" textAnchor="middle"
            fontFamily='"Archivo", system-ui, sans-serif'
            fontSize="100" fontWeight="900"
            style={{ letterSpacing: '-0.06em' }}
            fill="currentColor">X</text>
          <circle cx="86" cy="16" r="10" fill="#FF5E5B"/>
        </svg>
      </div>
    );
  }
  return (
    <div className="xc-logo">
      <svg viewBox="0 0 520 130" height="42" fill="none" aria-label="XACT wordmark"
        style={{ overflow: 'visible' }}>
        <text x="15" y="94"
          fontFamily='"Archivo", system-ui, sans-serif'
          fontSize="108" fontWeight="900"
          style={{ letterSpacing: '-0.055em' }}
          fill="currentColor">XACT</text>
        {/* vertical cut through the C — uses sidebar bg color */}
        <rect x="190" y="46" width="18" height="60"
          style={{ fill: 'var(--bg-2, #0E1118)' }}/>
        {/* red signal dot, top-right */}
        <circle cx="458" cy="28" r="10" fill="#FF5E5B"/>
      </svg>
    </div>
  );
}

// ─── Top bar ────────────────────────────────────────────────────────────────
const SCREEN_LABELS = {
  dash: 'Dashboard', estimates: 'Estimates', takeoff: 'Takeoff',
  pipeline: 'Pipeline', pricing: 'Pricing', analytics: 'Analytics',
  team: 'Team', map: 'Job Map', settings: 'Settings',
};
const SCREEN_GLYPHS = {
  dash: '▦', estimates: '▤', takeoff: '◫', pipeline: '▽',
  pricing: '◈', analytics: '▯', settings: '⚙',
};

function TopBar({ onCmd, team, screen, setScreen, onBack, onForward, canBack, canForward, history }) {
  const [crumbOpen, setCrumbOpen] = useState(false);
  const [histOpen, setHistOpen] = useState(false);
  const crumbRef = useRef(null);
  const histRef = useRef(null);

  useEffect(() => {
    const click = (e) => {
      if (!crumbRef.current?.contains(e.target)) setCrumbOpen(false);
      if (!histRef.current?.contains(e.target)) setHistOpen(false);
    };
    document.addEventListener('mousedown', click);
    return () => document.removeEventListener('mousedown', click);
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.altKey && e.key === 'ArrowLeft' && canBack)    { e.preventDefault(); onBack?.(); }
      if (e.altKey && e.key === 'ArrowRight' && canForward){ e.preventDefault(); onForward?.(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [canBack, canForward, onBack, onForward]);

  const curLabel = SCREEN_LABELS[screen] || 'Workspace';
  const recent = (history || []).filter(s => s !== screen).slice(-6).reverse();

  return (
    <header className="xc-topbar">
      <div className="xc-nav-history">
        <button className="xc-icon-btn xc-nav-arrow" disabled={!canBack} onClick={onBack} title="Back (Alt+←)">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 3L5 7l4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <button className="xc-icon-btn xc-nav-arrow" disabled={!canForward} onClick={onForward} title="Forward (Alt+→)">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <div className="xc-nav-hist-wrap" ref={histRef}>
          <button className={`xc-icon-btn xc-nav-arrow ${histOpen ? 'active' : ''}`}
            disabled={recent.length === 0}
            onClick={() => setHistOpen(o => !o)} title="Recent screens">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          {histOpen && recent.length > 0 && (
            <div className="xc-impexp-pop xc-nav-hist-pop">
              <div className="xc-impexp-grp">RECENT</div>
              {recent.map((s, i) => (
                <button key={i} className="xc-impexp-item"
                  onClick={() => { setScreen(s); setHistOpen(false); }}>
                  <span className="xc-impexp-ext xc-impexp-ico" style={{fontSize:13}}>{SCREEN_GLYPHS[s] || '◌'}</span>
                  <span><b>{SCREEN_LABELS[s] || s}</b><small>{i === 0 ? 'just left' : `${i + 1} ago`}</small></span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="xc-crumbs" ref={crumbRef}>
        <button className="xc-crumb-btn" onClick={() => setScreen('dash')}>Workspace</button>
        <span className="xc-crumb-sep">/</span>
        <button className={`xc-crumb-btn cur ${crumbOpen ? 'active' : ''}`}
          onClick={() => setCrumbOpen(o => !o)}>
          {curLabel}
          <svg width="9" height="9" viewBox="0 0 10 10" style={{marginLeft:5,opacity:.55}}><path d="M2 4l3 3 3-3" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round"/></svg>
        </button>
        {crumbOpen && (
          <div className="xc-impexp-pop xc-crumb-pop">
            <div className="xc-impexp-grp">JUMP TO</div>
            {Object.entries(SCREEN_LABELS).filter(([k]) => k !== 'team' && k !== 'map').map(([k, label]) => (
              <button key={k}
                className={`xc-impexp-item ${k === screen ? 'cur' : ''}`}
                onClick={() => { setScreen(k); setCrumbOpen(false); }}>
                <span className="xc-impexp-ext xc-impexp-ico" style={{fontSize:13}}>{SCREEN_GLYPHS[k] || '◌'}</span>
                <span><b>{label}</b><small>{k === screen ? 'current screen' : `Open ${label.toLowerCase()}`}</small></span>
              </button>
            ))}
          </div>
        )}
      </div>
      <button className="xc-search" onClick={onCmd}>
        <span className="xc-search-ic">{I.search}</span>
        <span className="xc-search-txt">Search jobs, parts, calcs…</span>
        <kbd className="xc-kbd">⌘K</kbd>
      </button>
      <div className="xc-top-actions">
        <button className="xc-icon-btn" title="Alerts"><span className="xc-dot"/>{I.bell}</button>
        <button className="xc-btn-primary">{I.plus}<span>New Estimate</span></button>
      </div>
    </header>
  );
}

// ─── Card wrapper ───────────────────────────────────────────────────────────
function Card({ title, sub, actions, children, className = '', pad = true, scan = false }) {
  return (
    <section className={`xc-card ${className}`} style={{ padding: pad ? 'var(--card-pad)' : 0 }}>
      {(title || actions) && (
        <header className="xc-card-hd">
          <div>
            {title && <h3 className="xc-card-title">{title}</h3>}
            {sub && <p className="xc-card-sub">{sub}</p>}
          </div>
          <div className="xc-card-actions">{actions}</div>
        </header>
      )}
      {children}
    </section>
  );
}

// ─── Status pill ────────────────────────────────────────────────────────────
function StatusPill({ status }) {
  const map = {
    'In Review': { c: 'amber' }, 'Submitted': { c: 'blue' }, 'Drafting': { c: 'slate' },
    'Pricing': { c: 'violet' }, 'Won': { c: 'green' }, 'Lost': { c: 'red' },
  };
  return <span className={`xc-status xc-status-${map[status]?.c || 'slate'}`}>
    <span className="xc-status-dot"/>{status}
  </span>;
}

window.XACT_UI = { Sparkline, Counter, KpiCard, Sidebar, Logo, TopBar, Card, StatusPill };
