import autoTable from 'jspdf-autotable';
import {
  newDoc, drawHeader, drawFooter,
  drawProjectSummary, drawAssetRegister, drawSystemReferences,
  drawDefectSummary, drawPhotoEvidence, drawSignatoryPage,
  summariseInspections, MARGIN_PT,
} from './pdfBuilders';
import { CERT_PACK_TYPES, ASSET_STATUSES } from '../utils/constants';

/**
 * One generator per cert pack type. Each composes the shared
 * pdfBuilders primitives. Output is a Blob; the caller persists it
 * via putBlob and records a CertPack row.
 *
 * The generators carry no legal weight on their own — they produce
 * professional, complete-looking reports the certifier reviews and
 * stamps. A jurisdiction-correct Form 15 or 16 still needs the
 * authority's stamp. Treat these PDFs as evidence packs.
 */

export async function generateCertPack({
  type, project, assets, systems, photos, defects = [],
  inspections = [], resultsByInspection = {}, signatories = [],
}) {
  const config = CONFIGS[type];
  if (!config) throw new Error(`Unknown cert pack type ${type}`);

  // Scope filter: install certifications skip planned-only assets;
  // AS 1851 reports include everything walked.
  const inScope = config.assetFilter ? assets.filter(config.assetFilter) : assets;
  const inScopeIds = new Set(inScope.map((a) => a.id));
  const inScopePhotos = photos.filter((p) => inScopeIds.has(p.assetId));
  const referencedSystemIds = new Set(inScope.map((a) => a.testedSystemId).filter(Boolean));
  const referencedSystems = systems.filter((s) => referencedSystemIds.has(s.id));
  const inScopeDefects = defects.filter((d) => inScopeIds.has(d.assetId));

  const doc = newDoc();
  drawHeader(doc, { title: config.title, project, packType: type });
  drawFooter(doc);

  let y = MARGIN_PT + 80;

  // Statement block
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(60, 60, 60);
  const statementLines = doc.splitTextToSize(config.statement, 595.28 - 2 * MARGIN_PT);
  doc.text(statementLines, MARGIN_PT, y);
  y += statementLines.length * 11 + 12;

  y = drawProjectSummary(doc, {
    project,
    assets: inScope,
    systems: referencedSystems,
    photos: inScopePhotos,
    defects: inScopeDefects,
    startY: y,
  });

  // Asset register
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(30, 30, 30);
  doc.text('Asset register', MARGIN_PT, y);
  y = drawAssetRegister(doc, { assets: inScope, systems: referencedSystems, startY: y + 8 });

  // Inspection summary (only on AS 1851 packs)
  if (config.includeInspections && inspections.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(30, 30, 30);
    doc.text('Inspection history', MARGIN_PT, y);
    autoTable(doc, {
      head: [['Frequency', 'Performed', 'Total', 'Pass', 'Fail']],
      body: summariseInspections(inspections, resultsByInspection),
      startY: y + 8,
      margin: { left: MARGIN_PT, right: MARGIN_PT },
      styles: { fontSize: 8, cellPadding: 4 },
      headStyles: { fillColor: [240, 240, 240], textColor: 30, fontStyle: 'bold' },
      didDrawPage: () => { drawFooter(doc); },
    });
    y = doc.lastAutoTable.finalY + 12;
  }

  y = drawSystemReferences(doc, { systems: referencedSystems, startY: y });

  if (config.includeDefects) {
    const assetsById = Object.fromEntries(inScope.map((a) => [a.id, a]));
    y = drawDefectSummary(doc, { defects: inScopeDefects, assetsById, startY: y });
  }

  if (config.includePhotos) {
    await drawPhotoEvidence(doc, { assets: inScope, photos: inScopePhotos });
  }

  drawSignatoryPage(doc, { signatories });

  // Re-pass footers (numbers now stable)
  const total = doc.internal.getNumberOfPages();
  for (let i = 1; i <= total; i += 1) {
    doc.setPage(i);
    // Footer was drawn during didDrawPage with the page count at that
    // moment; refresh now that the total is known. We overdraw on a
    // white rectangle to clear the stale 'Page n of m'.
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 800, 600, 42, 'F');
    drawFooter(doc);
  }

  return doc.output('blob');
}

const CONFIGS = {
  [CERT_PACK_TYPES.FORM_15]: {
    title: 'Form 15 — Design certificate',
    statement: 'This certificate is issued in respect of the design documentation for the passive fire protection works described herein. It records the FRL requirements, the tested systems specified, and the design responsibility for each element. The design certifier must verify substrate compatibility, achieved FRL, and the tested-system schedule before stamping.',
    includePhotos: false,
    includeInspections: false,
    includeDefects: false,
  },

  [CERT_PACK_TYPES.FORM_16]: {
    title: 'Form 16 — Inspection certificate',
    statement: 'This inspection certificate records the installation of passive fire protection works and the photographic evidence of compliance with the approved tested systems. The inspecting party verifies that the installation matches the as-built record below and that achieved FRL meets or exceeds required FRL across all reportable elements.',
    assetFilter: (a) => [ASSET_STATUSES.INSTALLED, ASSET_STATUSES.CERTIFIED].includes(a.status),
    includePhotos: true,
    includeInspections: false,
    includeDefects: false,
  },

  [CERT_PACK_TYPES.AS_1851_BASELINE]: {
    title: 'AS 1851 baseline survey',
    statement: 'This baseline survey records the condition of every passive-fire asset on site as at the survey date. Subsequent annual inspections compare against this baseline. Defects flagged below require rectification within the AS 1851 timeframe for their class.',
    includePhotos: true,
    includeInspections: true,
    includeDefects: true,
  },

  [CERT_PACK_TYPES.AS_1851_ANNUAL]: {
    title: 'AS 1851 annual inspection report',
    statement: 'This annual inspection report records the condition of passive fire protection elements under AS 1851 sections 16 (fire doors), 17 (fire and smoke walls / penetrations) and 18 (fire and smoke dampers) as applicable. Defects raised are classified per AS 1851 (A immediate, B programmed, C observation) with the rectification due date shown.',
    includePhotos: true,
    includeInspections: true,
    includeDefects: true,
  },

  [CERT_PACK_TYPES.INSTALL_CERTIFICATION]: {
    title: 'Install certification pack',
    statement: 'This certification pack records every passive-fire asset installed under this project, the tested system selected per element, achieved FRL, photographic evidence at pre-install / during / post-install stages, and the supervisor sign-off. This pack accompanies the Form 15 / Form 16 lodged with the certifier.',
    assetFilter: (a) => [ASSET_STATUSES.INSTALLED, ASSET_STATUSES.CERTIFIED].includes(a.status),
    includePhotos: true,
    includeInspections: false,
    includeDefects: true,
  },
};
