/**
 * Fire-industry + construction drawing symbols.
 *
 * Each symbol is a small SVG path string (24 × 24 viewport) plus metadata
 * that links it to a preferred product/assembly in the catalog. Use
 * `renderSymbolToSVG(symbolId, color, size)` to get inline SVG for the toolbar
 * and for placement preview.
 */

export const SYMBOL_CATEGORIES = {
  SPRINKLER: 'Sprinkler',
  DETECTION: 'Detection',
  ALARM: 'Alarm',
  PASSIVE: 'Passive',
  PORTABLE: 'Portable',
  HYDRANT: 'Hydrant',
  EGRESS: 'Egress',
  HVAC: 'HVAC',
  ELECTRICAL: 'Electrical',
  PLUMBING: 'Plumbing',
  GENERIC: 'Generic',
};

export const SYMBOLS = [
  // ---------- Sprinklers ----------
  { id: 'spr_upright', name: 'Sprinkler — Upright',  category: SYMBOL_CATEGORIES.SPRINKLER, standard: 'AS 2118', mappedAssemblyId: 'asm_spr_upright',
    svg: '<circle cx="12" cy="12" r="6" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="2" fill="currentColor"/><path d="M12 6V3M12 21v-3M3 12h3M18 12h3" stroke="currentColor" stroke-width="2"/>' },
  { id: 'spr_pendant', name: 'Sprinkler — Pendent',  category: SYMBOL_CATEGORIES.SPRINKLER, standard: 'AS 2118', mappedAssemblyId: 'asm_spr_pendant',
    svg: '<circle cx="12" cy="12" r="6" fill="currentColor" opacity="0.2"/><circle cx="12" cy="12" r="6" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/>' },
  { id: 'spr_sidewall', name: 'Sprinkler — Sidewall', category: SYMBOL_CATEGORIES.SPRINKLER, standard: 'AS 2118', mappedAssemblyId: 'asm_spr_sidewall',
    svg: '<path d="M4 12h16M14 8l6 4-6 4" fill="none" stroke="currentColor" stroke-width="2"/>' },
  { id: 'spr_concealed', name: 'Sprinkler — Concealed', category: SYMBOL_CATEGORIES.SPRINKLER, standard: 'AS 2118',
    svg: '<rect x="6" y="6" width="12" height="12" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="2" fill="currentColor"/>' },
  { id: 'spr_valveset', name: 'Sprinkler valve set', category: SYMBOL_CATEGORIES.SPRINKLER, standard: 'AS 2118',
    svg: '<circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="2"/><text x="12" y="15" text-anchor="middle" font-size="9" fill="currentColor">V</text>' },

  // ---------- Detection / alarm ----------
  { id: 'det_smoke',    name: 'Smoke detector',     category: SYMBOL_CATEGORIES.DETECTION, standard: 'AS 1670',
    svg: '<circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="2"/><text x="12" y="15" text-anchor="middle" font-size="9" fill="currentColor">S</text>' },
  { id: 'det_heat',     name: 'Heat detector',      category: SYMBOL_CATEGORIES.DETECTION, standard: 'AS 1670',
    svg: '<circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="2"/><text x="12" y="15" text-anchor="middle" font-size="9" fill="currentColor">H</text>' },
  { id: 'det_co',       name: 'CO detector',        category: SYMBOL_CATEGORIES.DETECTION,
    svg: '<circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="2"/><text x="12" y="15" text-anchor="middle" font-size="8" fill="currentColor">CO</text>' },
  { id: 'det_beam',     name: 'Beam detector',      category: SYMBOL_CATEGORIES.DETECTION,
    svg: '<rect x="3" y="9" width="6" height="6" fill="none" stroke="currentColor" stroke-width="2"/><rect x="15" y="9" width="6" height="6" fill="none" stroke="currentColor" stroke-width="2"/><path d="M9 12h6" stroke="currentColor" stroke-width="1" stroke-dasharray="2 2"/>' },
  { id: 'det_aspirating', name: 'Aspirating detector', category: SYMBOL_CATEGORIES.DETECTION,
    svg: '<rect x="4" y="8" width="16" height="8" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8 8V4M16 8V4" stroke="currentColor" stroke-width="2"/>' },
  { id: 'alarm_mcp',    name: 'Manual call point',  category: SYMBOL_CATEGORIES.ALARM, standard: 'AS 1670',
    svg: '<rect x="6" y="4" width="12" height="16" fill="none" stroke="currentColor" stroke-width="2"/><text x="12" y="15" text-anchor="middle" font-size="8" fill="currentColor">MCP</text>' },
  { id: 'alarm_sounder', name: 'Sounder',           category: SYMBOL_CATEGORIES.ALARM, standard: 'AS 1670',
    svg: '<path d="M4 9v6h4l5 4V5L8 9H4z" fill="none" stroke="currentColor" stroke-width="2"/><path d="M16 8a5 5 0 010 8" fill="none" stroke="currentColor" stroke-width="2"/>' },
  { id: 'alarm_strobe', name: 'Strobe',             category: SYMBOL_CATEGORIES.ALARM,
    svg: '<path d="M12 2l3 8h-2l3 12-7-12h2L9 2z" fill="currentColor"/>' },
  { id: 'alarm_fip',    name: 'FIP / NDU',          category: SYMBOL_CATEGORIES.ALARM, standard: 'AS 1670',
    svg: '<rect x="4" y="4" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"/><text x="12" y="15" text-anchor="middle" font-size="8" fill="currentColor">FIP</text>' },
  { id: 'alarm_ewis',   name: 'EWIS speaker',       category: SYMBOL_CATEGORIES.ALARM, standard: 'AS 1670.4',
    svg: '<rect x="6" y="6" width="12" height="12" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M9 12h6M12 9v6" stroke="currentColor" stroke-width="2"/>' },

  // ---------- Portable / hydrant ----------
  { id: 'ext_water',  name: 'Extinguisher — Water',     category: SYMBOL_CATEGORIES.PORTABLE, standard: 'AS 2444',
    svg: '<rect x="9" y="4" width="6" height="16" rx="2" fill="currentColor" opacity="0.2"/><rect x="9" y="4" width="6" height="16" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="9" r="1" fill="currentColor"/>' },
  { id: 'ext_co2',    name: 'Extinguisher — CO₂',       category: SYMBOL_CATEGORIES.PORTABLE, standard: 'AS 2444',
    svg: '<rect x="9" y="4" width="6" height="16" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><text x="12" y="15" text-anchor="middle" font-size="6" fill="currentColor">CO2</text>' },
  { id: 'ext_dcp',    name: 'Extinguisher — DCP',       category: SYMBOL_CATEGORIES.PORTABLE, standard: 'AS 2444',
    svg: '<rect x="9" y="4" width="6" height="16" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><text x="12" y="15" text-anchor="middle" font-size="6" fill="currentColor">DCP</text>' },
  { id: 'ext_foam',   name: 'Extinguisher — Foam (AFFF)', category: SYMBOL_CATEGORIES.PORTABLE, standard: 'AS 2444',
    svg: '<rect x="9" y="4" width="6" height="16" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><text x="12" y="15" text-anchor="middle" font-size="6" fill="currentColor">AFFF</text>' },
  { id: 'ext_wetchem', name: 'Extinguisher — Wet chem',  category: SYMBOL_CATEGORIES.PORTABLE, standard: 'AS 2444',
    svg: '<rect x="9" y="4" width="6" height="16" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><text x="12" y="15" text-anchor="middle" font-size="6" fill="currentColor">WC</text>' },
  { id: 'fire_blanket', name: 'Fire blanket',           category: SYMBOL_CATEGORIES.PORTABLE,
    svg: '<rect x="4" y="6" width="16" height="12" fill="none" stroke="currentColor" stroke-width="2"/><path d="M4 10h16M4 14h16" stroke="currentColor" stroke-width="1"/>' },
  { id: 'hose_reel',  name: 'Hose reel',                category: SYMBOL_CATEGORIES.HYDRANT, standard: 'AS 2441',
    svg: '<circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="1" fill="currentColor"/>' },
  { id: 'hydrant',    name: 'Fire hydrant',             category: SYMBOL_CATEGORIES.HYDRANT, standard: 'AS 2419',
    svg: '<rect x="9" y="4" width="6" height="6" fill="currentColor" opacity="0.3"/><rect x="9" y="4" width="6" height="6" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 10v8M8 18h8" stroke="currentColor" stroke-width="2"/>' },
  { id: 'booster',    name: 'Fire brigade booster',     category: SYMBOL_CATEGORIES.HYDRANT, standard: 'AS 2419',
    svg: '<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><text x="12" y="15" text-anchor="middle" font-size="7" fill="currentColor">BB</text>' },

  // ---------- Egress ----------
  { id: 'egress_exit', name: 'Exit sign',               category: SYMBOL_CATEGORIES.EGRESS, standard: 'AS 2293',
    svg: '<rect x="3" y="9" width="18" height="8" fill="none" stroke="currentColor" stroke-width="2"/><text x="12" y="15" text-anchor="middle" font-size="6" fill="currentColor">EXIT</text>' },
  { id: 'egress_emerg', name: 'Emergency light',        category: SYMBOL_CATEGORIES.EGRESS, standard: 'AS 2293',
    svg: '<circle cx="12" cy="12" r="6" fill="currentColor" opacity="0.3"/><circle cx="12" cy="12" r="6" fill="none" stroke="currentColor" stroke-width="2"/><text x="12" y="15" text-anchor="middle" font-size="6" fill="currentColor">E</text>' },

  // ---------- Passive ----------
  { id: 'pas_firedoor', name: 'Fire door',              category: SYMBOL_CATEGORIES.PASSIVE, standard: 'AS 1905',
    svg: '<rect x="4" y="3" width="3" height="18" fill="currentColor"/><path d="M7 12l13-6v12L7 12z" fill="none" stroke="currentColor" stroke-width="2"/>' },
  { id: 'pas_pen',     name: 'Penetration seal',         category: SYMBOL_CATEGORIES.PASSIVE, standard: 'AS 1530.4',
    svg: '<rect x="4" y="4" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="3 2"/><path d="M9 9l6 6M15 9l-6 6" stroke="currentColor" stroke-width="2"/>' },
  { id: 'pas_collar',  name: 'Intumescent collar',       category: SYMBOL_CATEGORIES.PASSIVE,
    svg: '<circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="2"/>' },
  { id: 'pas_wall_frl', name: 'FRL wall (60/60/60)',     category: SYMBOL_CATEGORIES.PASSIVE,
    svg: '<rect x="2" y="10" width="20" height="4" fill="currentColor" opacity="0.3"/><rect x="2" y="10" width="20" height="4" fill="none" stroke="currentColor" stroke-width="2"/>' },

  // ---------- Generic construction ----------
  { id: 'door',       name: 'Door',                     category: SYMBOL_CATEGORIES.GENERIC,
    svg: '<path d="M4 20V4M4 4l16 16" fill="none" stroke="currentColor" stroke-width="2"/><path d="M4 20A16 16 0 0020 4" fill="none" stroke="currentColor" stroke-width="1"/>' },
  { id: 'window',     name: 'Window',                   category: SYMBOL_CATEGORIES.GENERIC,
    svg: '<rect x="3" y="9" width="18" height="6" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 9v6" stroke="currentColor" stroke-width="1"/>' },
  { id: 'gpo',        name: 'GPO outlet',               category: SYMBOL_CATEGORIES.ELECTRICAL,
    svg: '<circle cx="12" cy="12" r="6" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="10" cy="11" r="1" fill="currentColor"/><circle cx="14" cy="11" r="1" fill="currentColor"/>' },
  { id: 'switch',     name: 'Switch',                   category: SYMBOL_CATEGORIES.ELECTRICAL,
    svg: '<circle cx="12" cy="12" r="2" fill="currentColor"/><path d="M12 14l5 5" stroke="currentColor" stroke-width="2"/>' },
];

export function getSymbol(id) {
  return SYMBOLS.find((s) => s.id === id) || null;
}

export function getSymbolsByCategory(category) {
  return SYMBOLS.filter((s) => s.category === category);
}

/**
 * Render a symbol to an inline SVG string. Used for toolbar buttons via
 * dangerouslySetInnerHTML.
 *
 * Inputs are validated even though every current caller passes a literal —
 * this defends a future caller that wires `color` to user input.
 */
const COLOR_RE = /^#[0-9a-fA-F]{3,8}$|^rgb\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*\)$/;
export function renderSymbolToSVG(symbolId, color = '#ef4444', size = 24) {
  const sym = getSymbol(symbolId);
  if (!sym) return '';
  const safeColor = COLOR_RE.test(color) ? color : '#0f172a';
  const safeSize = Number.isFinite(size) ? Math.max(8, Math.min(256, Math.floor(size))) : 24;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${safeSize}" height="${safeSize}" viewBox="0 0 24 24" style="color:${safeColor}">${sym.svg}</svg>`;
}
