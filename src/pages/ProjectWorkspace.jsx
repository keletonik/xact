import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Boxes, ImagePlus, Pencil, ClipboardCheck, Bug, FileText, Wrench, Calculator, Plus, Map,
} from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import StatusBadge from '../components/common/StatusBadge';
import EmptyState from '../components/common/EmptyState';
import PaperCard from '../components/draft/PaperCard';
import InkStamp from '../components/draft/InkStamp';
import CalloutBalloon from '../components/draft/CalloutBalloon';
import RevisionStamp from '../components/draft/RevisionStamp';
import AssetTable from '../components/asset/AssetTable';
import AssetEditor from '../components/asset/AssetEditor';
import PhotoCapture from '../components/asset/PhotoCapture';
import InspectionList from '../components/inspection/InspectionList';
import PerformInspection from '../components/inspection/PerformInspection';
import DefectTable from '../components/defect/DefectTable';
import QuoteList from '../components/quote/QuoteList';
import QuoteEditor from '../components/quote/QuoteEditor';
import CertPackPanel from '../components/cert/CertPackPanel';
import WorkOrderPanel from '../components/workorder/WorkOrderPanel';
import useProjectStore from '../stores/useProjectStore';
import useAssetStore from '../stores/useAssetStore';
import useSystemLibraryStore from '../stores/useSystemLibraryStore';
import usePhotoStore from '../stores/usePhotoStore';
import useInspectionStore from '../stores/useInspectionStore';
import useDefectStore from '../stores/useDefectStore';
import useQuoteStore from '../stores/useQuoteStore';
import {
  PROJECT_STATUSES, PROJECT_STATUS_LABELS,
  PROJECT_TYPE_LABELS, REGION_LABELS, ASSET_STATUSES,
} from '../utils/constants';

const TAB_OVERVIEW   = 'overview';
const TAB_ASSETS     = 'assets';
const TAB_PLANS      = 'plans';
const TAB_PHOTOS     = 'photos';
const TAB_INSPECTION = 'inspections';
const TAB_DEFECTS    = 'defects';
const TAB_QUOTE      = 'quote';
const TAB_WORK       = 'work';
const TAB_CERTS      = 'certs';

export default function ProjectWorkspace() {
  const { id } = useParams();
  const navigate = useNavigate();

  const projects = useProjectStore((s) => s.projects);
  const hydrateProjects = useProjectStore((s) => s.hydrate);
  const updateProject = useProjectStore((s) => s.updateProject);
  const deleteProject = useProjectStore((s) => s.deleteProject);

  const assets = useAssetStore((s) => s.assets);
  const specialisations = useAssetStore((s) => s.specialisations);
  const hydrateAssets = useAssetStore((s) => s.hydrate);
  const createAsset = useAssetStore((s) => s.createAsset);
  const updateAsset = useAssetStore((s) => s.updateAsset);
  const deleteAsset = useAssetStore((s) => s.deleteAsset);

  const hydrateSystems = useSystemLibraryStore((s) => s.hydrate);
  const hydratePhotos  = usePhotoStore((s) => s.hydrate);
  const allPhotos      = usePhotoStore((s) => s.photos);

  const inspections             = useInspectionStore((s) => s.inspections);
  const resultsByInspection     = useInspectionStore((s) => s.resultsByInspection);
  const hydrateInspections      = useInspectionStore((s) => s.hydrate);
  const scheduleInspection      = useInspectionStore((s) => s.scheduleInspection);
  const completeInspection      = useInspectionStore((s) => s.completeInspection);
  const cancelInspection        = useInspectionStore((s) => s.cancelInspection);

  const defects          = useDefectStore((s) => s.defects);
  const hydrateDefects   = useDefectStore((s) => s.hydrate);
  const markRectified    = useDefectStore((s) => s.markRectified);
  const verifyDefect     = useDefectStore((s) => s.verify);
  const deleteDefect     = useDefectStore((s) => s.deleteDefect);

  const quotes               = useQuoteStore((s) => s.quotes);
  const lineItemsByQuote     = useQuoteStore((s) => s.lineItemsByQuote);
  const hydrateQuotes        = useQuoteStore((s) => s.hydrate);
  const createQuote          = useQuoteStore((s) => s.createQuote);
  const addQuoteLine         = useQuoteStore((s) => s.addLine);
  const updateQuoteLine      = useQuoteStore((s) => s.updateLine);
  const removeQuoteLine      = useQuoteStore((s) => s.removeLine);
  const setQuoteStatus       = useQuoteStore((s) => s.setStatus);
  const convertQuoteToAssets = useQuoteStore((s) => s.convertToAssets);

  useEffect(() => {
    hydrateProjects(); hydrateAssets(); hydrateSystems(); hydratePhotos();
    hydrateInspections(); hydrateDefects(); hydrateQuotes();
  }, [hydrateProjects, hydrateAssets, hydrateSystems, hydratePhotos, hydrateInspections, hydrateDefects, hydrateQuotes]);

  const [selectedPhotoAssetId, setSelectedPhotoAssetId] = useState(null);
  const [walkingInspection, setWalkingInspection] = useState(null);
  const [openQuoteId, setOpenQuoteId] = useState(null);

  const project = projects.find((p) => p.id === id);

  const [tab, setTab] = useState(TAB_OVERVIEW);
  const [editingAsset, setEditingAsset] = useState(null); // null | 'new' | assetObject

  const projectAssets = useMemo(() => assets.filter((a) => a.projectId === id), [assets, id]);

  const projectInspections = useMemo(
    () => inspections.filter((i) => i.projectId === id),
    [inspections, id],
  );

  const assetIdSet = useMemo(() => new Set(projectAssets.map((a) => a.id)), [projectAssets]);
  const projectDefects = useMemo(
    () => defects.filter((d) => assetIdSet.has(d.assetId)),
    [defects, assetIdSet],
  );
  const assetsById = useMemo(
    () => Object.fromEntries(projectAssets.map((a) => [a.id, a])),
    [projectAssets],
  );

  const openDefectCount = projectDefects.filter((d) => d.status !== 'verified').length;

  const tabs = useMemo(() => ([
    { id: TAB_OVERVIEW,   label: 'Overview',     icon: ClipboardCheck },
    { id: TAB_ASSETS,     label: 'Assets',       icon: Boxes,         count: projectAssets.length },
    { id: TAB_PLANS,      label: 'Plans',        icon: Map },
    { id: TAB_PHOTOS,     label: 'Photos',       icon: ImagePlus },
    { id: TAB_INSPECTION, label: 'Inspections',  icon: ClipboardCheck, count: projectInspections.length || undefined },
    { id: TAB_DEFECTS,    label: 'Defects',      icon: Bug,            count: openDefectCount || undefined },
    { id: TAB_QUOTE,      label: 'Quote',        icon: Calculator },
    { id: TAB_WORK,       label: 'Work orders',  icon: Wrench },
    { id: TAB_CERTS,      label: 'Cert packs',   icon: FileText },
  ]), [projectAssets.length, projectInspections.length, openDefectCount]);

  if (!project) {
    return (
      <div style={{ padding: 24 }}>
        <p>Project not found.</p>
        <Button variant="ghost" onClick={() => navigate('/projects')}>← All projects</Button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className="xc-stagger"
      style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 18 }}
    >
      <button
        type="button"
        onClick={() => navigate('/projects')}
        style={backCrumb}
      >
        ← project register
      </button>

      <section style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        alignItems: 'flex-end',
        gap: 22,
        borderBottom: '1.5px solid var(--rule-ink)',
        paddingBottom: 14,
      }}>
        <div>
          <div className="xc-stamp" style={{ marginBottom: 6, display: 'flex', alignItems: 'center', gap: 10 }}>
            <CalloutBalloon size="md">{project.code}</CalloutBalloon>
            <span>{PROJECT_TYPE_LABELS[project.projectType]} · {REGION_LABELS[project.region]}</span>
          </div>
          <h1 className="xc-display-italic" style={{ margin: 0, fontSize: 52, lineHeight: 1, color: 'var(--ink)' }}>
            {project.name}
          </h1>
          {(project.client || project.siteAddress) && (
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-3)', marginTop: 10 }}>
              {project.client ? `client: ${project.client}` : ''}
              {project.client && project.siteAddress ? ' · ' : ''}
              {project.siteAddress ? `site: ${project.siteAddress}` : ''}
            </p>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <InkStamp tone={projectStampTone(project.status)} size="md" rotate={-3}>
            {PROJECT_STATUS_LABELS[project.status]}
          </InkStamp>
          <RevisionStamp letter="B" />
        </div>
      </section>

      <DraftingTabs tabs={tabs} active={tab} onChange={setTab} />

      {tab === TAB_OVERVIEW && <OverviewTab project={project} assets={projectAssets} onChangeStatus={updateProject} onDelete={async () => {
        if (!window.confirm(`Delete project ${project.code}? This removes its assets too.`)) return;
        await deleteProject(project.id);
        navigate('/projects');
      }} />}

      {tab === TAB_ASSETS && (
        <PaperCard
          title="asset register"
          meta={
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
              {projectAssets.length} drafted
              <button type="button" onClick={() => setEditingAsset('new')} style={{
                background: 'var(--ink)',
                color: 'var(--paper-1)',
                border: '1px solid var(--ink)',
                padding: '6px 10px',
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                letterSpacing: 'var(--tracking-label)',
                textTransform: 'uppercase',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
              }}>
                <Plus size={11} /> add
              </button>
            </span>
          }
        >
          <AssetTable
            assets={projectAssets}
            onEdit={(asset) => setEditingAsset(asset)}
            onDelete={async (asset) => {
              if (!window.confirm(`Delete ${asset.tag}? Its photos go too.`)) return;
              await deleteAsset(asset.id);
            }}
          />
        </PaperCard>
      )}

      {tab === TAB_PLANS && (
        <PaperCard title="plans" meta="drawing register">
          <p style={{ fontSize: 13, color: 'var(--ink-2)', margin: 0 }}>
            Drawing upload, scale calibration, and the asset-pin overlay live in the global Markup tool. Open a plan, calibrate, then enable Pin asset mode to drop pins directly onto drawings.
          </p>
          <div style={{ marginTop: 12 }}>
            <button type="button" onClick={() => navigate('/markup')} style={{
              background: 'var(--ink)',
              color: 'var(--paper-1)',
              border: '1px solid var(--ink)',
              padding: '8px 14px',
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              letterSpacing: 'var(--tracking-label)',
              textTransform: 'uppercase',
              cursor: 'pointer',
            }}>
              open markup
            </button>
          </div>
        </PaperCard>
      )}

      {tab === TAB_PHOTOS && (
        <PhotosTab
          assets={projectAssets}
          photos={allPhotos}
          selectedAssetId={selectedPhotoAssetId}
          onSelectAsset={setSelectedPhotoAssetId}
        />
      )}
      {tab === TAB_INSPECTION && (
        walkingInspection ? (
          <PerformInspection
            inspection={walkingInspection}
            assets={projectAssets}
            onCancel={() => setWalkingInspection(null)}
            onSave={async (payload) => {
              await completeInspection(walkingInspection.id, payload);
              setWalkingInspection(null);
            }}
          />
        ) : (
          <PaperCard title="inspections" meta="as 1851 § 16 · 17 · 18">
            <InspectionList
              inspections={projectInspections}
              results={resultsByInspection}
              onSchedule={(input) => scheduleInspection({ ...input, projectId: id })}
              onPerform={(i) => {
                if (projectAssets.length === 0) {
                  alert('add assets first; inspections walk the asset register.');
                  return;
                }
                setWalkingInspection(i);
              }}
              onCancel={cancelInspection}
            />
          </PaperCard>
        )
      )}
      {tab === TAB_DEFECTS && (
        <PaperCard title="defect register" meta="class A · B · C">
          <DefectTable
            defects={projectDefects}
            assetsById={assetsById}
            onMarkRectified={markRectified}
            onVerify={(defectId) => verifyDefect(defectId, {})}
            onDelete={deleteDefect}
          />
        </PaperCard>
      )}
      {tab === TAB_QUOTE && (
        openQuoteId ? (
          (() => {
            const q = quotes.find((x) => x.id === openQuoteId);
            if (!q) { setOpenQuoteId(null); return null; }
            return (
              <QuoteEditor
                quote={q}
                lines={lineItemsByQuote[q.id] || []}
                onBack={() => setOpenQuoteId(null)}
                onAddLine={(input) => addQuoteLine(q.id, input)}
                onUpdateLine={(lineId, patch) => updateQuoteLine(q.id, lineId, patch)}
                onRemoveLine={(lineId) => removeQuoteLine(q.id, lineId)}
                onSetStatus={(status) => setQuoteStatus(q.id, status)}
                onConvert={async () => {
                  const created = await convertQuoteToAssets(q.id);
                  const n = Object.values(created).flat().length;
                  alert(`${n} planned assets created. head to assets tab to walk them through install.`);
                }}
              />
            );
          })()
        ) : (
          <PaperCard title="quote register" meta="version per project">
            <QuoteList
              quotes={quotes.filter((q) => q.projectId === id)}
              onOpen={(q) => setOpenQuoteId(q.id)}
              onCreate={async () => {
                const q = await createQuote({ projectId: id });
                setOpenQuoteId(q.id);
              }}
            />
          </PaperCard>
        )
      )}
      {tab === TAB_WORK && (
        <WorkOrderPanel
          project={project}
          assets={projectAssets}
          assetsById={assetsById}
        />
      )}

      {tab === TAB_CERTS && (
        <CertPackPanel
          project={project}
          assets={projectAssets}
          systems={useSystemLibraryStore.getState().systems}
          photos={allPhotos.filter((p) => assetIdSet.has(p.assetId))}
          defects={projectDefects}
          inspections={projectInspections}
          resultsByInspection={resultsByInspection}
        />
      )}

      {editingAsset && (
        <AssetEditor
          initial={editingAsset === 'new' ? null : editingAsset}
          defaultProjectId={project.id}
          initialSpecialisation={editingAsset === 'new' ? null : specialisations[editingAsset.id]}
          onClose={() => setEditingAsset(null)}
          onSave={async ({ assetPatch, specialisation }) => {
            if (editingAsset === 'new') {
              await createAsset({ asset: assetPatch, specialisation });
            } else {
              await updateAsset(editingAsset.id, { asset: assetPatch, specialisation });
            }
            setEditingAsset(null);
          }}
        />
      )}
    </motion.div>
  );
}

function OverviewTab({ project, assets, onChangeStatus, onDelete }) {
  const stats = useMemo(() => {
    const total = assets.length;
    const by = (status) => assets.filter((a) => a.status === status).length;
    return {
      total,
      planned: by(ASSET_STATUSES.PLANNED),
      installed: by(ASSET_STATUSES.INSTALLED),
      certified: by(ASSET_STATUSES.CERTIFIED),
      ncr: by(ASSET_STATUSES.NONCONFORMANCE),
    };
  }, [assets]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <PaperCard title="asset roll-up" meta={`${stats.total} total`}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gridAutoRows: '88px',
          borderTop: '1px solid var(--rule)',
          borderLeft: '1px solid var(--rule)',
        }}>
          <OverviewCell label="Total" value={stats.total} accent="ink" />
          <OverviewCell label="Planned" value={stats.planned} accent="planned" />
          <OverviewCell label="Installed" value={stats.installed} accent="installed" />
          <OverviewCell label="Certified" value={stats.certified} accent="certified" />
          <OverviewCell label="Non-conform" value={stats.ncr} accent={stats.ncr > 0 ? 'nonconformance' : 'mute'} />
        </div>
      </PaperCard>

      <PaperCard title="lifecycle" meta={`status: ${PROJECT_STATUS_LABELS[project.status]}`}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={async () => {
              const next = project.status === PROJECT_STATUSES.ARCHIVED ? PROJECT_STATUSES.ACTIVE : PROJECT_STATUSES.ARCHIVED;
              await onChangeStatus(project.id, { status: next });
            }}
            style={lifecycleAction}
          >
            {project.status === PROJECT_STATUSES.ARCHIVED ? 'restore' : 'archive'}
          </button>
          <button
            type="button"
            onClick={async () => {
              const next = project.status === PROJECT_STATUSES.COMPLETED ? PROJECT_STATUSES.ACTIVE : PROJECT_STATUSES.COMPLETED;
              await onChangeStatus(project.id, { status: next });
            }}
            style={lifecycleAction}
          >
            mark {project.status === PROJECT_STATUSES.COMPLETED ? 'active' : 'completed'}
          </button>
          <button type="button" onClick={onDelete} style={{ ...lifecycleAction, color: 'var(--accent)', borderColor: 'var(--accent)' }}>
            delete project
          </button>
        </div>
      </PaperCard>

      {project.notes && (
        <PaperCard title="notes">
          <p style={{ fontSize: 14, color: 'var(--ink)', margin: 0, whiteSpace: 'pre-wrap' }}>
            {project.notes}
          </p>
        </PaperCard>
      )}
    </div>
  );
}

function OverviewCell({ label, value, accent }) {
  const fg = {
    ink: 'var(--ink)',
    planned: 'var(--ink-3)',
    installed: 'var(--status-installed-ink)',
    certified: 'var(--status-certified-ink)',
    nonconformance: 'var(--accent)',
    mute: 'var(--ink-4)',
  }[accent] || 'var(--ink)';
  return (
    <div style={{
      borderRight: '1px solid var(--rule)',
      borderBottom: '1px solid var(--rule)',
      padding: '14px 16px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      minWidth: 0,
    }}>
      <span style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 9,
        letterSpacing: 'var(--tracking-label)',
        textTransform: 'uppercase',
        color: 'var(--ink-3)',
      }}>{label}</span>
      <span style={{
        fontFamily: 'var(--font-display)',
        fontWeight: 800,
        fontSize: 32,
        lineHeight: 1,
        letterSpacing: '-0.04em',
        color: fg,
        fontVariantNumeric: 'tabular-nums',
      }}>
        {value}
      </span>
    </div>
  );
}

function DraftingTabs({ tabs, active, onChange }) {
  return (
    <div style={{
      display: 'flex',
      gap: 0,
      borderBottom: '1.5px solid var(--rule-ink)',
      flexWrap: 'wrap',
    }}>
      {tabs.map((t) => {
        const isActive = active === t.id;
        const Icon = t.icon;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onChange(t.id)}
            style={{
              background: isActive ? 'var(--ink)' : 'transparent',
              color: isActive ? 'var(--paper-1)' : 'var(--ink-2)',
              border: 'none',
              borderRight: '1px solid var(--rule)',
              padding: '10px 16px',
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              letterSpacing: 'var(--tracking-label)',
              textTransform: 'uppercase',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              position: 'relative',
            }}
            aria-pressed={isActive}
          >
            {Icon && <Icon size={12} strokeWidth={2.25} />}
            <span>{t.label}</span>
            {t.count != null && (
              <span style={{
                marginLeft: 4,
                fontSize: 10,
                color: isActive ? 'var(--paper-3)' : 'var(--ink-4)',
                fontFamily: 'var(--font-mono)',
              }}>
                {String(t.count).padStart(2, '0')}
              </span>
            )}
            {isActive && (
              <span aria-hidden="true" style={{
                position: 'absolute',
                left: 0, right: 0, bottom: -1.5,
                height: 3,
                background: 'var(--accent)',
              }} />
            )}
          </button>
        );
      })}
    </div>
  );
}

function projectStampTone(status) {
  switch (status) {
    case PROJECT_STATUSES.ACTIVE:    return 'installed';
    case PROJECT_STATUSES.COMPLETED: return 'certified';
    case PROJECT_STATUSES.ON_HOLD:   return 'rectification';
    case PROJECT_STATUSES.ARCHIVED:  return 'planned';
    default:                         return 'draft';
  }
}

const backCrumb = {
  background: 'transparent',
  border: 'none',
  color: 'var(--ink-3)',
  fontFamily: 'var(--font-mono)',
  fontSize: 11,
  letterSpacing: 'var(--tracking-label)',
  textTransform: 'uppercase',
  padding: 0,
  cursor: 'pointer',
  textAlign: 'left',
};
const lifecycleAction = {
  background: 'transparent',
  border: '1px solid var(--rule-strong)',
  padding: '8px 14px',
  fontFamily: 'var(--font-mono)',
  fontSize: 11,
  letterSpacing: 'var(--tracking-label)',
  textTransform: 'uppercase',
  color: 'var(--ink-2)',
  cursor: 'pointer',
};

function StubTab({ label, detail }) {
  return (
    <Card>
      <strong>{label}</strong>
      <p style={{ fontSize: 13, color: 'var(--geist-fg-3)', marginTop: 8 }}>{detail}</p>
    </Card>
  );
}

function PhotosTab({ assets, photos, selectedAssetId, onSelectAsset }) {
  const counts = useMemo(() => {
    const out = {};
    for (const p of photos) (out[p.assetId] = (out[p.assetId] || 0) + 1);
    return out;
  }, [photos]);

  const selected = assets.find((a) => a.id === selectedAssetId) || assets[0];

  if (assets.length === 0) {
    return (
      <PaperCard title="photos" meta="evidence per asset per stage">
        <p style={{ fontSize: 13, color: 'var(--ink-2)', margin: 0 }}>
          Add an asset first; photos attach to assets.
        </p>
      </PaperCard>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 14 }}>
      <PaperCard title="asset register" noPad>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {assets.map((a) => {
            const active = (selected && selected.id === a.id);
            return (
              <button
                key={a.id}
                type="button"
                onClick={() => onSelectAsset(a.id)}
                style={{
                  textAlign: 'left',
                  padding: '10px 14px',
                  border: 'none',
                  borderBottom: '1px solid var(--rule)',
                  borderLeft: '3px solid ' + (active ? 'var(--accent)' : 'transparent'),
                  background: active ? 'var(--paper-2)' : 'var(--paper-1)',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 12,
                  color: 'var(--ink)',
                  letterSpacing: '0.04em',
                }}
              >
                <code>{a.tag}</code>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  color: counts[a.id] ? 'var(--ink-2)' : 'var(--ink-4)',
                }}>
                  {String(counts[a.id] || 0).padStart(2, '0')}
                </span>
              </button>
            );
          })}
        </div>
      </PaperCard>
      {selected && <PhotoCapture asset={selected} />}
    </div>
  );
}
