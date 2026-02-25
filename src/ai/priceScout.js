import { v4 as uuid } from 'uuid';
import useAuditStore from '../stores/useAuditStore';
import usePriceBookStore from '../stores/usePriceBookStore';

/**
 * Price Scout — searches for pricing intelligence on items.
 * All results go to an approval queue. Direct price book updates are forbidden.
 *
 * In production this would call external APIs (supplier portals, price aggregators).
 * For now it simulates results with realistic data patterns.
 */

export function createPriceScoutRequest(itemSpec) {
  const request = {
    id: uuid(),
    itemSpec: {
      name: itemSpec.name,
      brand: itemSpec.brand || '',
      model: itemSpec.model || '',
      size: itemSpec.size || '',
      standard: itemSpec.standard || '',
      region: itemSpec.region || 'nsw',
    },
    status: 'pending',
    createdAt: new Date().toISOString(),
    results: [],
  };

  useAuditStore.getState().log('ai_suggestion_created', {
    entityType: 'price_scout_request',
    entityId: request.id,
    description: `Price Scout request for "${itemSpec.name}"`,
    metadata: { itemSpec },
  });

  return request;
}

export function simulatePriceSearch(request) {
  const baseItem = usePriceBookStore.getState().searchItems(request.itemSpec.name)[0];
  const currentPrice = baseItem?.basePrice || 100;

  const variance = () => 0.8 + Math.random() * 0.4;
  const sources = [
    { supplier: 'National Fire Supplies', reliability: 0.92, deliveryDays: 3 },
    { supplier: 'FireTech Wholesale', reliability: 0.88, deliveryDays: 5 },
    { supplier: 'Allied Fire Products', reliability: 0.95, deliveryDays: 2 },
    { supplier: 'SafeGuard Distribution', reliability: 0.85, deliveryDays: 7 },
  ];

  const results = sources.map((source) => {
    const unitPrice = Math.round(currentPrice * variance() * 100) / 100;
    const packSize = [1, 5, 10, 20, 50][Math.floor(Math.random() * 5)];
    const packPrice = Math.round(unitPrice * packSize * 0.95 * 100) / 100;

    return {
      id: uuid(),
      supplier: source.supplier,
      unitPrice,
      packSize,
      packPrice,
      pricePerUnit: Math.round((packPrice / packSize) * 100) / 100,
      availability: Math.random() > 0.2 ? 'in_stock' : 'lead_time',
      deliveryDays: source.deliveryDays,
      lastVerified: new Date().toISOString(),
      confidence: Math.round((0.6 + Math.random() * 0.35) * 100) / 100,
      sourceEvidence: `Quoted via ${source.supplier} portal`,
      reliabilityScore: source.reliability,
    };
  });

  results.sort((a, b) => a.pricePerUnit - b.pricePerUnit);

  return {
    ...request,
    status: 'completed',
    results,
    completedAt: new Date().toISOString(),
    recommendedPrice: results[0]?.pricePerUnit || currentPrice,
    currentPrice,
    priceDelta: results[0] ? results[0].pricePerUnit - currentPrice : 0,
  };
}

export function submitPriceUpdate(searchResult, selectedResultId, itemId) {
  const result = searchResult.results.find((r) => r.id === selectedResultId);
  if (!result) return null;

  const item = usePriceBookStore.getState().getItem(itemId);

  const update = {
    itemId,
    itemName: item?.name || searchResult.itemSpec.name,
    currentPrice: item?.basePrice || 0,
    proposedPrice: result.pricePerUnit,
    source: result.supplier,
    confidence: result.confidence,
    evidence: result.sourceEvidence,
    searchRequestId: searchResult.id,
    resultId: selectedResultId,
  };

  usePriceBookStore.getState().addPendingUpdate(update);
  return update;
}

export function getScopeFlags(takeoffObjects, _projectScopes) {
  const flags = [];

  const hasDevices = takeoffObjects.some((o) => o.tags?.includes('device') || o.system === 'alarm');
  const hasPanel = takeoffObjects.some((o) => o.tags?.includes('panel') || o.label?.toLowerCase().includes('panel'));
  const hasCable = takeoffObjects.some((o) => o.type === 'linear' && o.system === 'alarm');

  if (hasDevices && !hasPanel) {
    flags.push({
      id: uuid(),
      type: 'missing_scope',
      severity: 'error',
      message: 'Detection devices found but no Fire Indicator Panel (FIP) included',
      recommendation: 'Add a FIP panel assembly to the estimate',
    });
  }

  if (hasDevices && !hasCable) {
    flags.push({
      id: uuid(),
      type: 'missing_scope',
      severity: 'warning',
      message: 'Detection devices found but no cable takeoff. Cable is typically required for wiring.',
      recommendation: 'Review cable requirements and add cable takeoff',
    });
  }

  const headCount = takeoffObjects.filter((o) => o.tags?.includes('head') || o.system === 'sprinkler').reduce((s, o) => s + o.quantity, 0);
  const commissioningIncluded = takeoffObjects.some((o) => o.label?.toLowerCase().includes('commission'));

  if (headCount > 0 && !commissioningIncluded) {
    flags.push({
      id: uuid(),
      type: 'missing_scope',
      severity: 'warning',
      message: `${headCount} sprinkler heads found but no commissioning line item`,
      recommendation: 'Add commissioning and certification assembly',
    });
  }

  const linearObjects = takeoffObjects.filter((o) => o.type === 'linear');
  const areaObjects = takeoffObjects.filter((o) => o.type === 'area');

  for (const lin of linearObjects) {
    for (const area of areaObjects) {
      if (lin.floor === area.floor && area.quantity > 0) {
        const ratio = lin.quantity / area.quantity;
        if (ratio < 0.5) {
          flags.push({
            id: uuid(),
            type: 'ratio_anomaly',
            severity: 'info',
            message: `Cable/pipe length (${lin.quantity}m) seems low relative to floor area (${area.quantity}m²) on ${lin.floor || 'this floor'}`,
            recommendation: 'Verify cable/pipe run lengths against floor area coverage',
          });
        }
      }
    }
  }

  return flags;
}
