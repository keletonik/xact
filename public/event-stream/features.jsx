// XACT — feature widgets
const { Card, Sparkline, Counter, StatusPill } = window.XACT_UI;
const ICN = window.XACT_ICONS;

// ─── Material price ticker (auto-scrolling marquee) ─────────────────────────
function PriceTicker({ materials }) {
  const items = [...materials, ...materials]; // duplicate for seamless loop
  return (
    <div className="xc-ticker">
      <div className="xc-ticker-lbl"><span className="xc-live-dot"/>LIVE · MATERIALS</div>
      <div className="xc-ticker-track">
        <div className="xc-ticker-inner">
          {items.map((m, i) => (
            <span key={i} className="xc-ticker-item">
              <span className="xc-ticker-sku">{m.sku}</span>
              <span className="xc-ticker-price">${m.price.toFixed(2)}<small>{m.unit}</small></span>
              <span className={`xc-ticker-delta ${m.delta > 0 ? 'up' : m.delta < 0 ? 'down' : 'flat'}`}>
                {m.delta > 0 ? '▲' : m.delta < 0 ? '▼' : '─'} {Math.abs(m.delta).toFixed(1)}%
              </span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Pipeline forecast — stacked area chart ─────────────────────────────────
function PipelineChart({ data }) {
  const W = 720, H = 220, P = 28;
  const max = Math.max(...data.map(d => d.pipe));
  const x = (i) => P + (i / (data.length - 1)) * (W - P * 2);
  const y = (v) => H - P - (v / max) * (H - P * 2);

  const series = ['pipe', 'bid', 'won'];
  const colors = { pipe: 'var(--accent)', bid: 'var(--accent-2)', won: 'var(--accent-3)' };
  const paths = {};
  series.forEach(s => {
    const pts = data.map((d, i) => [x(i), y(d[s])]);
    paths[s] = pts.map(([px, py], i) => (i === 0 ? `M${px},${py}` : `L${px},${py}`)).join(' ');
    paths[s + '_area'] = paths[s] + ` L${x(data.length - 1)},${H - P} L${x(0)},${H - P} Z`;
  });

  const [hover, setHover] = useState(null);
  const ref = useRef(null);

  return (
    <Card title="Pipeline Forecast" sub="Weighted bookings · next 12 weeks" scan
      actions={<>
        <button className="xc-chip active">Pipeline</button>
        <button className="xc-chip">Booked</button>
        <button className="xc-chip">Vs goal</button>
      </>}>
      <div className="xc-chart-legend">
        <span className="xc-legend"><i style={{ background: 'var(--accent)' }}/>Pipeline</span>
        <span className="xc-legend"><i style={{ background: 'var(--accent-2)' }}/>Bid</span>
        <span className="xc-legend"><i style={{ background: 'var(--accent-3)' }}/>Won</span>
        <span className="xc-chart-stat">Wtd ARR <b className="xc-mono">$10.24M</b></span>
      </div>
      <svg ref={ref} viewBox={`0 0 ${W} ${H}`} className="xc-chart" preserveAspectRatio="none"
        onMouseMove={(e) => {
          const r = ref.current.getBoundingClientRect();
          const px = ((e.clientX - r.left) / r.width) * W;
          const idx = Math.round(((px - P) / (W - P * 2)) * (data.length - 1));
          if (idx >= 0 && idx < data.length) setHover(idx);
        }}
        onMouseLeave={() => setHover(null)}>
        {/* grid */}
        {[0, 0.25, 0.5, 0.75, 1].map((p, i) => (
          <line key={i} x1={P} x2={W - P} y1={P + p * (H - P * 2)} y2={P + p * (H - P * 2)}
            stroke="var(--grid)" strokeDasharray="2 4" />
        ))}
        {/* y labels */}
        {[0, 0.5, 1].map((p, i) => (
          <text key={i} x={6} y={H - P - p * (H - P * 2) + 4} className="xc-axis">
            ${Math.round(max * p / 100) * 100 / 10}M
          </text>
        ))}
        {/* areas */}
        <path d={paths.pipe_area} fill="var(--accent)" opacity="0.10" />
        <path d={paths.bid_area} fill="var(--accent-2)" opacity="0.14" />
        <path d={paths.won_area} fill="var(--accent-3)" opacity="0.20" />
        {/* lines */}
        <path d={paths.pipe} fill="none" stroke="var(--accent)" strokeWidth="1.8" />
        <path d={paths.bid} fill="none" stroke="var(--accent-2)" strokeWidth="1.8" />
        <path d={paths.won} fill="none" stroke="var(--accent-3)" strokeWidth="1.8" />
        {/* x labels */}
        {data.map((d, i) => i % 2 === 0 && (
          <text key={i} x={x(i)} y={H - 8} className="xc-axis" textAnchor="middle">{d.w}</text>
        ))}
        {/* hover */}
        {hover != null && (
          <g>
            <line x1={x(hover)} x2={x(hover)} y1={P} y2={H - P} stroke="var(--accent)" strokeDasharray="2 3" opacity="0.6"/>
            <circle cx={x(hover)} cy={y(data[hover].pipe)} r="4" fill="var(--accent)"/>
            <circle cx={x(hover)} cy={y(data[hover].bid)} r="4" fill="var(--accent-2)"/>
            <circle cx={x(hover)} cy={y(data[hover].won)} r="4" fill="var(--accent-3)"/>
            <g transform={`translate(${Math.min(W - 130, x(hover) + 10)}, ${P + 6})`}>
              <rect width="120" height="64" rx="6" fill="var(--surface-2)" stroke="var(--border)"/>
              <text x="10" y="18" className="xc-tt-lbl">{data[hover].w}</text>
              <text x="10" y="34" className="xc-tt-row" fill="var(--accent)">Pipe ${(data[hover].pipe/1000).toFixed(2)}M</text>
              <text x="10" y="48" className="xc-tt-row" fill="var(--accent-2)">Bid  ${(data[hover].bid/1000).toFixed(2)}M</text>
              <text x="10" y="60" className="xc-tt-row" fill="var(--accent-3)">Won  ${(data[hover].won/1000).toFixed(2)}M</text>
            </g>
          </g>
        )}
      </svg>
    </Card>
  );
}

// ─── 3D building model widget (CSS 3D rotating) ─────────────────────────────
function BuildingViewer({ proposal }) {
  const [rotY, setRotY] = useState(28);
  const [rotX, setRotX] = useState(-18);
  const [auto, setAuto] = useState(true);
  const draggingRef = useRef(null);

  useEffect(() => {
    if (!auto) return;
    let raf;
    const tick = () => { setRotY(r => r + 0.18); raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [auto]);

  const onDown = (e) => {
    setAuto(false);
    draggingRef.current = { x: e.clientX, y: e.clientY, rotX, rotY };
  };
  const onMove = (e) => {
    if (!draggingRef.current) return;
    const dx = e.clientX - draggingRef.current.x;
    const dy = e.clientY - draggingRef.current.y;
    setRotY(draggingRef.current.rotY + dx * 0.5);
    setRotX(Math.max(-60, Math.min(15, draggingRef.current.rotX - dy * 0.4)));
  };
  const onUp = () => { draggingRef.current = null; };

  // 8 floors stacked
  const floors = Array.from({ length: 8 }, (_, i) => i);
  return (
    <Card title="Hydraulic Model" sub={proposal.name} scan
      actions={<button className="xc-chip" onClick={() => setAuto(a => !a)}>{auto ? 'Pause' : 'Rotate'}</button>}>
      <div className="xc-3d-wrap" onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onUp}>
        <div className="xc-3d-grid"/>
        <div className="xc-3d-scene">
          <div className="xc-3d-cube" style={{ transform: `rotateX(${rotX}deg) rotateY(${rotY}deg)` }}>
            {floors.map(f => (
              <div key={f} className="xc-3d-floor" style={{ transform: `translateY(${(f - 4) * -18}px)`, opacity: 0.55 + f * 0.05 }}>
                <div className="xc-3d-face xc-3d-front"/>
                <div className="xc-3d-face xc-3d-back"/>
                <div className="xc-3d-face xc-3d-right"/>
                <div className="xc-3d-face xc-3d-left"/>
                <div className="xc-3d-face xc-3d-top"/>
                <div className="xc-3d-face xc-3d-bottom"/>
                {/* sprinkler dots */}
                {[0, 1, 2, 3].map(d => (
                  <span key={d} className="xc-3d-head" style={{
                    transform: `translate3d(${[-30, 30, 30, -30][d]}px, 0, ${[-20, -20, 20, 20][d]}px)`
                  }}/>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="xc-3d-readout">
          <div><span>Heads</span><b className="xc-mono">{proposal.heads.toLocaleString()}</b></div>
          <div><span>K-factor</span><b className="xc-mono">8.0</b></div>
          <div><span>Demand</span><b className="xc-mono">412 GPM</b></div>
          <div><span>Residual</span><b className="xc-mono">68 PSI</b></div>
        </div>
      </div>
    </Card>
  );
}

// ─── Kanban (drag to reorder estimates between columns) ─────────────────────
function Kanban({ proposals, setProposals }) {
  const cols = [
    { id: 'design', label: 'Design', tone: 'slate' },
    { id: 'takeoff', label: 'Takeoff', tone: 'amber' },
    { id: 'pricing', label: 'Pricing', tone: 'violet' },
    { id: 'bid', label: 'Submitted', tone: 'blue' },
    { id: 'won', label: 'Won', tone: 'green' },
  ];
  // If a setter is provided, lift state up; otherwise keep local
  const [localItems, setLocalItems] = useState(proposals);
  const items = setProposals ? proposals : localItems;
  const setItems = setProposals
    ? (updater) => setProposals(prev => typeof updater === 'function' ? updater(prev) : updater)
    : setLocalItems;
  const [drag, setDrag] = useState(null);
  const [over, setOver] = useState(null);

  const move = (id, target) => setItems(prev => prev.map(p => p.id === id ? { ...p, stage: target } : p));

  return (
    <Card title="Active Estimates" sub="Drag cards across stages" scan
      actions={<>
        <button className="xc-chip">All teams</button>
        <button className="xc-chip">This week</button>
        <button className="xc-chip active">My pipeline</button>
      </>}>
      <div className="xc-kanban">
        {cols.filter(c => c.id !== 'won' || true).map(col => {
          const colItems = items.filter(p => p.stage === col.id);
          const sum = colItems.reduce((s, p) => s + p.value, 0);
          return (
            <div key={col.id} className={`xc-kan-col ${over === col.id ? 'over' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setOver(col.id); }}
              onDragLeave={() => setOver(null)}
              onDrop={(e) => { e.preventDefault(); drag && move(drag, col.id); setDrag(null); setOver(null); }}>
              <div className="xc-kan-hd">
                <div>
                  <span className={`xc-kan-dot xc-tone-${col.tone}`}/>
                  <b>{col.label}</b>
                  <span className="xc-kan-count">{colItems.length}</span>
                </div>
                <span className="xc-mono xc-kan-sum">${(sum / 1000).toFixed(0)}K</span>
              </div>
              <div className="xc-kan-list">
                {colItems.map(p => (
                  <div key={p.id} className="xc-kan-card" draggable
                    onDragStart={() => setDrag(p.id)}
                    onDragEnd={() => { setDrag(null); setOver(null); }}>
                    <div className="xc-kan-row">
                      <span className="xc-mono xc-kan-id">{p.id}</span>
                      <span className={`xc-risk xc-risk-${p.risk}`}>{p.risk.toUpperCase()}</span>
                    </div>
                    <div className="xc-kan-name">{p.name}</div>
                    <div className="xc-kan-meta">
                      <span>{p.type}</span>
                    </div>
                    <div className="xc-kan-foot">
                      <span className="xc-mono xc-kan-val">${(p.value / 1000).toFixed(0)}K</span>
                      <div className="xc-kan-conf">
                        <span className="xc-conf-bar"><span style={{ width: `${p.confidence}%` }}/></span>
                        <span className="xc-mono">{p.confidence}%</span>
                      </div>
                    </div>
                  </div>
                ))}
                {colItems.length === 0 && <div className="xc-kan-empty">— empty —</div>}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

// ─── Activity feed ──────────────────────────────────────────────────────────
function ActivityFeed({ items }) {
  const kindMap = { price: '#fbbf24', risk: '#ef4444', submit: '#22d3ee', system: '#a78bfa', calc: '#4ade80', open: '#94a3b8', win: '#4ade80', takeoff: '#ff6b35' };
  return (
    <Card title="Activity" sub="Live" scan
      actions={<button className="xc-chip active">All</button>}>
      <div className="xc-feed">
        {items.map((it, i) => (
          <div key={i} className="xc-feed-row">
            <span className="xc-feed-dot" style={{ background: kindMap[it.kind] }}/>
            <div className="xc-feed-body">
              <div className="xc-feed-line"><b>{it.who}</b> {it.what} <a className="xc-feed-link">{it.target}</a></div>
              <div className="xc-feed-time">{it.t} ago</div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ─── US Map with job site markers ───────────────────────────────────────────
function JobMap({ sites }) {
  // Simple flat projection of CONUS
  const project = (lat, lng) => {
    const x = ((lng + 125) / 60) * 100; // 125W → 65W
    const y = ((50 - lat) / 25) * 100;  // 50N → 25N
    return [x, y];
  };
  const [hover, setHover] = useState(null);
  const toneFor = (s) => ({
    design: '#94a3b8', takeoff: '#fbbf24', pricing: '#a78bfa', bid: '#22d3ee', won: '#4ade80'
  })[s] || '#94a3b8';

  return (
    <Card title="Active Sites" sub={`${sites.length} active across 8 states`} scan
      actions={<button className="xc-chip">Filter</button>}>
      <div className="xc-map">
        <svg viewBox="0 0 100 60" className="xc-map-svg" preserveAspectRatio="none">
          {/* Stylized CONUS outline */}
          <path d="M3,18 L8,12 L20,8 L35,7 L48,9 L62,10 L75,12 L86,16 L92,22 L95,30 L93,40 L86,46 L75,50 L60,52 L48,53 L35,52 L22,49 L12,44 L5,36 L2,28 Z"
            fill="var(--map-fill)" stroke="var(--map-stroke)" strokeWidth="0.3"/>
          {/* Grid */}
          {[20, 40, 60, 80].map(v => <line key={'v'+v} x1={v} y1="0" x2={v} y2="60" stroke="var(--grid)" strokeWidth="0.15"/>)}
          {[15, 30, 45].map(v => <line key={'h'+v} x1="0" y1={v} x2="100" y2={v} stroke="var(--grid)" strokeWidth="0.15"/>)}
          {/* sites */}
          {sites.map(s => {
            const [x, y] = project(s.lat, s.lng);
            const r = Math.max(0.8, Math.sqrt(s.value) / 12);
            const tone = toneFor(s.status);
            return (
              <g key={s.id} onMouseEnter={() => setHover(s.id)} onMouseLeave={() => setHover(null)}>
                <circle cx={x} cy={y} r={r * 2.2} fill={tone} opacity="0.15">
                  <animate attributeName="r" values={`${r*2};${r*3.5};${r*2}`} dur="2.4s" repeatCount="indefinite"/>
                  <animate attributeName="opacity" values="0.25;0;0.25" dur="2.4s" repeatCount="indefinite"/>
                </circle>
                <circle cx={x} cy={y} r={r} fill={tone}/>
                {hover === s.id && (
                  <g>
                    <rect x={x + 2} y={y - 8} width="22" height="10" rx="1.2" fill="var(--surface-2)" stroke="var(--border)" strokeWidth="0.2"/>
                    <text x={x + 3} y={y - 4} className="xc-map-tt">{s.label}</text>
                    <text x={x + 3} y={y - 0.5} className="xc-map-tt2">${s.value}K · {s.id}</text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
        <div className="xc-map-legend">
          {['design','takeoff','pricing','bid','won'].map(s => (
            <span key={s} className="xc-legend"><i style={{ background: toneFor(s) }}/>{s}</span>
          ))}
        </div>
      </div>
    </Card>
  );
}

// ─── Activity heatmap (26 weeks × 7 days) ───────────────────────────────────
function Heatmap({ data }) {
  const max = Math.max(...data.flat());
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  return (
    <Card title="Estimating Cadence" sub="Tickets closed · last 26 weeks" scan
      actions={<>
        <button className="xc-chip active">Closed</button>
        <button className="xc-chip">Opened</button>
      </>}>
      <div className="xc-heat-wrap">
        <div className="xc-heat-days">
          {days.map((d, i) => <span key={i} className="xc-heat-day">{i % 2 === 1 ? d : ''}</span>)}
        </div>
        <div className="xc-heat-grid">
          {data.map((week, w) => (
            <div key={w} className="xc-heat-col">
              {week.map((v, d) => {
                const intensity = v / max;
                return (
                  <span key={d} className="xc-heat-cell"
                    style={{
                      background: intensity === 0 ? 'var(--heat-0)' :
                        `color-mix(in oklch, var(--accent) ${15 + intensity * 85}%, transparent)`
                    }}
                    title={`${v} closed`}/>
                );
              })}
            </div>
          ))}
        </div>
        <div className="xc-heat-legend">
          <span>Less</span>
          {[0, 0.25, 0.5, 0.75, 1].map((p, i) => (
            <span key={i} className="xc-heat-cell"
              style={{ background: p === 0 ? 'var(--heat-0)' : `color-mix(in oklch, var(--accent) ${15 + p * 85}%, transparent)` }}/>
          ))}
          <span>More</span>
        </div>
      </div>
    </Card>
  );
}

// ─── Win/loss bars ──────────────────────────────────────────────────────────
function WinLoss({ data }) {
  const max = Math.max(...data.map(d => d.won + d.lost));
  const winRate = (data.reduce((s, d) => s + d.won, 0) / data.reduce((s, d) => s + d.won + d.lost, 0) * 100).toFixed(0);
  return (
    <Card title="Win Rate" sub="Last 6 quarters" scan>
      <div className="xc-wl-stat">
        <div className="xc-wl-big"><Counter value={parseInt(winRate)} suffix="%"/></div>
        <div className="xc-wl-sub">↗ +6pp vs. trailing year</div>
      </div>
      <div className="xc-wl-bars">
        {data.map(d => {
          const total = d.won + d.lost;
          const wp = (d.won / total) * 100;
          return (
            <div key={d.q} className="xc-wl-row">
              <span className="xc-wl-q">{d.q}</span>
              <div className="xc-wl-bar">
                <span className="xc-wl-won" style={{ width: `${wp}%` }}/>
                <span className="xc-wl-lost" style={{ width: `${100 - wp}%` }}/>
              </div>
              <span className="xc-mono xc-wl-n">{d.won}/{total}</span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

// ─── Excel-style proposals table ────────────────────────────────────────────
const { EditableCell, ExportImportMenu } = window.XACT_EDIT;
const STATUS_VALUES = ['Drafting', 'In Review', 'Pricing', 'Submitted', 'Won', 'Lost'];
const STAGE_VALUES = ['design', 'takeoff', 'pricing', 'bid', 'won', 'lost'];
const RISK_VALUES = ['low', 'med', 'high'];

function ProposalsTable({ proposals, setProposals, onOpen, density }) {
  const [sort, setSort] = useState({ k: 'updated', dir: 'desc' });
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({}); // { col: Set([...values]) }
  const [openFilter, setOpenFilter] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [editCell, setEditCell] = useState(null); // { id, k }
  const [colWidths, setColWidths] = useState(() => {
    try {
      const raw = localStorage.getItem('xact_table_col_widths_v1');
      if (raw) return JSON.parse(raw);
    } catch {}
    return null; // initialised from `cols` after first render
  });
  const [colOrder, setColOrder] = useState(() => {
    try {
      const raw = localStorage.getItem('xact_table_col_order_v1');
      if (raw) return JSON.parse(raw);
    } catch {}
    return null;
  });
  const [resizing, setResizing] = useState(null); // { k, startX, startW }
  const [dragCol, setDragCol] = useState(null);
  const [overCol, setOverCol] = useState(null);
  const filterRef = useRef(null);

  // Fallback: support read-only mode if no setter provided
  const [localProposals, setLocalProposals] = useState(proposals);
  const items = setProposals ? proposals : localProposals;
  const setItems = setProposals
    ? (updater) => setProposals(prev => typeof updater === 'function' ? updater(prev) : updater)
    : setLocalProposals;

  useEffect(() => {
    const onDoc = (e) => {
      if (!filterRef.current?.contains(e.target)) setOpenFilter(null);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const cols = [
    { k: 'id', label: 'ID', w: 88, kind: 'text', mono: true, freeze: true, readonly: true },
    { k: 'name', label: 'Project', w: 240, kind: 'text' },
    { k: 'client', label: 'Client', w: 130, kind: 'enum' },
    { k: 'type', label: 'System Type', w: 170, kind: 'enum' },
    { k: 'value', label: 'Value', w: 100, kind: 'num', mono: true, align: 'r', fmt: (v) => '$' + (Number(v)/1000).toFixed(0) + 'K' },
    { k: 'sqft', label: 'SQFT', w: 80, kind: 'num', mono: true, align: 'r', fmt: (v) => (Number(v)/1000).toFixed(0) + 'k' },
    { k: 'heads', label: 'Heads', w: 80, kind: 'num', mono: true, align: 'r', fmt: (v) => Number(v).toLocaleString() },
    { k: 'status', label: 'Status', w: 130, kind: 'enum', enumValues: STATUS_VALUES },
    { k: 'confidence', label: 'Conf', w: 100, kind: 'num', align: 'r' },
    { k: 'owner', label: 'Owner', w: 130, kind: 'enum' },
    { k: 'city', label: 'Location', w: 150, kind: 'enum' },
    { k: 'risk', label: 'Risk', w: 80, kind: 'enum', enumValues: RISK_VALUES },
    { k: 'stage', label: 'Stage', w: 100, kind: 'enum', enumValues: STAGE_VALUES, hideExport: false },
    { k: 'updated', label: 'Updated', w: 100, kind: 'text', mono: true },
  ];

  // Resolve effective column list (custom order + custom widths from state)
  const colsByKey = Object.fromEntries(cols.map(c => [c.k, c]));
  const orderedKeys = (colOrder && colOrder.every(k => colsByKey[k])
    && cols.every(c => colOrder.includes(c.k)))
    ? colOrder
    : cols.map(c => c.k);
  const effectiveCols = orderedKeys.map(k => ({
    ...colsByKey[k],
    w: (colWidths && colWidths[k]) || colsByKey[k].w,
  }));

  // Column resize — drag the handle on the right edge of a header
  const startResize = (k, e) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startW = (colWidths && colWidths[k]) || colsByKey[k].w;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    const onMove = (ev) => {
      const next = Math.max(48, Math.min(640, startW + (ev.clientX - startX)));
      setColWidths(prev => ({ ...(prev || {}), [k]: next }));
    };
    const onUp = () => {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      // persist
      setColWidths(prev => {
        try { localStorage.setItem('xact_table_col_widths_v1', JSON.stringify(prev || {})); } catch {}
        return prev;
      });
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  // Column reorder — drag header label to new position
  const onColDragStart = (k, e) => { setDragCol(k); e.dataTransfer.effectAllowed = 'move'; };
  const onColDragOver  = (k, e) => { if (dragCol && dragCol !== k) { e.preventDefault(); setOverCol(k); } };
  const onColDrop      = (k) => {
    if (!dragCol || dragCol === k) { setDragCol(null); setOverCol(null); return; }
    const from = orderedKeys.indexOf(dragCol);
    const to   = orderedKeys.indexOf(k);
    if (from < 0 || to < 0) { setDragCol(null); setOverCol(null); return; }
    const next = [...orderedKeys];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setColOrder(next);
    try { localStorage.setItem('xact_table_col_order_v1', JSON.stringify(next)); } catch {}
    setDragCol(null); setOverCol(null);
  };
  const resetTableLayout = () => {
    setColWidths(null); setColOrder(null);
    try {
      localStorage.removeItem('xact_table_col_widths_v1');
      localStorage.removeItem('xact_table_col_order_v1');
    } catch {}
  };

  // Per-cell display renderer (read-only view)
  const renderDisplay = (col, p) => {
    const v = p[col.k];
    if (col.k === 'id')   return <span className="xc-mono">{v}</span>;
    if (col.k === 'name') return <div className="xc-xl-name"><b>{v}</b></div>;
    if (col.k === 'type') return <span className="xc-tag">{v}</span>;
    if (col.k === 'status') return <StatusPill status={v}/>;
    if (col.k === 'confidence') return (
      <div className="xc-xl-conf">
        <span><span style={{ width: `${Math.max(0, Math.min(100, Number(v)||0))}%` }}/></span>
        <span className="xc-mono">{v}</span>
      </div>
    );
    if (col.k === 'risk') return <span className={`xc-risk xc-risk-${v}`}>{String(v).toUpperCase()}</span>;
    if (col.k === 'owner') return <span className="xc-tag">{v}</span>;
    if (col.k === 'stage') return <span className="xc-mono xc-muted" style={{textTransform:'uppercase',letterSpacing:'.06em',fontSize:10}}>{v}</span>;
    return col.fmt ? col.fmt(v) : v;
  };

  // mutations
  const updateCell = (id, k, v) => {
    setItems(prev => prev.map(p => p.id === id ? { ...p, [k]: v, updated: 'just now' } : p));
  };
  const deleteRow = (id) => {
    setItems(prev => prev.filter(p => p.id !== id));
    if (selectedRow === id) setSelectedRow(null);
  };
  const duplicateRow = (id) => {
    setItems(prev => {
      const idx = prev.findIndex(p => p.id === id);
      if (idx < 0) return prev;
      const src = prev[idx];
      const newId = nextId(prev);
      const copy = { ...src, id: newId, name: src.name + ' (copy)', status: 'Drafting', stage: 'design', confidence: 50, updated: 'just now' };
      const next = [...prev]; next.splice(idx + 1, 0, copy); return next;
    });
  };
  const nextId = (rows) => {
    const max = rows.reduce((m, p) => {
      const n = parseInt(String(p.id).replace(/[^0-9]/g, ''), 10);
      return isNaN(n) ? m : Math.max(m, n);
    }, 2400);
    return `XCT-${max + 1}`;
  };
  const addRow = () => {
    setItems(prev => {
      const row = {
        id: nextId(prev), name: 'New Project', client: 'TBD', type: 'NFPA-13 Wet System',
        value: 250000, status: 'Drafting', stage: 'design', confidence: 50,
        due: new Date(Date.now() + 21*24*60*60*1000).toISOString().slice(0,10),
        sqft: 50000, owner: 'Team A', risk: 'low', city: 'TBD', updated: 'just now', heads: 500,
      };
      // start editing the project name
      setTimeout(() => setEditCell({ id: row.id, k: 'name' }), 0);
      setSelectedRow(row.id);
      return [row, ...prev];
    });
  };

  // import handler
  const onImport = (rows, mode) => {
    if (mode === 'replace') {
      setItems(rows.map(normalizeRow));
    } else if (mode === 'merge') {
      setItems(prev => {
        const map = new Map(prev.map(p => [p.id, p]));
        rows.forEach(r => {
          const n = normalizeRow(r);
          if (n.id && map.has(n.id)) map.set(n.id, { ...map.get(n.id), ...n, updated: 'just now' });
          else if (n.id) map.set(n.id, n);
        });
        return [...map.values()];
      });
    } else {
      setItems(prev => {
        let maxN = prev.reduce((m, p) => Math.max(m, parseInt(String(p.id).replace(/[^0-9]/g,''),10) || 0), 2400);
        const added = rows.map(r => {
          const n = normalizeRow(r);
          if (!n.id) n.id = `XCT-${++maxN}`;
          return n;
        });
        return [...prev, ...added];
      });
    }
  };
  const normalizeRow = (r) => {
    const out = { ...r };
    ['value','sqft','heads','confidence'].forEach(k => {
      if (out[k] != null) {
        const n = typeof out[k] === 'number' ? out[k] : parseFloat(String(out[k]).replace(/[^0-9.\-]/g,''));
        out[k] = isNaN(n) ? 0 : n;
      }
    });
    if (!out.updated) out.updated = 'imported';
    return out;
  };

  // distinct values per enum column for filter popovers
  const distinct = (col) => {
    const colDef = cols.find(c => c.k === col);
    if (colDef?.enumValues) return colDef.enumValues;
    return [...new Set(items.map(p => p[col]))].sort();
  };

  // apply
  let rows = items.filter(p => {
    if (search) {
      const s = search.toLowerCase();
      if (!Object.values(p).some(v => String(v).toLowerCase().includes(s))) return false;
    }
    for (const k of Object.keys(filters)) {
      const set = filters[k];
      if (set && set.size > 0 && !set.has(p[k])) return false;
    }
    return true;
  });
  rows = [...rows].sort((a, b) => {
    const av = a[sort.k], bv = b[sort.k];
    if (av === bv) return 0;
    const cmp = typeof av === 'number' ? av - bv : String(av).localeCompare(String(bv));
    return sort.dir === 'asc' ? cmp : -cmp;
  });

  const toggleSort = (k) => setSort(s => ({ k, dir: s.k === k && s.dir === 'asc' ? 'desc' : 'asc' }));
  const toggleFilter = (col, val) => setFilters(f => {
    const cur = new Set(f[col] || []);
    cur.has(val) ? cur.delete(val) : cur.add(val);
    return { ...f, [col]: cur };
  });
  const clearFilter = (col) => setFilters(f => { const n = { ...f }; delete n[col]; return n; });

  const activeFilters = Object.keys(filters).filter(k => filters[k]?.size > 0);

  // footer aggregates
  const sumVal = rows.reduce((s, p) => s + Number(p.value || 0), 0);
  const sumSqft = rows.reduce((s, p) => s + Number(p.sqft || 0), 0);
  const sumHeads = rows.reduce((s, p) => s + Number(p.heads || 0), 0);
  const avgConf = Math.round(rows.reduce((s, p) => s + Number(p.confidence || 0), 0) / (rows.length || 1));

  const rowPad = density === 'compact' ? '5px 10px' : density === 'spacious' ? '14px 14px' : '8px 12px';

  return (
    <Card title="Proposals" sub={`${rows.length} of ${items.length} · ${activeFilters.length ? activeFilters.length + ' filters' : 'click any cell to edit'}`} scan
      actions={<>
        <div className="xc-xl-search">
          {ICN.search}
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Find in sheet…"/>
          {search && <button onClick={() => setSearch('')} className="xc-xl-clear">×</button>}
        </div>
        {activeFilters.length > 0 && (
          <button className="xc-chip xc-chip-warn" onClick={() => setFilters({})}>
            Clear {activeFilters.length} filter{activeFilters.length > 1 ? 's' : ''}
          </button>
        )}
        <button className="xc-chip" onClick={addRow} title="Add new row">
          <svg width="10" height="10" viewBox="0 0 10 10"><path d="M5 1v8M1 5h8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
          New row
        </button>
        <ExportImportMenu
          rows={rows.length ? rows : items}
          cols={effectiveCols.filter(c => c.k !== 'stage' || true)}
          filenameBase="xact-proposals"
          onImport={onImport}/>
        {(colWidths || colOrder) && (
          <button className="xc-chip" onClick={resetTableLayout} title="Reset column widths and order">
            <svg width="10" height="10" viewBox="0 0 12 12"><path d="M2 6a4 4 0 117 2.8M9 4v3H6" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Reset layout
          </button>
        )}
      </>}>
      <div className="xc-xl-wrap" ref={filterRef}>
        <table className="xc-xl-table" style={{ '--row-pad': rowPad }}>
          <colgroup>
            {effectiveCols.map(c => <col key={c.k} style={{ width: c.w }}/>)}
            <col style={{ width: 40 }}/>
          </colgroup>
          <thead>
            <tr>
              {effectiveCols.map(c => {
                const isActive = filters[c.k]?.size > 0;
                const isSort = sort.k === c.k;
                const isDraggingMe = dragCol === c.k;
                const isOverMe = overCol === c.k && dragCol && dragCol !== c.k;
                return (
                  <th key={c.k}
                    className={`${c.align === 'r' ? 'r' : ''} ${c.freeze ? 'frz' : ''} ${isDraggingMe ? 'dragging' : ''} ${isOverMe ? 'drop-over' : ''}`}
                    onDragOver={(e) => onColDragOver(c.k, e)}
                    onDrop={() => onColDrop(c.k)}
                    onDragLeave={() => overCol === c.k && setOverCol(null)}>
                    <div className="xc-xl-hd"
                      draggable={!c.freeze}
                      onDragStart={(e) => onColDragStart(c.k, e)}
                      onDragEnd={() => { setDragCol(null); setOverCol(null); }}>
                      <button className="xc-xl-sort" onClick={() => toggleSort(c.k)}>
                        <span>{c.label}</span>
                        {isSort && <span className="xc-xl-arrow">{sort.dir === 'asc' ? '▲' : '▼'}</span>}
                      </button>
                      {c.kind === 'enum' && (
                        <button className={`xc-xl-filter ${isActive ? 'active' : ''}`}
                          onClick={(e) => { e.stopPropagation(); setOpenFilter(openFilter === c.k ? null : c.k); }}>
                          <svg width="9" height="9" viewBox="0 0 10 10"><path d="M1 2h8l-3 4v3l-2 .5V6L1 2z" fill="currentColor"/></svg>
                        </button>
                      )}
                    </div>
                    {/* drag handle for resizing */}
                    <span className={`xc-xl-resize ${resizing === c.k ? 'active' : ''}`}
                      onMouseDown={(e) => startResize(c.k, e)}
                      title="Drag to resize column"/>
                    {openFilter === c.k && (
                      <div className="xc-xl-pop" onClick={e => e.stopPropagation()}>
                        <div className="xc-xl-pop-hd">
                          <span>Filter · {c.label}</span>
                          {isActive && <button onClick={() => clearFilter(c.k)}>Clear</button>}
                        </div>
                        <div className="xc-xl-pop-list">
                          {distinct(c.k).map(v => {
                            const checked = filters[c.k]?.has(v);
                            return (
                              <label key={v} className="xc-xl-pop-row">
                                <input type="checkbox" checked={!!checked} onChange={() => toggleFilter(c.k, v)}/>
                                <span>{v}</span>
                                <small>{items.filter(p => p[c.k] === v).length}</small>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </th>
                );
              })}
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p, ri) => (
              <tr key={p.id}
                className={`${ri % 2 ? 'band' : ''} ${selectedRow === p.id ? 'sel' : ''}`}
                onClick={() => setSelectedRow(p.id)}>
                {effectiveCols.map(c => {
                  const isEditing = editCell?.id === p.id && editCell?.k === c.k;
                  return (
                    <td key={c.k}
                      className={`${c.align === 'r' ? 'r' : ''} ${c.mono ? 'xc-mono' : ''} ${c.freeze ? 'frz' : ''} ${isEditing ? 'editing' : ''} ${c.readonly ? 'readonly' : ''}`}
                      onClick={(e) => {
                        if (c.readonly || isEditing) return;
                        if (selectedRow === p.id) {
                          e.stopPropagation();
                          setEditCell({ id: p.id, k: c.k });
                        }
                      }}>
                      <EditableCell
                        value={p[c.k]} col={c} row={p}
                        distinct={c.kind === 'enum' ? distinct(c.k) : null}
                        editing={isEditing}
                        onStartEdit={() => setEditCell({ id: p.id, k: c.k })}
                        onEndEdit={() => setEditCell(null)}
                        onChange={(v) => updateCell(p.id, c.k, v)}
                        render={(val) => renderDisplay(c, p)}/>
                    </td>
                  );
                })}
                <td className="xc-xl-end">
                  <div className="xc-row-actions">
                    <button className="xc-icon-btn xc-row-btn" title="Duplicate"
                      onClick={(e) => { e.stopPropagation(); duplicateRow(p.id); }}>
                      <svg width="12" height="12" viewBox="0 0 12 12"><path d="M3 3h6v6H3zM5 1h6v6" fill="none" stroke="currentColor" strokeWidth="1.3"/></svg>
                    </button>
                    <button className="xc-icon-btn xc-row-btn xc-row-btn-danger" title="Delete row"
                      onClick={(e) => { e.stopPropagation(); deleteRow(p.id); }}>
                      <svg width="12" height="12" viewBox="0 0 12 12"><path d="M2 3h8M4.5 3V2h3v1M3.5 3l.5 7h4l.5-7" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </button>
                    <button className="xc-icon-btn xc-row-btn" title="Open details"
                      onClick={(e) => { e.stopPropagation(); onOpen(p); }}>
                      {ICN.arrow}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={effectiveCols.length + 1} className="xc-xl-empty">No rows match filters · <button className="xc-link" onClick={() => { setFilters({}); setSearch(''); }}>clear all</button></td></tr>
            )}
          </tbody>
          <tfoot>
            <tr>
              {effectiveCols.map((c, idx) => {
                if (c.k === 'value')      return <td key={c.k} className="r xc-mono">${(sumVal/1000000).toFixed(2)}M</td>;
                if (c.k === 'sqft')       return <td key={c.k} className="r xc-mono">{(sumSqft/1000).toFixed(0)}k</td>;
                if (c.k === 'heads')      return <td key={c.k} className="r xc-mono">{sumHeads.toLocaleString()}</td>;
                if (c.k === 'confidence') return <td key={c.k} className="r xc-mono">avg {avgConf}</td>;
                if (idx === 0)            return <td key={c.k} className="xc-xl-foot-lbl">∑ {rows.length} rows</td>;
                return <td key={c.k}></td>;
              })}
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </Card>
  );
}

// ─── Materials side panel ──────────────────────────────────────────────────
function MaterialsPanel({ materials }) {
  return (
    <Card title="Material Pricing" sub="Realtime · CFS index" scan
      actions={<button className="xc-chip active">Top 8</button>}>
      <div className="xc-mat-list">
        {materials.map(m => (
          <div key={m.sku} className="xc-mat-row">
            <div className="xc-mat-meta">
              <span className="xc-mono xc-mat-sku">{m.sku}</span>
              <span className="xc-mat-name">{m.name}</span>
            </div>
            <div className="xc-mat-val">
              <span className="xc-mono">${m.price.toFixed(2)}<small>{m.unit}</small></span>
              <span className={`xc-mat-delta ${m.delta > 0 ? 'up' : m.delta < 0 ? 'down' : 'flat'}`}>
                {m.delta > 0 ? '▲' : m.delta < 0 ? '▼' : '─'} {Math.abs(m.delta).toFixed(1)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

window.XACT_FEAT = { PriceTicker, PipelineChart, BuildingViewer, Kanban, ActivityFeed, JobMap, Heatmap, WinLoss, ProposalsTable, MaterialsPanel };
