import Dexie from 'dexie';

/**
 * XACT v2 schema, passive-fire focused. See REBUILD.md §3.
 *
 * Money in integer cents. Lengths in mm. Areas in mm². FRL as string ('-/120/120').
 * Photos stored as Blobs in `blobs` keyed by SHA-256 content hash.
 */
class XactDB extends Dexie {
  constructor() {
    super('xact');

    this.version(2).stores({
      companies:        '&id, name',
      users:            '&id, companyId, email, role',
      projects:         '&id, companyId, code, name, status, projectType, updatedAt',
      buildings:        '&id, projectId, name',
      levels:           '&id, buildingId, ordinal',
      drawings:         '&id, projectId, buildingId, levelId, version, supersedes, uploadedAt',
      markupDocs:       '&id, drawingId, projectId, updatedAt',
      assets:           '&id, projectId, drawingId, tag, assetType, substrate, requiredFrl, achievedFrl, status, testedSystemId, updatedAt',
      penetrations:     '&assetId',
      fireDoors:        '&assetId',
      fireDampers:      '&assetId',
      photos:           '&id, assetId, stage, takenAt, blobHash',
      inspections:      '&id, projectId, frequency, scheduledDate, performedDate, performedById',
      inspectionResults:'&id, inspectionId, assetId, result, defectClass',
      defects:          '&id, assetId, severity, raisedAt, rectificationDueDate, rectifiedAt',
      systemLibrary:    '&id, manufacturer, systemName, testReportNo, testStandard, testedFrl, updatedAt',
      quotes:           '&id, projectId, version, status, updatedAt',
      quoteLineItems:   '&id, quoteId, assetType, substrate, requiredFrl',
      takeoffItems:     '&id, drawingId, assetTemplateId',
      workOrders:       '&id, projectId, crewId, scheduledDate, status',
      certPacks:        '&id, projectId, type, generatedAt',
      vendors:          '&id, name, role',
      blobs:            '&hash',
      auditEntries:     '&id, at, userId, action, entityType, entityId',
    });
  }
}

const db = new XactDB();

export async function resetDB() {
  await db.delete();
  await db.open();
}

/** Persist a Blob by SHA-256 hash. Returns the hex hash. Dedupes on hash. */
export async function putBlob(blob) {
  const buf = await blob.arrayBuffer();
  const digest = await crypto.subtle.digest('SHA-256', buf);
  const hash = Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  const existing = await db.blobs.get(hash);
  if (!existing) {
    await db.blobs.put({
      hash, blob, size: blob.size, type: blob.type,
      createdAt: new Date().toISOString(),
    });
  }
  return hash;
}

export async function getBlob(hash) {
  const record = await db.blobs.get(hash);
  return record?.blob ?? null;
}

export default db;
