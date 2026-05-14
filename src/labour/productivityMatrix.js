import { REGIONS, ACCESS_DIFFICULTY, UNITS } from '../utils/constants';

/**
 * Default labour productivity matrix.
 *
 * One entry per (trade, task) tuple. unitsPerHour is the *baseline* — multipliers
 * adjust for region and access difficulty.
 *
 * Rates are sourced from typical Australian fire-protection trade rates
 * (2024 indicative) and are configurable per-org via the Admin → Labour screen.
 */
const baseRegion = {
  [REGIONS.NSW]: 1.0,
  [REGIONS.VIC]: 0.98,
  [REGIONS.QLD]: 0.95,
  [REGIONS.WA]: 1.08,
  [REGIONS.SA]: 0.93,
  [REGIONS.TAS]: 0.96,
  [REGIONS.NT]: 1.15,
  [REGIONS.ACT]: 1.02,
};

const baseAccess = {
  [ACCESS_DIFFICULTY.STANDARD]: 1.0,
  [ACCESS_DIFFICULTY.RESTRICTED]: 1.15,
  [ACCESS_DIFFICULTY.HIGH_LEVEL]: 1.35,
  [ACCESS_DIFFICULTY.CONFINED]: 1.25,
  [ACCESS_DIFFICULTY.AFTER_HOURS]: 1.50,
};

export const LABOUR_TASKS = [
  // ---------- Sprinkler ----------
  { id: 'lt_spr_head', trade: 'sprinkler_fitter', task: 'Install sprinkler head (incl. drop)',         unit: UNITS.EACH,    unitsPerHour: 4.0,  hourlyRateCents: 12500 },
  { id: 'lt_spr_pipe25', trade: 'sprinkler_fitter', task: 'Install 25 mm BMS pipe',                    unit: UNITS.METRE,   unitsPerHour: 6.0,  hourlyRateCents: 12500 },
  { id: 'lt_spr_pipe50', trade: 'sprinkler_fitter', task: 'Install 50 mm BMS pipe',                    unit: UNITS.METRE,   unitsPerHour: 4.0,  hourlyRateCents: 12500 },
  { id: 'lt_spr_pipe100', trade: 'sprinkler_fitter', task: 'Install 100 mm BMS pipe',                  unit: UNITS.METRE,   unitsPerHour: 2.5,  hourlyRateCents: 12500 },
  { id: 'lt_spr_valveset', trade: 'sprinkler_fitter', task: 'Install valve set (wet)',                 unit: UNITS.EACH,    unitsPerHour: 0.25, hourlyRateCents: 14500 },
  { id: 'lt_spr_test',   trade: 'sprinkler_fitter', task: 'Pressure test & commission per branch',     unit: UNITS.EACH,    unitsPerHour: 1.5,  hourlyRateCents: 12500 },

  // ---------- Fire alarm / detection ----------
  { id: 'lt_alm_detect', trade: 'fire_tech', task: 'Install smoke / heat detector',                    unit: UNITS.EACH,    unitsPerHour: 3.0,  hourlyRateCents: 13500 },
  { id: 'lt_alm_mcp',    trade: 'fire_tech', task: 'Install manual call point',                        unit: UNITS.EACH,    unitsPerHour: 4.0,  hourlyRateCents: 13500 },
  { id: 'lt_alm_sounder', trade: 'fire_tech', task: 'Install sounder / strobe',                        unit: UNITS.EACH,    unitsPerHour: 4.0,  hourlyRateCents: 13500 },
  { id: 'lt_alm_fip',    trade: 'fire_tech', task: 'Install FIP / NDU',                                unit: UNITS.EACH,    unitsPerHour: 0.2,  hourlyRateCents: 15500 },
  { id: 'lt_alm_cable',  trade: 'cabler',     task: 'Run fire-rated cable',                            unit: UNITS.METRE,   unitsPerHour: 18.0, hourlyRateCents: 11500 },
  { id: 'lt_alm_commission', trade: 'fire_tech', task: 'Commission alarm zone',                        unit: UNITS.EACH,    unitsPerHour: 0.5,  hourlyRateCents: 15500 },

  // ---------- Passive fire ----------
  { id: 'lt_pas_pen_small',  trade: 'passive_installer', task: 'Penetration seal (≤100 mm)',           unit: UNITS.EACH,    unitsPerHour: 6.0,  hourlyRateCents: 11000 },
  { id: 'lt_pas_pen_large',  trade: 'passive_installer', task: 'Penetration seal (>100 mm)',           unit: UNITS.EACH,    unitsPerHour: 3.0,  hourlyRateCents: 11000 },
  { id: 'lt_pas_collar',     trade: 'passive_installer', task: 'Intumescent collar',                   unit: UNITS.EACH,    unitsPerHour: 4.0,  hourlyRateCents: 11000 },
  { id: 'lt_pas_firedoor',   trade: 'passive_installer', task: 'Inspect / tag fire door',              unit: UNITS.EACH,    unitsPerHour: 6.0,  hourlyRateCents: 11000 },
  { id: 'lt_pas_wall_frl',   trade: 'passive_installer', task: 'FRL plasterboard wall',                unit: UNITS.SQ_METRE, unitsPerHour: 2.0, hourlyRateCents: 11500 },

  // ---------- Portable / hydrant ----------
  { id: 'lt_ext_install',    trade: 'fire_tech', task: 'Install extinguisher (bracket + sign)',        unit: UNITS.EACH,    unitsPerHour: 6.0,  hourlyRateCents: 11500 },
  { id: 'lt_hyd_install',    trade: 'sprinkler_fitter', task: 'Install hydrant outlet',                unit: UNITS.EACH,    unitsPerHour: 0.5,  hourlyRateCents: 13500 },
  { id: 'lt_hose_reel',      trade: 'sprinkler_fitter', task: 'Install hose reel',                     unit: UNITS.EACH,    unitsPerHour: 1.0,  hourlyRateCents: 13500 },

  // ---------- Servicing ----------
  { id: 'lt_svc_routine_ext', trade: 'service_tech', task: '6-monthly extinguisher inspection',        unit: UNITS.EACH,    unitsPerHour: 18.0, hourlyRateCents: 10500 },
  { id: 'lt_svc_routine_det', trade: 'service_tech', task: 'Annual detector test (per device)',        unit: UNITS.EACH,    unitsPerHour: 10.0, hourlyRateCents: 10500 },
  { id: 'lt_svc_hyd_flow',    trade: 'service_tech', task: 'Annual hydrant flow test',                 unit: UNITS.EACH,    unitsPerHour: 1.0,  hourlyRateCents: 11500 },
  { id: 'lt_svc_door_tag',    trade: 'service_tech', task: 'Fire-door tag (annual)',                   unit: UNITS.EACH,    unitsPerHour: 8.0,  hourlyRateCents: 10500 },
].map((task) => ({
  ...task,
  regionMultipliers: { ...baseRegion },
  accessMultipliers: { ...baseAccess },
}));

/**
 * Compute the labour cost for a task given a quantity, region, access difficulty.
 * Returns integer cents.
 */
export function labourCost(task, qty, { region, access } = {}) {
  if (!task || !qty) return 0;
  const regionMul = task.regionMultipliers?.[region] ?? 1;
  const accessMul = task.accessMultipliers?.[access] ?? 1;
  const hours = qty / task.unitsPerHour;
  const cents = hours * task.hourlyRateCents * regionMul * accessMul;
  return Math.round(cents);
}

export function applyOnCosts(directCostCents, onCostPct = 0.35) {
  return Math.round(directCostCents * (1 + onCostPct));
}
