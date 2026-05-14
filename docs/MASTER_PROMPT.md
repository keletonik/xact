# Evalax — Master Prompt (Single-Source Brief)

> Use this document as the single source of truth when handing this project to another engineer, agent, or vendor. It is intentionally written as a *prompt* — copy/paste-able into a coding agent — and also serves as the product/architecture brief.

---

## 1. The one-sentence pitch

**Evalax is an end-to-end web platform for cost estimation, take-off, markup and ongoing servicing across the construction and fire-protection industries — covering major works, minor works, and life-cycle servicing — with a Bluebeam-grade markup engine, an integrated multi-supplier price book (CSV-ingested), a labour productivity engine, custom-products/assemblies, and AI-assisted price discovery and proposal generation.**

## 2. Target users & jobs-to-be-done

| Persona | Job |
|---|---|
| Estimator (construction / fire) | Open a drawing set, perform calibrated take-off (counts, lengths, areas), map symbols to priced assemblies, produce a fully-marked-up estimate and client proposal. |
| Servicing manager | Maintain register of installed assets per site, schedule recurring inspections (AS 1851 / NCC), dispatch work orders, invoice T&M or fixed-fee. |
| Procurement / commercial | Ingest supplier price lists (CSV), maintain multi-supplier alternatives, approve price updates, manage freight/lead-time/MOQ. |
| Project manager | Track major vs minor projects through pipeline → quote → won → delivery → service handover. |
| Admin / owner | Configure margins, regions, labour rates, users/roles, AS-standards mapping, integrations. |
| AI agent | Suggest assemblies for ambiguous symbols, scout supplier prices, draft proposals, run audit/QA. |

## 3. Functional scope (MUST-HAVE)

### 3.1 Catalog & price book
- Built-in starter catalogs: sprinkler, alarm, passive fire, portable equipment.
- Custom products: full CRUD, units (ea, m, m², m³, hr, day, lot, kg, L, set, roll, length, pair), categories (material/labour/plant/subcontract/permit/preliminary), brand/model/SKU, manufacturer datasheet links.
- Assemblies: composed of items, parametric (e.g. "sprinkler head install" includes head + 1.2 m drop + fittings + 0.4 hr fitter labour).
- Multi-supplier price book: each item can have N supplier prices, with effective dates, currency, FX, freight, MOQ, lead-time, source URL.
- Price update workflow: pending → reviewed → approved → applied (with audit trail).
- CSV import (products and supplier prices) with: column mapping, dedup by SKU/UPC, currency conversion, validation, dry-run preview, rollback.

### 3.2 Labour
- Productivity matrix: trade × task × units/hour, with multipliers for region, access difficulty, height, after-hours.
- Crew composition: a labour line can specify a crew (1 fitter + 1 apprentice) and apply blended rate.
- On-costs: superannuation, workers-comp, leave loading, vehicle, allowances — configurable per region.

### 3.3 Take-off & markup (Bluebeam-equivalent core)
- Open PDF (multi-page), TIFF, PNG, JPG, DWG (rendered via server-side conversion — stretch goal: client-side via dxf-parser).
- Calibration: 2-point + known distance → page scale; per-page scale; viewport units (mm/cm/m/ft/in).
- Drawing tools: rectangle, ellipse, polygon, polyline, freehand, line, arrow, cloud, text-box, callout, stamp, image, hyperlink, measurement.
- Measurement tools: **count** (custom symbol), **length** (polyline w/ snap), **area** (polygon w/ cutouts), **perimeter**, **volume** (area × depth), **diameter**, **angle**.
- Snap: endpoint, midpoint, intersection, perpendicular, grid, ortho lock, length lock.
- Layers: unlimited, named, colour, visibility, lock, opacity.
- Pages: page navigator, page rotation, page extraction, split/merge documents.
- Symbol library: fire-industry symbols (sprinkler upright, sprinkler pendent, sidewall, smoke detector, heat detector, manual call point, FIP, sounder, EWIS speaker, hydrant, hose-reel, extinguisher × types, exit sign, emergency light, fire door, FRL wall…), construction (door, window, fixture, fitting), plumbing, electrical, HVAC. Drag-and-drop placement.
- Mark-ups carry **estimate metadata**: link a count to a price-book item or assembly so the estimate auto-populates.
- Take-off legend: live count summary per symbol/measurement type per layer per page.
- Compare/overlay revisions: bitwise diff between rev A and rev B drawings, with change-summary.
- Export: flattened PDF with markups, CSV of measurements, image export per page.

### 3.4 Estimating
- Lines link back to take-off objects (traceability).
- Markup layers: cost → margin → overhead → profit → contingency → risk → tax.
- Region multiplier, access-difficulty multiplier, GST.
- Versioning: snapshot, diff between revisions, supersede.
- Major vs minor pathway: minor jobs use a streamlined single-screen quick estimator; major projects use the full take-off + WBS pathway.
- Export: customer-facing proposal (HTML + PDF), internal cost report, AS 4000 schedule format, IFC handover.

### 3.5 Servicing
- Asset register per site (sprinkler heads, FIP, hydrants, extinguishers …) with location, install date, last-service, next-service, warranty.
- Schedules: AS 1851 routine inspection cadences (monthly, 6-monthly, yearly, 5-yearly), plus custom schedules.
- Work orders: scheduled or reactive; checklist by asset class; tech mobile-friendly capture; defect → quote pathway (drops into estimates).
- Service contracts: fixed-fee, T&M, hybrid; auto-invoice on completion; recurring revenue dashboard.
- Defect → opportunity: a defect raised on a service visit becomes a minor-project opportunity in one click.

### 3.6 Projects, opportunities, proposals
- Pipeline: lead → opportunity → quoting → quoted → won/lost. Server-tracked stage durations.
- Estimate → proposal: pick a customer-facing template (cover, scope, schedule, exclusions, T&Cs, price). Generate PDF.
- E-signature stub: store acceptance event, signed-by, IP, timestamp (real e-sig provider integration is post-MVP).

### 3.7 Admin
- Users, roles (admin / estimator / viewer / auditor), invitations.
- Org settings: default margin/overhead/profit, region, GST, on-costs, currency, FX.
- Integrations: Xero, MYOB, simPRO, ServiceM8, Procore, BIM 360 (stubs — interface defined, implementation deferred).
- Audit log: append-only, queryable, export.

### 3.8 AI assists
- Price scout: given an item, suggest alternatives from supplier feeds (mock data acceptable for MVP).
- Assembly suggester: from a take-off symbol and project context, suggest an assembly.
- Proposal writer: generate scope/exclusions text from estimate.
- Drawing Q&A (stretch): pdf.js text layer → retrieval over markup metadata.
- Anomaly detection: estimate line outliers vs historical median.

## 4. Non-functional requirements

| Aspect | Target |
|---|---|
| Browsers | Latest Chrome / Edge / Safari / Firefox; no IE. |
| Offline | First-class. IndexedDB persistence + service-worker shell. Sync queue when backend reachable. |
| Performance | First contentful paint < 2 s on a fibre line; markup canvas must handle a 50-page PDF at 60 fps pan/zoom on a mid-range laptop. |
| Accessibility | WCAG 2.2 AA. Keyboard-operable markup tools. Reduced-motion respected. |
| Security | OWASP Top 10. CSP, SRI on third-party scripts. JWT auth, rotate refresh. Row-level scoping by org. Files are scanned (ClamAV stub) and stored with content-addressable hashes. |
| Privacy | No PII in logs. Soft-delete; hard-delete on request. |
| Data integrity | All money in cents (integer). All measurements stored in SI (mm, mm², mm³). UI converts. |
| Auditability | Append-only audit table, immutable history snapshots on estimates. |
| Testability | Unit tests on pricing, markup geometry, CSV parser. Component tests on critical pages. E2E on the take-off → estimate → proposal happy path. |
| Internationalisation | i18n-ready (en-AU default, en-US, en-GB). All money formatters locale-aware. |
| Standards mapping | AS 1851, AS 2118, AS 1670, NCC 2022 references stored on assemblies for traceability. |

## 5. Architecture (chosen stack)

### 5.1 Frontend
- **React 19** + **Vite 7** + **React Router 6**
- **Zustand** for app state; **TanStack Query** for server cache (when backend live)
- **Konva** + **react-konva** for the markup canvas
- **pdf.js** (pdfjs-dist) for PDF rendering
- **Papa Parse** for CSV
- **Dexie** for IndexedDB offline persistence
- **Zod** for runtime schema validation
- **Fuse.js** for fuzzy search across catalog
- **jsPDF** + **jspdf-autotable** for proposal/quote PDFs
- **Recharts** for dashboards (already in tree)
- **Framer Motion** for micro-interactions (already in tree)
- **clsx** + CSS modules (already in tree)

### 5.2 Backend (scaffold included; production deployment is out-of-session)
- **Hono** (lightweight, runs on Node, Bun, Cloudflare Workers, Deno)
- **Drizzle ORM** with **better-sqlite3** in dev → swap driver for Postgres in prod
- **Zod** schemas shared with the frontend via the `shared/` package
- **JOSE** for JWT; **argon2** for password hashing (server-only)
- **WebSocket** channel via Hono's upgrade for live multi-user markup presence
- File storage: local disk in dev, S3-compatible (R2/MinIO) in prod

### 5.3 Deployment topology (target)
- Frontend → Vercel (current `vercel.json` retained).
- API → Cloudflare Workers or Fly.io.
- Database → Neon Postgres (serverless) or Turso (SQLite-on-edge).
- Files → R2 or S3.
- Background jobs (PDF flatten, CSV import, AI calls) → durable queue (BullMQ on Upstash, or Cloudflare Queues).

### 5.4 Data model (high level)
See `docs/ARCHITECTURE.md`.

## 6. The build, sequenced

1. **Foundation**: dependencies, IndexedDB layer, Zod schemas, CSV parser, design tokens.
2. **Catalog + price book**: custom-product CRUD, multi-supplier prices, labour matrix, CSV import wizard.
3. **Markup engine**: pdf.js rendering → Konva overlay → tools → layers → save/restore.
4. **Take-off → estimate link**: symbol mapping → assembly expansion → line generation.
5. **Estimating UX upgrade**: major vs minor pathways, version diff UI.
6. **Servicing**: assets, schedules, work orders, defect-to-quote.
7. **Proposals**: branded PDF generation.
8. **Backend scaffold**: Hono + Drizzle, REST endpoints mirroring stores, WS presence.
9. **AI**: price-scout + assembly-suggester (mock first, plug-in real model later).
10. **Audit**: 10-pass review (see `docs/AUDIT.md`).

## 7. Definition of done (per feature)

- [ ] Domain model has a Zod schema; persisted in Dexie; exposed by a Zustand store.
- [ ] UI screen reads/writes via the store; renders empty/loading/error states.
- [ ] All money in integer cents; all measurements in SI base units.
- [ ] Keyboard-navigable; tab order verified; aria-labels.
- [ ] Audit-logged where the action is consequential.
- [ ] Covered by either a unit test or a visible smoke test on a documented happy path.
- [ ] No `any`, no `// eslint-disable` without a reason comment.
- [ ] No TODOs left in code without an open issue link.

## 8. Out of scope (this session)

- Real e-signature integration (DocuSign / Adobe Sign).
- Real accounting integration (Xero / MYOB) — only the interface stub.
- True multi-user real-time collaboration (CRDT) — only single-tab presence stub.
- Mobile-native apps (PWA only).
- Native CAD (.dwg) interpretation — only PDF/raster.
- ClamAV virus scanning (stubbed).
- SSO / SAML (only password auth scaffolded).

## 9. The agent prompt (paste-ready)

> You are a master-level full-stack engineer extending the Evalax estimation platform.
> The codebase is React 19 + Vite + Zustand on the front end, with a Hono + Drizzle + SQLite scaffold under `server/`. Persistence on the client is Dexie/IndexedDB.
> Read `docs/MASTER_PROMPT.md` (this file) and `docs/ARCHITECTURE.md` before writing code.
> When extending a feature, follow the "Definition of done" checklist above. When adding a new feature, add it to both the master prompt and the architecture doc.
> Keep money in integer cents. Keep measurements in SI. Never break the existing public Zustand store APIs without a deprecation shim.
> When in doubt, prefer fewer abstractions over more. No premature generalisation. No half-finished implementations.
> After every batch of changes, run: `npm run lint && npm run build`. Fix everything red before moving on.
