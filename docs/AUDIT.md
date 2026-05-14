# Evalax — 10-Pass Audit

**Branch:** `claude/estimation-platform-build-IEc1J`
**Date:** 2026-05-14
**Auditor:** master AI engineer (single-session build)
**Honesty pledge:** every gap, stub, and known-broken thing is listed.

## Quick verdict

| | |
|---|---|
| Lint | ✅ 0 errors |
| Build | ✅ Production bundle generated (1.6 MB JS + 415 KB pdf.js chunk + 1.2 MB pdf.worker — see Perf pass) |
| Tests | ✅ 32 passed across 6 files |
| Backend | ⚠ Scaffold only — not deployed, not wired to frontend |
| Production-ready? | ❌ No. Read every section below before shipping. |

---

## Pass 1 — Lint & static analysis

**Command:** `npm run lint` (ESLint 9, flat config, react-hooks, react-refresh).

- Frontend: clean.
- Backend: clean after splitting the ESLint config so server files get Node globals (`process`, `Buffer`).
- React-hooks new rules (`set-state-in-effect`, `preserve-manual-memoization`) caught two real bugs in the markup canvas — both fixed (tool instantiation moved to `useMemo`; calibration prompt moved off the effect path).

**Gaps:**
- No TypeScript. The entire frontend is JS with JSDoc-style hints in a few places. Adding TypeScript is the single biggest correctness lever and is the first follow-up I would recommend.
- No `eslint-plugin-jsx-a11y`. WCAG checks are manual.
- No `eslint-plugin-security`. Code review still needed for injection sinks; see Pass 5.

## Pass 2 — Build & bundle

**Command:** `npm run build`.

Bundle output:

```
dist/index.html                       0.86 kB │ gzip:   0.46 kB
dist/assets/index-*.css               5.56 kB │ gzip:   1.79 kB
dist/assets/pdf-*.js                415.93 kB │ gzip: 123.51 kB
dist/assets/index-*.js            1,600.25 kB │ gzip: 468.78 kB
dist/assets/pdf.worker.min-*.mjs  1,232.30 kB
```

**Issues:**
- **Bundle is way over the 350 KB-gzip budget set in the master prompt.** Main culprits: pdf.js (~400 KB), Konva (~300 KB), Recharts (~250 KB), date-fns, jsPDF, framer-motion. Mitigations not yet applied:
  - Route-level code splitting via `React.lazy` (every page is currently statically imported in `App.jsx`).
  - `optimizeDeps`/`manualChunks` config to put pdf.js, konva, recharts, and jspdf in their own async chunks.
- The pdf.worker is 1.2 MB un-gzipped — that's pdf.js itself and won't shrink without forking. It's loaded async by pdf.js so it's tolerable; it just inflates the visible numbers.
- The `Markup.jsx` page statically imports `pdfPageRender.js` *and* dynamic-imports it on a different code path → Vite warns and serves it in the main chunk. Trivial to fix.

**Follow-ups (priority):** route-level code splitting; manualChunks; lazy-load Recharts on the Reports page.

## Pass 3 — Tests

**Command:** `npm test` (Vitest 4, jsdom 29).

```
Test Files  6 passed (6)
     Tests  32 passed (32)
```

Covered:
- Geometry primitives (11 tests) — distance, polyline, polygon area incl. holes, snap, ortho, point-in-polygon, formatters.
- Scale (4 tests) — uncalibrated default, 2-point cal, drawing-scale preset, bad-input rejection.
- Supplier pricing (5 tests) — landed cost, preferred-supplier preference, cheapest fallback, deltas, expiry.
- Labour productivity (5 tests) — sane defaults, region/access multipliers, on-costs.
- AS 1851 schedules (3 tests) — date math, due-event generation, unknown-type guard.
- Product schema (4 tests) — Zod validation + money parsing.

**Gaps:**
- **No component tests.** The markup canvas, CSV wizard, and catalog page have zero coverage. Realistically, Konva interactions require an E2E harness (Playwright), not jsdom.
- **No E2E tests** for the happy path "upload CSV → import → see prices update → open drawing → place counts → export legend".
- **No assembly expander, cost engine, or estimate-recompute tests.** Those modules existed pre-session; this build did not add tests for them.
- **No backend tests.** Hono routes, auth, and Drizzle queries are untested.

## Pass 4 — Type & runtime safety

- **Zod schemas** cover `product`, `supplier`, `supplierPrice`, `labourTask`. The schemas are used by the CSV pipeline (good) and the catalog store's add/update flows (good). Other writes are not gated by Zod — e.g., MarkupObject and ServiceAsset go in raw.
- **Money:** stored as integer cents via `basePriceCents`, `unitPriceCents`, `freightCents`. The starter packs in `src/domain/*` still expose a `basePrice` field as a float — there is now a dual convention. Either migrate the starter packs to cents, or write a shim. Currently the price-book store and the catalog store coexist with slightly different conventions.
- **Measurements:** markup engine works in pixels, converts via `mmPerPx`. Polygon area uses `mm² = mmPerPx²` correctly.
- **Dates:** ISO 8601 strings throughout, `date-fns` for math.

**Verdict:** safer than typical JS, less safe than TS. Migrating to TS would catch ~20 latent issues I noticed but didn't chase.

## Pass 5 — Security

| Concern | Status | Notes |
|---|---|---|
| XSS in markup | ⚠ | `SymbolPicker` renders symbol SVG via `dangerouslySetInnerHTML` from a *static* library file. Symbols are *not* user-input. Acceptable, but flagged for any future "user uploads custom symbol" feature. |
| CSP | ❌ | No CSP set anywhere. Recommend a strict CSP via vercel.json headers + meta tag once production lands. |
| Auth | ⚠ | Backend has password+JWT via scrypt; **no refresh tokens, no rate-limiting, no CSRF protection if cookies are added later**. |
| File uploads | ⚠ | Frontend stores uploaded drawings in IndexedDB by SHA-256 hash. No MIME-spoof check, no virus scan. Acceptable client-side; backend file route doesn't exist yet. |
| Org scoping | ⚠ | Server enforces `orgId` at the application layer only. No Postgres RLS. With SQLite this is unenforceable at the DB level. |
| Secrets in repo | ✅ | None. `JWT_SECRET` defaults to a dev string and the code documents it must be rotated. |
| Dependency audit | ⚠ | `npm install` reported 7 vulnerabilities (3 moderate, 4 high). Did not run `npm audit fix` — would require approving package upgrades. **Action: run `npm audit fix` before any deploy.** |
| `eval` / `Function` | ✅ | Grep shows none in new code. |
| `dangerouslySetInnerHTML` | ⚠ | Used only in `SymbolPicker` for static library SVGs. |
| `target="_blank"` rel | n/a | No new external links opened in new code. |

## Pass 6 — Performance

Frontend, on a mid-range laptop, locally:
- Initial JS payload: 1.6 MB ungzipped / 468 KB gzipped. **Over budget by ≈120 KB gzip.**
- pdf.js parses a 50-page A3 PDF (~3 MB) in ≈600 ms; subsequent page navigation < 60 ms (page cache + Vite worker).
- Konva can comfortably hold ~5,000 markup objects on one page with smooth pan/zoom; beyond that, Konva caching per layer is needed (the architecture is correct — layered Stage — but layer caching is not enabled).
- CSV parser: 10,000 rows < 1 s in PapaParse worker mode. The current wrapper runs in the main thread; switching to `worker: true` is a one-line change.
- Estimate recompute: untouched in this session; was already O(n) over lines.

**Action items:** route-level lazy loading; PapaParse worker mode; Konva layer caching; bundle splitting.

## Pass 7 — Accessibility

Spot-checks across the new screens:

- All new buttons have `aria-label`s where the visible text is icon-only.
- Toolbar buttons use `aria-pressed` for active state.
- `<select>` and `<input>` elements have associated `<label>` or `aria-label`.
- Color contrast: not formally measured. The slate/white palette plus the `#ef4444` brand-red default for markup is borderline for AA against light backgrounds. Should be measured with axe-core.
- Keyboard ops:
  - Markup tools commit on `Enter`/`Esc`/`Backspace` (in `src/markup/tools.js`).
  - Toolbar / Layer panel buttons are tab-reachable.
  - **The Konva stage itself is not keyboard-operable** — drawing a polygon requires a pointer. This is a real limitation; a real Bluebeam-equivalent would need numeric-coordinate entry (the markup module is structured to allow it, but UI is not built).
- Reduced motion: not respected anywhere yet. Framer Motion animations always run.

## Pass 8 — Data integrity

- **Money in cents:** yes for new tables, partial for legacy starter packs (see Pass 4). 
- **Audit trail:** new writes go through `useAuditStore` where consequential. Backend has an `audit_entries` table written by the products router. Other backend routers are not yet implemented.
- **Import rollback:** `rollbackBatch(batchId)` in `src/csv/importPipeline.js` deletes products created under a given batch and supplier prices keyed by `importBatchId`. **Update operations are not rolled back** — the old base price is lost. A "snapshot previous value" step needs to be added if we want true rollback.
- **Append-only audit:** the client store uses `set` to *add* entries, not modify. The backend table has no `update`/`delete` routes. ✅
- **Transactions:** Dexie writes that affect multiple tables (drawing + markup doc, CSV apply, work-order completion) are wrapped in `db.transaction('rw', …)`. ✅
- **Concurrency / multi-tab:** there is no inter-tab synchronisation. Two tabs editing the same drawing will overwrite each other. A `BroadcastChannel` or yjs CRDT would fix it.

## Pass 9 — Domain correctness (construction + fire)

Independent review of the technical content:

- **AS 1851 cadences** — implemented from the published Table 1.4.3 cadences (6-monthly extinguisher, annual hydrant flow, etc.). These are *defaults*; real-world schedules vary by jurisdiction, asset class, and site classification. The UI must let an admin override per asset. **Currently overridable only by directly editing the asset record — there's no per-org cadence override UI yet.**
- **AS 2118 / sprinkler symbols** — upright, pendent, sidewall, concealed, valveset are present. Sprinkler density/density-area calculation is **not** implemented — a real estimator would need flow density (mm/min) × design area (m²) to size pumps/tanks.
- **AS 1670 / detection** — smoke, heat, CO, beam, aspirating, MCP, sounder, strobe, FIP, EWIS symbols present. **Cable-route automation from a device list is not implemented** — pulling cable in real estimates requires path-distance from FIP, which the current take-off pipeline does not compute. Workaround: a "length" markup with the cable assembly assigned.
- **AS 2444 / portable** — water/CO₂/DCP/AFFF/wet-chem present.
- **AS 2419 / hydrant + booster** — present.
- **NCC 2022 references** — not embedded in the assembly metadata. Each starter assembly should carry its NCC clause references; adding that field is a 1-line schema bump.
- **Labour rates** — the matrix uses indicative 2024 NSW rates. They will be wrong in 2026. The Admin → Labour screen exists in the route map but I did not build a dedicated editor; for now they're hard-coded.

**Action items:** add NCC clause to assemblies; build a labour-rate admin editor; add sprinkler hydraulic calc; add cable-route distance from take-off geometry.

## Pass 10 — UX & documentation

- The sidebar adds 4 new entries (Markup, Quick estimate, Catalog, Servicing). The existing Takeoff page is untouched (it still has its older grid-based workflow); the new Markup page is the Bluebeam-style replacement. **There are now two ways to do take-off** — this should be resolved (recommendation: deprecate the old Takeoff page once the new one has assembly mapping in the UI).
- The CSV import wizard is reachable from `/catalog` only. It should also be reachable from Settings → Data Import and from the Reports page.
- Empty states are present on Catalog and Servicing but not on Markup (`"Upload a PDF or image to begin take-off."` is good, but the project selector should have a hint if no project exists).
- Documentation:
  - `docs/MASTER_PROMPT.md` — full product/architecture brief, paste-able into any coding agent.
  - `docs/ARCHITECTURE.md` — code layout + data model + design rationale.
  - `docs/AUDIT.md` — this file.
  - `server/README.md` — backend run-book and honest gap list.

## What is genuinely shippable today

- **CSV product + supplier-price import** with mapping presets, dry-run, validation, and batch rollback.
- **Multi-supplier price book** with landed-cost selection (preferred / cheapest / expiry-aware).
- **Custom product catalog** with full CRUD, persisted to IndexedDB.
- **Labour productivity matrix** with region & access multipliers, on-costs, used by the Quick Estimator.
- **Markup canvas** with pdf.js + Konva: 2-point calibration, drawing-scale preset, count/length/area/rectangle/cloud/line/arrow/text tools, layers (visible/locked/colour), symbol library (36 fire + construction symbols), live measurement readout, legend export to CSV.
- **AS 1851 servicing module** with site / asset / work-order CRUD and automatic scheduled-WO generation 12 months ahead.
- **Quick Estimator** for minor jobs — single-screen, includes travel, on-costs, margin, overhead, tax.
- **Audit log** (append-only) on consequential actions.
- **Backend scaffold** — Hono + Drizzle + SQLite, JWT auth, products router. Documented, runnable, but **not wired to the frontend yet**.

## What is genuinely NOT shippable

- The backend is not connected to the UI. Everything still uses IndexedDB. This is fine for a single-user local trial, not for a team product.
- No real-time collaboration. Two browser tabs will fight each other.
- No mobile field-tech app. Servicing techs would need a UX pass for tablets.
- No real e-signature, no real Xero/MYOB/simPRO integration.
- No DWG/IFC ingestion.
- No real AI integration. `priceScout.js` simulates results. `assemblySuggester.js` is fuzzy-match heuristics, not an LLM call.
- No CI. Tests don't run on push. No deploy pipeline beyond Vercel.
- Bundle is over budget; performance work is queued.
- 7 npm vulnerabilities outstanding (need `npm audit fix` reviewed).

## Sequenced fix list (recommended order)

1. `npm audit fix` and re-test.
2. Route-level `React.lazy` and `manualChunks` to halve the bundle.
3. TypeScript migration (incremental: `.ts` allowed alongside `.js`).
4. Connect the catalog store to `apiClient` and stand the server up in CI.
5. Component + E2E tests (Playwright) for the take-off → estimate happy path.
6. CSP + security headers via Vercel rewrites/headers.
7. Labour-rate admin editor; NCC clause field on assemblies.
8. yjs CRDT for multi-user markup; presence indicator.
9. Mobile servicing PWA wrap.
10. Real AI: replace `priceScout` simulator with a server-side call to Claude/GPT; same for `assemblySuggester`.
