import Dexie from 'dexie';

/**
 * Xact client-side persistence (IndexedDB via Dexie).
 *
 * Every aggregate root in the domain model lives in its own table.
 * Migrations: bump the version number and add a new .stores() block.
 *
 * IMPORTANT: money is stored as integer cents (priceCents), and all
 * measurements are stored in SI base units (mm, mm^2, mm^3).
 */

class XactDB extends Dexie {
  constructor() {
    super('xact');

    // v1 — initial schema
    this.version(1).stores({
      // catalog
      products:        '&id, sku, name, category, brand, isCustom, isArchived, updatedAt',
      suppliers:       '&id, name, abn',
      supplierPrices:  '&id, productId, supplierId, effectiveFrom, isPreferred, importBatchId',
      assemblies:      '&id, name, scope',
      labourTasks:     '&id, trade, task',

      // projects
      projects:        '&id, code, name, status, type, region, customerId, updatedAt',
      customers:       '&id, name, abn',

      // drawings + markup
      drawings:        '&id, projectId, name, blobHash, uploadedAt',
      blobs:           '&hash',              // content-addressable file storage
      markupDocs:      '&id, drawingId, projectId, updatedAt',

      // estimating
      estimates:       '&id, projectId, status, version, updatedAt',

      // servicing
      sites:           '&id, customerId, projectId, name',
      serviceAssets:   '&id, projectId, siteId, type, nextInspectionDue, status',
      workOrders:      '&id, projectId, status, scheduledFor, type',
      inspectionLogs:  '&id, assetId, performedAt',

      // import/audit
      importBatches:   '&id, kind, importedAt',
      auditEntries:    '&id, at, userId, action, entityType, entityId',
    });
  }
}

const db = new XactDB();

/**
 * Reset the DB. Used by tests; safe but destructive.
 */
export async function resetDB() {
  await db.delete();
  await db.open();
}

/**
 * Persist a Blob by content hash. Returns the hex SHA-256 hash.
 * Duplicate uploads dedupe automatically.
 */
export async function putBlob(blob) {
  const buf = await blob.arrayBuffer();
  const digest = await crypto.subtle.digest('SHA-256', buf);
  const hash = Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  const existing = await db.blobs.get(hash);
  if (!existing) {
    await db.blobs.put({ hash, blob, size: blob.size, type: blob.type, createdAt: new Date().toISOString() });
  }
  return hash;
}

export async function getBlob(hash) {
  const record = await db.blobs.get(hash);
  return record?.blob ?? null;
}

export default db;
