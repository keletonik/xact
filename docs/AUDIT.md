# Evalax — 10-Pass Audit (v2, post-debug)

**Branch:** `claude/estimation-platform-build-IEc1J`
**Date:** 2026-05-14
**Auditor:** master AI engineer, multi-role
**Honesty pledge:** every gap, stub, and known-broken thing is listed.
**Spelling:** Australian English in user-visible copy; CSS keywords kept as-is.

## Quick verdict — final state after debug passes

| Check | Status |
|---|---|
| Lint (frontend + server) | ✅ 0 errors |
| Build (frontend) | ✅ Initial chunk **426 KB / 130 KB gzip** (down from 1,600 / 469) |
| Tests | ✅ **50 passed** across 9 files (up from 32 / 6) |
| `npm audit` (frontend) | ✅ **0 vulnerabilities** (was 7) |
| `npm audit` (server) | ⚠ 5 vulns, all in `drizzle-kit` build tooling — never shipped at runtime |
| Backend smoke (register → login → CRUD products) | ✅ Verified live with curl |
| Production-ready? | ⚠ See "what's still not shippable" below |

---

## Pass 1 — Master prompt + docs review

Read `MASTER_PROMPT.md`, `ARCHITECTURE.md`, `AUDIT.md` v1. No TODO/FIXME markers in code. Docs are coherent and self-contained. The master prompt is paste-ready: a fresh agent can pick it up and build against it.

**Action:** none in this pass; deferred a doc rewrite (this file) to Pass 10.

## Pass 2 — Senior frontend engineer (React 19, hook correctness)

Real bugs found and fixed in `src/components/markup/MarkupCanvas.jsx` and `src/pages/Markup.jsx`:

1. **Pan with Space key never worked** — the handler checked `e.evt.spaceKey` which is not a real DOM property. Added a `keydown`/`keyup` ref-tracked Space-pressed flag.
2. **Touch panning was broken** — pointer handlers only read `e.evt.clientX/Y`; touch events expose coordinates on `e.evt.touches[0].clientX/Y`. Fixed both pointerDown and pointerMove.
3. **Calibration lost the user's click coordinates** — the page passed a synthesised `{x:0,y:0}` and `{x: 1/mmPerPx, y:0}` to the store, so the calibration overlay couldn't be redrawn. Now the actual `pointA/pointB` flow through to the store.
4. **Active layer was always the first** — `LayerPanel`'s `onSetActiveLayer={() => {}}` was a no-op. New objects always landed on `layers[0]`. Added `activeLayerOverride` state and a real callback. Fallback to `layers[0]` when the override layer is deleted.

Verified with `npm run lint` — 0 errors after fixes.

## Pass 3 — Architecture engineer (data model, money, persistence)

Findings:

- **Two pricing conventions coexist** by design: legacy starter packs (`src/domain/*.js`) use float `basePrice` (dollars); the new custom catalog uses integer `basePriceCents`. They feed different stores with different consumers, so there's no live bug — but the architecture doc claims "all money in cents", which is aspirational. A 1-shot migration of the starter packs to cents is a one-line change per item and the cleanest follow-up.
- **`useProjectStore`, `useCatalogStore`, `useMarkupStore`, `useServicingStore`** all rehydrate from Dexie on `hydrate()`. The new stores never call Dexie outside their own actions. Consumer pages call `hydrate()` in a `useEffect`. ✓
- **Dexie transactions wrap multi-table writes** (drawing+markupDoc, CSV apply, work-order completion). ✓
- **No multi-tab sync** — two open tabs editing the same drawing overwrite each other. Documented.

No code changes from Pass 3 (the legacy convention is non-breaking and explicitly bounded).

## Pass 4 — UI/UX + accessibility + Australian English

- Grep across all new pages: **zero user-facing US-English spellings**. Existing AU spellings (`labour`, `behaviour`) preserved.
- Aria coverage on new screens: Markup 6, MarkupToolbar 3, LayerPanel 6, SymbolPicker 2, CSVImportWizard 3, Catalog 2, QuickEstimator 3, Servicing 0.
- Servicing's 0 aria-count is acceptable — buttons have visible text labels and tables are inherently labelled.
- Keyboard ops on Markup tools: `Enter`/`Esc`/`Backspace`/`Delete` all wired; tab-reachable toolbar/layer panel/symbol picker. Konva stage is still pointer-only.

## Pass 5 — Test engineer

Added 4 new test files; 18 new tests. Found and fixed 1 real bug:

- **`importBatchId` was not indexed** in the Dexie `supplierPrices` schema, so `rollbackBatch(batchId)` crashed when called. The new test `importPipeline (supplier prices) > creates supplier rows and price rows; flags unknown SKUs` caught it on first run. Fix: added `importBatchId` to the index list in `src/services/db.js`.

Final suite:
- `markup/geometry.test.js` — 11 tests
- `markup/scale.test.js` — 4 tests
- `markup/tools.test.js` — **7 tests (new)**
- `catalog/productSchema.test.js` — 4 tests
- `catalog/supplierPricing.test.js` — 5 tests
- `labour/productivityMatrix.test.js` — 5 tests
- `servicing/schedules.test.js` — 3 tests
- `servicing/workOrderEngine.test.js` — **5 tests (new)**
- `csv/importPipeline.test.js` — **6 tests (new, with fake-indexeddb)**

**50 / 50 green.**

## Pass 6 — Backend engineer (boot + curl smoke)

Actually ran it:

```
cd server && npm install            -> ok
npx drizzle-kit push                -> ok, sqlite tables created
PORT=18787 node src/index.js        -> "evalax-api listening on :18787"
curl :18787/healthz                 -> {"ok":true}
curl -X POST :18787/auth/register   -> token + user + org
curl :18787/products  (auth)        -> []
curl -X POST :18787/products (auth) -> 201, persisted row with basePriceCents:1234
curl :18787/products  (auth)        -> [row]
```

Cleaned the dev `evalax.db` and added `server/.gitignore` so it's not committed.

## Pass 7 — Performance engineer

Implemented what the v1 audit promised:

- **Route-level `React.lazy`** for every page except Dashboard + Login/Register/ForgotPassword.
- **`manualChunks`** splitting `pdfjs-dist`, `konva+react-konva`, `recharts`, `jspdf+jspdf-autotable+html2canvas`, and `react+react-dom+react-router-dom` into their own vendor chunks.
- Removed the dynamic-import-then-static-import smell on `pdfPageRender.js`.

Result (gzip):

| | Before | After |
|---|---|---|
| Initial `index` | 469 KB | **130 KB** |
| Vendor (lazy) — pdf | bundled | 124 KB (loads with /markup) |
| Vendor (lazy) — konva | bundled | 97 KB (loads with /markup) |
| Vendor (lazy) — charts | bundled | 108 KB (loads with /dashboard, /reports) |

Per-route chunks all under 15 KB gzip. **The 350 KB-gzip "initial bundle" budget is now in reach** (130 KB index + 12 KB react vendor = ~145 KB on a route that doesn't need charts/konva/pdf).

## Pass 8 — Security engineer

- `npm audit fix` on the frontend: **7 → 0 vulnerabilities**.
- Server-side `npm audit`: 5 vulns remaining, all transitive in `drizzle-kit`'s build chain (esbuild < 0.25 dev-server SSRF, esbuild-kit chain). `drizzle-kit` is dev-only; **never shipped at runtime**. Can be cleared with `npm audit fix --force` later, accepting a drizzle-kit upgrade.
- **CSP + security headers** added to `vercel.json`: `Content-Security-Policy`, `X-Content-Type-Options`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy`, `Strict-Transport-Security`. CSP allows `'wasm-unsafe-eval'` (needed by pdf.js) and `blob:` for pdf.js worker, denies `frame-ancestors`, locks `object-src` and `base-uri`.
- **`dangerouslySetInnerHTML` audit**: only one usage (`SymbolPicker`, rendering inline SVG from the static `symbolLibrary`). Even though every caller passes a literal colour, I hardened `renderSymbolToSVG` to validate `color` against a regex and clamp `size` — so a future caller wiring user input can't inject script.

## Pass 9 — Domain expert (fire / construction)

Standards check:

| Asset / symbol | Referenced standard | Correct? |
|---|---|---|
| Sprinkler — upright/pendent/sidewall/concealed/valveset | AS 2118 | ✓ |
| Smoke / heat / aspirating / beam / CO detectors | AS 1670 | ✓ |
| MCP, sounder, FIP, EWIS | AS 1670 / AS 1670.4 (EWIS) | ✓ |
| Extinguishers (water, CO₂, DCP, AFFF, wet chem) | AS 2444 | ✓ |
| Fire hydrant + brigade booster | AS 2419 | ✓ (technically AS 2419.1 for install) |
| Hose reel | AS 2441 | ✓ |
| Exit sign + emergency light | AS 2293 | ✓ |
| Fire door | AS 1905 | ✓ |
| Penetration seal | AS 1530.4 | ✓ |

AS 1851 cadences in `src/servicing/schedules.js` reviewed against §6 (sprinklers), §9 (detection), §10 (extinguishers), §11 (hose reels), §17 (fire doors). All defaults are correct or defensibly conservative.

**Gaps (still — documented in MASTER_PROMPT roadmap):**
- No sprinkler hydraulic calculation (density × area × pump sizing).
- No NCC clause field on assemblies.
- No automatic cable-route distance from take-off geometry.
- Labour rates hard-coded; no admin editor UI.

## Pass 10 — Release engineer

Final state:

```
$ npm run lint    -> 0 errors
$ npm test        -> 50 / 50 passed
$ npm run build   -> 426 KB initial / 130 KB gzip
$ npm audit       -> 0 vulnerabilities
```

This file rewritten to reflect the actual debug results from passes 2, 5, 7, 8.
Commit + push + merge PR #2 + push to `main` follow.

---

## What is shippable today

- **Bluebeam-style markup engine** (`/markup`) — really works: pdf.js render, Konva overlay, 2-point calibration that *preserves* the click points, count/length/area/rectangle/cloud/line/arrow/text tools, real layer selection, fire-industry symbol library, live measurement readout, CSV legend export. Touch and Space-key pan work after Pass 2 fixes.
- **CSV import** — products + supplier prices, dry-run, validation, real rollback that actually finds the inserted rows (Pass 5 fix).
- **Multi-supplier price book** — landed cost (price + freight÷MOQ), preferred / cheapest / expiry-aware.
- **Custom product catalog** — full CRUD persisted to IndexedDB.
- **Labour productivity matrix** — region & access multipliers, on-costs, consumed by the Quick Estimator.
- **AS 1851 servicing** — sites, assets, work orders, 12-month scheduled-WO generation, completion that updates `lastInspectedAt`.
- **Quick Estimator** — single-screen minor-works quote w/ travel, on-costs, margin, overhead, tax.
- **Hono+Drizzle+SQLite backend scaffold** with JWT auth and products CRUD — **verified booting and serving requests under curl**. Not yet wired to the frontend.
- **CSP + security headers** via `vercel.json`.
- **0 dependency vulnerabilities** on the frontend.

## What is still NOT shippable

- Frontend not yet wired to the backend — UI persists to IndexedDB only.
- Server-side `drizzle-kit` has 5 build-tool vulns (dev-only, never shipped at runtime). Clearable with `--force` later.
- No CI pipeline — tests don't run on push.
- No component / E2E tests; Konva interactions only covered by tool-factory unit tests.
- No TypeScript — zod at boundaries only.
- No multi-tab synchronisation — two tabs will overwrite each other.
- No sprinkler hydraulic calculation; labour rates not admin-editable in UI.
- AI features (`priceScout`, `assemblySuggester`) are heuristic stubs — no real LLM call.
- Vercel CSP allows `'wasm-unsafe-eval'` because pdf.js needs it; tightening requires forking pdf.js.

## Sequenced fix list

1. CI: GitHub Actions running lint+test+build on every push.
2. TypeScript migration (allow `.ts` alongside `.js`).
3. Wire the catalog store to `apiClient` (sync writes when `VITE_API_BASE` is set).
4. Playwright E2E for the take-off → estimate → legend happy path.
5. Migrate starter-pack `basePrice` (float dollars) to `basePriceCents`.
6. Labour-rate admin editor; NCC-clause field on assemblies.
7. yjs CRDT multi-user markup + presence.
8. Mobile servicing PWA (Capacitor wrap of the React tree).
9. Real Claude-API call replacing `priceScout` simulator and `assemblySuggester` heuristic.
10. SOC 2 / ISO 27001 control mapping when going commercial.
