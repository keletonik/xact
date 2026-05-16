/**
 * Fire-industry + construction drawing symbols.
 *
 * Each symbol is a small SVG path string (24 × 24 viewport) plus metadata
 * that links it to a preferred product/assembly in the catalog. Use
 * `renderSymbolToSVG(symbolId, color, size)` to get inline SVG for the toolbar
 * and for placement preview.
 *
 * Stroke-width of 2.5 is the default — symbols rendered at 24-28 px in the
 * picker need that weight to remain crisp on standard-DPI displays.
 */

export const SYMBOL_CATEGORIES = {
  SPRINKLER: 'Sprinkler',
  VALVES: 'Sprinkler / Valves',
  PUMPS: 'Sprinkler / Pumps',
  DETECTION: 'Detection',
  ALARM: 'Alarm',
  PASSIVE: 'Passive',
  PORTABLE: 'Portable',
  HYDRANT: 'Hydrant',
  EGRESS: 'Egress',
  SUPPRESSION: 'Special suppression',
  BUILDING: 'Building services',
  REFERENCE: 'Reference marks',
  HVAC: 'HVAC',
  ELECTRICAL: 'Electrical',
  PLUMBING: 'Plumbing',
  GENERIC: 'Generic',
};

const SW = 'stroke-width="2.5"';
const SW3 = 'stroke-width="3"';

export const SYMBOLS = [
  // ---------- Sprinklers ----------
  { id: 'spr_upright', name: 'Sprinkler — Upright',  category: SYMBOL_CATEGORIES.SPRINKLER, standard: 'AS 2118', mappedAssemblyId: 'asm_spr_upright',
    svg: `<circle cx="12" cy="12" r="6" fill="none" stroke="currentColor" ${SW}/><circle cx="12" cy="12" r="2" fill="currentColor"/><path d="M12 6V3M12 21v-3M3 12h3M18 12h3" stroke="currentColor" ${SW}/>` },
  { id: 'spr_pendant', name: 'Sprinkler — Pendent',  category: SYMBOL_CATEGORIES.SPRINKLER, standard: 'AS 2118', mappedAssemblyId: 'asm_spr_pendant',
    svg: `<circle cx="12" cy="12" r="6" fill="currentColor" opacity="0.25"/><circle cx="12" cy="12" r="6" fill="none" stroke="currentColor" ${SW}/><circle cx="12" cy="12" r="1.7" fill="currentColor"/>` },
  { id: 'spr_sidewall', name: 'Sprinkler — Sidewall', category: SYMBOL_CATEGORIES.SPRINKLER, standard: 'AS 2118', mappedAssemblyId: 'asm_spr_sidewall',
    svg: `<path d="M4 12h16M14 8l6 4-6 4" fill="none" stroke="currentColor" ${SW}/>` },
  { id: 'spr_concealed', name: 'Sprinkler — Concealed', category: SYMBOL_CATEGORIES.SPRINKLER, standard: 'AS 2118',
    svg: `<rect x="6" y="6" width="12" height="12" rx="2" fill="none" stroke="currentColor" ${SW}/><circle cx="12" cy="12" r="2" fill="currentColor"/>` },
  { id: 'spr_dry_pendant', name: 'Sprinkler — Dry pendent', category: SYMBOL_CATEGORIES.SPRINKLER, standard: 'AS 2118',
    svg: `<circle cx="12" cy="12" r="6" fill="none" stroke="currentColor" ${SW}/><circle cx="12" cy="12" r="1.7" fill="currentColor"/><text x="12" y="6" text-anchor="middle" font-size="6" fill="currentColor" font-weight="700">D</text>` },
  { id: 'spr_esfr', name: 'Sprinkler — ESFR', category: SYMBOL_CATEGORIES.SPRINKLER, standard: 'AS 2118',
    svg: `<circle cx="12" cy="12" r="7" fill="none" stroke="currentColor" ${SW3}/><circle cx="12" cy="12" r="2" fill="currentColor"/><path d="M12 5v-2M12 21v-2M5 12h-2M21 12h-2" stroke="currentColor" ${SW}/>` },
  { id: 'spr_residential', name: 'Sprinkler — Residential', category: SYMBOL_CATEGORIES.SPRINKLER, standard: 'AS 2118',
    svg: `<circle cx="12" cy="12" r="5" fill="none" stroke="currentColor" ${SW}/><circle cx="12" cy="12" r="1.5" fill="currentColor"/><text x="12" y="22" text-anchor="middle" font-size="6" fill="currentColor" font-weight="700">R</text>` },
  { id: 'spr_high_temp', name: 'Sprinkler — High temp', category: SYMBOL_CATEGORIES.SPRINKLER, standard: 'AS 2118',
    svg: `<circle cx="12" cy="12" r="7" fill="none" stroke="currentColor" ${SW}/><circle cx="12" cy="12" r="4.5" fill="none" stroke="currentColor" ${SW}/><circle cx="12" cy="12" r="1.5" fill="currentColor"/>` },
  { id: 'spr_open', name: 'Sprinkler — Open (deluge)', category: SYMBOL_CATEGORIES.SPRINKLER, standard: 'AS 2118',
    svg: `<circle cx="12" cy="12" r="6" fill="none" stroke="currentColor" ${SW}/><path d="M9 14l3 4 3-4" fill="none" stroke="currentColor" ${SW}/>` },

  // ---------- Sprinkler valves ----------
  { id: 'spr_valveset', name: 'Sprinkler valve set', category: SYMBOL_CATEGORIES.VALVES, standard: 'AS 2118',
    svg: `<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" ${SW}/><text x="12" y="15" text-anchor="middle" font-size="9" font-weight="700" fill="currentColor">V</text>` },
  { id: 'spr_alarm_valve', name: 'Alarm valve', category: SYMBOL_CATEGORIES.VALVES, standard: 'AS 2118',
    svg: `<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" ${SW}/><text x="12" y="15" text-anchor="middle" font-size="8" font-weight="700" fill="currentColor">AV</text>` },
  { id: 'spr_deluge_valve', name: 'Deluge valve', category: SYMBOL_CATEGORIES.VALVES, standard: 'AS 2118',
    svg: `<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" ${SW}/><text x="12" y="15" text-anchor="middle" font-size="8" font-weight="700" fill="currentColor">DV</text>` },
  { id: 'spr_dry_pipe_valve', name: 'Dry-pipe valve', category: SYMBOL_CATEGORIES.VALVES, standard: 'AS 2118',
    svg: `<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" ${SW}/><text x="12" y="15" text-anchor="middle" font-size="8" font-weight="700" fill="currentColor">DP</text>` },
  { id: 'spr_preaction_valve', name: 'Pre-action valve', category: SYMBOL_CATEGORIES.VALVES, standard: 'AS 2118',
    svg: `<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" ${SW}/><text x="12" y="15" text-anchor="middle" font-size="8" font-weight="700" fill="currentColor">PA</text>` },
  { id: 'spr_flow_switch', name: 'Flow switch', category: SYMBOL_CATEGORIES.VALVES,
    svg: `<rect x="4" y="9" width="16" height="6" fill="none" stroke="currentColor" ${SW}/><path d="M8 12h8M14 10l2 2-2 2" fill="none" stroke="currentColor" ${SW}/>` },
  { id: 'spr_pressure_switch', name: 'Pressure switch', category: SYMBOL_CATEGORIES.VALVES,
    svg: `<rect x="4" y="9" width="16" height="6" fill="none" stroke="currentColor" ${SW}/><text x="12" y="14" text-anchor="middle" font-size="7" font-weight="700" fill="currentColor">PSW</text>` },
  { id: 'spr_isolation_valve', name: 'Isolation valve', category: SYMBOL_CATEGORIES.VALVES,
    svg: `<path d="M4 6l8 6-8 6V6zM20 6l-8 6 8 6V6z" fill="none" stroke="currentColor" ${SW}/>` },
  { id: 'spr_test_drain', name: 'Test & drain', category: SYMBOL_CATEGORIES.VALVES,
    svg: `<path d="M6 6v8a3 3 0 003 3h6a3 3 0 003-3V6M12 17v4M9 21h6" fill="none" stroke="currentColor" ${SW}/>` },
  { id: 'spr_check_valve', name: 'Check valve', category: SYMBOL_CATEGORIES.VALVES,
    svg: `<path d="M4 12h16M10 8l4 4-4 4" fill="none" stroke="currentColor" ${SW}/>` },

  // ---------- Pumps & tanks ----------
  { id: 'spr_pump_main', name: 'Main fire pump', category: SYMBOL_CATEGORIES.PUMPS, standard: 'AS 2941',
    svg: `<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" ${SW3}/><text x="12" y="15" text-anchor="middle" font-size="10" font-weight="700" fill="currentColor">P</text>` },
  { id: 'spr_pump_jockey', name: 'Jockey pump', category: SYMBOL_CATEGORIES.PUMPS, standard: 'AS 2941',
    svg: `<circle cx="12" cy="12" r="7" fill="none" stroke="currentColor" ${SW}/><text x="12" y="15" text-anchor="middle" font-size="9" font-weight="700" fill="currentColor">J</text>` },
  { id: 'spr_pump_diesel', name: 'Diesel pump', category: SYMBOL_CATEGORIES.PUMPS, standard: 'AS 2941',
    svg: `<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" ${SW}/><text x="12" y="11" text-anchor="middle" font-size="6" font-weight="700" fill="currentColor">D</text><text x="12" y="17" text-anchor="middle" font-size="6" font-weight="700" fill="currentColor">P</text>` },
  { id: 'spr_pump_booster', name: 'Booster pump', category: SYMBOL_CATEGORIES.PUMPS, standard: 'AS 2419',
    svg: `<path d="M12 3l9 5.2v7.6L12 21l-9-5.2V8.2z" fill="none" stroke="currentColor" ${SW}/><text x="12" y="15" text-anchor="middle" font-size="8" font-weight="700" fill="currentColor">B</text>` },
  { id: 'spr_water_tank', name: 'Water tank', category: SYMBOL_CATEGORIES.PUMPS,
    svg: `<rect x="4" y="6" width="16" height="14" rx="2" fill="none" stroke="currentColor" ${SW}/><path d="M4 9h16M8 13h8" stroke="currentColor" ${SW}/>` },
  { id: 'spr_air_compressor', name: 'Air compressor', category: SYMBOL_CATEGORIES.PUMPS,
    svg: `<rect x="3" y="9" width="14" height="8" rx="2" fill="none" stroke="currentColor" ${SW}/><circle cx="18.5" cy="13" r="2.5" fill="none" stroke="currentColor" ${SW}/>` },

  // ---------- Detection / alarm ----------
  { id: 'det_smoke',    name: 'Smoke detector',     category: SYMBOL_CATEGORIES.DETECTION, standard: 'AS 1670',
    svg: `<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" ${SW}/><text x="12" y="15" text-anchor="middle" font-size="10" font-weight="700" fill="currentColor">S</text>` },
  { id: 'det_heat',     name: 'Heat detector',      category: SYMBOL_CATEGORIES.DETECTION, standard: 'AS 1670',
    svg: `<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" ${SW}/><text x="12" y="15" text-anchor="middle" font-size="10" font-weight="700" fill="currentColor">H</text>` },
  { id: 'det_co',       name: 'CO detector',        category: SYMBOL_CATEGORIES.DETECTION,
    svg: `<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" ${SW}/><text x="12" y="15" text-anchor="middle" font-size="8" font-weight="700" fill="currentColor">CO</text>` },
  { id: 'det_multi',    name: 'Multi-criteria detector', category: SYMBOL_CATEGORIES.DETECTION, standard: 'AS 1670',
    svg: `<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" ${SW}/><text x="12" y="15" text-anchor="middle" font-size="10" font-weight="700" fill="currentColor">M</text>` },
  { id: 'det_smoke_heat', name: 'Smoke + heat combo', category: SYMBOL_CATEGORIES.DETECTION,
    svg: `<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" ${SW}/><text x="12" y="11" text-anchor="middle" font-size="6" font-weight="700" fill="currentColor">S</text><text x="12" y="18" text-anchor="middle" font-size="6" font-weight="700" fill="currentColor">H</text>` },
  { id: 'det_beam',     name: 'Beam detector',      category: SYMBOL_CATEGORIES.DETECTION,
    svg: `<rect x="2" y="9" width="6" height="6" fill="none" stroke="currentColor" ${SW}/><rect x="16" y="9" width="6" height="6" fill="none" stroke="currentColor" ${SW}/><path d="M8 12h8" stroke="currentColor" stroke-width="1.5" stroke-dasharray="2 2"/>` },
  { id: 'det_aspirating', name: 'Aspirating detector', category: SYMBOL_CATEGORIES.DETECTION,
    svg: `<rect x="3" y="8" width="18" height="8" fill="none" stroke="currentColor" ${SW}/><path d="M7 8V4M12 8V4M17 8V4" stroke="currentColor" ${SW}/>` },
  { id: 'det_linear_heat', name: 'Linear heat cable', category: SYMBOL_CATEGORIES.DETECTION,
    svg: `<path d="M3 12c0-3 3-3 3 0s3 3 3 0 3-3 3 0 3 3 3 0 3-3 3 0" fill="none" stroke="currentColor" ${SW}/>` },
  { id: 'det_flame_optical', name: 'Flame detector (optical)', category: SYMBOL_CATEGORIES.DETECTION,
    svg: `<path d="M12 3l9 16H3z" fill="none" stroke="currentColor" ${SW}/><circle cx="12" cy="14" r="2" fill="currentColor"/>` },
  { id: 'det_duct_smoke', name: 'Duct smoke detector', category: SYMBOL_CATEGORIES.DETECTION,
    svg: `<rect x="3" y="6" width="18" height="6" fill="none" stroke="currentColor" ${SW}/><rect x="3" y="14" width="18" height="4" fill="none" stroke="currentColor" ${SW}/><text x="12" y="11" text-anchor="middle" font-size="5" font-weight="700" fill="currentColor">D-S</text>` },
  { id: 'det_video_smoke', name: 'Video smoke detector', category: SYMBOL_CATEGORIES.DETECTION,
    svg: `<rect x="4" y="8" width="16" height="8" rx="1" fill="none" stroke="currentColor" ${SW}/><circle cx="12" cy="12" r="2.5" fill="none" stroke="currentColor" ${SW}/>` },

  // ---------- Alarm devices ----------
  { id: 'alarm_mcp',    name: 'Manual call point',  category: SYMBOL_CATEGORIES.ALARM, standard: 'AS 1670',
    svg: `<rect x="5" y="3" width="14" height="18" rx="1" fill="none" stroke="currentColor" ${SW}/><text x="12" y="15" text-anchor="middle" font-size="8" font-weight="700" fill="currentColor">MCP</text>` },
  { id: 'alarm_sounder', name: 'Sounder',           category: SYMBOL_CATEGORIES.ALARM, standard: 'AS 1670',
    svg: `<path d="M4 9v6h4l5 4V5L8 9H4z" fill="none" stroke="currentColor" ${SW}/><path d="M16 8a5 5 0 010 8" fill="none" stroke="currentColor" ${SW}/>` },
  { id: 'alarm_strobe', name: 'Strobe',             category: SYMBOL_CATEGORIES.ALARM,
    svg: `<path d="M13 3l-6 9h4l-2 9 7-11h-4l1-7z" fill="currentColor"/>` },
  { id: 'alarm_sounder_strobe', name: 'Sounder + strobe', category: SYMBOL_CATEGORIES.ALARM,
    svg: `<path d="M4 10v4h3l4 3V7L7 10H4z" fill="none" stroke="currentColor" ${SW}/><path d="M16 6l-2 5h2l-2 7 5-8h-2l1-4z" fill="currentColor"/>` },
  { id: 'alarm_bell',    name: 'Bell',              category: SYMBOL_CATEGORIES.ALARM,
    svg: `<path d="M6 16h12l-1.5-1.5V10a4.5 4.5 0 00-9 0v4.5L6 16zM10.5 18a1.5 1.5 0 003 0" fill="none" stroke="currentColor" ${SW}/>` },
  { id: 'alarm_voice',   name: 'Voice annunciator', category: SYMBOL_CATEGORIES.ALARM,
    svg: `<rect x="4" y="8" width="16" height="8" rx="1" fill="none" stroke="currentColor" ${SW}/><text x="12" y="14" text-anchor="middle" font-size="6" font-weight="700" fill="currentColor">VOICE</text>` },
  { id: 'alarm_fip',    name: 'FIP (Fire Indicator Panel)', category: SYMBOL_CATEGORIES.ALARM, standard: 'AS 1670',
    svg: `<rect x="3" y="3" width="18" height="18" fill="none" stroke="currentColor" ${SW3}/><text x="12" y="14" text-anchor="middle" font-size="8" font-weight="700" fill="currentColor">FIP</text>` },
  { id: 'alarm_subfip',  name: 'Sub-FIP / NDU',      category: SYMBOL_CATEGORIES.ALARM,
    svg: `<rect x="4" y="4" width="16" height="16" fill="none" stroke="currentColor" ${SW}/><text x="12" y="14" text-anchor="middle" font-size="7" font-weight="700" fill="currentColor">NDU</text>` },
  { id: 'alarm_ewis',   name: 'EWIS speaker',       category: SYMBOL_CATEGORIES.ALARM, standard: 'AS 1670.4',
    svg: `<rect x="5" y="5" width="14" height="14" rx="2" fill="none" stroke="currentColor" ${SW}/><path d="M9 12h6M12 9v6" stroke="currentColor" ${SW3}/>` },
  { id: 'alarm_isolator', name: 'Zone isolator',   category: SYMBOL_CATEGORIES.ALARM,
    svg: `<circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" ${SW}/><path d="M8 12h8" stroke="currentColor" ${SW3}/>` },

  // ---------- Portable / hydrant ----------
  { id: 'ext_water',  name: 'Extinguisher — Water',     category: SYMBOL_CATEGORIES.PORTABLE, standard: 'AS 2444',
    svg: `<rect x="9" y="3" width="6" height="18" rx="2" fill="currentColor" opacity="0.25"/><rect x="9" y="3" width="6" height="18" rx="2" fill="none" stroke="currentColor" ${SW}/><circle cx="12" cy="8" r="1" fill="currentColor"/>` },
  { id: 'ext_co2',    name: 'Extinguisher — CO₂',       category: SYMBOL_CATEGORIES.PORTABLE, standard: 'AS 2444',
    svg: `<rect x="9" y="3" width="6" height="18" rx="2" fill="none" stroke="currentColor" ${SW}/><text x="12" y="15" text-anchor="middle" font-size="6" font-weight="700" fill="currentColor">CO2</text>` },
  { id: 'ext_dcp',    name: 'Extinguisher — DCP',       category: SYMBOL_CATEGORIES.PORTABLE, standard: 'AS 2444',
    svg: `<rect x="9" y="3" width="6" height="18" rx="2" fill="none" stroke="currentColor" ${SW}/><text x="12" y="15" text-anchor="middle" font-size="6" font-weight="700" fill="currentColor">DCP</text>` },
  { id: 'ext_foam',   name: 'Extinguisher — Foam (AFFF)', category: SYMBOL_CATEGORIES.PORTABLE, standard: 'AS 2444',
    svg: `<rect x="9" y="3" width="6" height="18" rx="2" fill="none" stroke="currentColor" ${SW}/><text x="12" y="15" text-anchor="middle" font-size="5" font-weight="700" fill="currentColor">AFFF</text>` },
  { id: 'ext_wetchem', name: 'Extinguisher — Wet chem',  category: SYMBOL_CATEGORIES.PORTABLE, standard: 'AS 2444',
    svg: `<rect x="9" y="3" width="6" height="18" rx="2" fill="none" stroke="currentColor" ${SW}/><text x="12" y="15" text-anchor="middle" font-size="6" font-weight="700" fill="currentColor">WC</text>` },
  { id: 'ext_metal',  name: 'Extinguisher — Class D (metal)', category: SYMBOL_CATEGORIES.PORTABLE, standard: 'AS 2444',
    svg: `<rect x="9" y="3" width="6" height="18" rx="2" fill="none" stroke="currentColor" ${SW}/><text x="12" y="15" text-anchor="middle" font-size="7" font-weight="700" fill="currentColor">D</text>` },
  { id: 'ext_wheeled', name: 'Wheeled extinguisher',   category: SYMBOL_CATEGORIES.PORTABLE, standard: 'AS 2444',
    svg: `<rect x="7" y="3" width="10" height="13" rx="2" fill="none" stroke="currentColor" ${SW}/><circle cx="8" cy="20" r="2" fill="none" stroke="currentColor" ${SW}/><circle cx="16" cy="20" r="2" fill="none" stroke="currentColor" ${SW}/>` },
  { id: 'fire_blanket', name: 'Fire blanket',           category: SYMBOL_CATEGORIES.PORTABLE,
    svg: `<rect x="3" y="5" width="18" height="14" fill="none" stroke="currentColor" ${SW}/><path d="M3 10h18M3 14h18" stroke="currentColor" ${SW}/>` },
  { id: 'ext_signage', name: 'Extinguisher signage',   category: SYMBOL_CATEGORIES.PORTABLE,
    svg: `<rect x="4" y="3" width="16" height="12" fill="none" stroke="currentColor" ${SW}/><path d="M12 15v4M9 19h6" stroke="currentColor" ${SW}/>` },

  // ---------- Hydrants / hose reels ----------
  { id: 'hose_reel',  name: 'Hose reel',                category: SYMBOL_CATEGORIES.HYDRANT, standard: 'AS 2441',
    svg: `<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" ${SW}/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" ${SW}/><circle cx="12" cy="12" r="1.2" fill="currentColor"/>` },
  { id: 'hose_reel_cabinet', name: 'Hose reel cabinet', category: SYMBOL_CATEGORIES.HYDRANT, standard: 'AS 2441',
    svg: `<rect x="2" y="4" width="20" height="16" rx="1" fill="none" stroke="currentColor" ${SW}/><circle cx="12" cy="12" r="5" fill="none" stroke="currentColor" ${SW}/><circle cx="12" cy="12" r="2" fill="none" stroke="currentColor" ${SW}/>` },
  { id: 'hydrant',    name: 'Fire hydrant',             category: SYMBOL_CATEGORIES.HYDRANT, standard: 'AS 2419',
    svg: `<rect x="9" y="3" width="6" height="7" fill="currentColor" opacity="0.3"/><rect x="9" y="3" width="6" height="7" fill="none" stroke="currentColor" ${SW}/><path d="M12 10v9M7 19h10" stroke="currentColor" ${SW}/>` },
  { id: 'hydrant_external', name: 'External hydrant', category: SYMBOL_CATEGORIES.HYDRANT, standard: 'AS 2419',
    svg: `<path d="M12 3l9 5.2v7.6L12 21l-9-5.2V8.2z" fill="none" stroke="currentColor" ${SW}/><text x="12" y="15" text-anchor="middle" font-size="8" font-weight="700" fill="currentColor">H</text>` },
  { id: 'hydrant_internal', name: 'Internal hydrant', category: SYMBOL_CATEGORIES.HYDRANT, standard: 'AS 2419',
    svg: `<rect x="3" y="3" width="18" height="18" fill="none" stroke="currentColor" ${SW}/><text x="12" y="15" text-anchor="middle" font-size="9" font-weight="700" fill="currentColor">H</text>` },
  { id: 'booster',    name: 'Fire brigade booster',     category: SYMBOL_CATEGORIES.HYDRANT, standard: 'AS 2419',
    svg: `<circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" ${SW3}/><text x="12" y="15" text-anchor="middle" font-size="7" font-weight="700" fill="currentColor">BB</text>` },
  { id: 'brigade_box', name: 'Brigade contact box', category: SYMBOL_CATEGORIES.HYDRANT,
    svg: `<rect x="4" y="4" width="16" height="16" fill="none" stroke="currentColor" ${SW}/><text x="12" y="15" text-anchor="middle" font-size="6" font-weight="700" fill="currentColor">FB</text>` },
  { id: 'block_plan', name: 'Block plan', category: SYMBOL_CATEGORIES.HYDRANT,
    svg: `<rect x="3" y="3" width="18" height="18" fill="none" stroke="currentColor" ${SW}/><path d="M3 9h18M3 15h18M9 3v18M15 3v18" stroke="currentColor" stroke-width="1.5"/>` },

  // ---------- Egress ----------
  { id: 'egress_exit', name: 'Exit sign',               category: SYMBOL_CATEGORIES.EGRESS, standard: 'AS 2293',
    svg: `<rect x="2" y="8" width="20" height="9" fill="currentColor" opacity="0.15"/><rect x="2" y="8" width="20" height="9" fill="none" stroke="currentColor" ${SW}/><text x="12" y="15" text-anchor="middle" font-size="7" font-weight="700" fill="currentColor">EXIT</text>` },
  { id: 'egress_exit_left', name: 'Exit — arrow left', category: SYMBOL_CATEGORIES.EGRESS,
    svg: `<rect x="2" y="8" width="20" height="9" fill="none" stroke="currentColor" ${SW}/><path d="M8 12.5l-3-1.5 3-1.5M5 11h6" stroke="currentColor" ${SW}/><text x="16" y="15" text-anchor="middle" font-size="6" font-weight="700" fill="currentColor">EXIT</text>` },
  { id: 'egress_exit_right', name: 'Exit — arrow right', category: SYMBOL_CATEGORIES.EGRESS,
    svg: `<rect x="2" y="8" width="20" height="9" fill="none" stroke="currentColor" ${SW}/><path d="M16 9.5l3 1.5-3 1.5M19 11h-6" stroke="currentColor" ${SW}/><text x="8" y="15" text-anchor="middle" font-size="6" font-weight="700" fill="currentColor">EXIT</text>` },
  { id: 'egress_exit_up', name: 'Exit — arrow up', category: SYMBOL_CATEGORIES.EGRESS,
    svg: `<rect x="2" y="8" width="20" height="9" fill="none" stroke="currentColor" ${SW}/><path d="M12 11l-2-3M12 11l2-3M12 8v6" stroke="currentColor" ${SW}/><text x="17" y="15" text-anchor="middle" font-size="6" font-weight="700" fill="currentColor">EX</text>` },
  { id: 'egress_emerg', name: 'Emergency light',        category: SYMBOL_CATEGORIES.EGRESS, standard: 'AS 2293',
    svg: `<circle cx="12" cy="12" r="7" fill="currentColor" opacity="0.25"/><circle cx="12" cy="12" r="7" fill="none" stroke="currentColor" ${SW}/><text x="12" y="15" text-anchor="middle" font-size="7" font-weight="700" fill="currentColor">E</text>` },
  { id: 'egress_emerg_combined', name: 'Combined exit + emergency', category: SYMBOL_CATEGORIES.EGRESS,
    svg: `<rect x="2" y="6" width="20" height="12" fill="none" stroke="currentColor" ${SW}/><circle cx="6" cy="12" r="2" fill="currentColor"/><text x="15" y="15" text-anchor="middle" font-size="6" font-weight="700" fill="currentColor">EX/E</text>` },
  { id: 'egress_refuge', name: 'Disabled refuge area', category: SYMBOL_CATEGORIES.EGRESS,
    svg: `<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" ${SW}/><circle cx="11" cy="7" r="1.5" fill="currentColor"/><path d="M9 11h4l1 4M9 16h4M11 11v3" stroke="currentColor" ${SW}/>` },
  { id: 'egress_refuge_call', name: 'Refuge call point', category: SYMBOL_CATEGORIES.EGRESS,
    svg: `<rect x="4" y="4" width="16" height="16" rx="2" fill="none" stroke="currentColor" ${SW}/><path d="M9 13a1 1 0 011-1h1l1.5 2 2-1 2 1-1 2-2 .5a8 8 0 01-3.5-3z" fill="currentColor"/>` },
  { id: 'egress_photolum', name: 'Photoluminescent path', category: SYMBOL_CATEGORIES.EGRESS,
    svg: `<path d="M2 14h20" stroke="currentColor" ${SW}/><circle cx="4" cy="10" r="1.5" fill="currentColor"/><circle cx="9" cy="10" r="1.5" fill="currentColor"/><circle cx="15" cy="10" r="1.5" fill="currentColor"/><circle cx="20" cy="10" r="1.5" fill="currentColor"/>` },

  // ---------- Passive fire ----------
  { id: 'pas_firedoor', name: 'Fire door',              category: SYMBOL_CATEGORIES.PASSIVE, standard: 'AS 1905',
    svg: `<rect x="4" y="3" width="3" height="18" fill="currentColor"/><path d="M7 12l13-6v12L7 12z" fill="none" stroke="currentColor" ${SW}/>` },
  { id: 'pas_smoke_door', name: 'Smoke door',           category: SYMBOL_CATEGORIES.PASSIVE,
    svg: `<rect x="4" y="3" width="3" height="18" fill="currentColor"/><path d="M7 12l13-6v12L7 12z" fill="none" stroke="currentColor" ${SW}/><text x="14" y="14" text-anchor="middle" font-size="6" font-weight="700" fill="currentColor">S</text>` },
  { id: 'pas_pen',     name: 'Penetration seal',         category: SYMBOL_CATEGORIES.PASSIVE, standard: 'AS 1530.4',
    svg: `<rect x="4" y="4" width="16" height="16" fill="none" stroke="currentColor" ${SW}" stroke-dasharray="3 2"/><path d="M9 9l6 6M15 9l-6 6" stroke="currentColor" ${SW}/>` },
  { id: 'pas_collar',  name: 'Intumescent collar',       category: SYMBOL_CATEGORIES.PASSIVE,
    svg: `<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" ${SW}/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" ${SW}/>` },
  { id: 'pas_wall_frl', name: 'FRL wall (60/60/60)',     category: SYMBOL_CATEGORIES.PASSIVE,
    svg: `<rect x="2" y="9" width="20" height="6" fill="currentColor" opacity="0.3"/><rect x="2" y="9" width="20" height="6" fill="none" stroke="currentColor" ${SW3}/>` },
  { id: 'pas_fire_window', name: 'Fire-rated window', category: SYMBOL_CATEGORIES.PASSIVE,
    svg: `<rect x="3" y="6" width="18" height="12" fill="none" stroke="currentColor" ${SW}/><path d="M3 6l18 12M21 6L3 18" stroke="currentColor" stroke-width="1.5"/>` },
  { id: 'pas_fire_damper', name: 'Fire damper', category: SYMBOL_CATEGORIES.PASSIVE, standard: 'AS 1668',
    svg: `<rect x="3" y="8" width="18" height="8" fill="none" stroke="currentColor" ${SW}/><path d="M3 12h18M9 8v8M15 8v8" stroke="currentColor" ${SW}/>` },
  { id: 'pas_smoke_damper', name: 'Smoke damper', category: SYMBOL_CATEGORIES.PASSIVE, standard: 'AS 1668',
    svg: `<rect x="3" y="8" width="18" height="8" fill="none" stroke="currentColor" ${SW}/><path d="M5 8l4 8M11 8l4 8M17 8l3 6" stroke="currentColor" ${SW}/>` },
  { id: 'pas_fire_curtain', name: 'Fire curtain', category: SYMBOL_CATEGORIES.PASSIVE,
    svg: `<path d="M3 5h18M6 5v15M10 5v15M14 5v15M18 5v15" stroke="currentColor" ${SW}/>` },
  { id: 'pas_smoke_curtain', name: 'Smoke curtain', category: SYMBOL_CATEGORIES.PASSIVE,
    svg: `<path d="M3 5h18M6 5v15M10 5v15M14 5v15M18 5v15" stroke="currentColor" ${SW}" stroke-dasharray="2 2"/>` },

  // ---------- Special suppression ----------
  { id: 'sup_gas_nozzle', name: 'Gas suppression nozzle', category: SYMBOL_CATEGORIES.SUPPRESSION,
    svg: `<circle cx="12" cy="14" r="3" fill="none" stroke="currentColor" ${SW}/><path d="M12 11V7M9 7h6M10 4h4" stroke="currentColor" ${SW}/>` },
  { id: 'sup_fm200',     name: 'FM-200 cylinder',         category: SYMBOL_CATEGORIES.SUPPRESSION,
    svg: `<rect x="7" y="3" width="10" height="18" rx="2" fill="none" stroke="currentColor" ${SW}/><text x="12" y="14" text-anchor="middle" font-size="5" font-weight="700" fill="currentColor">FM200</text>` },
  { id: 'sup_inergen',   name: 'Inergen cylinder',        category: SYMBOL_CATEGORIES.SUPPRESSION,
    svg: `<rect x="7" y="3" width="10" height="18" rx="2" fill="none" stroke="currentColor" ${SW}/><text x="12" y="14" text-anchor="middle" font-size="5" font-weight="700" fill="currentColor">IG-55</text>` },
  { id: 'sup_kitchen_hood', name: 'Kitchen wet chem hood', category: SYMBOL_CATEGORIES.SUPPRESSION,
    svg: `<path d="M3 5l4 5h10l4-5M5 10v10h14V10" fill="none" stroke="currentColor" ${SW}/><circle cx="10" cy="15" r="1" fill="currentColor"/><circle cx="14" cy="15" r="1" fill="currentColor"/>` },
  { id: 'sup_watermist', name: 'Watermist head', category: SYMBOL_CATEGORIES.SUPPRESSION,
    svg: `<circle cx="12" cy="12" r="3" fill="currentColor"/><path d="M12 4v3M12 17v3M4 12h3M17 12h3M6 6l2 2M16 6l-2 2M6 18l2-2M16 18l-2-2" stroke="currentColor" ${SW}/>` },

  // ---------- Building services ----------
  { id: 'bs_stairs', name: 'Stairs', category: SYMBOL_CATEGORIES.BUILDING,
    svg: `<path d="M4 20v-3h4v-3h4v-3h4V8h4" fill="none" stroke="currentColor" ${SW}/>` },
  { id: 'bs_lift_passenger', name: 'Passenger lift', category: SYMBOL_CATEGORIES.BUILDING,
    svg: `<rect x="6" y="3" width="12" height="18" fill="none" stroke="currentColor" ${SW}/><path d="M12 6l-2 3h4l-2-3zM12 18l-2-3h4l-2 3z" fill="currentColor"/>` },
  { id: 'bs_lift_fire', name: 'Fire-rated lift', category: SYMBOL_CATEGORIES.BUILDING,
    svg: `<rect x="6" y="3" width="12" height="18" fill="none" stroke="currentColor" ${SW}/><text x="12" y="14" text-anchor="middle" font-size="7" font-weight="700" fill="currentColor">F</text>` },
  { id: 'bs_toilet', name: 'Toilet (WC)', category: SYMBOL_CATEGORIES.BUILDING,
    svg: `<rect x="6" y="4" width="12" height="16" fill="none" stroke="currentColor" ${SW}/><text x="12" y="14" text-anchor="middle" font-size="7" font-weight="700" fill="currentColor">WC</text>` },
  { id: 'bs_plant_room', name: 'Plant room', category: SYMBOL_CATEGORIES.BUILDING,
    svg: `<rect x="3" y="3" width="18" height="18" fill="none" stroke="currentColor" ${SW}/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" ${SW}/><path d="M12 7v2M12 15v2M5 12h2M17 12h2" stroke="currentColor" ${SW}/>` },
  { id: 'bs_substation', name: 'Substation', category: SYMBOL_CATEGORIES.BUILDING,
    svg: `<rect x="3" y="3" width="18" height="18" fill="none" stroke="currentColor" ${SW}/><path d="M13 5l-5 8h4l-3 6 6-9h-4l2-5z" fill="currentColor"/>` },
  { id: 'bs_gas_main', name: 'Gas main shutoff', category: SYMBOL_CATEGORIES.BUILDING,
    svg: `<rect x="6" y="6" width="12" height="12" fill="none" stroke="currentColor" ${SW}/><text x="12" y="15" text-anchor="middle" font-size="9" font-weight="700" fill="currentColor">G</text>` },
  { id: 'bs_service_riser', name: 'Service riser', category: SYMBOL_CATEGORIES.BUILDING,
    svg: `<rect x="9" y="3" width="6" height="18" fill="none" stroke="currentColor" ${SW}/><path d="M9 8h6M9 12h6M9 16h6" stroke="currentColor" stroke-width="1.5"/>` },

  // ---------- Reference marks ----------
  { id: 'ref_north', name: 'North arrow', category: SYMBOL_CATEGORIES.REFERENCE,
    svg: `<path d="M12 3l4 12-4-3-4 3z" fill="currentColor"/><text x="12" y="22" text-anchor="middle" font-size="7" font-weight="700" fill="currentColor">N</text>` },
  { id: 'ref_scale_bar', name: 'Scale bar', category: SYMBOL_CATEGORIES.REFERENCE,
    svg: `<rect x="3" y="10" width="5" height="4" fill="currentColor"/><rect x="8" y="10" width="5" height="4" fill="none" stroke="currentColor" ${SW}/><rect x="13" y="10" width="5" height="4" fill="currentColor"/><path d="M3 18v-3M8 18v-3M13 18v-3M18 18v-3" stroke="currentColor" ${SW}/>` },
  { id: 'ref_detail_bubble', name: 'Detail bubble', category: SYMBOL_CATEGORIES.REFERENCE,
    svg: `<circle cx="12" cy="12" r="7" fill="none" stroke="currentColor" ${SW3}/><path d="M5 12h-2M19 12h2M12 5V3M12 19v2" stroke="currentColor" ${SW}/><text x="12" y="15" text-anchor="middle" font-size="7" font-weight="700" fill="currentColor">A</text>` },
  { id: 'ref_section_bubble', name: 'Section reference', category: SYMBOL_CATEGORIES.REFERENCE,
    svg: `<circle cx="12" cy="10" r="5" fill="none" stroke="currentColor" ${SW}/><path d="M12 15v6M9 18h6" stroke="currentColor" ${SW}/><text x="12" y="12" text-anchor="middle" font-size="6" font-weight="700" fill="currentColor">A</text>` },
  { id: 'ref_zone_boundary', name: 'Zone boundary', category: SYMBOL_CATEGORIES.REFERENCE,
    svg: `<rect x="3" y="3" width="18" height="18" fill="none" stroke="currentColor" ${SW}" stroke-dasharray="4 3"/>` },

  // ---------- Generic construction ----------
  { id: 'door',       name: 'Door',                     category: SYMBOL_CATEGORIES.GENERIC,
    svg: `<path d="M4 20V4M4 4l16 16" fill="none" stroke="currentColor" ${SW}/><path d="M4 20A16 16 0 0020 4" fill="none" stroke="currentColor" stroke-width="1.5"/>` },
  { id: 'window',     name: 'Window',                   category: SYMBOL_CATEGORIES.GENERIC,
    svg: `<rect x="3" y="9" width="18" height="6" fill="none" stroke="currentColor" ${SW}/><path d="M12 9v6" stroke="currentColor" stroke-width="1.5"/>` },
  { id: 'gpo',        name: 'GPO outlet',               category: SYMBOL_CATEGORIES.ELECTRICAL,
    svg: `<circle cx="12" cy="12" r="7" fill="none" stroke="currentColor" ${SW}/><circle cx="10" cy="11" r="1.2" fill="currentColor"/><circle cx="14" cy="11" r="1.2" fill="currentColor"/>` },
  { id: 'switch',     name: 'Switch',                   category: SYMBOL_CATEGORIES.ELECTRICAL,
    svg: `<circle cx="12" cy="12" r="2.5" fill="currentColor"/><path d="M12 14l5 5" stroke="currentColor" ${SW}/>` },
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
export function renderSymbolToSVG(symbolId, color = '#0f172a', size = 28) {
  const sym = getSymbol(symbolId);
  if (!sym) return '';
  const safeColor = COLOR_RE.test(color) ? color : '#0f172a';
  const safeSize = Number.isFinite(size) ? Math.max(8, Math.min(256, Math.floor(size))) : 28;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${safeSize}" height="${safeSize}" viewBox="0 0 24 24" style="color:${safeColor}">${sym.svg}</svg>`;
}
