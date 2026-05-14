import { addDays, addMonths, addYears } from 'date-fns';

/**
 * AS 1851 — Routine service of fire protection systems & equipment.
 *
 * Each asset class maps to a default cadence. Real-world schedules vary by
 * jurisdiction and site classification; these are sensible defaults that can be
 * overridden per asset in the UI.
 */
export const AS1851_CADENCES = {
  // Extinguishers and reels
  extinguisher: [
    { frequency: '6m',  task: '6-monthly extinguisher inspection',  labourTaskId: 'lt_svc_routine_ext' },
    { frequency: '12m', task: 'Annual extinguisher inspection',      labourTaskId: 'lt_svc_routine_ext' },
    { frequency: '5y',  task: '5-yearly pressure test',              labourTaskId: 'lt_svc_routine_ext' },
  ],
  hose_reel: [
    { frequency: '6m',  task: '6-monthly hose reel inspection' },
    { frequency: '12m', task: 'Annual hose reel inspection + flow test' },
  ],
  // Sprinklers
  sprinkler_head: [
    { frequency: '12m', task: 'Annual sprinkler head visual inspection' },
    { frequency: '5y',  task: '5-yearly inspection (sampling)' },
  ],
  sprinkler_valveset: [
    { frequency: 'monthly', task: 'Monthly valve set inspection' },
    { frequency: '12m',     task: 'Annual trip test' },
  ],
  // Detection / alarm
  smoke_detector: [
    { frequency: '6m',  task: '6-monthly detector function test', labourTaskId: 'lt_svc_routine_det' },
    { frequency: '12m', task: 'Annual sensitivity test',          labourTaskId: 'lt_svc_routine_det' },
  ],
  heat_detector: [
    { frequency: '6m',  task: '6-monthly detector function test', labourTaskId: 'lt_svc_routine_det' },
  ],
  manual_call_point: [
    { frequency: '6m',  task: '6-monthly MCP test' },
  ],
  fip: [
    { frequency: 'monthly', task: 'Monthly FIP indication test' },
    { frequency: '12m',     task: 'Annual battery + power supply test' },
  ],
  // Hydrants
  hydrant: [
    { frequency: '6m',  task: '6-monthly hydrant inspection' },
    { frequency: '12m', task: 'Annual hydrant flow test', labourTaskId: 'lt_svc_hyd_flow' },
  ],
  booster: [
    { frequency: '12m', task: 'Annual booster test' },
  ],
  // Passive
  fire_door: [
    { frequency: '12m', task: 'Annual fire-door tag (AS 1851 §17)', labourTaskId: 'lt_svc_door_tag' },
  ],
  emergency_light: [
    { frequency: '6m',  task: '6-monthly discharge test' },
    { frequency: '12m', task: 'Annual emergency lighting test' },
  ],
};

/** Add a cadence interval to a date. */
export function advanceDate(from, frequency) {
  const d = new Date(from);
  switch (frequency) {
    case 'weekly':  return addDays(d, 7).toISOString();
    case 'monthly': return addMonths(d, 1).toISOString();
    case '3m':      return addMonths(d, 3).toISOString();
    case '6m':      return addMonths(d, 6).toISOString();
    case '12m':
    case 'annual':
    case 'yearly': return addYears(d, 1).toISOString();
    case '2y':     return addYears(d, 2).toISOString();
    case '5y':     return addYears(d, 5).toISOString();
    default:       return addYears(d, 1).toISOString();
  }
}

/**
 * For an asset with type and last-inspected date, produce the list of due
 * inspections within a window. Each output is a candidate work-order line.
 */
export function dueInspectionsFor(asset, windowStart = new Date().toISOString(), windowEnd = addYears(new Date(), 1).toISOString()) {
  const cadences = AS1851_CADENCES[asset.type] || [];
  const last = asset.lastInspectedAt || asset.installDate || new Date().toISOString();
  const due = [];
  const winStartMs = new Date(windowStart).getTime();
  const winEndMs = new Date(windowEnd).getTime();
  for (const c of cadences) {
    let next = advanceDate(last, c.frequency);
    let nextMs = new Date(next).getTime();
    while (nextMs <= winEndMs) {
      if (nextMs >= winStartMs) {
        due.push({
          assetId: asset.id,
          frequency: c.frequency,
          task: c.task,
          labourTaskId: c.labourTaskId,
          scheduledFor: next,
        });
      }
      next = advanceDate(next, c.frequency);
      nextMs = new Date(next).getTime();
    }
  }
  return due;
}
