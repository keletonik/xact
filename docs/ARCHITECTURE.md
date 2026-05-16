# Xact — Architecture

> Companion to `MASTER_PROMPT.md`. Where the master prompt is the *what*, this is the *how*.

---

## 1. Repository layout

```
xact/
├── docs/                      # Master prompt, architecture, audit log
├── public/symbols/            # Drawing-symbol SVG library (fire, building)
├── src/
│   ├── App.jsx                # Router shell
│   ├── main.jsx
│   ├── ai/                    # AI assist modules (price scout, assembly suggester)
│   ├── assets/
│   ├── backend/               # Frontend-side client for the server API
│   │   └── apiClient.js
│   ├── catalog/               # Product/assembly/labour business logic
│   │   ├── productSchema.js
│   │   ├── supplierPricing.js
│   │   └── customProductsSeed.js
│   ├── csv/                   # CSV ingest pipeline
│   │   ├── parser.js
│   │   ├── mappingPresets.js
│   │   └── importPipeline.js
│   ├── components/
│   │   ├── common/            # Buttons, modals, tables, etc.
│   │   ├── csv/               # CSV import wizard UI
│   │   ├── catalog/           # Catalog editors
│   │   ├── markup/            # Markup canvas + toolbars
│   │   ├── servicing/         # Servicing screens
│   │   └── layout/            # Sidebar, header
│   ├── domain/                # Starter packs (sprinkler/alarm/passive/portable)
│   ├── engine/                # Cost, pricing, assembly, labour, markup math
│   ├── hooks/
│   ├── labour/                # Productivity matrix, on-costs
│   │   └── productivityMatrix.js
│   ├── markup/                # Markup engine (pure logic; no React)
│   │   ├── geometry.js
│   │   ├── scale.js
│   │   ├── tools.js
│   │   ├── layers.js
│   │   └── exporters.js
│   ├── pages/                 # Route components
│   │   └── servicing/
│   ├── services/              # Persistence + client services (Dexie wrappers)
│   │   ├── db.js              # Dexie schema
│   │   ├── catalogService.js
│   │   ├── markupService.js
│   │   └── servicingService.js
│   ├── servicing/             # Servicing domain (assets, schedules, work orders)
│   │   ├── schedules.js       # AS 1851 cadences
│   │   └── workOrderEngine.js
│   ├── stores/                # Zustand stores (one per aggregate root)
│   └── utils/                 # Constants, formatters, validators
├── server/
│   ├── src/
│   │   ├── index.js           # Hono entrypoint
│   │   ├── db/                # Drizzle schema + migrations
│   │   ├── routes/            # REST handlers
│   │   ├── middleware/        # auth, audit, cors
│   │   └── services/          # business logic shared with FE
│   └── package.json
├── shared/                    # (future) shared Zod schemas FE ↔ BE
├── index.html
├── package.json
├── vite.config.js
└── vercel.json
```

## 2. Frontend state model

There are three layers:

1. **Persistence** — Dexie (IndexedDB). Schemas defined in `src/services/db.js`. Every aggregate root is a Dexie table. Migrations live in the same file (`db.version(n).stores(...)`).
2. **Stores** — Zustand. Each store owns one aggregate root, calls Dexie on writes, and rehydrates from Dexie on app start. Stores expose pure, deterministic actions that also write to the audit log when consequential.
3. **Views** — React components. Components never call Dexie directly; they always go through the store.

```
React component → Zustand store → Dexie table  (→ optional API mirror)
                              ↓
                       Audit log entry
```

## 3. Money & units

- **Money**: stored as integer cents in a `priceCents` field. Display helpers in `src/utils/formatters.js`. CSV import converts floats to cents at ingest.
- **Measurements**: stored in SI base units (mm for length, mm² for area, mm³ for volume). The take-off engine works in pixels internally and converts to mm via the page's calibration scale. The UI lets the user choose display units (mm, cm, m, ft, in) per project.
- **Time**: ISO 8601 strings everywhere. Date math via `date-fns`.

## 4. Domain model (key aggregates)

### Product
```
{ id, sku, name, description, category, unit, brand, model,
  manufacturer, datasheetUrl, hsCode, gtin,
  basePriceCents, currency,
  tags: string[], standards: string[],   // e.g. ["AS 2118"]
  isCustom: boolean, isArchived: boolean,
  createdAt, updatedAt, createdBy }
```

### SupplierPrice
```
{ id, productId, supplierId, supplierSku,
  unitPriceCents, currency, fxRateToAUD,
  moq, packSize, freightCents, leadTimeDays,
  effectiveFrom, effectiveTo, sourceUrl, importBatchId,
  isPreferred }
```

### Supplier
```
{ id, name, abn, contact, email, phone, address,
  terms, currency, notes }
```

### LabourTask
```
{ id, trade, task, unit, unitsPerHour,
  regionMultipliers: { nsw: 1.0, vic: 0.98, ... },
  accessMultipliers: { standard: 1.0, restricted: 1.15, ... },
  notes }
```

### Project
```
{ id, code, name, customerId, status,
  type: 'major' | 'minor' | 'service',
  region, address, gpsLat, gpsLng,
  startDate, dueDate, value,
  managerId, estimatorId,
  fireScopes: string[] }
```

### Drawing
```
{ id, projectId, name, filename, contentType,
  pageCount, sizeBytes,
  blob: Blob,            // stored in Dexie 'blobs' table by hash
  blobHash: string,
  uploadedAt, uploadedBy }
```

### MarkupDocument
```
{ id, drawingId, projectId, name,
  pages: [{ pageNumber, scale, units, layers: [Layer], objects: [MarkupObject] }],
  createdAt, updatedAt, version }
```

### MarkupObject
```
{ id, type: 'count' | 'length' | 'area' | 'rectangle' | 'polygon' | 'text' | ...,
  pageNumber, layerId,
  geometry: { ... },     // shape-specific (see markup/geometry.js)
  style: { stroke, fill, strokeWidth, opacity, dash },
  metadata: {
    symbolId?: string,
    productId?: string,
    assemblyId?: string,
    quantity: number,
    measuredValueMm: number,
    note: string
  } }
```

### Estimate
```
{ id, projectId, status, version,
  lines: [EstimateLine],
  markups: { margin, overhead, profit, contingency, risk },
  totals: { rawCost, withMargin, withOverhead, withProfit, contingency, risk, subtotalExTax, tax, totalIncTax },
  snapshots: [Snapshot],
  approvedBy, approvedAt }
```

### ServiceAsset
```
{ id, projectId, siteId, type, location, locationMm,
  manufacturer, model, serial, installDate, warrantyExpiry,
  status: 'active' | 'defective' | 'retired',
  inspectionSchedule: 'monthly' | '6m' | '12m' | '5y' | 'custom',
  lastInspectedAt, nextInspectionDue }
```

### WorkOrder
```
{ id, projectId, type: 'scheduled' | 'reactive' | 'defect',
  scope, assignedTo, status, scheduledFor, completedAt,
  checklistTemplate, checklistResults,
  partsUsed: [{ productId, quantity }],
  labourMinutes, notes,
  generatedFromAssetId?, generatedFromDefectId? }
```

### AuditEntry (append-only)
```
{ id, at, userId, action, entityType, entityId,
  description, previousValue, newValue, reason }
```

## 5. Markup engine

The markup canvas is built from three layered surfaces:

1. **PDF render layer** — `pdfjs-dist` renders each page to a `<canvas>` at a chosen scale.
2. **Konva interaction layer** — `react-konva` `<Stage>` overlaid on top; receives input; renders shapes (markups).
3. **HUD layer** — toolbar, layer panel, page navigator, measurement readout. Pure React.

### Coordinate spaces
- **Page pixel space**: what pdf.js renders. Origin top-left.
- **Page mm space**: page-pixel × `(mmPerPixel)` from calibration.
- **World/stage space**: Konva stage coordinates (we keep them equal to page-pixel for simplicity; pan/zoom is via Konva stage scale).

### Calibration
Two-point calibration: user clicks two endpoints of a known dimension and enters the real-world length. We store `scale = realMm / pixelDistance`. Per-page scale.

### Geometry primitives
Length, area, perimeter, count are computed in `src/markup/geometry.js`. Shoelace for polygon area. Polyline sum for length.

### Tools
A "tool" is a state machine: `idle → drawing → finalised → idle`. Tools live in `src/markup/tools.js` as plain JS factories; each returns `{ onPointerDown, onPointerMove, onPointerUp, onKeyDown }` handlers and a `render` function returning Konva nodes for the in-progress shape.

### Layers
Layers are arrays of objects sorted by z-index. Each object stores `layerId`. Visibility/lock controlled by the layer.

### Persistence
A `MarkupDocument` is serialised JSON (no Konva refs) and stored in Dexie. The drawing blob is stored separately by content hash.

### Export
- Flatten to PDF: jsPDF + html2canvas on each page (server-side flatten is the production path).
- CSV: list of measurements with type, page, layer, value, units, linked product/assembly.

## 6. CSV import pipeline

`src/csv/importPipeline.js` implements a 6-step pipeline:

1. **Parse** with PapaParse, header inference, encoding detection.
2. **Detect preset** — match column headers against `src/csv/mappingPresets.js` (e.g. Wormald format, Reece format, generic).
3. **User maps** any unmapped columns.
4. **Validate** each row with the appropriate Zod schema.
5. **Dry-run preview**: show diffs (new vs existing by SKU). User reviews and approves.
6. **Apply** in a transaction: insert/update products and supplier prices, with one `importBatchId` for rollback.

The pipeline is callable headlessly (for the API) and through the UI wizard in `src/components/csv/`.

## 7. Servicing

- `src/servicing/schedules.js` produces a stream of due-date events from AS 1851 cadences.
- `src/servicing/workOrderEngine.js` turns due-date events into open work orders, dedupes them, and reconciles when the tech completes the visit.

## 8. Backend (scaffold)

The backend is a separate npm workspace under `server/`. It is **not** required to run the frontend (which is fully offline-capable). It is included so the platform can be deployed multi-user.

- **Hono** for routing. One route file per aggregate root.
- **Drizzle** for ORM. SQLite (better-sqlite3) in dev; Postgres in prod.
- **JOSE** for JWT signing; access + refresh tokens.
- **Argon2** for password hashing.
- **CORS** locked to the configured frontend origin in prod.

### Run locally
```
cd server && npm install
npm run dev    # starts on http://localhost:8787
```

Frontend reads `VITE_API_BASE` (defaults to '' which means offline-only mode).

## 9. Testing strategy

- Unit tests on pure functions: pricing layers, assembly expander, labour calculator, markup geometry, CSV parser. Located alongside the module with `.test.js`.
- Component tests on critical screens: takeoff page, estimate page. Use Vitest + Testing Library.
- E2E happy path: upload CSV → see prices update; open drawing → place 5 sprinkler counts → see estimate populate; export proposal PDF.

Tests are not yet wired into CI — this is the first follow-up.

## 10. Security model

- Auth: JWT access (15 min) + refresh (7 days). Refresh stored in HttpOnly cookie.
- Org scoping: every aggregate row has `orgId`; middleware injects `currentUser.orgId` and the query layer filters by it. No client-side filtering trust.
- CSP: locked-down policy in `index.html` meta and (production) HTTP headers.
- File uploads: extension allow-list, MIME sniff, max 200 MB, virus-scan stub.
- Audit: append-only `audit_entries` table; never updated; never deleted.

## 11. Performance budget

| Surface | Budget |
|---|---|
| Bundle (initial) | < 350 KB gzip |
| LCP on dashboard (mid-range laptop, fibre) | < 2.5 s |
| Markup canvas pan/zoom | 60 fps with 5,000 objects on a page |
| CSV import | 10,000 rows < 5 s |
| Estimate recompute on edit | < 50 ms |

## 12. Roadmap beyond this session

1. Wire backend to deployed Postgres + S3, ship end-to-end auth.
2. Real-time multi-user markup via CRDT (yjs).
3. Native DWG/DXF take-off.
4. BIM (IFC) consumption — extract quantities from model.
5. Mobile servicing app (Capacitor wrap of the same React tree).
6. Real AI integration (Claude / GPT-4) for proposal copy + drawing Q&A.
7. SOC 2 / ISO 27001 control mapping.
