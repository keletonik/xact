# XACT, passive-fire rebuild brief

Locked: 29/05/2026. Source of truth for the rebuild. All work executes against this.

## 1. Purpose

Single application for AU passive-fire contractors covering the full lifecycle: quote, install + certify, then annual AS 1851 servicing. One project, one source of truth, no separate tools for the three phases.

Standards baseline: NCC Section C, AS 4072.1 (penetration sealing), AS 1530.4 (FRL test method), AS 1851 (routine servicing of fire safety installations) sections 16, 17, 18.

## 2. Users

- Installer in the field: drops assets on plans, captures photos per stage, picks tested system, signs off.
- Supervisor: reviews crew installs, approves cert pack release.
- Office estimator: takeoff from plans, builds quotes, manages SystemLibrary unit rates.
- Inspector: AS 1851 baseline survey and annual revisit, defect logging.
- Certifier (read-mostly): receives cert packs.

## 3. Domain primitives (fresh dexie v2, no migration)

```
Company → User
Company → Project(name, client, site_address, project_type ∈ {new_install, survey, service_contract}, status, dates)
Project → Building(name) → Level
Project → Drawing(level, name, pdf_blob, scale_calibration, version, supersedes)

Project → Asset (spine of everything)
  fields: tag, asset_type ∈ {penetration, fire_door, fire_damper, fire_shutter,
                              joint_seal, structural_coating, smoke_seal},
          drawing_id, location_on_plan{x,y},
          substrate ∈ {concrete_slab, masonry_wall, plasterboard_wall,
                       shaft_wall, floor_slab, riser_shaft, ceiling_membrane},
          required_frl (FRL string, e.g. '-/120/120'),
          achieved_frl,
          tested_system_id → SystemLibrary,
          install_date, installer_id, supervisor_signoff_id,
          status ∈ {planned, installed, rectification, certified, nonconformance}

Asset specialisations (one-to-one):
  Penetration(services_passing[]{type,size,qty}, opening_size, sealant_depth, backing_material)
  FireDoor(door_set_id, leaf_count, gap_top_mm, gap_sides_mm, gap_bottom_mm,
           intumescent_seals_ok, smoke_seals_ok, self_closer_ok,
           hinge_count, hinge_intumescent_ok, ironmongery_set)
  FireDamper(make_model, drive_type, fusible_link_rating_C, duct_dimensions,
             last_drop_test_date)

Asset → Photo(stage ∈ {pre_install, during, post_install, annual_inspection},
              blob, exif_taken_at, geo, notes)

Project → Inspection(frequency ∈ {baseline, annual, 5_yearly},
                     scheduled_date, performed_date, performed_by_id)
Inspection → InspectionResult(asset_id, result ∈ {pass, fail},
                              defect_class ∈ {A,B,C}, notes, photo_id)
Asset → Defect(raised_at, severity, description,
               rectification_due_date, rectified_at, rectified_by_id)

SystemLibrary (the compliance brain):
  manufacturer, system_name, test_report_no, test_standard ∈ {AS_1530.4, EN_1366_3, UL_1479},
  tested_frl,
  substrates_supported[], services_supported[], opening_size_range_mm,
  detail_drawing_blob, certificate_blob

Project → Quote(version, status, total)
Quote → QuoteLineItem(asset_template{type, frl, substrate, services}, qty,
                      unit_rate, materials_cost, labour_hours)
Drawing → TakeoffItem(location, asset_template_id) → seeds future Asset

Project → WorkOrder(crew_id, scheduled_date, assets[], status)
Project → CertPack(type ∈ {Form_15, Form_16, AS_1851_baseline, AS_1851_annual,
                            install_certification},
                   generated_at, scope, pdf_blob, signatories[])
```

Everything else is derived. No alarms, no extinguishers, no sprinklers.

## 4. Surface area (routes, ordered by importance)

```
/                              Dashboard (KPIs across projects)
/projects                      Project list
/projects/:id                  Project workspace, default tab = Plans
  ├── plans                    Drawing list + upload + scale calibration
  ├── markup/:drawingId        Konva canvas, drop asset pins, tap to edit
  ├── assets                   Asset register, table, filters
  ├── photos                   Per-asset photo grid by stage
  ├── inspections              AS 1851 schedule + perform (service projects)
  ├── defects                  Defect register + rectification scheduling
  ├── quote                    Takeoff + line items + totals (new_install)
  ├── work-orders              Crew dispatch
  └── certs                    Generate Form 15/16, AS 1851, install cert packs
/system-library                Tested systems catalogue + matrix search
/catalog                       Plan-markup symbol library (existing ~90 symbols)
/vendors                       Passive-fire suppliers only
/settings                      Company, cert branding, defaults
```

## 5. Removed (anti-bloat, hard)

- `src/domain/alarmPack.js` — delete
- `src/domain/portableEquipmentPack.js` — delete
- `/opportunities`, `/proposals` — delete (project IS the pipeline)
- `/pricebook` — fold unit rates into SystemLibrary
- `/estimates`, `/quick-estimator` — replaced by per-project `/quote`
- `/notifications`, `/help` — defer, no backend yet
- Any generic CRM, multi-trade estimating, accounting, kanban, chat

## 6. Killer features (these are why the app exists)

1. **System matrix search**: pick required FRL × substrate × services, get every tested SystemLibrary entry that complies. Replaces installer guesswork and manufacturer brochure trawling.
2. **Plan-pinned asset register**: every asset is a point on a versioned drawing, not a line in a spreadsheet. Konva canvas + dexie blob.
3. **Photo evidence per stage**: pre/during/post install + annual. Mandatory for cert pack release.
4. **One-click cert packs**: jsPDF templates for Form 15, Form 16, AS 1851 baseline, AS 1851 annual, install certification. Pulls all asset data + photos + tested-system certs into a deliverable PDF.
5. **AS 1851 inspection workflow**: walk asset list per scheduled inspection, pass/fail/defect with photo, generate report.

## 7. Standards mapping

| Standard            | Drives                                                             |
|---------------------|--------------------------------------------------------------------|
| NCC Section C       | Required FRL per element type                                      |
| AS 4072.1           | Penetration sealing requirements, system selection                 |
| AS 1530.4           | FRL test method, tested-system credentials in SystemLibrary        |
| AS 1851 § 16        | Fire-door annual + 5-yearly inspection schedule and pass criteria  |
| AS 1851 § 17        | Fire and smoke wall / penetration annual inspection                |
| AS 1851 § 18        | Fire and smoke damper annual inspection + drop test cycle          |
| AS 1851 defect class| A/B/C classification on InspectionResult                           |

## 8. Architecture

- Vite + React 19, kept.
- zustand for app state, dexie v2 (fresh schema, drop v1) for persistence.
- Konva for plan canvas, asset pins overlay on PDF.
- jsPDF + jspdf-autotable + html2canvas for cert pack generation.
- exceljs for asset-register export.
- Offline-first. `src/backend/apiClient.js` stays a stub. Backend sync is post-MVP.
- src/domain/ collapsed to a single passive-fire module, no other packs.

## 9. Phasing

| # | Phase | Status |
|---|---|---|
| 1 | Strip bloat, fresh dexie v2 schema, prune routes | done |
| 2 | SystemLibrary + matrix search | done |
| 3a | Asset register + type-aware editor + matrix integration | done |
| 3b | Markup-canvas pin overlay (click drawing → create / open asset) | **outstanding** |
| 4 | Photo capture per stage (EXIF + SHA-256 blob dedupe) | done |
| 5 | AS 1851 inspections + defects (atomic walk + defect raising) | done |
| 6 | Quote + line items + convert-to-assets bridge | done |
| 7 | Cert pack PDFs (5 generators on shared builders) | done |
| 8 | Work orders + crew dispatch | done |
| 9 | Dashboard KPIs across all stores | done |
| 10 | Polish: settings (logo + roster), vendors CRUD, library import/export | done |

### Phase 3b notes

Deferred from the main rebuild because the existing `MarkupCanvas.jsx`
is 611 lines of dense Konva (lasso selection, transformer handles,
calibration, panning, controlled props) and an incorrect overlay
integration risks regressing the markup tool that already ships.

Suggested approach for 3b when picked up:
- Add a new `AssetPinLayer.jsx` as a sibling Konva `<Layer>` inside
  `MarkupCanvas`, controlled by a new `assetsOnPlan` prop and the
  existing selection mechanism.
- Add an `active tool = pinAsset` that disables lasso while active.
- Click in pin mode creates an Asset via `useAssetStore.createAsset`
  with `drawingId` and `locationOnPlan` populated, then opens the
  AssetEditor for the new row.
- Existing pins render as small circles + tag-label; click opens the
  editor.
- Add `forDrawing(drawingId)` selector (already on store) to filter
  the layer's input.
- Add Vitest coverage for hit-testing and pin-mode mode-exclusivity.

## 10. Non-goals

No fire alarm monitoring. No extinguisher servicing. No sprinkler design. No generic CRM. No accounting. No multi-trade estimating. No chat. No social. If a feature does not serve passive-fire contractors specifically, it is out.
