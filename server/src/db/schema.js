import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

/**
 * Drizzle schema mirrors the Dexie client schema. All money in integer cents.
 * All measurements in mm. All timestamps in ISO 8601 strings (TEXT).
 */

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  orgId: text('org_id').notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: text('name').notNull(),
  role: text('role').notNull().default('estimator'),
  createdAt: text('created_at').notNull(),
});

export const orgs = sqliteTable('orgs', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  country: text('country').default('AU'),
  currency: text('currency').default('AUD'),
  createdAt: text('created_at').notNull(),
});

export const products = sqliteTable('products', {
  id: text('id').primaryKey(),
  orgId: text('org_id').notNull(),
  sku: text('sku'),
  name: text('name').notNull(),
  description: text('description'),
  category: text('category').notNull(),
  unit: text('unit').notNull(),
  brand: text('brand'),
  model: text('model'),
  manufacturer: text('manufacturer'),
  datasheetUrl: text('datasheet_url'),
  hsCode: text('hs_code'),
  gtin: text('gtin'),
  basePriceCents: integer('base_price_cents').notNull().default(0),
  currency: text('currency').notNull().default('AUD'),
  tags: text('tags', { mode: 'json' }),
  standards: text('standards', { mode: 'json' }),
  isCustom: integer('is_custom', { mode: 'boolean' }).notNull().default(true),
  isArchived: integer('is_archived', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const suppliers = sqliteTable('suppliers', {
  id: text('id').primaryKey(),
  orgId: text('org_id').notNull(),
  name: text('name').notNull(),
  abn: text('abn'),
  contact: text('contact'),
  email: text('email'),
  phone: text('phone'),
  address: text('address'),
  terms: text('terms'),
  currency: text('currency').default('AUD'),
  notes: text('notes'),
});

export const supplierPrices = sqliteTable('supplier_prices', {
  id: text('id').primaryKey(),
  orgId: text('org_id').notNull(),
  productId: text('product_id').notNull(),
  supplierId: text('supplier_id').notNull(),
  supplierSku: text('supplier_sku'),
  unitPriceCents: integer('unit_price_cents').notNull(),
  currency: text('currency').notNull().default('AUD'),
  fxRateToAUD: integer('fx_rate_to_aud_micro').notNull().default(1_000_000),
  moq: integer('moq').notNull().default(1),
  packSize: integer('pack_size').notNull().default(1),
  freightCents: integer('freight_cents').notNull().default(0),
  leadTimeDays: integer('lead_time_days').notNull().default(0),
  effectiveFrom: text('effective_from').notNull(),
  effectiveTo: text('effective_to'),
  sourceUrl: text('source_url'),
  importBatchId: text('import_batch_id'),
  isPreferred: integer('is_preferred', { mode: 'boolean' }).notNull().default(false),
});

export const projects = sqliteTable('projects', {
  id: text('id').primaryKey(),
  orgId: text('org_id').notNull(),
  code: text('code').notNull(),
  name: text('name').notNull(),
  customerId: text('customer_id'),
  status: text('status').notNull().default('lead'),
  type: text('type').notNull().default('major'),
  region: text('region'),
  address: text('address'),
  startDate: text('start_date'),
  dueDate: text('due_date'),
  valueCents: integer('value_cents').default(0),
  managerId: text('manager_id'),
  estimatorId: text('estimator_id'),
  fireScopes: text('fire_scopes', { mode: 'json' }),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const drawings = sqliteTable('drawings', {
  id: text('id').primaryKey(),
  orgId: text('org_id').notNull(),
  projectId: text('project_id').notNull(),
  name: text('name').notNull(),
  contentType: text('content_type').notNull(),
  pageCount: integer('page_count').notNull().default(1),
  sizeBytes: integer('size_bytes').notNull(),
  storageKey: text('storage_key').notNull(),
  blobHash: text('blob_hash').notNull(),
  uploadedAt: text('uploaded_at').notNull(),
});

export const markupDocs = sqliteTable('markup_docs', {
  id: text('id').primaryKey(),
  orgId: text('org_id').notNull(),
  drawingId: text('drawing_id').notNull(),
  projectId: text('project_id').notNull(),
  payload: text('payload', { mode: 'json' }).notNull(),
  version: integer('version').notNull().default(1),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const estimates = sqliteTable('estimates', {
  id: text('id').primaryKey(),
  orgId: text('org_id').notNull(),
  projectId: text('project_id').notNull(),
  status: text('status').notNull().default('draft'),
  version: integer('version').notNull().default(1),
  payload: text('payload', { mode: 'json' }).notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const serviceAssets = sqliteTable('service_assets', {
  id: text('id').primaryKey(),
  orgId: text('org_id').notNull(),
  projectId: text('project_id'),
  siteId: text('site_id').notNull(),
  type: text('type').notNull(),
  location: text('location'),
  manufacturer: text('manufacturer'),
  model: text('model'),
  serial: text('serial'),
  installDate: text('install_date'),
  warrantyExpiry: text('warranty_expiry'),
  status: text('status').notNull().default('active'),
  inspectionSchedule: text('inspection_schedule'),
  lastInspectedAt: text('last_inspected_at'),
  nextInspectionDue: text('next_inspection_due'),
});

export const workOrders = sqliteTable('work_orders', {
  id: text('id').primaryKey(),
  orgId: text('org_id').notNull(),
  projectId: text('project_id'),
  type: text('type').notNull(),
  scope: text('scope').notNull(),
  status: text('status').notNull().default('open'),
  scheduledFor: text('scheduled_for').notNull(),
  completedAt: text('completed_at'),
  generatedFromAssetId: text('generated_from_asset_id'),
  labourTaskId: text('labour_task_id'),
  payload: text('payload', { mode: 'json' }),
  createdAt: text('created_at').notNull(),
});

export const auditEntries = sqliteTable('audit_entries', {
  id: text('id').primaryKey(),
  orgId: text('org_id').notNull(),
  userId: text('user_id'),
  at: text('at').notNull(),
  action: text('action').notNull(),
  entityType: text('entity_type'),
  entityId: text('entity_id'),
  description: text('description'),
  previousValue: text('previous_value', { mode: 'json' }),
  newValue: text('new_value', { mode: 'json' }),
  reason: text('reason'),
});
