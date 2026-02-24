import { ITEM_CATEGORIES, UNITS, FIRE_SCOPES } from '../utils/constants';

export const PASSIVE_FIRE_ITEMS = [
  // Penetration Seals
  { id: 'pf-seal-collar-50', name: 'Intumescent Pipe Collar 50mm', category: ITEM_CATEGORIES.MATERIAL, unit: UNITS.EACH, basePrice: 42.00, brand: 'Hilti', model: 'CP 644' },
  { id: 'pf-seal-collar-80', name: 'Intumescent Pipe Collar 80mm', category: ITEM_CATEGORIES.MATERIAL, unit: UNITS.EACH, basePrice: 58.00, brand: 'Hilti', model: 'CP 644' },
  { id: 'pf-seal-collar-100', name: 'Intumescent Pipe Collar 100mm', category: ITEM_CATEGORIES.MATERIAL, unit: UNITS.EACH, basePrice: 72.00, brand: 'Hilti', model: 'CP 644' },
  { id: 'pf-seal-collar-150', name: 'Intumescent Pipe Collar 150mm', category: ITEM_CATEGORIES.MATERIAL, unit: UNITS.EACH, basePrice: 95.00, brand: 'Hilti', model: 'CP 644' },
  { id: 'pf-seal-sealant', name: 'Fire Rated Sealant 310ml', category: ITEM_CATEGORIES.MATERIAL, unit: UNITS.EACH, basePrice: 28.00, brand: 'Hilti', model: 'FS-ONE MAX' },
  { id: 'pf-seal-mortar', name: 'Fire Rated Mortar 20kg', category: ITEM_CATEGORIES.MATERIAL, unit: UNITS.EACH, basePrice: 65.00 },
  { id: 'pf-seal-pillow', name: 'Fire Pillows (pack of 20)', category: ITEM_CATEGORIES.MATERIAL, unit: UNITS.EACH, basePrice: 185.00 },
  { id: 'pf-seal-wrap', name: 'Intumescent Wrap Strip', category: ITEM_CATEGORIES.MATERIAL, unit: UNITS.METRE, basePrice: 22.00 },
  { id: 'pf-seal-batt', name: 'Fire Rated Mineral Wool Batt', category: ITEM_CATEGORIES.MATERIAL, unit: UNITS.SQ_METRE, basePrice: 35.00 },

  // Fire Dampers
  { id: 'pf-damper-300x200', name: 'Fire Damper 300x200mm', category: ITEM_CATEGORIES.MATERIAL, unit: UNITS.EACH, basePrice: 185.00 },
  { id: 'pf-damper-400x300', name: 'Fire Damper 400x300mm', category: ITEM_CATEGORIES.MATERIAL, unit: UNITS.EACH, basePrice: 265.00 },
  { id: 'pf-damper-600x400', name: 'Fire Damper 600x400mm', category: ITEM_CATEGORIES.MATERIAL, unit: UNITS.EACH, basePrice: 380.00 },
  { id: 'pf-damper-actuator', name: 'Motorised Actuator for Fire Damper', category: ITEM_CATEGORIES.MATERIAL, unit: UNITS.EACH, basePrice: 320.00 },

  // Fire Doors & Glazing
  { id: 'pf-door-single', name: 'Fire Door Single Leaf -/60/30', category: ITEM_CATEGORIES.MATERIAL, unit: UNITS.EACH, basePrice: 850.00 },
  { id: 'pf-door-double', name: 'Fire Door Double Leaf -/60/30', category: ITEM_CATEGORIES.MATERIAL, unit: UNITS.EACH, basePrice: 1450.00 },
  { id: 'pf-door-hardware', name: 'Fire Door Hardware Set', category: ITEM_CATEGORIES.MATERIAL, unit: UNITS.SET, basePrice: 320.00 },
  { id: 'pf-glazing-60', name: 'Fire Rated Glazing -/60/-', category: ITEM_CATEGORIES.MATERIAL, unit: UNITS.SQ_METRE, basePrice: 650.00 },

  // Coatings
  { id: 'pf-coat-intumescent', name: 'Intumescent Steel Coating', category: ITEM_CATEGORIES.MATERIAL, unit: UNITS.SQ_METRE, basePrice: 45.00 },
  { id: 'pf-coat-board', name: 'Fire Rated Board (Fyrchek)', category: ITEM_CATEGORIES.MATERIAL, unit: UNITS.SQ_METRE, basePrice: 32.00 },

  // Labour
  { id: 'pf-lab-collar', name: 'Install Intumescent Collar', category: ITEM_CATEGORIES.LABOUR, unit: UNITS.EACH, basePrice: 35.00 },
  { id: 'pf-lab-seal-small', name: 'Seal Small Penetration (<100mm)', category: ITEM_CATEGORIES.LABOUR, unit: UNITS.EACH, basePrice: 45.00 },
  { id: 'pf-lab-seal-large', name: 'Seal Large Penetration (>100mm)', category: ITEM_CATEGORIES.LABOUR, unit: UNITS.EACH, basePrice: 85.00 },
  { id: 'pf-lab-damper', name: 'Install Fire Damper', category: ITEM_CATEGORIES.LABOUR, unit: UNITS.EACH, basePrice: 180.00 },
  { id: 'pf-lab-door', name: 'Install Fire Door', category: ITEM_CATEGORIES.LABOUR, unit: UNITS.EACH, basePrice: 450.00 },
  { id: 'pf-lab-photo', name: 'Photographic Evidence Pack (per penetration)', category: ITEM_CATEGORIES.LABOUR, unit: UNITS.EACH, basePrice: 8.00 },
  { id: 'pf-lab-cert', name: 'Certification & Documentation', category: ITEM_CATEGORIES.LABOUR, unit: UNITS.LOT, basePrice: 1200.00 },
];

export const PASSIVE_FIRE_ASSEMBLIES = [
  {
    id: 'asm-pf-collar-pipe-50',
    name: 'Pipe Penetration Seal 50mm (complete)',
    description: 'Intumescent collar + sealant + install + photo evidence',
    scope: FIRE_SCOPES.PASSIVE,
    driverUnit: UNITS.EACH,
    components: [
      { itemId: 'pf-seal-collar-50', itemName: 'Intumescent Pipe Collar 50mm', category: ITEM_CATEGORIES.MATERIAL, unit: UNITS.EACH, basePrice: 42.00, quantityMultiplier: 1 },
      { itemId: 'pf-seal-sealant', itemName: 'Fire Rated Sealant', category: ITEM_CATEGORIES.MATERIAL, unit: UNITS.EACH, basePrice: 28.00, quantityMultiplier: 0.25 },
      { itemId: 'pf-lab-collar', itemName: 'Install Collar', category: ITEM_CATEGORIES.LABOUR, unit: UNITS.EACH, basePrice: 35.00, quantityMultiplier: 1 },
      { itemId: 'pf-lab-photo', itemName: 'Photo Evidence', category: ITEM_CATEGORIES.LABOUR, unit: UNITS.EACH, basePrice: 8.00, quantityMultiplier: 1 },
    ],
  },
  {
    id: 'asm-pf-collar-pipe-100',
    name: 'Pipe Penetration Seal 100mm (complete)',
    description: 'Intumescent collar + sealant + install + photo evidence',
    scope: FIRE_SCOPES.PASSIVE,
    driverUnit: UNITS.EACH,
    components: [
      { itemId: 'pf-seal-collar-100', itemName: 'Intumescent Pipe Collar 100mm', category: ITEM_CATEGORIES.MATERIAL, unit: UNITS.EACH, basePrice: 72.00, quantityMultiplier: 1 },
      { itemId: 'pf-seal-sealant', itemName: 'Fire Rated Sealant', category: ITEM_CATEGORIES.MATERIAL, unit: UNITS.EACH, basePrice: 28.00, quantityMultiplier: 0.5 },
      { itemId: 'pf-lab-seal-small', itemName: 'Seal Penetration', category: ITEM_CATEGORIES.LABOUR, unit: UNITS.EACH, basePrice: 45.00, quantityMultiplier: 1 },
      { itemId: 'pf-lab-photo', itemName: 'Photo Evidence', category: ITEM_CATEGORIES.LABOUR, unit: UNITS.EACH, basePrice: 8.00, quantityMultiplier: 1 },
    ],
  },
  {
    id: 'asm-pf-cable-pen',
    name: 'Cable Penetration Seal (complete)',
    description: 'Fire pillows + sealant + mineral wool + installation',
    scope: FIRE_SCOPES.PASSIVE,
    driverUnit: UNITS.EACH,
    components: [
      { itemId: 'pf-seal-pillow', itemName: 'Fire Pillows', category: ITEM_CATEGORIES.MATERIAL, unit: UNITS.EACH, basePrice: 185.00, quantityMultiplier: 0.15 },
      { itemId: 'pf-seal-batt', itemName: 'Mineral Wool', category: ITEM_CATEGORIES.MATERIAL, unit: UNITS.SQ_METRE, basePrice: 35.00, quantityMultiplier: 0.1 },
      { itemId: 'pf-seal-sealant', itemName: 'Fire Rated Sealant', category: ITEM_CATEGORIES.MATERIAL, unit: UNITS.EACH, basePrice: 28.00, quantityMultiplier: 0.5 },
      { itemId: 'pf-lab-seal-large', itemName: 'Seal Large Penetration', category: ITEM_CATEGORIES.LABOUR, unit: UNITS.EACH, basePrice: 85.00, quantityMultiplier: 1 },
      { itemId: 'pf-lab-photo', itemName: 'Photo Evidence', category: ITEM_CATEGORIES.LABOUR, unit: UNITS.EACH, basePrice: 8.00, quantityMultiplier: 1 },
    ],
  },
  {
    id: 'asm-pf-damper-400',
    name: 'Fire Damper 400x300 (installed)',
    description: 'Fire damper with actuator, install and certification',
    scope: FIRE_SCOPES.PASSIVE,
    driverUnit: UNITS.EACH,
    components: [
      { itemId: 'pf-damper-400x300', itemName: 'Fire Damper 400x300mm', category: ITEM_CATEGORIES.MATERIAL, unit: UNITS.EACH, basePrice: 265.00, quantityMultiplier: 1 },
      { itemId: 'pf-damper-actuator', itemName: 'Motorised Actuator', category: ITEM_CATEGORIES.MATERIAL, unit: UNITS.EACH, basePrice: 320.00, quantityMultiplier: 1 },
      { itemId: 'pf-lab-damper', itemName: 'Install Fire Damper', category: ITEM_CATEGORIES.LABOUR, unit: UNITS.EACH, basePrice: 180.00, quantityMultiplier: 1 },
    ],
  },
  {
    id: 'asm-pf-certification',
    name: 'Passive Fire Certification Package',
    description: 'Full documentation and certification for passive fire works',
    scope: FIRE_SCOPES.PASSIVE,
    driverUnit: UNITS.LOT,
    components: [
      { itemId: 'pf-lab-cert', itemName: 'Certification & Documentation', category: ITEM_CATEGORIES.LABOUR, unit: UNITS.LOT, basePrice: 1200.00, quantityMultiplier: 1 },
      { itemId: 'pf-lab-photo', itemName: 'Photo Evidence (batch)', category: ITEM_CATEGORIES.LABOUR, unit: UNITS.EACH, basePrice: 8.00, quantityFormula: (qty, vars) => vars.penetrationCount || 20 },
    ],
  },
];

export const PASSIVE_FIRE_CHECKLIST = [
  { id: 'pf-chk-1', text: 'Penetration schedule captured from drawings', required: true },
  { id: 'pf-chk-2', text: 'Service types identified (pipe, cable, mixed)', required: true },
  { id: 'pf-chk-3', text: 'Wall/floor FRL ratings confirmed', required: true },
  { id: 'pf-chk-4', text: 'Seal system compatible with service type and FRL', required: true },
  { id: 'pf-chk-5', text: 'Fire dampers included where ducts penetrate fire walls', required: true },
  { id: 'pf-chk-6', text: 'Photographic evidence requirements included', required: true },
  { id: 'pf-chk-7', text: 'Certification and documentation costed', required: true },
  { id: 'pf-chk-8', text: 'Access difficulty assessed for ceiling/riser locations', required: false },
];
