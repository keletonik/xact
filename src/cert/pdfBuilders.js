import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { getBlob } from '../services/db';
import {
  ASSET_TYPE_LABELS, SUBSTRATE_LABELS,
  PHOTO_STAGES, PHOTO_STAGE_LABELS,
  CERT_PACK_TYPE_LABELS, DEFECT_CLASS_LABELS,
  INSPECTION_FREQUENCY_LABELS,
} from '../utils/constants';

/**
 * Shared PDF building blocks for the five cert pack types.
 *
 * jsPDF + jspdf-autotable for tables, html2canvas not needed here
 * because every page is composed from primitives. Photos are
 * embedded as JPEG/PNG dataURLs read from dexie blobs.
 *
 * Money / FRL are passed in pre-formatted; this layer does layout
 * only and is intentionally domain-light so the same builder can
 * back Form 15, Form 16, AS 1851 baseline / annual, and install certs.
 *
 * Pages are A4 portrait. Margins held by MARGIN_PT. Every page gets a
 * header + footer via the autotable `didDrawPage` hook so pagination
 * is handled automatically.
 */
const PAGE_W = 595.28;
const PAGE_H = 841.89;
const MARGIN_PT = 36;

export function newDoc({ orientation = 'portrait' } = {}) {
  return new jsPDF({ unit: 'pt', format: 'a4', orientation });
}

export function drawHeader(doc, { title, project, packType }) {
  const company = localStorage.getItem('xact-company-name') || 'XACT Passive Fire';
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  doc.text(company, MARGIN_PT, MARGIN_PT - 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  doc.text(CERT_PACK_TYPE_LABELS[packType] || 'Cert pack', PAGE_W - MARGIN_PT, MARGIN_PT - 12, { align: 'right' });

  doc.setDrawColor(220, 220, 220);
  doc.line(MARGIN_PT, MARGIN_PT - 6, PAGE_W - MARGIN_PT, MARGIN_PT - 6);

  doc.setTextColor(20, 20, 20);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(title, MARGIN_PT, MARGIN_PT + 14);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(70, 70, 70);
  const subtitle = `${project.code} — ${project.name}`;
  doc.text(subtitle, MARGIN_PT, MARGIN_PT + 30);
  if (project.client) doc.text(`Client: ${project.client}`, MARGIN_PT, MARGIN_PT + 44);
  if (project.siteAddress) doc.text(`Site: ${project.siteAddress}`, MARGIN_PT, MARGIN_PT + 58);
}

export function drawFooter(doc) {
  const pageNum = doc.internal.getCurrentPageInfo().pageNumber;
  const total = doc.internal.getNumberOfPages();
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.setDrawColor(220, 220, 220);
  doc.line(MARGIN_PT, PAGE_H - MARGIN_PT + 6, PAGE_W - MARGIN_PT, PAGE_H - MARGIN_PT + 6);
  doc.text(`Generated ${new Date().toLocaleString('en-AU')}`, MARGIN_PT, PAGE_H - MARGIN_PT + 18);
  doc.text(`Page ${pageNum} of ${total}`, PAGE_W - MARGIN_PT, PAGE_H - MARGIN_PT + 18, { align: 'right' });
}

export function drawProjectSummary(doc, { project, assets, systems, photos, defects, startY }) {
  const counts = assets.reduce((acc, a) => { (acc[a.status] = (acc[a.status] || 0) + 1); return acc; }, {});
  const lines = [
    ['Project code', project.code],
    ['Project name', project.name],
    ['Client', project.client || '—'],
    ['Site', project.siteAddress || '—'],
    ['Region', (project.region || '').toUpperCase()],
    ['Total assets', String(assets.length)],
    ['Installed', String(counts.installed || 0)],
    ['Certified', String(counts.certified || 0)],
    ['Non-conformances', String(counts.nonconformance || 0)],
    ['Photos captured', String(photos.length)],
    ['Tested systems referenced', String(systems.length)],
    ['Defects raised', String(defects.length)],
  ];
  autoTable(doc, {
    body: lines,
    startY,
    margin: { left: MARGIN_PT, right: MARGIN_PT },
    theme: 'plain',
    styles: { fontSize: 9, cellPadding: 3 },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 140, textColor: [70, 70, 70] } },
  });
  return doc.lastAutoTable.finalY + 12;
}

export function drawAssetRegister(doc, { assets, systems, startY }) {
  const systemById = Object.fromEntries(systems.map((s) => [s.id, s]));
  const rows = assets.map((a) => [
    a.tag,
    ASSET_TYPE_LABELS[a.assetType],
    a.substrate ? SUBSTRATE_LABELS[a.substrate] : '—',
    a.requiredFrl || '—',
    a.achievedFrl || '—',
    a.testedSystemId ? `${systemById[a.testedSystemId]?.manufacturer || ''} ${systemById[a.testedSystemId]?.systemName || ''}`.trim() || '—' : '—',
    a.status,
  ]);
  autoTable(doc, {
    head: [['Tag', 'Type', 'Substrate', 'Required FRL', 'Achieved FRL', 'Tested system', 'Status']],
    body: rows,
    startY,
    margin: { left: MARGIN_PT, right: MARGIN_PT },
    styles: { fontSize: 8, cellPadding: 4 },
    headStyles: { fillColor: [240, 240, 240], textColor: 30, fontStyle: 'bold' },
    didDrawPage: () => { drawFooter(doc); },
  });
  return doc.lastAutoTable.finalY + 12;
}

export function drawSystemReferences(doc, { systems, startY }) {
  if (systems.length === 0) return startY;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(30, 30, 30);
  doc.text('Tested systems referenced', MARGIN_PT, startY);
  const rows = systems.map((s) => [
    `${s.manufacturer} ${s.systemName}`,
    s.testReportNo || '—',
    s.testStandard,
    s.testedFrl,
    (s.openingSizeRangeMm ? `${s.openingSizeRangeMm[0]}–${s.openingSizeRangeMm[1]} mm` : '—'),
  ]);
  autoTable(doc, {
    head: [['System', 'Test report', 'Standard', 'Tested FRL', 'Opening']],
    body: rows,
    startY: startY + 8,
    margin: { left: MARGIN_PT, right: MARGIN_PT },
    styles: { fontSize: 8, cellPadding: 4 },
    headStyles: { fillColor: [240, 240, 240], textColor: 30, fontStyle: 'bold' },
    didDrawPage: () => { drawFooter(doc); },
  });
  return doc.lastAutoTable.finalY + 12;
}

export function drawDefectSummary(doc, { defects, assetsById, startY }) {
  if (defects.length === 0) return startY;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(30, 30, 30);
  doc.text('Defects', MARGIN_PT, startY);
  const rows = defects.map((d) => [
    assetsById[d.assetId]?.tag || d.assetId.slice(0, 8),
    DEFECT_CLASS_LABELS[d.severity] || d.severity,
    d.description || '—',
    (d.raisedAt || '').slice(0, 10),
    d.rectificationDueDate || '—',
    d.status,
  ]);
  autoTable(doc, {
    head: [['Asset', 'Class', 'Description', 'Raised', 'Due', 'Status']],
    body: rows,
    startY: startY + 8,
    margin: { left: MARGIN_PT, right: MARGIN_PT },
    styles: { fontSize: 8, cellPadding: 4 },
    headStyles: { fillColor: [240, 240, 240], textColor: 30, fontStyle: 'bold' },
    didDrawPage: () => { drawFooter(doc); },
  });
  return doc.lastAutoTable.finalY + 12;
}

export async function drawPhotoEvidence(doc, { assets, photos }) {
  if (photos.length === 0) return;
  const byAsset = photos.reduce((acc, p) => {
    (acc[p.assetId] ??= []).push(p);
    return acc;
  }, {});

  for (const asset of assets) {
    const set = byAsset[asset.id];
    if (!set || set.length === 0) continue;
    doc.addPage();
    drawFooter(doc);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(30, 30, 30);
    doc.text(`${asset.tag} — ${ASSET_TYPE_LABELS[asset.assetType]}`, MARGIN_PT, MARGIN_PT);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    const meta = [
      asset.substrate ? SUBSTRATE_LABELS[asset.substrate] : null,
      asset.requiredFrl ? `Required FRL ${asset.requiredFrl}` : null,
      asset.achievedFrl ? `Achieved FRL ${asset.achievedFrl}` : null,
    ].filter(Boolean).join(' · ');
    if (meta) doc.text(meta, MARGIN_PT, MARGIN_PT + 16);

    // Group photos by stage in canonical order
    const order = [PHOTO_STAGES.PRE_INSTALL, PHOTO_STAGES.DURING, PHOTO_STAGES.POST_INSTALL, PHOTO_STAGES.ANNUAL_INSPECTION];
    let y = MARGIN_PT + 36;
    const cellW = (PAGE_W - 2 * MARGIN_PT - 12) / 2;
    const cellH = 160;

    for (const stage of order) {
      const stagePhotos = set.filter((p) => p.stage === stage);
      if (stagePhotos.length === 0) continue;

      if (y + cellH + 24 > PAGE_H - MARGIN_PT) {
        doc.addPage();
        drawFooter(doc);
        y = MARGIN_PT;
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(50, 50, 50);
      doc.text(PHOTO_STAGE_LABELS[stage], MARGIN_PT, y);
      y += 8;

      let col = 0;
      for (const photo of stagePhotos) {
        if (y + cellH > PAGE_H - MARGIN_PT) {
          doc.addPage();
          drawFooter(doc);
          y = MARGIN_PT;
          col = 0;
        }
        const dataUrl = await blobToDataURL(photo.blobHash);
        if (dataUrl) {
          const x = MARGIN_PT + col * (cellW + 12);
          try {
            doc.addImage(dataUrl, 'JPEG', x, y, cellW, cellH, undefined, 'FAST');
          } catch {
            // Skip on malformed image; tag with note in the cert.
          }
          doc.setFontSize(7);
          doc.setTextColor(120, 120, 120);
          doc.text(photo.takenAt ? new Date(photo.takenAt).toLocaleString('en-AU') : '', x, y + cellH + 10);
        }
        col += 1;
        if (col >= 2) {
          col = 0;
          y += cellH + 24;
        }
      }
      if (col !== 0) y += cellH + 24;
    }
  }
}

export function drawSignatoryPage(doc, { signatories = [] }) {
  doc.addPage();
  drawFooter(doc);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(30, 30, 30);
  doc.text('Signatories', MARGIN_PT, MARGIN_PT);

  let y = MARGIN_PT + 28;
  const blocks = signatories.length > 0 ? signatories : [
    { role: 'Installer',  name: '', date: '' },
    { role: 'Supervisor', name: '', date: '' },
    { role: 'Certifier',  name: '', date: '' },
  ];

  for (const block of blocks) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(50, 50, 50);
    doc.text(block.role, MARGIN_PT, y);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(70, 70, 70);
    doc.text('Name:', MARGIN_PT, y + 16);
    doc.line(MARGIN_PT + 50, y + 17, MARGIN_PT + 260, y + 17);
    if (block.name) doc.text(block.name, MARGIN_PT + 54, y + 14);

    doc.text('Date:', MARGIN_PT + 280, y + 16);
    doc.line(MARGIN_PT + 320, y + 17, MARGIN_PT + 420, y + 17);
    if (block.date) doc.text(block.date, MARGIN_PT + 324, y + 14);

    doc.text('Signature:', MARGIN_PT, y + 44);
    doc.line(MARGIN_PT + 60, y + 45, PAGE_W - MARGIN_PT, y + 45);

    y += 80;
  }
}

async function blobToDataURL(hash) {
  const blob = await getBlob(hash);
  if (!blob) return null;
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(blob);
  });
}

export function summariseInspections(inspections, results) {
  const completed = inspections.filter((i) => i.status === 'completed');
  return completed.map((i) => {
    const rs = results[i.id] || [];
    const fails = rs.filter((r) => r.result === 'fail').length;
    return [
      INSPECTION_FREQUENCY_LABELS[i.frequency],
      i.performedDate ? i.performedDate.slice(0, 10) : '—',
      String(rs.length),
      String(rs.length - fails),
      String(fails),
    ];
  });
}

export { MARGIN_PT, PAGE_W, PAGE_H };
