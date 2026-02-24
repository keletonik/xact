import { REGION_MODIFIERS, ACCESS_DIFFICULTY_MULTIPLIERS } from '../utils/constants';

/**
 * Pricing layers resolve a unit price for an item given contextual factors.
 * Order of resolution (later layers override earlier):
 *   1. Base price book rate
 *   2. Supplier override (if negotiated)
 *   3. Region modifier
 *   4. Time-based escalation
 *   5. Project-specific negotiated rate
 *   6. Access difficulty adjustment (labour only)
 */

export function resolveUnitPrice(item, context = {}) {
  const {
    supplierOverrides = {},
    region = null,
    escalationRate = 0,
    escalationMonths = 0,
    projectRates = {},
    accessDifficulty = 'standard',
  } = context;

  let price = item.basePrice || 0;

  // Layer 2: Supplier override
  if (supplierOverrides[item.id] != null) {
    price = supplierOverrides[item.id];
  }

  // Layer 3: Region modifier
  if (region && REGION_MODIFIERS[region]) {
    price *= REGION_MODIFIERS[region];
  }

  // Layer 4: Time-based escalation (compound monthly)
  if (escalationRate > 0 && escalationMonths > 0) {
    const monthlyRate = escalationRate / 12;
    price *= Math.pow(1 + monthlyRate, escalationMonths);
  }

  // Layer 5: Project-specific negotiated rate
  if (projectRates[item.id] != null) {
    price = projectRates[item.id];
  }

  // Layer 6: Access difficulty (applies to labour items)
  if (item.category === 'labour' && accessDifficulty !== 'standard') {
    const multiplier = ACCESS_DIFFICULTY_MULTIPLIERS[accessDifficulty] || 1.0;
    price *= multiplier;
  }

  return roundToDP(price, 2);
}

export function applyWastage(quantity, wastagePercent = 0) {
  return quantity * (1 + wastagePercent / 100);
}

export function applySlack(linearQuantity, slackPercent = 0) {
  return linearQuantity * (1 + slackPercent / 100);
}

export function calculateFittingFactor(baseLabourHours, fittingFactor = 1.0) {
  return baseLabourHours * fittingFactor;
}

function roundToDP(value, dp) {
  const factor = Math.pow(10, dp);
  return Math.round(value * factor) / factor;
}
