import { ACCESS_DIFFICULTY_MULTIPLIERS } from '../utils/constants';

/**
 * Labour costing model.
 *
 * Crew model:
 * {
 *   name: string,
 *   members: [{ role, hourlyRate, count }],
 *   productivity: { unit, ratePerHour }  // e.g. 3 heads per hour
 * }
 */

export function computeCrewHourlyRate(crew) {
  return crew.members.reduce((sum, m) => sum + m.hourlyRate * m.count, 0);
}

export function computeLabourHours(quantity, productivity, conditions = {}) {
  if (!productivity || productivity.ratePerHour <= 0) return 0;

  let hours = quantity / productivity.ratePerHour;

  if (conditions.accessDifficulty) {
    const multiplier = ACCESS_DIFFICULTY_MULTIPLIERS[conditions.accessDifficulty] || 1.0;
    hours *= multiplier;
  }

  if (conditions.fittingFactor) {
    hours *= conditions.fittingFactor;
  }

  return roundToDP(hours, 2);
}

export function computeLabourCost(quantity, crew, conditions = {}) {
  const hours = computeLabourHours(quantity, crew.productivity, conditions);
  const hourlyRate = computeCrewHourlyRate(crew);
  return {
    hours: roundToDP(hours, 2),
    hourlyRate: roundToDP(hourlyRate, 2),
    total: roundToDP(hours * hourlyRate, 2),
  };
}

export function computePrelims(projectDays, config = {}) {
  const items = [];

  if (config.inductionHours) {
    items.push({
      description: 'Site induction',
      quantity: config.inductionHours,
      unit: 'hr',
      rate: config.labourRate || 85,
      total: roundToDP(config.inductionHours * (config.labourRate || 85), 2),
    });
  }

  if (config.swmsCount) {
    items.push({
      description: 'SWMS / JSA preparation',
      quantity: config.swmsCount,
      unit: 'ea',
      rate: config.swmsRate || 250,
      total: roundToDP(config.swmsCount * (config.swmsRate || 250), 2),
    });
  }

  if (config.travelDays) {
    items.push({
      description: 'Travel & mobilisation',
      quantity: config.travelDays,
      unit: 'day',
      rate: config.travelDayRate || 350,
      total: roundToDP(config.travelDays * (config.travelDayRate || 350), 2),
    });
  }

  if (config.qaDocSets) {
    items.push({
      description: 'QA documentation packs',
      quantity: config.qaDocSets,
      unit: 'set',
      rate: config.qaDocRate || 180,
      total: roundToDP(config.qaDocSets * (config.qaDocRate || 180), 2),
    });
  }

  if (projectDays > 0 && config.siteSetupRate) {
    items.push({
      description: 'Site setup & amenities',
      quantity: projectDays,
      unit: 'day',
      rate: config.siteSetupRate,
      total: roundToDP(projectDays * config.siteSetupRate, 2),
    });
  }

  return items;
}

export const DEFAULT_CREWS = {
  sprinklerInstall: {
    name: 'Sprinkler Install Crew',
    members: [
      { role: 'Sprinkler Fitter', hourlyRate: 95, count: 1 },
      { role: 'Apprentice', hourlyRate: 45, count: 1 },
    ],
    productivity: { unit: 'head', ratePerHour: 2.5 },
  },
  sprinklerPipe: {
    name: 'Sprinkler Pipe Crew',
    members: [
      { role: 'Sprinkler Fitter', hourlyRate: 95, count: 1 },
      { role: 'Apprentice', hourlyRate: 45, count: 1 },
    ],
    productivity: { unit: 'm', ratePerHour: 8 },
  },
  alarmInstall: {
    name: 'Fire Alarm Install Crew',
    members: [
      { role: 'Electrician', hourlyRate: 90, count: 1 },
      { role: 'Apprentice', hourlyRate: 42, count: 1 },
    ],
    productivity: { unit: 'device', ratePerHour: 3 },
  },
  cableInstall: {
    name: 'Cable Install Crew',
    members: [
      { role: 'Electrician', hourlyRate: 90, count: 1 },
      { role: 'Apprentice', hourlyRate: 42, count: 1 },
    ],
    productivity: { unit: 'm', ratePerHour: 25 },
  },
  passiveFire: {
    name: 'Passive Fire Crew',
    members: [
      { role: 'Passive Fire Tech', hourlyRate: 88, count: 1 },
      { role: 'Labourer', hourlyRate: 55, count: 1 },
    ],
    productivity: { unit: 'penetration', ratePerHour: 4 },
  },
};

function roundToDP(value, dp) {
  const factor = Math.pow(10, dp);
  return Math.round(value * factor) / factor;
}
