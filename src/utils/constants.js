/**
 * XACT passive-fire constants. See REBUILD.md §3 for the domain model.
 */

export const ROLES = {
  OFFICE:     'office',     // estimator / admin
  SUPERVISOR: 'supervisor',
  INSTALLER:  'installer',
  INSPECTOR:  'inspector',  // AS 1851 routine inspection
  CERTIFIER:  'certifier',  // read-mostly
};

export const ROLE_LABELS = {
  [ROLES.OFFICE]:     'Office',
  [ROLES.SUPERVISOR]: 'Supervisor',
  [ROLES.INSTALLER]:  'Installer',
  [ROLES.INSPECTOR]:  'Inspector',
  [ROLES.CERTIFIER]:  'Certifier',
};

export const PROJECT_TYPES = {
  NEW_INSTALL:      'new_install',
  SURVEY:           'survey',             // AS 1851 baseline + audit
  SERVICE_CONTRACT: 'service_contract',   // ongoing AS 1851 routine
};

export const PROJECT_TYPE_LABELS = {
  [PROJECT_TYPES.NEW_INSTALL]:      'New install',
  [PROJECT_TYPES.SURVEY]:           'Survey / baseline',
  [PROJECT_TYPES.SERVICE_CONTRACT]: 'Service contract',
};

export const PROJECT_STATUSES = {
  ACTIVE:    'active',
  ON_HOLD:   'on_hold',
  COMPLETED: 'completed',
  ARCHIVED:  'archived',
};

export const PROJECT_STATUS_LABELS = {
  [PROJECT_STATUSES.ACTIVE]:    'Active',
  [PROJECT_STATUSES.ON_HOLD]:   'On hold',
  [PROJECT_STATUSES.COMPLETED]: 'Completed',
  [PROJECT_STATUSES.ARCHIVED]:  'Archived',
};

export const ASSET_TYPES = {
  PENETRATION:         'penetration',
  FIRE_DOOR:           'fire_door',
  FIRE_DAMPER:         'fire_damper',
  FIRE_SHUTTER:        'fire_shutter',
  JOINT_SEAL:          'joint_seal',
  STRUCTURAL_COATING:  'structural_coating',
  SMOKE_SEAL:          'smoke_seal',
};

export const ASSET_TYPE_LABELS = {
  [ASSET_TYPES.PENETRATION]:        'Penetration',
  [ASSET_TYPES.FIRE_DOOR]:          'Fire door',
  [ASSET_TYPES.FIRE_DAMPER]:        'Fire damper',
  [ASSET_TYPES.FIRE_SHUTTER]:       'Fire shutter',
  [ASSET_TYPES.JOINT_SEAL]:         'Joint seal',
  [ASSET_TYPES.STRUCTURAL_COATING]: 'Structural coating',
  [ASSET_TYPES.SMOKE_SEAL]:         'Smoke seal',
};

export const SUBSTRATES = {
  CONCRETE_SLAB:      'concrete_slab',
  CONCRETE_WALL:      'concrete_wall',
  MASONRY_WALL:       'masonry_wall',
  PLASTERBOARD_WALL:  'plasterboard_wall',
  SHAFT_WALL:         'shaft_wall',
  FLOOR_SLAB:         'floor_slab',
  RISER_SHAFT:        'riser_shaft',
  CEILING_MEMBRANE:   'ceiling_membrane',
};

export const SUBSTRATE_LABELS = {
  [SUBSTRATES.CONCRETE_SLAB]:     'Concrete slab',
  [SUBSTRATES.CONCRETE_WALL]:     'Concrete wall',
  [SUBSTRATES.MASONRY_WALL]:      'Masonry wall',
  [SUBSTRATES.PLASTERBOARD_WALL]: 'Plasterboard wall',
  [SUBSTRATES.SHAFT_WALL]:        'Shaft wall',
  [SUBSTRATES.FLOOR_SLAB]:        'Floor slab',
  [SUBSTRATES.RISER_SHAFT]:       'Riser shaft',
  [SUBSTRATES.CEILING_MEMBRANE]:  'Ceiling membrane',
};

export const SERVICE_TYPES = {
  CABLE_TRAY:    'cable_tray',
  CABLE_BUNDLE:  'cable_bundle',
  SINGLE_CABLE:  'single_cable',
  COPPER_PIPE:   'copper_pipe',
  PVC_PIPE:      'pvc_pipe',
  CAST_IRON:     'cast_iron',
  HVAC_DUCT:     'hvac_duct',
  STEEL_PIPE:    'steel_pipe',
  CONDUIT:       'conduit',
  EMPTY:         'empty_opening',
};

export const SERVICE_TYPE_LABELS = {
  [SERVICE_TYPES.CABLE_TRAY]:   'Cable tray',
  [SERVICE_TYPES.CABLE_BUNDLE]: 'Cable bundle',
  [SERVICE_TYPES.SINGLE_CABLE]: 'Single cable',
  [SERVICE_TYPES.COPPER_PIPE]:  'Copper pipe',
  [SERVICE_TYPES.PVC_PIPE]:     'PVC pipe',
  [SERVICE_TYPES.CAST_IRON]:    'Cast iron pipe',
  [SERVICE_TYPES.HVAC_DUCT]:    'HVAC duct',
  [SERVICE_TYPES.STEEL_PIPE]:   'Steel pipe',
  [SERVICE_TYPES.CONDUIT]:      'Conduit',
  [SERVICE_TYPES.EMPTY]:        'Empty opening',
};

export const ASSET_STATUSES = {
  PLANNED:        'planned',
  INSTALLED:      'installed',
  RECTIFICATION:  'rectification',
  CERTIFIED:      'certified',
  NONCONFORMANCE: 'nonconformance',
};

export const ASSET_STATUS_LABELS = {
  [ASSET_STATUSES.PLANNED]:        'Planned',
  [ASSET_STATUSES.INSTALLED]:      'Installed',
  [ASSET_STATUSES.RECTIFICATION]:  'Rectification',
  [ASSET_STATUSES.CERTIFIED]:      'Certified',
  [ASSET_STATUSES.NONCONFORMANCE]: 'Non-conformance',
};

export const PHOTO_STAGES = {
  PRE_INSTALL:        'pre_install',
  DURING:             'during',
  POST_INSTALL:       'post_install',
  ANNUAL_INSPECTION:  'annual_inspection',
};

export const PHOTO_STAGE_LABELS = {
  [PHOTO_STAGES.PRE_INSTALL]:       'Pre-install',
  [PHOTO_STAGES.DURING]:            'During',
  [PHOTO_STAGES.POST_INSTALL]:      'Post-install',
  [PHOTO_STAGES.ANNUAL_INSPECTION]: 'Annual inspection',
};

export const INSPECTION_FREQUENCIES = {
  BASELINE:    'baseline',
  ANNUAL:      'annual',
  FIVE_YEARLY: '5_yearly',
};

export const INSPECTION_FREQUENCY_LABELS = {
  [INSPECTION_FREQUENCIES.BASELINE]:    'Baseline',
  [INSPECTION_FREQUENCIES.ANNUAL]:      'Annual',
  [INSPECTION_FREQUENCIES.FIVE_YEARLY]: '5-yearly',
};

export const DEFECT_CLASSES = {
  A: 'A',  // immediate / safety critical
  B: 'B',  // requires rectification within a defined period
  C: 'C',  // observation / minor
};

export const DEFECT_CLASS_LABELS = {
  [DEFECT_CLASSES.A]: 'A (immediate)',
  [DEFECT_CLASSES.B]: 'B (programmed)',
  [DEFECT_CLASSES.C]: 'C (observation)',
};

export const TEST_STANDARDS = {
  AS_1530_4:   'AS 1530.4',
  EN_1366_3:   'EN 1366-3',
  EN_1366_4:   'EN 1366-4',
  UL_1479:     'UL 1479',
  ASTM_E814:   'ASTM E814',
};

export const CERT_PACK_TYPES = {
  FORM_15:              'form_15',
  FORM_16:              'form_16',
  AS_1851_BASELINE:     'as_1851_baseline',
  AS_1851_ANNUAL:       'as_1851_annual',
  INSTALL_CERTIFICATION:'install_certification',
  AFSS_EVIDENCE:        'afss_evidence',
};

export const CERT_PACK_TYPE_LABELS = {
  [CERT_PACK_TYPES.FORM_15]:              'Form 15 (design certificate)',
  [CERT_PACK_TYPES.FORM_16]:              'Form 16 (inspection certificate)',
  [CERT_PACK_TYPES.AS_1851_BASELINE]:     'AS 1851 baseline survey',
  [CERT_PACK_TYPES.AS_1851_ANNUAL]:       'AS 1851 annual inspection',
  [CERT_PACK_TYPES.INSTALL_CERTIFICATION]:'Install certification pack',
  [CERT_PACK_TYPES.AFSS_EVIDENCE]:        'AFSS evidence support pack',
};

export const MANUFACTURERS = {
  HILTI:     'Hilti',
  PROMAT:    'Promat',
  TRAFALGAR: 'Trafalgar Fire',
  BOSS:      'Boss Fire',
  FIRESAFE:  'FireSAFE',
  THREE_M:   '3M',
  PYROPHOBIC:'Pyrophobic',
  ROCKWOOL:  'Rockwool',
};

export const REGIONS = {
  NSW: 'nsw', VIC: 'vic', QLD: 'qld', WA: 'wa',
  SA:  'sa',  TAS: 'tas', NT:  'nt',  ACT: 'act',
};

export const REGION_LABELS = {
  [REGIONS.NSW]: 'NSW', [REGIONS.VIC]: 'VIC', [REGIONS.QLD]: 'QLD',
  [REGIONS.WA]:  'WA',  [REGIONS.SA]:  'SA',  [REGIONS.TAS]: 'TAS',
  [REGIONS.NT]:  'NT',  [REGIONS.ACT]: 'ACT',
};

export const TAX_RATE = 0.10; // GST

export const AUDIT_ACTIONS = {
  PROJECT_CREATED:        'project_created',
  PROJECT_UPDATED:        'project_updated',
  ASSET_CREATED:          'asset_created',
  ASSET_UPDATED:          'asset_updated',
  ASSET_INSTALLED:        'asset_installed',
  ASSET_SIGNED_OFF:       'asset_signed_off',
  PHOTO_CAPTURED:         'photo_captured',
  INSPECTION_PERFORMED:   'inspection_performed',
  DEFECT_RAISED:          'defect_raised',
  DEFECT_RECTIFIED:       'defect_rectified',
  CERT_PACK_GENERATED:    'cert_pack_generated',
  SYSTEM_LIBRARY_UPDATED: 'system_library_updated',
};
