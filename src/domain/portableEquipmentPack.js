import { ITEM_CATEGORIES, UNITS, FIRE_SCOPES } from '../utils/constants';

export const PORTABLE_ITEMS = [
  // Extinguishers
  { id: 'pe-ext-abe-45', name: 'ABE Dry Chemical Extinguisher 4.5kg', category: ITEM_CATEGORIES.MATERIAL, unit: UNITS.EACH, basePrice: 85.00 },
  { id: 'pe-ext-abe-90', name: 'ABE Dry Chemical Extinguisher 9.0kg', category: ITEM_CATEGORIES.MATERIAL, unit: UNITS.EACH, basePrice: 125.00 },
  { id: 'pe-ext-co2-35', name: 'CO2 Extinguisher 3.5kg', category: ITEM_CATEGORIES.MATERIAL, unit: UNITS.EACH, basePrice: 165.00 },
  { id: 'pe-ext-co2-50', name: 'CO2 Extinguisher 5.0kg', category: ITEM_CATEGORIES.MATERIAL, unit: UNITS.EACH, basePrice: 210.00 },
  { id: 'pe-ext-water-9', name: 'Water Extinguisher 9L', category: ITEM_CATEGORIES.MATERIAL, unit: UNITS.EACH, basePrice: 95.00 },
  { id: 'pe-ext-foam-9', name: 'Foam Extinguisher 9L', category: ITEM_CATEGORIES.MATERIAL, unit: UNITS.EACH, basePrice: 125.00 },
  { id: 'pe-ext-wetckem', name: 'Wet Chemical Extinguisher 7L', category: ITEM_CATEGORIES.MATERIAL, unit: UNITS.EACH, basePrice: 155.00 },
  { id: 'pe-ext-bracket', name: 'Extinguisher Wall Bracket', category: ITEM_CATEGORIES.MATERIAL, unit: UNITS.EACH, basePrice: 18.00 },
  { id: 'pe-ext-cabinet', name: 'Extinguisher Cabinet (recessed)', category: ITEM_CATEGORIES.MATERIAL, unit: UNITS.EACH, basePrice: 85.00 },

  // Fire Blankets
  { id: 'pe-blanket-12', name: 'Fire Blanket 1.2m x 1.2m', category: ITEM_CATEGORIES.MATERIAL, unit: UNITS.EACH, basePrice: 45.00 },
  { id: 'pe-blanket-18', name: 'Fire Blanket 1.8m x 1.2m', category: ITEM_CATEGORIES.MATERIAL, unit: UNITS.EACH, basePrice: 65.00 },

  // Hose Reels
  { id: 'pe-hose-reel-25', name: 'Fire Hose Reel 25mm x 36m (swing arm)', category: ITEM_CATEGORIES.MATERIAL, unit: UNITS.EACH, basePrice: 420.00 },
  { id: 'pe-hose-reel-valve', name: 'Stop Valve for Hose Reel', category: ITEM_CATEGORIES.MATERIAL, unit: UNITS.EACH, basePrice: 65.00 },

  // Hydrants
  { id: 'pe-hydrant-landing', name: 'Fire Hydrant Landing Valve (single)', category: ITEM_CATEGORIES.MATERIAL, unit: UNITS.EACH, basePrice: 280.00 },
  { id: 'pe-hydrant-double', name: 'Fire Hydrant Landing Valve (dual)', category: ITEM_CATEGORIES.MATERIAL, unit: UNITS.EACH, basePrice: 420.00 },
  { id: 'pe-hydrant-booster', name: 'Hydrant Booster Assembly', category: ITEM_CATEGORIES.MATERIAL, unit: UNITS.EACH, basePrice: 2800.00 },
  { id: 'pe-hydrant-pipe-65', name: 'Hydrant Pipe 65mm Galv', category: ITEM_CATEGORIES.MATERIAL, unit: UNITS.METRE, basePrice: 38.00 },
  { id: 'pe-hydrant-pipe-100', name: 'Hydrant Pipe 100mm Galv', category: ITEM_CATEGORIES.MATERIAL, unit: UNITS.METRE, basePrice: 62.00 },

  // Signage
  { id: 'pe-sign-ext', name: 'Extinguisher Location Sign (AS 1319)', category: ITEM_CATEGORIES.MATERIAL, unit: UNITS.EACH, basePrice: 12.00 },
  { id: 'pe-sign-hose', name: 'Hose Reel Location Sign', category: ITEM_CATEGORIES.MATERIAL, unit: UNITS.EACH, basePrice: 12.00 },
  { id: 'pe-sign-hydrant', name: 'Hydrant Location Sign', category: ITEM_CATEGORIES.MATERIAL, unit: UNITS.EACH, basePrice: 14.00 },
  { id: 'pe-sign-id', name: 'Extinguisher ID Sign (type/class)', category: ITEM_CATEGORIES.MATERIAL, unit: UNITS.EACH, basePrice: 8.00 },

  // Labour
  { id: 'pe-lab-ext-install', name: 'Install Extinguisher + Bracket', category: ITEM_CATEGORIES.LABOUR, unit: UNITS.EACH, basePrice: 32.00 },
  { id: 'pe-lab-hose-install', name: 'Install Hose Reel', category: ITEM_CATEGORIES.LABOUR, unit: UNITS.EACH, basePrice: 280.00 },
  { id: 'pe-lab-hydrant-install', name: 'Install Hydrant Landing Valve', category: ITEM_CATEGORIES.LABOUR, unit: UNITS.EACH, basePrice: 350.00 },
  { id: 'pe-lab-hydrant-pipe', name: 'Install Hydrant Pipe', category: ITEM_CATEGORIES.LABOUR, unit: UNITS.METRE, basePrice: 42.00 },
  { id: 'pe-lab-sign', name: 'Install Signage', category: ITEM_CATEGORIES.LABOUR, unit: UNITS.EACH, basePrice: 15.00 },
  { id: 'pe-lab-commission', name: 'Testing & Commissioning', category: ITEM_CATEGORIES.LABOUR, unit: UNITS.DAY, basePrice: 950.00 },
  { id: 'pe-lab-cert', name: 'Certification & Compliance Documentation', category: ITEM_CATEGORIES.LABOUR, unit: UNITS.LOT, basePrice: 800.00 },
];

export const PORTABLE_ASSEMBLIES = [
  {
    id: 'asm-pe-ext-abe-installed',
    name: 'ABE Extinguisher 4.5kg (installed + signed)',
    description: 'Extinguisher with bracket, signage, and installation',
    scope: FIRE_SCOPES.EXTINGUISHER,
    driverUnit: UNITS.EACH,
    components: [
      { itemId: 'pe-ext-abe-45', itemName: 'ABE Dry Chemical 4.5kg', category: ITEM_CATEGORIES.MATERIAL, unit: UNITS.EACH, basePrice: 85.00, quantityMultiplier: 1 },
      { itemId: 'pe-ext-bracket', itemName: 'Wall Bracket', category: ITEM_CATEGORIES.MATERIAL, unit: UNITS.EACH, basePrice: 18.00, quantityMultiplier: 1 },
      { itemId: 'pe-sign-ext', itemName: 'Location Sign', category: ITEM_CATEGORIES.MATERIAL, unit: UNITS.EACH, basePrice: 12.00, quantityMultiplier: 1 },
      { itemId: 'pe-sign-id', itemName: 'ID Sign', category: ITEM_CATEGORIES.MATERIAL, unit: UNITS.EACH, basePrice: 8.00, quantityMultiplier: 1 },
      { itemId: 'pe-lab-ext-install', itemName: 'Install Extinguisher', category: ITEM_CATEGORIES.LABOUR, unit: UNITS.EACH, basePrice: 32.00, quantityMultiplier: 1 },
      { itemId: 'pe-lab-sign', itemName: 'Install Signage', category: ITEM_CATEGORIES.LABOUR, unit: UNITS.EACH, basePrice: 15.00, quantityMultiplier: 2 },
    ],
  },
  {
    id: 'asm-pe-hose-reel-installed',
    name: 'Fire Hose Reel (installed + signed)',
    description: 'Hose reel with valve, signage, and plumbing connection',
    scope: FIRE_SCOPES.HYDRANT,
    driverUnit: UNITS.EACH,
    components: [
      { itemId: 'pe-hose-reel-25', itemName: 'Fire Hose Reel 25mm x 36m', category: ITEM_CATEGORIES.MATERIAL, unit: UNITS.EACH, basePrice: 420.00, quantityMultiplier: 1 },
      { itemId: 'pe-hose-reel-valve', itemName: 'Stop Valve', category: ITEM_CATEGORIES.MATERIAL, unit: UNITS.EACH, basePrice: 65.00, quantityMultiplier: 1 },
      { itemId: 'pe-sign-hose', itemName: 'Location Sign', category: ITEM_CATEGORIES.MATERIAL, unit: UNITS.EACH, basePrice: 12.00, quantityMultiplier: 1 },
      { itemId: 'pe-lab-hose-install', itemName: 'Install Hose Reel', category: ITEM_CATEGORIES.LABOUR, unit: UNITS.EACH, basePrice: 280.00, quantityMultiplier: 1 },
      { itemId: 'pe-lab-sign', itemName: 'Install Signage', category: ITEM_CATEGORIES.LABOUR, unit: UNITS.EACH, basePrice: 15.00, quantityMultiplier: 1 },
    ],
  },
  {
    id: 'asm-pe-hydrant-landing',
    name: 'Hydrant Landing Valve (installed)',
    description: 'Single hydrant with pipe connection and signage',
    scope: FIRE_SCOPES.HYDRANT,
    driverUnit: UNITS.EACH,
    components: [
      { itemId: 'pe-hydrant-landing', itemName: 'Landing Valve (single)', category: ITEM_CATEGORIES.MATERIAL, unit: UNITS.EACH, basePrice: 280.00, quantityMultiplier: 1 },
      { itemId: 'pe-hydrant-pipe-65', itemName: 'Hydrant Pipe 65mm', category: ITEM_CATEGORIES.MATERIAL, unit: UNITS.METRE, basePrice: 38.00, quantityMultiplier: 5 },
      { itemId: 'pe-sign-hydrant', itemName: 'Location Sign', category: ITEM_CATEGORIES.MATERIAL, unit: UNITS.EACH, basePrice: 14.00, quantityMultiplier: 1 },
      { itemId: 'pe-lab-hydrant-install', itemName: 'Install Landing Valve', category: ITEM_CATEGORIES.LABOUR, unit: UNITS.EACH, basePrice: 350.00, quantityMultiplier: 1 },
      { itemId: 'pe-lab-hydrant-pipe', itemName: 'Install Pipe', category: ITEM_CATEGORIES.LABOUR, unit: UNITS.METRE, basePrice: 42.00, quantityMultiplier: 5 },
      { itemId: 'pe-lab-sign', itemName: 'Install Signage', category: ITEM_CATEGORIES.LABOUR, unit: UNITS.EACH, basePrice: 15.00, quantityMultiplier: 1 },
    ],
  },
];

export const PORTABLE_CHECKLIST = [
  { id: 'pe-chk-1', text: 'Extinguisher types match area hazard classification', required: true },
  { id: 'pe-chk-2', text: 'Extinguisher travel distances within code limits', required: true },
  { id: 'pe-chk-3', text: 'Hose reel coverage verified (each area within 4m of nozzle reach)', required: true },
  { id: 'pe-chk-4', text: 'Hydrant locations per AS 2419 requirements', required: true },
  { id: 'pe-chk-5', text: 'Booster assembly included where required', required: true },
  { id: 'pe-chk-6', text: 'All signage compliant with AS 1319', required: true },
  { id: 'pe-chk-7', text: 'Compliance documentation and certification included', required: true },
];
