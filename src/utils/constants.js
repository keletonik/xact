export const ROLES = {
  ADMIN: 'admin',
  ESTIMATOR: 'estimator',
  VIEWER: 'viewer',
  AUDITOR: 'auditor',
};

export const ROLE_LABELS = {
  [ROLES.ADMIN]: 'Admin',
  [ROLES.ESTIMATOR]: 'Estimator',
  [ROLES.VIEWER]: 'Viewer',
  [ROLES.AUDITOR]: 'Auditor',
};

export const PROJECT_STATUSES = {
  LEAD: 'lead',
  OPPORTUNITY: 'opportunity',
  QUOTING: 'quoting',
  QUOTED: 'quoted',
  WON: 'won',
  LOST: 'lost',
  ON_HOLD: 'on_hold',
};

export const PROJECT_STATUS_LABELS = {
  [PROJECT_STATUSES.LEAD]: 'Lead',
  [PROJECT_STATUSES.OPPORTUNITY]: 'Opportunity',
  [PROJECT_STATUSES.QUOTING]: 'Quoting',
  [PROJECT_STATUSES.QUOTED]: 'Quoted',
  [PROJECT_STATUSES.WON]: 'Won',
  [PROJECT_STATUSES.LOST]: 'Lost',
  [PROJECT_STATUSES.ON_HOLD]: 'On Hold',
};

export const ESTIMATE_STATUSES = {
  DRAFT: 'draft',
  IN_REVIEW: 'in_review',
  APPROVED: 'approved',
  SENT: 'sent',
  ACCEPTED: 'accepted',
  DECLINED: 'declined',
  SUPERSEDED: 'superseded',
};

export const ESTIMATE_STATUS_LABELS = {
  [ESTIMATE_STATUSES.DRAFT]: 'Draft',
  [ESTIMATE_STATUSES.IN_REVIEW]: 'In Review',
  [ESTIMATE_STATUSES.APPROVED]: 'Approved',
  [ESTIMATE_STATUSES.SENT]: 'Sent',
  [ESTIMATE_STATUSES.ACCEPTED]: 'Accepted',
  [ESTIMATE_STATUSES.DECLINED]: 'Declined',
  [ESTIMATE_STATUSES.SUPERSEDED]: 'Superseded',
};

export const TAKEOFF_OBJECT_TYPES = {
  COUNT: 'count',
  LINEAR: 'linear',
  AREA: 'area',
  VOLUME: 'volume',
};

export const ITEM_CATEGORIES = {
  MATERIAL: 'material',
  LABOUR: 'labour',
  PLANT: 'plant',
  SUBCONTRACT: 'subcontract',
  PERMIT: 'permit',
  PRELIMINARY: 'preliminary',
};

export const ITEM_CATEGORY_LABELS = {
  [ITEM_CATEGORIES.MATERIAL]: 'Material',
  [ITEM_CATEGORIES.LABOUR]: 'Labour',
  [ITEM_CATEGORIES.PLANT]: 'Plant & Equipment',
  [ITEM_CATEGORIES.SUBCONTRACT]: 'Subcontract',
  [ITEM_CATEGORIES.PERMIT]: 'Permits & Fees',
  [ITEM_CATEGORIES.PRELIMINARY]: 'Preliminaries',
};

export const FIRE_SCOPES = {
  SPRINKLER: 'sprinkler',
  ALARM: 'alarm',
  PASSIVE: 'passive',
  EXTINGUISHER: 'extinguisher',
  HYDRANT: 'hydrant',
  EGRESS: 'egress',
  EWIS: 'ewis',
  DETECTION: 'detection',
  SUPPRESSION: 'suppression',
};

export const FIRE_SCOPE_LABELS = {
  [FIRE_SCOPES.SPRINKLER]: 'Fire Sprinkler',
  [FIRE_SCOPES.ALARM]: 'Fire Alarm',
  [FIRE_SCOPES.PASSIVE]: 'Passive Fire Protection',
  [FIRE_SCOPES.EXTINGUISHER]: 'Portable Extinguishers',
  [FIRE_SCOPES.HYDRANT]: 'Hydrants & Hose Reels',
  [FIRE_SCOPES.EGRESS]: 'Emergency Egress',
  [FIRE_SCOPES.EWIS]: 'EWIS',
  [FIRE_SCOPES.DETECTION]: 'Detection Systems',
  [FIRE_SCOPES.SUPPRESSION]: 'Special Suppression',
};

export const BUILDING_CLASSES = {
  CLASS_1A: '1a',
  CLASS_1B: '1b',
  CLASS_2: '2',
  CLASS_3: '3',
  CLASS_4: '4',
  CLASS_5: '5',
  CLASS_6: '6',
  CLASS_7A: '7a',
  CLASS_7B: '7b',
  CLASS_8: '8',
  CLASS_9A: '9a',
  CLASS_9B: '9b',
  CLASS_9C: '9c',
  CLASS_10A: '10a',
  CLASS_10B: '10b',
};

export const RISK_CLASSIFICATIONS = {
  LOW: 'low',
  ORDINARY_1: 'ordinary_1',
  ORDINARY_2: 'ordinary_2',
  HIGH: 'high',
  EXTRA_HIGH: 'extra_high',
};

export const MARKUP_TYPES = {
  MARGIN: 'margin',
  OVERHEAD: 'overhead',
  PROFIT: 'profit',
  CONTINGENCY: 'contingency',
  RISK: 'risk',
};

export const TAX_RATE = 0.10; // 10% GST

export const AUDIT_ACTIONS = {
  ESTIMATE_CREATED: 'estimate_created',
  ESTIMATE_UPDATED: 'estimate_updated',
  ESTIMATE_VERSION_CREATED: 'estimate_version_created',
  ESTIMATE_APPROVED: 'estimate_approved',
  ESTIMATE_SENT: 'estimate_sent',
  LINE_ADDED: 'line_added',
  LINE_UPDATED: 'line_updated',
  LINE_DELETED: 'line_deleted',
  PRICE_BOOK_ITEM_CREATED: 'price_book_item_created',
  PRICE_BOOK_ITEM_UPDATED: 'price_book_item_updated',
  PRICE_BOOK_ITEM_DELETED: 'price_book_item_deleted',
  ASSEMBLY_CREATED: 'assembly_created',
  ASSEMBLY_UPDATED: 'assembly_updated',
  AI_SUGGESTION_CREATED: 'ai_suggestion_created',
  AI_SUGGESTION_APPROVED: 'ai_suggestion_approved',
  AI_SUGGESTION_REJECTED: 'ai_suggestion_rejected',
  PERMISSION_CHANGED: 'permission_changed',
  PROPOSAL_GENERATED: 'proposal_generated',
  PROPOSAL_SENT: 'proposal_sent',
  PROPOSAL_ACCEPTED: 'proposal_accepted',
  TAKEOFF_OBJECT_CREATED: 'takeoff_object_created',
  TAKEOFF_OBJECT_UPDATED: 'takeoff_object_updated',
  PROJECT_CREATED: 'project_created',
  PROJECT_UPDATED: 'project_updated',
};

export const REGIONS = {
  NSW: 'nsw',
  VIC: 'vic',
  QLD: 'qld',
  WA: 'wa',
  SA: 'sa',
  TAS: 'tas',
  NT: 'nt',
  ACT: 'act',
};

export const REGION_LABELS = {
  [REGIONS.NSW]: 'New South Wales',
  [REGIONS.VIC]: 'Victoria',
  [REGIONS.QLD]: 'Queensland',
  [REGIONS.WA]: 'Western Australia',
  [REGIONS.SA]: 'South Australia',
  [REGIONS.TAS]: 'Tasmania',
  [REGIONS.NT]: 'Northern Territory',
  [REGIONS.ACT]: 'Australian Capital Territory',
};

export const UNITS = {
  EACH: 'ea',
  METRE: 'm',
  SQ_METRE: 'm²',
  CU_METRE: 'm³',
  HOUR: 'hr',
  DAY: 'day',
  LOT: 'lot',
  KG: 'kg',
  LITRE: 'L',
  SET: 'set',
  ROLL: 'roll',
  LENGTH: 'length',
  PAIR: 'pair',
};

export const ACCESS_DIFFICULTY = {
  STANDARD: 'standard',
  RESTRICTED: 'restricted',
  HIGH_LEVEL: 'high_level',
  CONFINED: 'confined',
  AFTER_HOURS: 'after_hours',
};

export const ACCESS_DIFFICULTY_MULTIPLIERS = {
  [ACCESS_DIFFICULTY.STANDARD]: 1.0,
  [ACCESS_DIFFICULTY.RESTRICTED]: 1.15,
  [ACCESS_DIFFICULTY.HIGH_LEVEL]: 1.35,
  [ACCESS_DIFFICULTY.CONFINED]: 1.25,
  [ACCESS_DIFFICULTY.AFTER_HOURS]: 1.50,
};

export const REGION_MODIFIERS = {
  [REGIONS.NSW]: 1.0,
  [REGIONS.VIC]: 0.98,
  [REGIONS.QLD]: 0.95,
  [REGIONS.WA]: 1.08,
  [REGIONS.SA]: 0.93,
  [REGIONS.TAS]: 0.96,
  [REGIONS.NT]: 1.15,
  [REGIONS.ACT]: 1.02,
};
