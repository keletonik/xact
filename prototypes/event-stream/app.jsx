// XACT — main app
const { useState, useEffect, useRef } = React;
const { useTweaks, TweaksPanel, TweakSection, TweakSlider, TweakToggle, TweakRadio, TweakSelect, TweakColor } = window;
const { Sidebar, TopBar, KpiCard, Card, Sparkline } = window.XACT_UI;
const F = window.XACT_FEAT;
const { CommandPalette, DetailDrawer, LiveCursors } = window.XACT_OV;
const { WidgetFrame, WidgetGrid, WidgetToolbar, useDashboardLayout, WIDGET_META } = window.XACT_DASH;
const D = window.XACT_DATA;

// Persistent proposals state (so edits + kanban moves survive screen switches)
const PROPOSALS_LS = 'xact_proposals_v1';
function loadProposals() {
  try {
    const raw = localStorage.getItem(PROPOSALS_LS);
    if (raw) return JSON.parse(raw);
  } catch {}
  return D.proposals;
}
function saveProposals(p) {
  try { localStorage.setItem(PROPOSALS_LS, JSON.stringify(p)); } catch {}
}

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "direction": "light",
  "accent": "#FF5E5B",
  "density": "comfy",
  "sidebarCollapsed": false,
  "pattern": "grid",
  "font": "inter-tight"
}/*EDITMODE-END*/;

// Direction presets (CSS variables applied to root)
const DIRECTIONS = {
  eventstream: {
    label: 'Event Stream',
    vars: {
      '--bg': '#0A0C10',
      '--bg-2': '#0E1118',
      '--surface': '#10141C',
      '--surface-2': '#161B25',
      '--surface-3': '#1D2330',
      '--border': 'rgba(255, 255, 255, 0.06)',
      '--border-2': 'rgba(255, 255, 255, 0.13)',
      '--text': '#FFFFFF',
      '--text-2': '#B5BCC8',
      '--text-3': '#6B7484',
      '--muted': '#3A4252',
      '--grid': 'rgba(255, 255, 255, 0.04)',
      '--accent': '#FF5E5B',
      '--accent-2': '#6D8CFF',
      '--accent-3': '#8BE36B',
      '--accent-glow': 'rgba(255, 94, 91, 0.32)',
      '--map-fill': 'rgba(255, 255, 255, 0.03)',
      '--map-stroke': 'rgba(255, 255, 255, 0.18)',
      '--heat-0': 'rgba(255, 255, 255, 0.04)',
      '--shadow': '0 1px 0 rgba(255,255,255,0.03) inset, 0 12px 32px rgba(0,0,0,0.5)',
      '--card-blur': 'none',
    }
  },
  light: {
    label: 'Audit Light',
    vars: {
      '--bg': '#F6F8FA',
      '--bg-2': '#EDF1F5',
      '--surface': '#FFFFFF',
      '--surface-2': '#F2F5F8',
      '--surface-3': '#E6EBF1',
      '--border': 'rgba(11, 15, 20, 0.08)',
      '--border-2': 'rgba(11, 15, 20, 0.16)',
      '--text': '#0B0F14',
      '--text-2': '#3A4252',
      '--text-3': '#6B7484',
      '--muted': '#A8B0BC',
      '--grid': 'rgba(11, 15, 20, 0.05)',
      '--accent': '#FF5E5B',
      '--accent-2': '#6D8CFF',
      '--accent-3': '#16a34a',
      '--accent-glow': 'rgba(255, 94, 91, 0.22)',
      '--map-fill': 'rgba(11, 15, 20, 0.04)',
      '--map-stroke': 'rgba(11, 15, 20, 0.25)',
      '--heat-0': 'rgba(11, 15, 20, 0.05)',
      '--shadow': '0 1px 0 rgba(255,255,255,0.6) inset, 0 1px 0 rgba(11,15,20,0.04), 0 8px 24px rgba(11,15,20,0.06)',
      '--card-blur': 'none',
    }
  },
  signal: {
    label: 'Signal Console',
    vars: {
      '--bg': '#06070A',
      '--bg-2': '#0A0C10',
      '--surface': '#0D1015',
      '--surface-2': '#13171F',
      '--surface-3': '#1A1F29',
      '--border': 'rgba(255, 94, 91, 0.08)',
      '--border-2': 'rgba(255, 94, 91, 0.18)',
      '--text': '#FFFFFF',
      '--text-2': '#A8B0BC',
      '--text-3': '#5C6473',
      '--muted': '#2F3540',
      '--grid': 'rgba(255, 94, 91, 0.06)',
      '--accent': '#FF5E5B',
      '--accent-2': '#FFB020',
      '--accent-3': '#8BE36B',
      '--accent-glow': 'rgba(255, 94, 91, 0.45)',
      '--map-fill': 'rgba(255, 94, 91, 0.04)',
      '--map-stroke': 'rgba(255, 94, 91, 0.3)',
      '--heat-0': 'rgba(255, 94, 91, 0.05)',
      '--shadow': '0 0 0 1px rgba(255,94,91,0.08) inset, 0 12px 32px rgba(0,0,0,0.6)',
      '--card-blur': 'none',
    }
  }
};

const FONTS = {
  'archivo':       { label: 'Geist + Archivo display · Event Stream', body: '"Geist", "Inter Tight", -apple-system, system-ui, sans-serif', mono: '"JetBrains Mono", ui-monospace, monospace', display: '"Archivo", "Geist", sans-serif' },
  'inter-tight':   { label: 'Inter Tight · JetBrains Mono', body: '"Inter Tight", -apple-system, system-ui, sans-serif', mono: '"JetBrains Mono", ui-monospace, monospace', display: '"Inter Tight", sans-serif' },
  'geist':         { label: 'Geist · Geist Mono', body: '"Geist", "Inter Tight", sans-serif', mono: '"Geist Mono", ui-monospace, monospace', display: '"Geist", sans-serif' },
  'space-grotesk': { label: 'Space Grotesk · IBM Plex Mono', body: '"Space Grotesk", -apple-system, sans-serif', mono: '"IBM Plex Mono", ui-monospace, monospace', display: '"Space Grotesk", sans-serif' },
  'host-grotesk':  { label: 'Host Grotesk · JetBrains Mono', body: '"Host Grotesk", "Inter Tight", sans-serif', mono: '"JetBrains Mono", ui-monospace, monospace', display: '"Host Grotesk", sans-serif' },
  'manrope':       { label: 'Manrope · JetBrains Mono', body: '"Manrope", -apple-system, sans-serif', mono: '"JetBrains Mono", ui-monospace, monospace', display: '"Manrope", sans-serif' },
  'dm-sans':       { label: 'DM Sans · DM Mono', body: '"DM Sans", -apple-system, sans-serif', mono: '"DM Mono", ui-monospace, monospace', display: '"DM Sans", sans-serif' },
  'jakarta':       { label: 'Plus Jakarta · IBM Plex Mono', body: '"Plus Jakarta Sans", sans-serif', mono: '"IBM Plex Mono", ui-monospace, monospace', display: '"Plus Jakarta Sans", sans-serif' },
  'onest':         { label: 'Onest · Departure Mono', body: '"Onest", -apple-system, sans-serif', mono: '"Departure Mono", ui-monospace, monospace', display: '"Onest", sans-serif' },
  'albert':        { label: 'Albert Sans · JetBrains Mono', body: '"Albert Sans", -apple-system, sans-serif', mono: '"JetBrains Mono", ui-monospace, monospace', display: '"Albert Sans", sans-serif' },
  'ibm-plex':      { label: 'IBM Plex Sans · IBM Plex Mono', body: '"IBM Plex Sans", -apple-system, sans-serif', mono: '"IBM Plex Mono", ui-monospace, monospace', display: '"IBM Plex Sans", sans-serif' },
  'public':        { label: 'Public Sans · Fragment Mono', body: '"Public Sans", -apple-system, sans-serif', mono: '"Fragment Mono", ui-monospace, monospace', display: '"Public Sans", sans-serif' },
};

// Event Stream signal red + brand-study companions
const ACCENTS = ['#FF5E5B', '#FFB020', '#8BE36B', '#6D8CFF', '#00D1FF', '#FFFFFF'];

// URL param overrides (used by exploration canvas iframes)
const urlParams = new URLSearchParams(window.location.search);
const URL_OVERRIDES = {};
['direction', 'accent', 'density', 'pattern', 'font'].forEach(k => {
  if (urlParams.has(k)) URL_OVERRIDES[k] = urlParams.get(k);
});
if (urlParams.get('sidebar') === 'collapsed') URL_OVERRIDES.sidebarCollapsed = true;
const EFFECTIVE_DEFAULTS = { ...TWEAK_DEFAULTS, ...URL_OVERRIDES };

function App() {
  const [t, setTweak] = useTweaks(EFFECTIVE_DEFAULTS);
  const [cmd, setCmd] = useState(false);
  const [drawer, setDrawer] = useState(null);
  const [proposals, setProposals] = useState(loadProposals);
  useEffect(() => { saveProposals(proposals); }, [proposals]);

  // Navigation history stack (browser-style back/forward)
  const [history, setHistory] = useState(['dash']);
  const [hIdx, setHIdx] = useState(0);
  const screen = history[hIdx];
  const setScreen = (next) => {
    if (next === screen) return;
    setHistory(h => {
      const trimmed = h.slice(0, hIdx + 1);
      return [...trimmed, next];
    });
    setHIdx(i => i + 1);
  };
  const onBack    = () => setHIdx(i => Math.max(0, i - 1));
  const onForward = () => setHIdx(i => Math.min(history.length - 1, i + 1));
  const canBack    = hIdx > 0;
  const canForward = hIdx < history.length - 1;

  // ⌘K hotkey
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCmd(c => !c);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const dir = DIRECTIONS[t.direction] || DIRECTIONS.eventstream;
  const font = FONTS[t.font] || FONTS['archivo'];

  const rootStyle = {
    ...dir.vars,
    '--accent': t.accent || dir.vars['--accent'],
    '--accent-glow': `color-mix(in oklch, ${t.accent || dir.vars['--accent']} 30%, transparent)`,
    '--font-body': font.body,
    '--font-mono': font.mono,
    '--font-display': font.display,
    '--card-pad': t.density === 'compact' ? '14px 16px' : t.density === 'spacious' ? '24px 26px' : '18px 20px',
    '--row-gap': t.density === 'compact' ? '10px' : t.density === 'spacious' ? '20px' : '14px',
  };

  return (
    <div className={`xc-root dir-${t.direction} dense-${t.density} pat-${t.pattern}`} style={rootStyle}>
      <Sidebar collapsed={t.sidebarCollapsed} onToggle={() => setTweak('sidebarCollapsed', !t.sidebarCollapsed)}
        screen={screen} setScreen={setScreen} dense={t.density}/>
      <main className="xc-main">
        <TopBar onCmd={() => setCmd(true)} team={D.team} screen={screen}
          setScreen={setScreen}
          onBack={onBack} onForward={onForward}
          canBack={canBack} canForward={canForward}
          history={history.slice(0, hIdx + 1)}/>
        <div className="xc-content">
          {screen === 'dash' && <DashboardScreen onOpen={setDrawer} density={t.density} proposals={proposals} setProposals={setProposals}/>}
          {screen === 'estimates' && <EstimatesScreen onOpen={setDrawer} density={t.density} proposals={proposals} setProposals={setProposals}/>}
          {screen === 'pipeline' && <PipelineScreen/>}
          {screen === 'takeoff' && <TakeoffScreen proposals={proposals}/>}
          {screen === 'pricing' && <PricingScreen/>}
          {screen === 'analytics' && <AnalyticsScreen/>}
          {screen === 'settings' && <SettingsScreen/>}
        </div>
      </main>

      <CommandPalette open={cmd} onClose={() => setCmd(false)}
        proposals={proposals}
        onOpenProposal={(p) => setDrawer(p)}
        setScreen={setScreen}/>
      <DetailDrawer proposal={drawer} onClose={() => setDrawer(null)}/>

      <TweaksPanel>
        <TweakSection label="Theme"/>
        <TweakRadio label="Mode" value={t.direction}
          options={[{value:'eventstream', label:'Dark'},{value:'light', label:'Light'},{value:'signal', label:'Signal'}]}
          onChange={v => setTweak('direction', v)}/>
        <TweakColor label="Accent" value={t.accent} options={ACCENTS}
          onChange={v => setTweak('accent', v)}/>
        <TweakRadio label="Density" value={t.density}
          options={['compact','comfy','spacious']}
          onChange={v => setTweak('density', v)}/>
        <TweakSelect label="Background" value={t.pattern}
          options={[{value:'grid',label:'Grid'},{value:'dot',label:'Dots'},{value:'blueprint',label:'Blueprint'},{value:'none',label:'None'}]}
          onChange={v => setTweak('pattern', v)}/>
        <TweakSection label="Typography"/>
        <TweakSelect label="Font pair" value={t.font}
          options={Object.keys(FONTS).map(k => ({ value: k, label: FONTS[k].label }))}
          onChange={v => setTweak('font', v)}/>
        <TweakSection label="Layout"/>
        <TweakToggle label="Sidebar collapsed" value={t.sidebarCollapsed}
          onChange={v => setTweak('sidebarCollapsed', v)}/>
      </TweaksPanel>
    </div>
  );
}

// ─── Screens ───────────────────────────────────────────────────────────────
function DashboardScreen({ onOpen, density, proposals, setProposals }) {
  const dash = useDashboardLayout();
  const kpisById = {
    'kpi-pipeline': { label: 'Pipeline (wtd)', value: 10240000, prefix: '$', suffix: '', delta: 8.4, deltaLabel: 'vs. last 30d', spark: D.spark(1) },
    'kpi-active':   { label: 'Active estimates', value: proposals.filter(p => !['won','lost'].includes(p.stage)).length, delta: 4.2, deltaLabel: '3 due this week', spark: D.spark(2) },
    'kpi-winrate':  { label: 'Win rate · QTD', value: 73, suffix: '%', delta: 6.1, deltaLabel: '24 wins / 31 bids', spark: D.spark(3) },
    'kpi-cycle':    { label: 'Avg. bid cycle', value: 4.6, suffix: 'd', decimals: 1, delta: -12.3, deltaLabel: '-1.4d MoM', spark: D.spark(4) },
  };
  const renderWidget = (w) => {
    if (w.id.startsWith('kpi-')) return <KpiCard {...kpisById[w.id]} density={density}/>;
    if (w.id === 'pipeline')    return <F.PipelineChart data={D.forecast}/>;
    if (w.id === 'activity')    return <F.ActivityFeed items={D.activity}/>;
    if (w.id === 'heatmap')     return <F.Heatmap data={D.heatmap}/>;
    if (w.id === 'winloss')     return <F.WinLoss data={D.winloss}/>;
    if (w.id === 'kanban')      return <F.Kanban proposals={proposals} setProposals={setProposals}/>;
    if (w.id === 'proposals')   return <F.ProposalsTable proposals={proposals} setProposals={setProposals} onOpen={onOpen} density={density}/>;
    return null;
  };
  return (
    <>
      <WidgetToolbar editing={dash.editing} setEditing={dash.setEditing}
        hidden={dash.hidden} layout={dash.layout}
        onShow={dash.onShow} onResetLayout={dash.onResetLayout}/>
      <WidgetGrid editing={dash.editing}>
        {dash.visible.map(w => (
          <WidgetFrame key={w.id} widget={w} editing={dash.editing}
            onDragStart={dash.onDragStart} onDragEnd={dash.onDragEnd}
            onDrop={dash.onDrop}
            isDragging={dash.drag === w.id}
            isOver={dash.over === w.id && dash.drag !== w.id}
            onHide={dash.onHide} onSpan={dash.onSpan}>
            {renderWidget(w)}
          </WidgetFrame>
        ))}
      </WidgetGrid>
    </>
  );
}

function EstimatesScreen({ onOpen, density, proposals, setProposals }) {
  return (
    <>
      <div className="xc-grid-12">
        <div className="span-12"><F.Kanban proposals={proposals} setProposals={setProposals}/></div>
      </div>
      <div className="xc-grid-12">
        <div className="span-12"><F.ProposalsTable proposals={proposals} setProposals={setProposals} onOpen={onOpen} density={density}/></div>
      </div>
    </>
  );
}

function PipelineScreen() {
  return (
    <>
      <div className="xc-grid-12">
        <div className="span-12"><F.PipelineChart data={D.forecast}/></div>
      </div>
      <div className="xc-grid-12">
        <div className="span-8"><F.Heatmap data={D.heatmap}/></div>
        <div className="span-4"><F.WinLoss data={D.winloss}/></div>
      </div>
    </>
  );
}

function TakeoffScreen({ proposals = D.proposals }) {
  return (
    <div className="xc-grid-12">
      <div className="span-12">
        <Card title="Takeoff Queue" sub="In progress sheets" scan>
          <div className="xc-takeoff-list">
            {proposals.filter(p => p.stage === 'takeoff').map(p => (
              <div key={p.id} className="xc-takeoff-row">
                <div>
                  <div className="xc-mono xc-muted">{p.id}</div>
                  <b>{p.name}</b>
                </div>
                <div className="xc-takeoff-prog">
                  <div className="xc-conf-bar"><span style={{ width: '64%', background: 'var(--accent)' }}/></div>
                  <span className="xc-mono">7 / 11 sheets</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function PricingScreen() {
  return (
    <div className="xc-grid-12">
      <div className="span-12"><F.MaterialsPanel materials={D.materials}/></div>
    </div>
  );
}

function AnalyticsScreen() {
  return (
    <>
      <div className="xc-grid-12">
        <div className="span-8"><F.PipelineChart data={D.forecast}/></div>
        <div className="span-4"><F.WinLoss data={D.winloss}/></div>
      </div>
      <div className="xc-grid-12">
        <div className="span-12"><F.Heatmap data={D.heatmap}/></div>
      </div>
    </>
  );
}

function TeamScreen() {
  return (
    <div className="xc-grid-12">
      <div className="span-12">
        <Card title="Team workload" scan>
          <div className="xc-team-list">
            {D.team.map(m => (
              <div key={m.id} className="xc-team-row">
                <span className="xc-avatar xc-avatar-lg" style={{ background: m.color }}>{m.initials}</span>
                <div className="xc-team-info">
                  <b>{m.name}</b>
                  <span className="xc-muted">{m.role}</span>
                </div>
                <div className="xc-team-load">
                  <span className="xc-mono">{m.load}%</span>
                  <div className="xc-conf-bar"><span style={{ width: m.load + '%', background: m.load > 85 ? '#ef4444' : 'var(--accent)' }}/></div>
                </div>
                <span className={`xc-status ${m.active ? 'xc-status-green' : 'xc-status-slate'}`}>
                  <span className="xc-status-dot"/>{m.active ? 'Online' : 'Away'}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function MapScreen() { return null; }

function SettingsScreen() {
  return (
    <div className="xc-grid-12">
      <div className="span-12">
        <Card title="Settings" sub="Workspace · XACT Fire Engineering"/>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
