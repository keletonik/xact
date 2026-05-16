# Xact — Master Prompt v2 (Bluebeam-grade)

> Paste this entire document as the system message of the next coding session.
> Read every section before writing code. The previous build (v1) shipped a working *foundation*. v2 is about taking it to Bluebeam parity and giving the whole product a unified, professional UI.

---

## 0. Mission (one sentence)

**Take Xact from a working estimation skeleton to a Bluebeam-grade, end-to-end construction-and-fire estimation platform with a unified design system, real Bluebeam-equivalent markup, real CSV-driven supplier pricing, real AS 1851 servicing, and a wired backend — production-deployable.**

---

## 1. Brutally honest current state (after v1 build + 10-pass debug)

What works *today*:
- React 19 + Vite + Zustand frontend, Hono + Drizzle + SQLite backend (auth + products CRUD live under curl).
- IndexedDB persistence (Dexie) for products, suppliers, prices, projects, drawings, markups, sites, assets, work orders, audit.
- CSV import wizard for products + supplier prices, with mapping presets, validation (zod), dry-run, and rollback.
- Markup canvas: pdf.js + Konva, 2-point calibration, pan/zoom, 7 tools (count, length, area, rectangle, cloud, line, arrow, text), 34-symbol fire/construction library, layers, CSV legend export.
- AS 1851 servicing module: sites, assets, work-order engine, 12-month schedule generation.
- Quick Estimator (single-screen minor works).
- Initial bundle 130 KB gzip; 0 frontend npm vulnerabilities; strict CSP; 50 unit tests.

What is **NOT yet Bluebeam-grade** (the deficit this v2 prompt closes):

### 1.1 Markup engine gaps vs Bluebeam Revu
| Bluebeam feature | Xact v1 | v2 target |
|---|---|---|
| Tool palette (categorised, drag-resize, dockable) | flat icon row | full ribbon + dockable palette |
| Tool Chest (saved tool sets, recents, custom) | none | yes |
| Markups List (sortable table of every markup w/ Subject/Author/Date/Page/Status) | none | yes |
| Properties panel (per-tool & per-selection) | none | yes |
| Per-tool options (line width, opacity, dash, font, fill style) | hard-coded | full |
| Multi-select via lasso / rubber-band | none | yes |
| Transform handles (resize / rotate selected) | none | yes |
| Undo / redo | none | yes (Cmd-Z, Cmd-Shift-Z, up to 100 steps) |
| Copy / paste / duplicate markups | none | yes |
| Group / ungroup | none | yes |
| Callout (text + leader line) | none | yes |
| Stamp tool (place reusable graphics) | none | yes |
| Cloud with bumpy edges (true revision cloud) | rectangle re-typed | yes |
| Image insertion | none | yes |
| Hyperlink markup | none | yes |
| Diameter tool | none | yes |
| Angle tool | none | yes |
| Polygon with holes (cutouts) | geometry only, no UI | full UI |
| Measurement labels rendered on the geometry | only HUD readout | both |
| Drawing-scale presets dropdown (1:50, 1:100, 1:200, 1:500) | API only | UI dropdown |
| Imperial/metric toggle | data only | UI |
| Bookmarks panel (PDF bookmarks) | none | yes |
| Thumbnail page navigator | prev/next buttons | thumbnail strip |
| Mini-map / overview | none | yes |
| Rulers (top + left) | none | yes |
| Grid overlay w/ snap visualisation | snap exists, no overlay | yes |
| Status bar (zoom %, page x/y, units, measurement) | partial | yes |
| Flatten markups into PDF (downloadable) | CSV legend only | full PDF flatten |
| Search text in PDF | none | yes |
| OCR raster PDFs | none | optional (deferred) |
| Compare Documents (overlay rev A vs rev B) | none | yes |
| Sets (group drawings into a Set) | none | yes |
| Studio / collaboration | none | deferred (v3) |
| Comments per markup, with replies | none | yes |
| Status workflow on markups (Approved / Rejected / Needs Review) | none | yes |
| Subject field (primary categorisation) | metadata exists | full UI |
| Auto-quantity multiplier (Subject Quantity) | metadata.quantity exists | full UI |
| Match Lines (connect measurements across pages) | none | deferred (v3) |
| Save Markups as Stamp / Symbol | none | yes |

### 1.2 UI mastery gaps
- Every new page (`Markup`, `Catalog`, `Servicing`, `QuickEstimator`) uses **inline styles**. There is no shared design system.
- The existing CSS variables in `src/index.css` (`--color-fire-500`, `--color-slate-*`, etc.) are not consistently consumed by new pages.
- No primitives: Button, IconButton, Modal, Toast, Drawer, Tabs, Tooltip, Toolbar, Ribbon, Card, EmptyState are inconsistently implemented across `src/components/common/` (some exist, some don't).
- Density: pages have inconsistent spacing scales (`8px` vs `12px` vs `16px` ad-hoc).
- Iconography: Lucide icons are used but not consistently sized.
- No theming dark-mode toggle wired up across new pages.
- No keyboard shortcut system surfaced (only Cmd-K command palette).
- No notification/toast system surfaced to new pages.

### 1.3 Catalog / pricing gaps
- Multi-supplier price comparison table not surfaced on the product detail row.
- No bulk-update flow ("apply 5% increase to all Hilti products").
- No price-history graph.
- No assembly editor (assemblies can only be authored by hand-editing `src/domain/*.js`).
- No "preferred supplier" UI control on a price row.
- No FX-rate management for non-AUD supplier prices.

### 1.4 Servicing gaps
- No mobile-friendly tech view (single-WO checklist on a tablet).
- No SLA tracking (response time vs target).
- No invoice generation from completed WOs.
- No recurring-revenue dashboard.
- No defect → quote button.
- No customer-facing service report PDF.

### 1.5 Backend gaps
- Only `/auth` and `/products` are wired. Suppliers, supplier-prices, projects, drawings, markup-docs, estimates, sites, service-assets, work-orders, audit are all missing routes (schema exists in Drizzle).
- No frontend → backend sync. The whole app still runs offline-only via IndexedDB.
- No file-upload route (drawings still only live in the browser).
- No refresh tokens.
- No rate limiting.
- No WebSocket / SSE for live updates.
- No CI workflow.

### 1.6 Cross-cutting gaps
- No TypeScript.
- No Playwright E2E suite.
- No CI pipeline.
- No deployment to a real URL (Vercel config exists, never deployed).
- No demo data seed beyond starter packs (no demo project, no demo drawing).

---

## 2. The v2 target — feature definitions

### 2.1 Design System (foundation — must come first)

Create `src/ui/` containing typed (JSDoc-typed if staying on JS, otherwise TypeScript) primitives. **Every new screen MUST consume these.**

Required primitives:
```
src/ui/
├── tokens.css            # CSS custom properties (spacing, colour, radius, shadow, motion)
├── Button.jsx            # variant: primary | secondary | ghost | danger; size: sm | md | lg
├── IconButton.jsx        # square, aria-label required
├── ToggleButton.jsx      # pressed state
├── ButtonGroup.jsx
├── Field.jsx             # label + input wrapper, error/help text
├── Input.jsx
├── Select.jsx
├── Textarea.jsx
├── Checkbox.jsx
├── Radio.jsx
├── Switch.jsx
├── Slider.jsx
├── NumberInput.jsx       # cents-aware money input variant
├── Combobox.jsx          # searchable single-select (Fuse.js)
├── Tabs.jsx
├── Drawer.jsx            # right/left/bottom edge
├── Modal.jsx
├── Tooltip.jsx
├── Toolbar.jsx
├── Ribbon.jsx            # Bluebeam-style tabbed top bar
├── StatusBar.jsx         # bottom strip
├── Splitter.jsx          # resizable pane divider
├── Panel.jsx             # dockable card with title, collapse, close
├── ContextMenu.jsx
├── EmptyState.jsx
├── Pagination.jsx
├── Table.jsx             # virtualised list for >500 rows
├── DataTable.jsx         # sort, filter, column-visibility
├── Toast.jsx             # imperative API: toast.success(...) / .error(...)
└── theme.js              # design-token JS export
```

Spacing scale: `4, 8, 12, 16, 24, 32, 48, 64`. Type scale: `11, 12, 13, 14, 16, 18, 24, 32`.
Radius scale: `4, 6, 8, 12, 16, 999`.

Replace every inline style in `src/pages/Markup.jsx`, `Catalog.jsx`, `Servicing.jsx`, `QuickEstimator.jsx` with these primitives.

### 2.2 Bluebeam-grade Markup app layout

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Ribbon: [File] [Home] [Tools] [Markup] [Measure] [Doc] [View]          │  ← top
├──────┬────────────────────────────────────────────────┬─────────────────┤
│ Tool │                                                │ Properties      │
│      │            Drawing canvas                      │ Markups List    │  ← three docked
│ Pal  │                                                │ Tool Chest      │     panels (drawer)
│ ette │           (pdf.js + Konva overlay)            │ Bookmarks       │
│      │                                                │ Layers          │
├──────┴────────────────────────────────────────────────┴─────────────────┤
│ Status bar:  page 3/12   1:100   m²   x=120 y=345   zoom 75%           │  ← bottom
└─────────────────────────────────────────────────────────────────────────┘
```

The three side panels are independently dockable (left / right / floating) using `Drawer` primitives.
Persist panel layout per user in localStorage.

### 2.3 Markup canvas — required additions

Restructure `src/components/markup/MarkupCanvas.jsx` (currently 422 lines, single file) into:
```
src/components/markup/
├── MarkupCanvas.jsx              # ≤200 lines: orchestration only
├── canvas/
│   ├── PdfLayer.jsx              # raster render via pdf.js
│   ├── KonvaStage.jsx            # the Konva <Stage>
│   ├── ObjectRenderer.jsx        # one component per markup type
│   ├── SelectionLayer.jsx        # transform handles, lasso preview
│   └── HudLayer.jsx              # rulers, grid, calibration overlay
├── tools/
│   ├── ToolPalette.jsx
│   ├── ToolOptions.jsx
│   └── ToolChest.jsx
├── panels/
│   ├── PropertiesPanel.jsx
│   ├── MarkupsListPanel.jsx
│   ├── LayerPanel.jsx
│   ├── BookmarksPanel.jsx
│   └── PageNavigator.jsx         # thumbnails
├── overlays/
│   ├── Rulers.jsx
│   ├── GridOverlay.jsx
│   ├── MiniMap.jsx
│   └── StatusBar.jsx
└── exporters/
    ├── flattenToPdf.js            # jsPDF + html2canvas
    └── exportLegend.js
```

New tools to implement (factories in `src/markup/tools.js`):
- `diameter` — click two points across a circle.
- `angle` — three points (vertex + two rays).
- `callout` — rectangle/ellipse + leader line + text.
- `stamp` — drop a reusable graphic at a point.
- `image` — drop an uploaded image at a rect.
- `hyperlink` — invisible hit region with `metadata.url`.
- `polygon-with-holes` — outer polygon + N inner polygons (use `polygonAreaWithHolesPx`).
- `revision-cloud` — true bumpy-edge cloud (replace the rectangle re-type).

New markup ops:
- **Undo/redo**: pure-data undo stack on the markup-doc reducer. Cmd-Z / Cmd-Shift-Z. Cap at 100 steps.
- **Copy/paste**: Cmd-C / Cmd-V; paste at cursor.
- **Duplicate**: Cmd-D; offsets by 10px.
- **Multi-select**: `Shift+click` toggles; `Esc+drag` rubber-bands.
- **Group/ungroup**: Cmd-G / Cmd-Shift-G.
- **Transform handles**: 8 handles around bounding box; Konva `Transformer` node.
- **Snap to angle**: hold Shift while drawing → 0°/15°/30°/45° lock.
- **Match angle**: hold Alt while drawing → align to nearest existing line.

New panels:
- **Markups List**: virtualised `<DataTable>` with columns Subject, Author, Date, Page, Layer, Type, Quantity, Length, Area, $, Status, Comment. Sortable, filterable, exportable.
- **Tool Chest**: save current tool config as a "Tool" with a name + icon; group into Sets; favourites pinned to top of the tool palette.
- **Properties Panel**: when a markup is selected, show all editable fields. When no selection, show the current tool's defaults.
- **Bookmarks**: read `pdf.outline` and render as tree; click navigates.
- **Page Navigator**: thumbnail strip; click navigates; drag to reorder (if Bluebeam-grade Sets is enabled).

New overlays:
- **Rulers** along the top & left, marking real-world units after calibration.
- **Grid** overlay with major/minor lines; snap visualisation when the cursor approaches a grid intersection.
- **MiniMap** in a corner showing the current viewport vs. the full page.
- **Status bar** at the bottom: page nav, zoom percentage, units toggle, current measurement readout, calibration status pill.

### 2.4 Markup ↔ Estimate integration

When placing a markup:
- The Properties panel exposes a "Link to" picker: search the catalog (products) or assemblies; pick one.
- Quantity multiplier (`metadata.quantity`) auto-derived from the geometry (count=1, length=mm, area=mm²) unless overridden.
- A live "Estimate preview" panel sums `quantity × unitPriceCents` for every linked markup on the page and across pages.

When an estimate is opened:
- The Estimate page shows a hyperlinked "Source markup" column. Clicking jumps back to that page + selects the markup.

### 2.5 Catalog — full feature set

- **Compare Suppliers** dialog: from a product row, open a modal listing all `SupplierPrice` rows with deltas (already computed by `compareSuppliers`). Each row has "Set as preferred" and "Archive".
- **Bulk update**: select N products → "Apply % adjustment" / "Set currency" / "Archive".
- **Assembly editor**: a screen at `/assemblies` showing the assembly tree (assembly → components → labour). Drag-add items from the catalog; live cost preview.
- **Price history**: per-product line chart of `basePriceCents` over time (Recharts).
- **FX-rate manager**: a screen at `/admin/fx` to add/edit FX rates. Used by `landedCentsPerUnit`.

### 2.6 Servicing — full feature set

- **Mobile-friendly Tech View** at `/servicing/visit/:woId`: single-WO checklist; offline-first (Dexie write, sync queue); camera capture per item.
- **Defect → quote**: from an open WO, click "Raise quote"; pre-fills a new Quick Estimate with the defective asset + parts.
- **Invoice draft**: when a WO completes, compute cost from labour minutes + parts used; produce an invoice draft (downloadable PDF via jsPDF).
- **Recurring revenue dashboard**: `/servicing/dashboard`: open contracts × annualised value; upcoming inspections in 30/60/90 days.
- **Customer-facing service report PDF**: from `/servicing` → "Generate report" → bundles all completed WOs in a date range into a customer report PDF.

### 2.7 Backend — full coverage

Add routes mirroring every Drizzle table:
```
/auth        — register, login, refresh, logout
/products    — GET, POST, GET/:id, PUT/:id, DELETE/:id
/suppliers   — same
/supplier-prices — same
/projects    — same
/drawings    — same, plus POST /:id/upload (S3-pre-signed URL)
/markup-docs — same
/estimates   — same
/sites       — same
/service-assets — same
/work-orders — same, plus POST /:id/complete
/audit       — GET (read-only)
/ws          — Hono websocket for presence + live markup-doc updates
```

Each router follows the products.js pattern: `requireAuth`, `eq(orgId)` scoping, audit-log write on consequential actions.

Frontend `src/backend/apiClient.js` must:
- Auto-rotate refresh token.
- Surface a `Bridge.subscribe(table, callback)` API that listens to WS events and updates the corresponding Zustand store.
- When offline, queue writes to Dexie; replay when reconnected.

### 2.8 CI + deploy

- GitHub Actions workflow: lint → test → build on every push.
- Vercel preview deploy on every PR (Vercel already configured via `vercel.json`).
- Backend deploy stub: a Dockerfile that builds the Hono app + a Fly.io / Cloudflare Workers config (your choice, document it).

### 2.9 Demo data

A `npm run seed:demo` script (frontend) that imports:
- 1 customer, 1 multi-storey project, 1 PDF drawing (in `public/seed/`), 200 sample products, 30 supplier prices, 1 estimate, 5 assets, 5 work orders.

This makes the platform demoable in 60 seconds from a fresh clone.

---

## 3. Sequenced delivery plan (8 milestones, ~2 weeks each)

**M1 — Design system foundation (week 1–2).** `src/ui/*` primitives + tokens.css. Migrate Catalog, Servicing, QuickEstimator, Markup pages to use them. Storybook stub.

**M2 — Markup app shell (week 3–4).** Restructure MarkupCanvas into the canvas/tools/panels/overlays layout. Ribbon + dockable side panels. Page thumbnail navigator. Rulers + grid overlay + status bar.

**M3 — Markup ops parity (week 5–6).** Undo/redo, copy/paste, multi-select, transform handles, group/ungroup, snap-to-angle. Add diameter, angle, callout, true revision cloud, stamp, image, hyperlink, polygon-with-holes.

**M4 — Markup data parity (week 7).** Markups List panel with virtualised table, Tool Chest, Properties panel, Bookmarks panel. Subject + Status workflow. Comments per markup. Save markups as stamps/symbols.

**M5 — Markup ↔ Estimate integration (week 8).** Link-to picker in Properties; live estimate preview; estimate page jump-to-markup.

**M6 — Catalog + Pricing full feature set (week 9–10).** Compare suppliers modal, bulk update, assembly editor at `/assemblies`, price history chart, FX-rate manager.

**M7 — Servicing full feature set (week 11–12).** Mobile tech view, defect-to-quote, invoice draft, recurring-revenue dashboard, customer service report PDF.

**M8 — Backend wiring + CI + deploy (week 13–14).** All routers + WS. apiClient with refresh + offline queue + sync. GitHub Actions. Vercel + Fly/Workers deploy. Demo seed.

---

## 4. Definition of done — per feature

A feature is **done** only if every box is checked:

- [ ] All new UI uses `src/ui/*` primitives. No inline styles except inside `src/ui/`.
- [ ] Pure logic separated from React (testable in isolation).
- [ ] Unit tests on the pure logic; ≥80% line coverage of the module.
- [ ] Playwright E2E covers the happy path on the feature.
- [ ] Keyboard reachable; all interactive elements have visible focus rings.
- [ ] Aria-labels on icon-only buttons.
- [ ] Reduced-motion respected (no animation when `prefers-reduced-motion`).
- [ ] Works offline (Dexie persistence) AND online (apiClient sync).
- [ ] Audit-logged where consequential.
- [ ] No `// TODO` or `// FIXME` left without an open issue link.
- [ ] No `any`, no `as unknown as`, no `// @ts-ignore` (once TypeScript lands).
- [ ] `npm run lint && npm test && npm run build` all green.

---

## 5. Architectural constraints (do not break these)

- **Money in integer cents** on all new tables and DTOs. Display-only conversion to dollars.
- **Measurements in mm / mm² / mm³** at rest; display unit chosen per page.
- **Audit log is append-only** — never update, never delete a row.
- **Org scoping is per-row.** Every aggregate has `orgId`; backend middleware enforces.
- **No re-fetch loops** — derived values via `useMemo`; never `setState` directly inside `useEffect` for non-IO sync.
- **Persistence layer is owned by stores.** UI components never touch Dexie or fetch.
- **Backwards compatibility for the store APIs** — never silently break public Zustand actions. Add a deprecation comment and a 1-release transition shim if you must change a signature.
- **Australian English** in all user-visible copy. Code identifiers may stay US (`color`, `center`) — these are CSS keywords.

---

## 6. Paste-ready prompt for an executing agent

Paste this block verbatim as the system message of the next session:

```
You are a master-level full-stack engineer extending the Xact estimation
platform. The current state is at `claude/fire-safety-react-app-0rptw` /
`main` on GitHub keletonik/xact. Before writing any code, read in this
order:
  1. docs/MASTER_PROMPT_V2.md (this file) — the brief.
  2. docs/ARCHITECTURE.md — the data model and code layout.
  3. docs/AUDIT.md — the gap list.

Then propose a milestone plan (M1–M8 from the master prompt) with a
realistic time estimate for the current session. Start with M1 (design
system) — do not skip ahead to M3 markup features before the primitives
exist, because every subsequent screen depends on them.

Execute one milestone at a time. After each milestone:
  • Update docs/MASTER_PROMPT_V2.md to mark the milestone done.
  • Commit with a clear message (Conventional Commits: feat:, fix:, refactor:, chore:).
  • Run `npm run lint && npm test && npm run build` and fix anything red.

Rules (non-negotiable):
  • Australian English in user-visible copy.
  • Money in integer cents; measurements in SI.
  • No inline styles outside `src/ui/`.
  • No half-finished features — if a milestone is too big for the session,
    ship a smaller scope cleanly rather than ship a partial bigger scope.
  • Honest reporting — when a sub-feature is stubbed, say so. Do not claim
    Bluebeam parity until the parity table in §1.1 has every row in v2 ticked.

If you genuinely cannot complete a milestone in the session, write
docs/HANDOFF.md describing exactly what's left, and stop. Do not rush.
```

---

## 7. Acceptance criteria for "Bluebeam-grade"

The product can be called Bluebeam-grade when **every row in §1.1 is implemented**, **§1.2 is satisfied** (no inline styles outside `src/ui/`), and a fresh user can:

1. Open a 12-page PDF set.
2. Calibrate page 1 in two clicks.
3. Place 50 sprinkler-head counts with a single symbol selected.
4. Draw a polygon-with-holes for a wet-area floor.
5. See those 51 markups in the Markups List, sortable, filterable.
6. Link a count to the "asm_spr_pendant" assembly and see the estimate total update live.
7. Flatten the marked-up PDF and download it.
8. Export the Markups List + measurements to CSV.
9. Generate a customer-facing proposal PDF.
10. Do steps 1–9 entirely offline; reconnect; observe writes sync.

When that happy path works end-to-end without manual hand-holding, v2 is done.
