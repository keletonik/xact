import { ITEM_CATEGORIES, UNITS, FIRE_SCOPES } from '../utils/constants';

export const ALARM_ITEMS = [
  // Panels & Power
  { id: 'alm-panel-fip', name: 'Fire Indicator Panel (FIP) - 4 Loop', category: ITEM_CATEGORIES.MATERIAL, unit: UNITS.EACH, basePrice: 8500.00, brand: 'Notifier', model: 'NFS2-3030' },
  { id: 'alm-panel-fip-8', name: 'Fire Indicator Panel (FIP) - 8 Loop', category: ITEM_CATEGORIES.MATERIAL, unit: UNITS.EACH, basePrice: 14200.00, brand: 'Notifier', model: 'NFS2-3030' },
  { id: 'alm-panel-mimic', name: 'Mimic Panel', category: ITEM_CATEGORIES.MATERIAL, unit: UNITS.EACH, basePrice: 3200.00 },
  { id: 'alm-psu-24v', name: 'Power Supply 24V 6A', category: ITEM_CATEGORIES.MATERIAL, unit: UNITS.EACH, basePrice: 450.00 },
  { id: 'alm-battery-12v7', name: 'Battery 12V 7Ah (pair)', category: ITEM_CATEGORIES.MATERIAL, unit: UNITS.PAIR, basePrice: 85.00 },

  // Detection Devices
  { id: 'alm-smoke-photo', name: 'Photoelectric Smoke Detector', category: ITEM_CATEGORIES.MATERIAL, unit: UNITS.EACH, basePrice: 65.00, brand: 'Notifier', model: 'FSP-851' },
  { id: 'alm-smoke-photo-addr', name: 'Addressable Photoelectric Smoke Detector', category: ITEM_CATEGORIES.MATERIAL, unit: UNITS.EACH, basePrice: 95.00, brand: 'Notifier', model: 'FSP-851A' },
  { id: 'alm-heat-rof', name: 'Rate of Rise Heat Detector', category: ITEM_CATEGORIES.MATERIAL, unit: UNITS.EACH, basePrice: 55.00, brand: 'Notifier', model: 'FST-851' },
  { id: 'alm-heat-fixed', name: 'Fixed Temperature Heat Detector', category: ITEM_CATEGORIES.MATERIAL, unit: UNITS.EACH, basePrice: 48.00, brand: 'Notifier', model: 'FST-851H' },
  { id: 'alm-beam', name: 'Beam Detector (reflective)', category: ITEM_CATEGORIES.MATERIAL, unit: UNITS.EACH, basePrice: 1250.00 },
  { id: 'alm-duct', name: 'Duct Detector Assembly', category: ITEM_CATEGORIES.MATERIAL, unit: UNITS.EACH, basePrice: 380.00 },
  { id: 'alm-vesda-laser', name: 'VESDA Aspirating Detector (LaserPLUS)', category: ITEM_CATEGORIES.MATERIAL, unit: UNITS.EACH, basePrice: 4500.00, brand: 'Xtralis', model: 'VLP-002' },
  { id: 'alm-base', name: 'Detector Base (standard)', category: ITEM_CATEGORIES.MATERIAL, unit: UNITS.EACH, basePrice: 12.00 },

  // Manual Call Points & Sounders
  { id: 'alm-mcp', name: 'Manual Call Point (break glass)', category: ITEM_CATEGORIES.MATERIAL, unit: UNITS.EACH, basePrice: 78.00 },
  { id: 'alm-sounder', name: 'Sounder/Alert', category: ITEM_CATEGORIES.MATERIAL, unit: UNITS.EACH, basePrice: 95.00 },
  { id: 'alm-sounder-strobe', name: 'Sounder/Strobe Combo', category: ITEM_CATEGORIES.MATERIAL, unit: UNITS.EACH, basePrice: 165.00 },
  { id: 'alm-ewis-speaker', name: 'EWIS Speaker', category: ITEM_CATEGORIES.MATERIAL, unit: UNITS.EACH, basePrice: 120.00 },
  { id: 'alm-ewis-warden', name: 'EWIS Warden Intercom Phone', category: ITEM_CATEGORIES.MATERIAL, unit: UNITS.EACH, basePrice: 280.00 },

  // Interface & Monitoring
  { id: 'alm-relay-module', name: 'Relay Module (addressable)', category: ITEM_CATEGORIES.MATERIAL, unit: UNITS.EACH, basePrice: 145.00 },
  { id: 'alm-monitor-module', name: 'Monitor Module (addressable)', category: ITEM_CATEGORIES.MATERIAL, unit: UNITS.EACH, basePrice: 135.00 },
  { id: 'alm-isolator', name: 'Short Circuit Isolator', category: ITEM_CATEGORIES.MATERIAL, unit: UNITS.EACH, basePrice: 85.00 },

  // Cable
  { id: 'alm-cable-2c15', name: 'Fire Cable 2C x 1.5mm² Red', category: ITEM_CATEGORIES.MATERIAL, unit: UNITS.METRE, basePrice: 3.20 },
  { id: 'alm-cable-2c15-screen', name: 'Screened Fire Cable 2C x 1.5mm² Red', category: ITEM_CATEGORIES.MATERIAL, unit: UNITS.METRE, basePrice: 4.80 },
  { id: 'alm-cable-4c15', name: 'Fire Cable 4C x 1.5mm² Red', category: ITEM_CATEGORIES.MATERIAL, unit: UNITS.METRE, basePrice: 5.60 },
  { id: 'alm-conduit-20', name: 'Conduit 20mm Heavy Duty', category: ITEM_CATEGORIES.MATERIAL, unit: UNITS.METRE, basePrice: 4.50 },
  { id: 'alm-tray-150', name: 'Cable Tray 150mm', category: ITEM_CATEGORIES.MATERIAL, unit: UNITS.METRE, basePrice: 18.00 },

  // Labour
  { id: 'alm-lab-device', name: 'Install Detection Device', category: ITEM_CATEGORIES.LABOUR, unit: UNITS.EACH, basePrice: 42.00 },
  { id: 'alm-lab-mcp', name: 'Install Manual Call Point', category: ITEM_CATEGORIES.LABOUR, unit: UNITS.EACH, basePrice: 55.00 },
  { id: 'alm-lab-sounder', name: 'Install Sounder/Speaker', category: ITEM_CATEGORIES.LABOUR, unit: UNITS.EACH, basePrice: 48.00 },
  { id: 'alm-lab-cable', name: 'Install Fire Cable', category: ITEM_CATEGORIES.LABOUR, unit: UNITS.METRE, basePrice: 8.50 },
  { id: 'alm-lab-panel', name: 'Install & Program FIP', category: ITEM_CATEGORIES.LABOUR, unit: UNITS.EACH, basePrice: 3500.00 },
  { id: 'alm-lab-commission', name: 'Commission & Test Alarm System', category: ITEM_CATEGORIES.LABOUR, unit: UNITS.DAY, basePrice: 1100.00 },
  { id: 'alm-lab-cert', name: 'Certification & As-Built Documentation', category: ITEM_CATEGORIES.LABOUR, unit: UNITS.LOT, basePrice: 1800.00 },
];

export const ALARM_ASSEMBLIES = [
  {
    id: 'asm-alm-smoke-addr',
    name: 'Addressable Smoke Detector (installed)',
    description: 'Addressable photo smoke detector with base, cable, and installation',
    scope: FIRE_SCOPES.ALARM,
    driverUnit: UNITS.EACH,
    components: [
      { itemId: 'alm-smoke-photo-addr', itemName: 'Addressable Photoelectric Smoke Detector', category: ITEM_CATEGORIES.MATERIAL, unit: UNITS.EACH, basePrice: 95.00, quantityMultiplier: 1 },
      { itemId: 'alm-base', itemName: 'Detector Base', category: ITEM_CATEGORIES.MATERIAL, unit: UNITS.EACH, basePrice: 12.00, quantityMultiplier: 1 },
      { itemId: 'alm-cable-2c15-screen', itemName: 'Screened Fire Cable', category: ITEM_CATEGORIES.MATERIAL, unit: UNITS.METRE, basePrice: 4.80, quantityMultiplier: 15, slackPercent: 10 },
      { itemId: 'alm-lab-device', itemName: 'Install Device', category: ITEM_CATEGORIES.LABOUR, unit: UNITS.EACH, basePrice: 42.00, quantityMultiplier: 1 },
      { itemId: 'alm-lab-cable', itemName: 'Install Cable', category: ITEM_CATEGORIES.LABOUR, unit: UNITS.METRE, basePrice: 8.50, quantityMultiplier: 15 },
    ],
  },
  {
    id: 'asm-alm-mcp-installed',
    name: 'Manual Call Point (installed)',
    description: 'MCP with cable run and installation',
    scope: FIRE_SCOPES.ALARM,
    driverUnit: UNITS.EACH,
    components: [
      { itemId: 'alm-mcp', itemName: 'Manual Call Point', category: ITEM_CATEGORIES.MATERIAL, unit: UNITS.EACH, basePrice: 78.00, quantityMultiplier: 1 },
      { itemId: 'alm-cable-2c15', itemName: 'Fire Cable 2C 1.5mm²', category: ITEM_CATEGORIES.MATERIAL, unit: UNITS.METRE, basePrice: 3.20, quantityMultiplier: 20, slackPercent: 10 },
      { itemId: 'alm-lab-mcp', itemName: 'Install MCP', category: ITEM_CATEGORIES.LABOUR, unit: UNITS.EACH, basePrice: 55.00, quantityMultiplier: 1 },
      { itemId: 'alm-lab-cable', itemName: 'Install Cable', category: ITEM_CATEGORIES.LABOUR, unit: UNITS.METRE, basePrice: 8.50, quantityMultiplier: 20 },
    ],
  },
  {
    id: 'asm-alm-sounder-strobe',
    name: 'Sounder/Strobe (installed)',
    description: 'Sounder/strobe with cable and installation',
    scope: FIRE_SCOPES.ALARM,
    driverUnit: UNITS.EACH,
    components: [
      { itemId: 'alm-sounder-strobe', itemName: 'Sounder/Strobe Combo', category: ITEM_CATEGORIES.MATERIAL, unit: UNITS.EACH, basePrice: 165.00, quantityMultiplier: 1 },
      { itemId: 'alm-cable-2c15', itemName: 'Fire Cable', category: ITEM_CATEGORIES.MATERIAL, unit: UNITS.METRE, basePrice: 3.20, quantityMultiplier: 20, slackPercent: 10 },
      { itemId: 'alm-lab-sounder', itemName: 'Install Sounder', category: ITEM_CATEGORIES.LABOUR, unit: UNITS.EACH, basePrice: 48.00, quantityMultiplier: 1 },
      { itemId: 'alm-lab-cable', itemName: 'Install Cable', category: ITEM_CATEGORIES.LABOUR, unit: UNITS.METRE, basePrice: 8.50, quantityMultiplier: 20 },
    ],
  },
  {
    id: 'asm-alm-panel-4loop',
    name: 'FIP 4-Loop System (installed & programmed)',
    description: 'Complete FIP with PSU, batteries, installation and programming',
    scope: FIRE_SCOPES.ALARM,
    driverUnit: UNITS.EACH,
    components: [
      { itemId: 'alm-panel-fip', itemName: 'Fire Indicator Panel 4-Loop', category: ITEM_CATEGORIES.MATERIAL, unit: UNITS.EACH, basePrice: 8500.00, quantityMultiplier: 1 },
      { itemId: 'alm-psu-24v', itemName: 'Power Supply 24V', category: ITEM_CATEGORIES.MATERIAL, unit: UNITS.EACH, basePrice: 450.00, quantityMultiplier: 1 },
      { itemId: 'alm-battery-12v7', itemName: 'Batteries (pair)', category: ITEM_CATEGORIES.MATERIAL, unit: UNITS.PAIR, basePrice: 85.00, quantityMultiplier: 2 },
      { itemId: 'alm-lab-panel', itemName: 'Install & Program FIP', category: ITEM_CATEGORIES.LABOUR, unit: UNITS.EACH, basePrice: 3500.00, quantityMultiplier: 1 },
    ],
  },
  {
    id: 'asm-alm-commission',
    name: 'Fire Alarm System Commissioning',
    description: 'Full system test, commissioning and certification',
    scope: FIRE_SCOPES.ALARM,
    driverUnit: UNITS.LOT,
    components: [
      { itemId: 'alm-lab-commission', itemName: 'Commission & Test', category: ITEM_CATEGORIES.LABOUR, unit: UNITS.DAY, basePrice: 1100.00, quantityFormula: (qty, vars) => Math.max(2, Math.ceil((vars.deviceCount || 50) / 80)) },
      { itemId: 'alm-lab-cert', itemName: 'Certification & As-Builts', category: ITEM_CATEGORIES.LABOUR, unit: UNITS.LOT, basePrice: 1800.00, quantityMultiplier: 1 },
    ],
  },
];

export const ALARM_CHECKLIST = [
  { id: 'alm-chk-1', text: 'Detector types match area classification (AS 1670)', required: true },
  { id: 'alm-chk-2', text: 'Loop loading within panel capacity', required: true },
  { id: 'alm-chk-3', text: 'MCP locations per code requirements', required: true },
  { id: 'alm-chk-4', text: 'Sounder/speaker coverage meets dB requirements', required: true },
  { id: 'alm-chk-5', text: 'Cable sizing and type verified (fire rated where required)', required: true },
  { id: 'alm-chk-6', text: 'Short circuit isolators at required intervals', required: true },
  { id: 'alm-chk-7', text: 'EWIS requirements assessed (Class 2+)', required: false },
  { id: 'alm-chk-8', text: 'Battery standby capacity meets 24hr + 30min requirement', required: true },
  { id: 'alm-chk-9', text: 'Commissioning and certification included', required: true },
  { id: 'alm-chk-10', text: 'Cable slack allowances applied', required: false },
];
