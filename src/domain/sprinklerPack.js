import { ITEM_CATEGORIES, UNITS, FIRE_SCOPES } from '../utils/constants';

export const SPRINKLER_ITEMS = [
  // Heads
  { id: 'spr-head-pend-68', name: 'Pendant Sprinkler Head 68°C', category: ITEM_CATEGORIES.MATERIAL, unit: UNITS.EACH, basePrice: 18.50, brand: 'Viking', model: 'VK302' },
  { id: 'spr-head-pend-79', name: 'Pendant Sprinkler Head 79°C', category: ITEM_CATEGORIES.MATERIAL, unit: UNITS.EACH, basePrice: 19.80, brand: 'Viking', model: 'VK302' },
  { id: 'spr-head-upright-68', name: 'Upright Sprinkler Head 68°C', category: ITEM_CATEGORIES.MATERIAL, unit: UNITS.EACH, basePrice: 18.50, brand: 'Viking', model: 'VK300' },
  { id: 'spr-head-sidewall', name: 'Sidewall Sprinkler Head 68°C', category: ITEM_CATEGORIES.MATERIAL, unit: UNITS.EACH, basePrice: 32.00, brand: 'Viking', model: 'VK305' },
  { id: 'spr-head-concealed', name: 'Concealed Sprinkler Head 68°C', category: ITEM_CATEGORIES.MATERIAL, unit: UNITS.EACH, basePrice: 45.00, brand: 'Tyco', model: 'TY-FRB' },
  { id: 'spr-head-esfr', name: 'ESFR Sprinkler Head K25.2', category: ITEM_CATEGORIES.MATERIAL, unit: UNITS.EACH, basePrice: 85.00, brand: 'Tyco', model: 'TY-ESFR' },

  // Pipe
  { id: 'spr-pipe-25', name: 'Sprinkler Pipe 25mm (1") Galv', category: ITEM_CATEGORIES.MATERIAL, unit: UNITS.METRE, basePrice: 12.80 },
  { id: 'spr-pipe-32', name: 'Sprinkler Pipe 32mm (1¼") Galv', category: ITEM_CATEGORIES.MATERIAL, unit: UNITS.METRE, basePrice: 16.50 },
  { id: 'spr-pipe-40', name: 'Sprinkler Pipe 40mm (1½") Galv', category: ITEM_CATEGORIES.MATERIAL, unit: UNITS.METRE, basePrice: 19.20 },
  { id: 'spr-pipe-50', name: 'Sprinkler Pipe 50mm (2") Galv', category: ITEM_CATEGORIES.MATERIAL, unit: UNITS.METRE, basePrice: 24.80 },
  { id: 'spr-pipe-65', name: 'Sprinkler Pipe 65mm (2½") Galv', category: ITEM_CATEGORIES.MATERIAL, unit: UNITS.METRE, basePrice: 35.40 },
  { id: 'spr-pipe-80', name: 'Sprinkler Pipe 80mm (3") Galv', category: ITEM_CATEGORIES.MATERIAL, unit: UNITS.METRE, basePrice: 42.60 },
  { id: 'spr-pipe-100', name: 'Sprinkler Pipe 100mm (4") Galv', category: ITEM_CATEGORIES.MATERIAL, unit: UNITS.METRE, basePrice: 58.90 },
  { id: 'spr-pipe-150', name: 'Sprinkler Pipe 150mm (6") Galv', category: ITEM_CATEGORIES.MATERIAL, unit: UNITS.METRE, basePrice: 96.50 },

  // Fittings & Valves
  { id: 'spr-valve-alarm', name: 'Alarm Valve Set (wet)', category: ITEM_CATEGORIES.MATERIAL, unit: UNITS.EACH, basePrice: 2850.00 },
  { id: 'spr-valve-deluge', name: 'Deluge Valve Set', category: ITEM_CATEGORIES.MATERIAL, unit: UNITS.EACH, basePrice: 4200.00 },
  { id: 'spr-valve-flow-sw', name: 'Flow Switch', category: ITEM_CATEGORIES.MATERIAL, unit: UNITS.EACH, basePrice: 185.00 },
  { id: 'spr-valve-gate', name: 'Gate Valve (OS&Y) 100mm', category: ITEM_CATEGORIES.MATERIAL, unit: UNITS.EACH, basePrice: 320.00 },
  { id: 'spr-valve-check', name: 'Check Valve 100mm', category: ITEM_CATEGORIES.MATERIAL, unit: UNITS.EACH, basePrice: 245.00 },
  { id: 'spr-hanger-std', name: 'Standard Pipe Hanger', category: ITEM_CATEGORIES.MATERIAL, unit: UNITS.EACH, basePrice: 8.50 },
  { id: 'spr-hanger-seismic', name: 'Seismic Brace Assembly', category: ITEM_CATEGORIES.MATERIAL, unit: UNITS.EACH, basePrice: 65.00 },
  { id: 'spr-coupling-grooved', name: 'Grooved Coupling (various)', category: ITEM_CATEGORIES.MATERIAL, unit: UNITS.EACH, basePrice: 28.00 },

  // Pumps & Tanks
  { id: 'spr-pump-electric', name: 'Electric Fire Pump 500L/min', category: ITEM_CATEGORIES.MATERIAL, unit: UNITS.EACH, basePrice: 18500.00 },
  { id: 'spr-pump-diesel', name: 'Diesel Fire Pump 1000L/min', category: ITEM_CATEGORIES.MATERIAL, unit: UNITS.EACH, basePrice: 35000.00 },
  { id: 'spr-pump-jockey', name: 'Jockey Pump', category: ITEM_CATEGORIES.MATERIAL, unit: UNITS.EACH, basePrice: 3200.00 },
  { id: 'spr-tank-bladder', name: 'Bladder Tank 500L', category: ITEM_CATEGORIES.MATERIAL, unit: UNITS.EACH, basePrice: 4800.00 },

  // Labour
  { id: 'spr-lab-head', name: 'Install Sprinkler Head', category: ITEM_CATEGORIES.LABOUR, unit: UNITS.EACH, basePrice: 55.00 },
  { id: 'spr-lab-pipe', name: 'Install Sprinkler Pipe', category: ITEM_CATEGORIES.LABOUR, unit: UNITS.METRE, basePrice: 35.00 },
  { id: 'spr-lab-valve', name: 'Install Valve Set', category: ITEM_CATEGORIES.LABOUR, unit: UNITS.EACH, basePrice: 850.00 },
  { id: 'spr-lab-hanger', name: 'Install Pipe Hanger', category: ITEM_CATEGORIES.LABOUR, unit: UNITS.EACH, basePrice: 22.00 },
  { id: 'spr-lab-commission', name: 'Commissioning & Testing', category: ITEM_CATEGORIES.LABOUR, unit: UNITS.DAY, basePrice: 1200.00 },
  { id: 'spr-lab-cert', name: 'Certification & Documentation', category: ITEM_CATEGORIES.LABOUR, unit: UNITS.LOT, basePrice: 1500.00 },
];

export const SPRINKLER_ASSEMBLIES = [
  {
    id: 'asm-spr-head-standard',
    name: 'Standard Pendant Head Assembly',
    description: 'Single pendant head with drop, fittings, and installation',
    scope: FIRE_SCOPES.SPRINKLER,
    driverUnit: UNITS.EACH,
    components: [
      { itemId: 'spr-head-pend-68', itemName: 'Pendant Sprinkler Head 68°C', category: ITEM_CATEGORIES.MATERIAL, unit: UNITS.EACH, basePrice: 18.50, quantityMultiplier: 1, wastagePercent: 5 },
      { itemId: 'spr-pipe-25', itemName: 'Drop Pipe 25mm', category: ITEM_CATEGORIES.MATERIAL, unit: UNITS.METRE, basePrice: 12.80, quantityMultiplier: 0.6, wastagePercent: 10 },
      { itemId: 'spr-coupling-grooved', itemName: 'Fittings allowance', category: ITEM_CATEGORIES.MATERIAL, unit: UNITS.EACH, basePrice: 28.00, quantityMultiplier: 2 },
      { itemId: 'spr-lab-head', itemName: 'Install Sprinkler Head', category: ITEM_CATEGORIES.LABOUR, unit: UNITS.EACH, basePrice: 55.00, quantityMultiplier: 1 },
    ],
  },
  {
    id: 'asm-spr-branch-25m',
    name: 'Branch Line 25mm (per metre)',
    description: '25mm branch piping with hangers at 1.8m centres',
    scope: FIRE_SCOPES.SPRINKLER,
    driverUnit: UNITS.METRE,
    components: [
      { itemId: 'spr-pipe-25', itemName: 'Sprinkler Pipe 25mm', category: ITEM_CATEGORIES.MATERIAL, unit: UNITS.METRE, basePrice: 12.80, quantityMultiplier: 1, wastagePercent: 8 },
      { itemId: 'spr-hanger-std', itemName: 'Standard Pipe Hanger', category: ITEM_CATEGORIES.MATERIAL, unit: UNITS.EACH, basePrice: 8.50, quantityFormula: (qty) => Math.ceil(qty / 1.8) },
      { itemId: 'spr-coupling-grooved', itemName: 'Grooved Coupling', category: ITEM_CATEGORIES.MATERIAL, unit: UNITS.EACH, basePrice: 28.00, quantityFormula: (qty) => Math.ceil(qty / 6) },
      { itemId: 'spr-lab-pipe', itemName: 'Install Sprinkler Pipe', category: ITEM_CATEGORIES.LABOUR, unit: UNITS.METRE, basePrice: 35.00, quantityMultiplier: 1 },
      { itemId: 'spr-lab-hanger', itemName: 'Install Pipe Hanger', category: ITEM_CATEGORIES.LABOUR, unit: UNITS.EACH, basePrice: 22.00, quantityFormula: (qty) => Math.ceil(qty / 1.8) },
    ],
  },
  {
    id: 'asm-spr-main-100m',
    name: 'Main Line 100mm (per metre)',
    description: '100mm main piping with hangers and seismic bracing',
    scope: FIRE_SCOPES.SPRINKLER,
    driverUnit: UNITS.METRE,
    components: [
      { itemId: 'spr-pipe-100', itemName: 'Sprinkler Pipe 100mm', category: ITEM_CATEGORIES.MATERIAL, unit: UNITS.METRE, basePrice: 58.90, quantityMultiplier: 1, wastagePercent: 5 },
      { itemId: 'spr-hanger-std', itemName: 'Standard Pipe Hanger', category: ITEM_CATEGORIES.MATERIAL, unit: UNITS.EACH, basePrice: 8.50, quantityFormula: (qty) => Math.ceil(qty / 3) },
      { itemId: 'spr-hanger-seismic', itemName: 'Seismic Brace', category: ITEM_CATEGORIES.MATERIAL, unit: UNITS.EACH, basePrice: 65.00, quantityFormula: (qty) => Math.ceil(qty / 12) },
      { itemId: 'spr-coupling-grooved', itemName: 'Grooved Coupling', category: ITEM_CATEGORIES.MATERIAL, unit: UNITS.EACH, basePrice: 28.00, quantityFormula: (qty) => Math.ceil(qty / 6) },
      { itemId: 'spr-lab-pipe', itemName: 'Install Sprinkler Pipe', category: ITEM_CATEGORIES.LABOUR, unit: UNITS.METRE, basePrice: 35.00, quantityMultiplier: 1.4 },
      { itemId: 'spr-lab-hanger', itemName: 'Install Pipe Hanger', category: ITEM_CATEGORIES.LABOUR, unit: UNITS.EACH, basePrice: 22.00, quantityFormula: (qty) => Math.ceil(qty / 3) },
    ],
  },
  {
    id: 'asm-spr-wet-valve-set',
    name: 'Wet Alarm Valve Set (complete)',
    description: 'Alarm valve with trim, gauges, and installation',
    scope: FIRE_SCOPES.SPRINKLER,
    driverUnit: UNITS.EACH,
    components: [
      { itemId: 'spr-valve-alarm', itemName: 'Alarm Valve Set', category: ITEM_CATEGORIES.MATERIAL, unit: UNITS.EACH, basePrice: 2850.00, quantityMultiplier: 1 },
      { itemId: 'spr-valve-gate', itemName: 'OS&Y Gate Valve', category: ITEM_CATEGORIES.MATERIAL, unit: UNITS.EACH, basePrice: 320.00, quantityMultiplier: 1 },
      { itemId: 'spr-valve-check', itemName: 'Check Valve', category: ITEM_CATEGORIES.MATERIAL, unit: UNITS.EACH, basePrice: 245.00, quantityMultiplier: 1 },
      { itemId: 'spr-valve-flow-sw', itemName: 'Flow Switch', category: ITEM_CATEGORIES.MATERIAL, unit: UNITS.EACH, basePrice: 185.00, quantityMultiplier: 1 },
      { itemId: 'spr-lab-valve', itemName: 'Install Valve Set', category: ITEM_CATEGORIES.LABOUR, unit: UNITS.EACH, basePrice: 850.00, quantityMultiplier: 1 },
    ],
  },
  {
    id: 'asm-spr-commission',
    name: 'Sprinkler System Commissioning',
    description: 'Testing, certification and documentation for sprinkler system',
    scope: FIRE_SCOPES.SPRINKLER,
    driverUnit: UNITS.LOT,
    components: [
      { itemId: 'spr-lab-commission', itemName: 'Commissioning & Testing', category: ITEM_CATEGORIES.LABOUR, unit: UNITS.DAY, basePrice: 1200.00, quantityFormula: (qty, vars) => Math.max(2, Math.ceil((vars.headCount || 50) / 100)) },
      { itemId: 'spr-lab-cert', itemName: 'Certification & Documentation', category: ITEM_CATEGORIES.LABOUR, unit: UNITS.LOT, basePrice: 1500.00, quantityMultiplier: 1 },
    ],
  },
];

export const SPRINKLER_CHECKLIST = [
  { id: 'spr-chk-1', text: 'Sprinkler head selection matches hazard classification', required: true },
  { id: 'spr-chk-2', text: 'Pipe sizing verified against hydraulic calculations', required: true },
  { id: 'spr-chk-3', text: 'Hanger spacing compliant with AS 2118', required: true },
  { id: 'spr-chk-4', text: 'Seismic bracing included where required', required: true },
  { id: 'spr-chk-5', text: 'Alarm valve and trim included', required: true },
  { id: 'spr-chk-6', text: 'Water supply adequate (pump/tank/town main)', required: true },
  { id: 'spr-chk-7', text: 'Commissioning and certification allowed', required: true },
  { id: 'spr-chk-8', text: 'Wastage/slack allowances applied', required: false },
  { id: 'spr-chk-9', text: 'Fitting factors applied for pipe complexity', required: false },
  { id: 'spr-chk-10', text: 'Access difficulty assessed and costed', required: false },
];
