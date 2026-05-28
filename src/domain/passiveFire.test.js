import { describe, it, expect } from 'vitest';
import {
  parseFrl, formatFrl, frlMeets, searchSystems, assetTypeAllowedOn,
  ASSET_TYPES, SUBSTRATES, SERVICE_TYPES,
} from './passiveFire';

describe('parseFrl', () => {
  it('parses a standard three-part FRL', () => {
    expect(parseFrl('-/120/120')).toEqual({ sa: null, integrity: 120, insulation: 120 });
  });
  it('parses an all-numeric FRL', () => {
    expect(parseFrl('90/90/60')).toEqual({ sa: 90, integrity: 90, insulation: 60 });
  });
  it('returns null for malformed input', () => {
    expect(parseFrl('not-an-frl')).toBeNull();
    expect(parseFrl('120/120')).toBeNull();
    expect(parseFrl('')).toBeNull();
    expect(parseFrl(null)).toBeNull();
  });
});

describe('formatFrl', () => {
  it('roundtrips with parseFrl', () => {
    const cases = ['-/120/120', '90/90/60', '-/240/180'];
    for (const frl of cases) expect(formatFrl(parseFrl(frl))).toBe(frl);
  });
});

describe('frlMeets', () => {
  it('passes when achieved equals required across criteria', () => {
    expect(frlMeets('-/120/120', '-/120/120')).toBe(true);
  });
  it('passes when achieved exceeds required', () => {
    expect(frlMeets('-/120/120', '-/240/180')).toBe(true);
  });
  it("treats '-' as no requirement", () => {
    expect(frlMeets('-/120/-', '120/120/0')).toBe(true);
  });
  it('fails when integrity is under-rated', () => {
    expect(frlMeets('-/120/120', '-/60/120')).toBe(false);
  });
  it('fails when insulation is under-rated even if integrity passes', () => {
    expect(frlMeets('-/120/120', '-/120/60')).toBe(false);
  });
  it('fails when achieved has no value for a required criterion', () => {
    expect(frlMeets('-/120/120', '-/120/-')).toBe(false);
  });
});

describe('searchSystems matrix', () => {
  const systems = [
    {
      id: 'a',
      manufacturer: 'Hilti',
      systemName: 'CFS-CT',
      testedFrl: '-/240/240',
      substratesSupported: [SUBSTRATES.CONCRETE_SLAB, SUBSTRATES.CONCRETE_WALL],
      servicesSupported: [SERVICE_TYPES.CABLE_TRAY, SERVICE_TYPES.CABLE_BUNDLE],
      openingSizeRangeMm: [100, 1200],
    },
    {
      id: 'b',
      manufacturer: 'Trafalgar',
      systemName: 'FyreCollar',
      testedFrl: '-/120/120',
      substratesSupported: [SUBSTRATES.CONCRETE_SLAB, SUBSTRATES.PLASTERBOARD_WALL],
      servicesSupported: [SERVICE_TYPES.PVC_PIPE, SERVICE_TYPES.CAST_IRON],
      openingSizeRangeMm: [40, 160],
    },
    {
      id: 'c',
      manufacturer: 'Promat',
      systemName: 'PROMASEAL Batt',
      testedFrl: '-/180/180',
      substratesSupported: [SUBSTRATES.CONCRETE_SLAB, SUBSTRATES.SHAFT_WALL],
      servicesSupported: [SERVICE_TYPES.CABLE_TRAY, SERVICE_TYPES.HVAC_DUCT, SERVICE_TYPES.CONDUIT],
      openingSizeRangeMm: [150, 2000],
    },
  ];

  it('filters by substrate', () => {
    const out = searchSystems(systems, { substrate: SUBSTRATES.SHAFT_WALL });
    expect(out.map((s) => s.id)).toEqual(['c']);
  });

  it('filters by required FRL (achieved must meet across criteria)', () => {
    const out = searchSystems(systems, { requiredFrl: '-/180/180' });
    expect(out.map((s) => s.id).sort()).toEqual(['a', 'c']);
  });

  it('requires the system to support ALL queried service types', () => {
    const out = searchSystems(systems, {
      serviceTypes: [SERVICE_TYPES.CABLE_TRAY, SERVICE_TYPES.HVAC_DUCT],
    });
    expect(out.map((s) => s.id)).toEqual(['c']);
  });

  it('honours opening-size range', () => {
    const out = searchSystems(systems, { openingMm: 80 });
    expect(out.map((s) => s.id)).toEqual(['b']);
  });

  it('combines constraints', () => {
    const out = searchSystems(systems, {
      requiredFrl: '-/120/120',
      substrate: SUBSTRATES.CONCRETE_SLAB,
      serviceTypes: [SERVICE_TYPES.CABLE_TRAY],
    });
    expect(out.map((s) => s.id).sort()).toEqual(['a', 'c']);
  });

  it('sorts by manufacturer then system name', () => {
    const out = searchSystems(systems, {});
    expect(out.map((s) => s.manufacturer)).toEqual(['Hilti', 'Promat', 'Trafalgar']);
  });
});

describe('assetTypeAllowedOn', () => {
  it('forbids fire doors on floor slabs', () => {
    expect(assetTypeAllowedOn(ASSET_TYPES.FIRE_DOOR, SUBSTRATES.FLOOR_SLAB)).toBe(false);
  });
  it('forbids fire dampers in ceiling membranes', () => {
    expect(assetTypeAllowedOn(ASSET_TYPES.FIRE_DAMPER, SUBSTRATES.CEILING_MEMBRANE)).toBe(false);
  });
  it('allows penetrations anywhere', () => {
    for (const sub of Object.values(SUBSTRATES)) {
      expect(assetTypeAllowedOn(ASSET_TYPES.PENETRATION, sub)).toBe(true);
    }
  });
});
