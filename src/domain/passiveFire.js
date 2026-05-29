import {
  ASSET_TYPES, SUBSTRATES, SERVICE_TYPES, TEST_STANDARDS, MANUFACTURERS,
  ASSET_STATUSES, PHOTO_STAGES,
} from '../utils/constants';

/**
 * Evidence gate: an asset cannot be marked CERTIFIED without at least one
 * post-install photo. Returns true if the gate is satisfied.
 */
export function canCertify(asset, photos) {
  if (!asset || asset.status !== ASSET_STATUSES.INSTALLED) return false;
  return (photos || []).some((p) => p.assetId === asset.id && p.stage === PHOTO_STAGES.POST_INSTALL);
}

/**
 * Passive-fire domain primitives.
 *
 * FRL ('Fire Resistance Level') is the three-part string AS 1530.4 produces:
 *   structural-adequacy / integrity / insulation, minutes.
 * '-' means not required for that criterion. Worked example: '-/120/120' is
 * a wall with no structural-adequacy requirement, 120-min integrity, 120-min
 * insulation.
 */

/** Parse an FRL string into {sa, integrity, insulation} where each is number | null. */
export function parseFrl(frl) {
  if (!frl || typeof frl !== 'string') return null;
  const parts = frl.trim().split('/');
  if (parts.length !== 3) return null;
  const toN = (s) => (s === '-' ? null : Number.parseInt(s, 10));
  const sa = toN(parts[0]);
  const integrity = toN(parts[1]);
  const insulation = toN(parts[2]);
  if (sa !== null && Number.isNaN(sa)) return null;
  if (integrity !== null && Number.isNaN(integrity)) return null;
  if (insulation !== null && Number.isNaN(insulation)) return null;
  return { sa, integrity, insulation };
}

/** Format an {sa,integrity,insulation} object back to an FRL string. */
export function formatFrl(frl) {
  if (!frl) return '';
  const part = (n) => (n === null || n === undefined ? '-' : String(n));
  return `${part(frl.sa)}/${part(frl.integrity)}/${part(frl.insulation)}`;
}

/**
 * Does the achieved FRL meet the required FRL across every criterion?
 * A '-' on required means that criterion is not applicable.
 */
export function frlMeets(required, achieved) {
  const r = parseFrl(required);
  const a = parseFrl(achieved);
  if (!r || !a) return false;
  const ok = (req, act) => req === null || (act !== null && act >= req);
  return ok(r.sa, a.sa) && ok(r.integrity, a.integrity) && ok(r.insulation, a.insulation);
}

/**
 * SystemLibrary matrix search: which tested systems satisfy
 * (required FRL × substrate × service types)?
 *
 * @param systems  Array of SystemLibrary entries.
 * @param query    {requiredFrl, substrate, serviceTypes: string[], openingMm?}
 * @returns        Systems sorted by manufacturer, name.
 */
export function searchSystems(systems, query) {
  const { requiredFrl, substrate, serviceTypes = [], openingMm } = query;
  return systems
    .filter((sys) => {
      if (substrate && !sys.substratesSupported?.includes(substrate)) return false;
      if (serviceTypes.length > 0) {
        const supportsAll = serviceTypes.every((t) => sys.servicesSupported?.includes(t));
        if (!supportsAll) return false;
      }
      if (openingMm && sys.openingSizeRangeMm) {
        const [min, max] = sys.openingSizeRangeMm;
        if (openingMm < min || openingMm > max) return false;
      }
      if (requiredFrl && !frlMeets(requiredFrl, sys.testedFrl)) return false;
      return true;
    })
    .sort((a, b) => {
      const m = (a.manufacturer || '').localeCompare(b.manufacturer || '');
      return m !== 0 ? m : (a.systemName || '').localeCompare(b.systemName || '');
    });
}

/** Default required FRLs by element role under NCC Section C. Starting point only. */
export const DEFAULT_REQUIRED_FRL = {
  lift_shaft_wall:           '120/120/120',
  exit_stair_wall:           '120/120/120',
  service_shaft_wall:        '120/120/120',
  fire_compartment_wall:     '-/90/90',
  fire_compartment_floor:    '90/90/90',
  fire_door_to_exit_stair:   '-/60/30',
  fire_door_to_service_shaft:'-/60/30',
};

/** Asset-type permitted on substrate? Hard physical sanity check. */
export function assetTypeAllowedOn(assetType, substrate) {
  if (assetType === ASSET_TYPES.FIRE_DOOR) {
    return ![SUBSTRATES.FLOOR_SLAB, SUBSTRATES.CEILING_MEMBRANE].includes(substrate);
  }
  if (assetType === ASSET_TYPES.FIRE_DAMPER) {
    return substrate !== SUBSTRATES.CEILING_MEMBRANE;
  }
  return true;
}

export { ASSET_TYPES, SUBSTRATES, SERVICE_TYPES, TEST_STANDARDS, MANUFACTURERS, ASSET_STATUSES, PHOTO_STAGES };
