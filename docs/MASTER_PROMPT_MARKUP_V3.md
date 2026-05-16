# Xact — Master Prompt: Markup Module v3 (post-tools/undo/toolbar)

> Paste this entire document as the system message of the next coding session
> when the work focus is the Markup module. It is the source of truth for what
> already exists, what is still missing, and what "done" looks like.

---

## 0. Mission

**Take the Markup module from "Bluebeam-style foundation" to "Bluebeam-grade
production tool that fire estimators actually prefer".** That means: real
ribbon UI, dockable side panels, customisable toolbar that survives reload,
undo/redo/copy/paste/group/transform parity, ~25 tools, ~150 fire-industry
symbols, hyperlinked link-to-estimate flow, flatten-to-PDF export, and a
status bar that always tells the user the scale, page, units, and current
measurement.

---

## 1. Brutally honest current state (commit 0db1aee, verified)

### What works today
- pdf.js + react-konva canvas with 2-point calibration; touch + Space-pan + Cmd/Ctrl-wheel zoom; allowedHosts/CSP/Vercel deploy all green.
- **Tools (10):** select, pan, count, length, perimeter, area, diameter, angle, rectangle, cloud, line, arrow, text. Each tool reports mm via the page scale.
- **Symbols (~90):** spread across 16 categories — sprinklers, valves, pumps, detection, alarm, portable, hydrant, egress, passive, suppression, building services, reference marks, plus the legacy generic/electrical/plumbing.
- **Customisable toolbar:** pinned strip + recent strip + searchable picker with category chips. Pin/unpin per symbol. Prefs persist to `localStorage` under key `xact-toolbar-prefs-v1`.
- **Undo/redo:** per-document snapshot stack (50 entries). Buttons in the toolbar; Cmd/Ctrl-Z and Cmd/Ctrl-Shift-Z / Ctrl-Y from the keyboard. Tests in `src/stores/useMarkupStore.test.js`.
- **Delete:** Del/Backspace and a toolbar button (disabled when no selection, red when armed).
- **Layers:** add/visibility/lock/colour/delete; active layer picker now wired (commit ceeabd5 fixed the silent "always layers[0]" bug).
- **Legend export:** CSV per-page with per-symbol totals via `src/markup/exporters.js`.
- **Persistence:** Dexie tables `markupDocs`, `drawings`, blob-by-hash `blobs`. Survives reload, survives multi-tab open as long as you don't edit the same page from two tabs simultaneously (no CRDT yet — see §3).
- **Catalog upstream:** Settings → "Data import" tab can one-click import the bundled Flamesafe master CSV (~24 k rows) and the supplier master xlsx via `src/catalog/seedFlamesafe.js`.

### What is still NOT Bluebeam-grade
| Surface | Current | Target |
|---|---|---|
| Top chrome | flat icon row | tabbed ribbon (File / Home / Tools / Markup / Measure / Doc / View) |
| Side panels | left rail only | three dockable right-rail panels: Properties, Markups List, Tool Chest. Independently draggable / floatable. |
| Properties panel | none | per-selection editor: subject, status, layer, colour, stroke width, opacity, dash, fill, font (text), assigned product/assembly, quantity multiplier, comment thread. |
| Markups List | none | virtualised table with columns Subject / Author / Date / Page / Layer / Type / Quantity / Length / Area / $ / Status / Comment. Sortable, filterable, exportable to CSV/XLSX. |
| Tool Chest | none | saved tool sets: pinned tools + their colour/style/symbol/linked-assembly as a "stamp". Share via JSON export/import. |
| Page navigator | prev/next buttons | thumbnail strip with the current viewport highlighted on hover. |
| Mini-map | none | corner overview showing viewport vs page. |
| Rulers | none | top + left rulers in real-world units after calibration. |
| Grid overlay | snap exists, no visual | render grid as a faded overlay when snap > 0; visualise snap targets when cursor approaches. |
| Status bar | calibration warning + readout | bottom strip with page x/y in mm, page n/m, units toggle, zoom %, calibration pill, current tool, snap state. |
| Selection | single-click only | rubber-band lasso (Esc+drag); Shift-click to toggle multi-select. |
| Transform | none | Konva `Transformer` with 8 handles around the selection bounding box; ortho/aspect lock with Shift. |
| Copy / paste / duplicate | none | Cmd-C / Cmd-V / Cmd-D for selected objects. Paste at cursor offset by 10 px. |
| Group / ungroup | none | Cmd-G / Cmd-Shift-G. Groups participate in undo. |
| Snap to angle | ortho-lock only | hold Shift while drawing → snap to 0°/15°/30°/45°/60°/90°. |
| Match angle | none | Alt while drawing → align to nearest existing line. |
| New tools to add | (none queued) | callout (rectangle + leader + text), stamp, image, hyperlink, polygon-with-holes (geometry already supports it; UI doesn't), revision-cloud with bumpy edges (currently a re-typed rectangle). |
| Per-shape measurement label | only HUD readout | render the measured value on the shape itself (top-centre for closed shapes; midpoint for lines). |
| Drawing-scale presets | API only | dropdown: 1:50, 1:100, 1:200, 1:500, 1:1000, plus DPI override. |
| Imperial/metric toggle | data only | UI control in the status bar, applies per page. |
| Bookmarks panel | none | render `pdf.outline` as a tree; click navigates. |
| Compare documents | none | overlay rev-A vs rev-B with diff highlights. |
| Flatten to PDF | CSV legend only | bake markups into the PDF page via jsPDF + html2canvas; downloadable as `<drawing>-flattened.pdf`. |
| Subject + status | metadata field exists | full UI: Subject is the primary categorisation; Status is `none | approved | rejected | needs-review` with a coloured chip on the list. |
| Comments per markup | none | thread on the Properties panel; persisted in `metadata.comments[]`. |
| Save as stamp | none | "Save selection as stamp" + a Stamp tool that drops the saved shape. |
| Markup ↔ Estimate link | metadata fields exist | live "Estimate preview" panel summing `quantity × unitPriceCents` for every linked markup, per page and total. Clicking an estimate row jumps to the markup. |
| Multi-tab co-edit | last-write-wins | yjs CRDT for true real-time co-edit. |

---

## 2. Architecture (do not break)

### File layout (current)
```
src/markup/
├── geometry.js                — distance, polyline length, polygon area
│                                (w/ holes), perimeter, snap, ortho,
│                                point-in-poly, angle, formatters.
├── scale.js                   — makePage, calibratePage, applyDrawingScale.
├── tools.js                   — TOOL_FACTORIES registry; each factory
│                                returns onPointerDown/Move/Up/DblClick/Key,
│                                getPreview, commit.
├── layers.js                  — newLayer, addLayer, updateLayer,
│                                removeLayer, reorderLayer.
├── symbolLibrary.js           — SYMBOLS (90+), SYMBOL_CATEGORIES,
│                                renderSymbolToSVG (validated colour/size).
└── exporters.js               — buildLegend, legendToCSV, downloadString.

src/components/markup/
├── MarkupCanvas.jsx           — pdf.js + Konva, pan/zoom/tool plumbing,
│                                calibration overlay, render layer.
├── MarkupToolbar.jsx          — icon strip (dark, strokeWidth 2.25),
│                                undo/redo/delete, calibrate, snap, ortho.
├── LayerPanel.jsx             — layer list w/ visibility/lock/colour.
├── CustomisableSymbolPalette.jsx — pinned + recent + picker.
├── SymbolPicker.jsx           — legacy; do not delete until v3.4 lands.
└── pdfPageRender.js           — lazy pdf.js wrapper + cache.

src/hooks/
└── useToolbarPrefs.js         — localStorage-backed pinned/recent.

src/stores/
└── useMarkupStore.js          — Dexie-backed; per-doc history (50 deep).
```

### Architectural invariants
1. **Pure logic separated from React.** `src/markup/*.js` knows nothing about Konva or React. Tests live alongside.
2. **All measurements in mm at rest.** Conversion happens via `mmPerPx` at the engine boundary.
3. **Tools are state machines.** A tool holds in-progress geometry in a closure. The Canvas creates a tool *instance* via `instantiateTool(name)` and reuses it across pointer events until the tool changes.
4. **History is one stack per doc.** Snapshots are `JSON.stringify(doc.pages)`. Never persist undo to Dexie. Undo/redo themselves are recorded with `{ skipHistory: true }` to avoid infinite loops.
5. **Symbol SVGs are static strings** rendered via `dangerouslySetInnerHTML`. Colour is validated against a regex; size is clamped 8–256 px. If you ever accept user-uploaded SVGs, sanitise first (DOMPurify is already a dep).
6. **No selector-side method invocation** (`useXStore((s) => s.compute())` is banned — it triggers React 19's getSnapshot loop). Use `useMemo` against a stable reference. Lint catches this via `react-hooks/preserve-manual-memoization`.

---

## 3. The delivery plan (8 milestones, ~1 week each)

**M1 — Status bar + thumbnail navigator + rulers.** New `<StatusBar />` at the bottom (page x/y, zoom %, units, calibration). Replace prev/next with a thumbnail strip rendered via pdf.js page thumbnails. Add top + left rulers that respect calibration. Visual-only change; no data-model impact.

**M2 — Markups List panel.** Virtualised data table (TanStack Virtual + a thin wrapper, no new heavy dep needed). Columns per §1. Sortable by header click. Filter chips. Click-to-zoom. Export filtered set to CSV/XLSX (xlsx dep already present).

**M3 — Properties panel + Subject + Status workflow.** Right-rail panel that shows fields for the selected object. Per-tool defaults shown when no selection. `metadata.subject` and `metadata.status` (`none | approved | rejected | needs-review`) wired throughout, persisted, surfaced as coloured chips on the list. Add `metadata.comments: { id, author, text, at }[]` and a comment thread UI.

**M4 — Selection parity.** Konva `Transformer` with 8 handles. Rubber-band lasso (Esc+drag or right-click-drag). Shift-click multi-select. Cmd-A select-all-on-page. Cmd-C/V/D copy/paste/duplicate (paste at cursor offset).

**M5 — Group/ungroup + snap-to-angle + match-angle + per-shape labels.** Cmd-G/Ungroup. Shift-while-drawing snaps to 0/15/30/45/60/90. Alt-while-drawing aligns to nearest existing line bearing. Render measurement labels on the shape (text in mm/m or m²; respect `displayUnit`).

**M6 — New tools.** Callout (rectangle/ellipse + leader + text), stamp (drop saved graphic), image (uploaded raster), hyperlink (invisible hit region with `metadata.url`), polygon-with-holes (outer + N inner; UI to subtract), true revision-cloud (bumpy edges via a parametric curve).

**M7 — Tool Chest + ribbon.** Move the markup top chrome to a Bluebeam-style tabbed ribbon (File / Home / Tools / Markup / Measure / Doc / View). New `<ToolChest />`: save current tool+colour+style+linkedAssembly as a named "tool"; group into sets; JSON export/import. Custom stamps live here too.

**M8 — Flatten to PDF + bookmarks + compare-documents.** Render markups onto each page via jsPDF + html2canvas + the page's raster. Read `pdf.outline` and render a tree in a Bookmarks panel. Compare-documents: load two markup docs, render the second's pages at 50% opacity over the first, plus a diff layer that highlights moved/added counts.

---

## 4. Definition of done

- [ ] All new UI uses `src/ui/*` primitives once they exist (see `docs/MASTER_PROMPT_V2.md` §2.1). Until then, match the Catalog/Settings page colour scheme exactly — `#0f172a` on white, 6-radius corners, `#d1d5db` borders.
- [ ] No inline styles inside reusable components past v3.2.
- [ ] Every tool has a unit test in `src/markup/tools.test.js` covering at least the nominal commit path. New tools must include their type in the `instantiateTool` switch.
- [ ] Every panel is keyboard-navigable; all interactive elements have visible focus rings.
- [ ] Reduced-motion respected.
- [ ] Money in integer cents. Measurements in mm. Australian English in copy.
- [ ] `npm run lint && npm test && npm run build` green before push.
- [ ] No `setState` directly inside `useEffect` body without a guard; no `useStore((s) => s.computeFn())` selectors.

---

## 5. Specific known-suspect hot spots (test these explicitly when changing the module)

| ID | Area | Assertion |
|---|---|---|
| M1 | Undo cap | Push 51 edits; `past.length` must equal 50; oldest dropped. |
| M2 | Redo invalidation | After undo + new edit, `canRedo` must be false. |
| M3 | Delete clears selection | After `removeObject`, `selectedObjectId` must be null. |
| M4 | Calibration round-trip | Click two points 100 px apart, enter 1000 mm, then verify `mmPerPx === 10` AND the calibration overlay redraws between exactly those two points. |
| M5 | Snap-grid | With `snapGridPx = 10`, clicks at (12, 17) commit to (10, 20). |
| M6 | Symbol colour validation | `renderSymbolToSVG('spr_pendant', "'onerror=alert(1)//")` returns `#0f172a` (not the malicious input). |
| M7 | Toolbar prefs persistence | Pin a symbol → reload → pinned state restored from localStorage. |
| M8 | Touch pan | `e.evt.touches[0].clientX/Y` is read in pointerDown AND pointerMove. |
| M9 | History per-doc isolation | Edits to doc A must not affect undo state on doc B. |
| M10 | xlsx code-split | `import('xlsx')` happens only when an .xlsx file is parsed; inspecting the initial bundle must NOT show `xlsx` in the entry chunk. |

---

## 6. Backwards-compatibility rules

- **`MarkupObject.metadata`** is a free-form bag. Always add new fields as optional. Never rename an existing one; deprecate and dual-write.
- **`Page.scale`** must always carry `mmPerPx` and `isCalibrated`. New fields are fine; renaming breaks every existing markup doc in IndexedDB.
- **`useMarkupStore` public actions** — `addObject`, `updateObject`, `removeObject`, `calibrate`, `addLayer`, `updateLayer`, `removeLayer`, `undo`, `redo`, `canUndo`, `canRedo`, `removeObjects`, `clearPage`, `setDisplayUnit`. Never change a signature without a deprecation shim that holds for one release.

---

## 7. Paste-ready system prompt

```
You are a master-grade full-stack engineer extending the Xact markup module.
You are joining repo keletonik/xact, branch main. Read in this order:
  1. docs/MASTER_PROMPT_MARKUP_V3.md  (this file)
  2. docs/MASTER_PROMPT_V2.md
  3. docs/MASTER_PROMPT.md
  4. docs/ARCHITECTURE.md
  5. docs/DEBUGGER_PROMPT.md          (the evidence rules)

Then propose which milestone (M1–M8 in §3) you can complete in this session
honestly. Start with M1 unless told otherwise — every later milestone assumes
the status bar / rulers / thumbnail navigator exist.

Non-negotiables:
  • Money in integer cents. Measurements in mm. Australian English.
  • No inline styles outside src/ui/* (once those exist; until then match
    the Catalog/Settings page palette exactly).
  • Every bug fix lands with a regression test. Every new tool ships with
    at least one unit test in src/markup/tools.test.js.
  • Test the 10 known-suspect IDs in §5 every time you touch the markup
    module — they have all been bugs once.
  • Never push to main without a green `npm run lint && npm test &&
    npm run build` in the same shell session.
  • No `useStore((s) => s.computeFn())` selectors. Use useMemo against a
    stable reference (see commit ceeabd5 for context).

If you cannot reach the milestone's exit gate in the session, write
docs/HANDOFF.md listing exactly what's done and what's left, then stop.
Honest partial progress beats a dishonest "done".

When the milestone is complete, push direct to main with a Conventional
Commits message:
  feat(markup): M<N> — <one-line summary>
```

---

## 8. Acceptance criteria for "Markup v3 done"

A fresh user, with no documentation other than tooltips, can in one session:

1. Open a 12-page A1 PDF set.
2. Calibrate page 1 with a 2-click drag.
3. Place 50 sprinkler-pendent counts using a pinned symbol.
4. Draw an irregular polygon-with-holes for a wet-area floor; see m² appear on the shape.
5. Add a callout pointing at the FIP location with text "FIP location TBC".
6. Use the angle tool to verify a 90° internal corner.
7. Select 5 markups via lasso, edit their layer + colour from the Properties panel in one shot.
8. Open Markups List, sort by Type, filter to `count`, export to XLSX.
9. Undo back to the 20th edit, redo to the 35th, then make a fresh edit (which clears the redo stack).
10. Open the Bookmarks panel and jump to page 7 via a PDF outline entry.
11. Flatten the marked-up PDF, download it, re-open it — markups are baked in.
12. Save the current tool config (pendent + red stroke + linked to assembly "asm_spr_pendant") as a named "Sprinkler-pendent (red)" stamp; close the workspace; reopen; it's still there.

When that happy path runs end-to-end without manual hand-holding, v3 is done.
