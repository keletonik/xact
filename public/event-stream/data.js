// XACT mock data — fire protection estimating
window.XACT_DATA = (() => {
  const proposals = [
    { id: 'XCT-2418', name: 'Northgate Distribution Center', client: 'Prologis', type: 'ESFR Wet System', value: 487300, status: 'In Review', stage: 'design', confidence: 78, due: '2026-05-22', sqft: 248000, owner: 'Team A', risk: 'low', city: 'Reno, NV', updated: '2h ago', heads: 1840 },
    { id: 'XCT-2419', name: 'Cedar Pointe Tower', client: 'Kilroy Realty', type: 'Combined Standpipe', value: 1264000, status: 'Submitted', stage: 'bid', confidence: 64, due: '2026-05-18', sqft: 612000, owner: 'Team B', risk: 'med', city: 'Seattle, WA', updated: '14m ago', heads: 4220 },
    { id: 'XCT-2420', name: 'Mercy Health Pavilion', client: 'Mercy Health', type: 'NFPA-13 Hospital', value: 892450, status: 'Drafting', stage: 'takeoff', confidence: 81, due: '2026-05-29', sqft: 184000, owner: 'Team A', risk: 'low', city: 'Cincinnati, OH', updated: '1h ago', heads: 2410 },
    { id: 'XCT-2421', name: 'Hangar 7 Retrofit', client: 'Boeing Field', type: 'AFFF Foam', value: 2140000, status: 'Pricing', stage: 'pricing', confidence: 52, due: '2026-05-20', sqft: 96000, owner: 'Team C', risk: 'high', city: 'Seattle, WA', updated: '5m ago', heads: 920 },
    { id: 'XCT-2422', name: 'Lakeside Self-Storage', client: 'CubeSmart', type: 'Dry Pipe', value: 312800, status: 'Won', stage: 'won', confidence: 100, due: '2026-04-30', sqft: 156000, owner: 'Team B', risk: 'low', city: 'Madison, WI', updated: '1d ago', heads: 980 },
    { id: 'XCT-2423', name: 'Quantum Data Hall 4', client: 'Equinix', type: 'Pre-Action Clean Agent', value: 3480000, status: 'In Review', stage: 'design', confidence: 71, due: '2026-06-04', sqft: 88000, owner: 'Team C', risk: 'med', city: 'Ashburn, VA', updated: '32m ago', heads: 1640 },
    { id: 'XCT-2424', name: 'Foothills Apartments', client: 'Mill Creek', type: 'NFPA-13R Residential', value: 218500, status: 'Submitted', stage: 'bid', confidence: 58, due: '2026-05-25', sqft: 142000, owner: 'Team A', risk: 'low', city: 'Boise, ID', updated: '3h ago', heads: 1120 },
    { id: 'XCT-2425', name: 'Pier 41 Cold Storage', client: 'Lineage Logistics', type: 'Dry Pipe + Antifreeze', value: 1085000, status: 'Drafting', stage: 'takeoff', confidence: 67, due: '2026-06-11', sqft: 320000, owner: 'Team B', risk: 'high', city: 'Oakland, CA', updated: '4h ago', heads: 2880 },
    { id: 'XCT-2426', name: 'Vail Resort Lodge B', client: 'Vail Resorts', type: 'Antifreeze Loop', value: 642100, status: 'Pricing', stage: 'pricing', confidence: 73, due: '2026-05-28', sqft: 78000, owner: 'Team C', risk: 'med', city: 'Vail, CO', updated: '22m ago', heads: 840 },
    { id: 'XCT-2427', name: 'Riverside Mall Renovation', client: 'Simon Property', type: 'NFPA-13 Retrofit', value: 478900, status: 'Lost', stage: 'lost', confidence: 0, due: '2026-04-12', sqft: 410000, owner: 'Team A', risk: 'low', city: 'St. Louis, MO', updated: '5d ago', heads: 2680 },
  ];

  const activity = [
    { t: '2m', who: 'Pricing Engine', what: 'repriced 1,840 pendents on', target: 'XCT-2418', kind: 'price' },
    { t: '8m', who: 'Risk Monitor', what: 'flagged AFFF supply lead-time on', target: 'XCT-2421', kind: 'risk' },
    { t: '14m', who: 'Bid Engine', what: 'auto-submitted package for', target: 'XCT-2419', kind: 'submit' },
    { t: '23m', who: 'AutoTakeoff', what: 'completed sheet 3 of 11 on', target: 'XCT-2420', kind: 'system' },
    { t: '32m', who: 'Hydraulic Calc', what: 'recalibrated demand for', target: 'XCT-2423', kind: 'calc' },
    { t: '47m', who: 'Review Bot', what: 'opened design review for', target: 'XCT-2418', kind: 'open' },
    { t: '1h', who: 'XACT', what: 'recorded win on', target: 'XCT-2422', kind: 'win' },
    { t: '1h', who: 'Material Index', what: 'pushed CPVC +2.4% on', target: 'all open bids', kind: 'price' },
    { t: '2h', who: 'AutoTakeoff', what: 'started sheet parse on', target: 'XCT-2425', kind: 'takeoff' },
  ];

  const materials = [
    { sku: 'CPVC-2"', name: 'CPVC Schedule 80, 2"', unit: '/LF', price: 4.18, delta: 2.4, vol: 12400 },
    { sku: 'BLK-4"', name: 'Black Steel SCH-10, 4"', unit: '/LF', price: 11.92, delta: -0.8, vol: 8600 },
    { sku: 'PND-K56', name: 'Pendent Head K5.6 SR', unit: '/ea', price: 9.40, delta: 0.0, vol: 18420 },
    { sku: 'PND-K80', name: 'Pendent K8.0 ESFR', unit: '/ea', price: 47.20, delta: 1.1, vol: 4280 },
    { sku: 'GRV-COUP', name: 'Grooved Coupling 4"', unit: '/ea', price: 28.60, delta: -1.4, vol: 2140 },
    { sku: 'AFFF-3%', name: 'AFFF 3% Concentrate', unit: '/gal', price: 38.50, delta: 4.2, vol: 920 },
    { sku: 'DRY-VLV-6', name: 'Dry Pipe Valve 6"', unit: '/ea', price: 4280.00, delta: 0.6, vol: 12 },
    { sku: 'PA-VLV-4', name: 'Pre-Action Valve 4"', unit: '/ea', price: 6840.00, delta: 1.8, vol: 6 },
  ];

  const team = [];

  // 12-week pipeline forecast (values in $K)
  const forecast = [
    { w: 'W18', bid: 1840, won: 920, pipe: 4200 },
    { w: 'W19', bid: 2140, won: 1180, pipe: 4810 },
    { w: 'W20', bid: 1920, won: 1020, pipe: 5240 },
    { w: 'W21', bid: 2480, won: 1420, pipe: 5680 },
    { w: 'W22', bid: 3120, won: 1680, pipe: 6120 },
    { w: 'W23', bid: 2840, won: 1540, pipe: 6480 },
    { w: 'W24', bid: 3640, won: 2180, pipe: 7240 },
    { w: 'W25', bid: 4120, won: 2480, pipe: 7820 },
    { w: 'W26', bid: 3840, won: 2240, pipe: 8140 },
    { w: 'W27', bid: 4480, won: 2680, pipe: 8920 },
    { w: 'W28', bid: 5120, won: 3120, pipe: 9640 },
    { w: 'W29', bid: 4840, won: 2940, pipe: 10240 },
  ];

  // 26-week activity heatmap (counts per week × weekday)
  const heatmap = Array.from({ length: 26 }, (_, w) =>
    Array.from({ length: 7 }, (_, d) => {
      const base = (Math.sin((w * 7 + d) * 0.6) + 1) * 6;
      const wkn = d === 0 || d === 6 ? 0.25 : 1;
      const trend = w / 30;
      return Math.max(0, Math.round((base + trend * 8) * wkn));
    })
  );

  // Win/loss by quarter
  const winloss = [
    { q: 'Q1 25', won: 18, lost: 9, total: 41200 },
    { q: 'Q2 25', won: 22, lost: 11, total: 48900 },
    { q: 'Q3 25', won: 19, lost: 8, total: 44600 },
    { q: 'Q4 25', won: 26, lost: 12, total: 58200 },
    { q: 'Q1 26', won: 31, lost: 10, total: 67400 },
    { q: 'Q2 26', won: 24, lost: 7, total: 72100 },
  ];

  // Job sites for map
  const sites = [
    { id: 'XCT-2418', lat: 39.5, lng: -119.8, label: 'Reno', value: 487, status: 'design' },
    { id: 'XCT-2419', lat: 47.6, lng: -122.3, label: 'Seattle', value: 1264, status: 'bid' },
    { id: 'XCT-2420', lat: 39.1, lng: -84.5, label: 'Cincinnati', value: 892, status: 'takeoff' },
    { id: 'XCT-2421', lat: 47.5, lng: -122.3, label: 'Boeing Fld', value: 2140, status: 'pricing' },
    { id: 'XCT-2422', lat: 43.1, lng: -89.4, label: 'Madison', value: 313, status: 'won' },
    { id: 'XCT-2423', lat: 39.0, lng: -77.5, label: 'Ashburn', value: 3480, status: 'design' },
    { id: 'XCT-2424', lat: 43.6, lng: -116.2, label: 'Boise', value: 219, status: 'bid' },
    { id: 'XCT-2425', lat: 37.8, lng: -122.3, label: 'Oakland', value: 1085, status: 'takeoff' },
    { id: 'XCT-2426', lat: 39.6, lng: -106.4, label: 'Vail', value: 642, status: 'pricing' },
  ];

  // Sparkline for top metric cards (last 14 days)
  const spark = (seed) => Array.from({ length: 14 }, (_, i) =>
    50 + Math.sin(i * 0.7 + seed) * 18 + i * 1.6 + (i % 3 === 0 ? 4 : 0)
  );

  return { proposals, activity, materials, team, forecast, heatmap, winloss, sites, spark };
})();
