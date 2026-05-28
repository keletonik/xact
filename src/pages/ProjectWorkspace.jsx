import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Boxes, ImagePlus, Pencil, ClipboardCheck, Bug, FileText, Wrench, Calculator, Plus, Map,
} from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import StatusBadge from '../components/common/StatusBadge';
import Tabs from '../components/common/Tabs';
import EmptyState from '../components/common/EmptyState';
import AssetTable from '../components/asset/AssetTable';
import AssetEditor from '../components/asset/AssetEditor';
import PhotoCapture from '../components/asset/PhotoCapture';
import InspectionList from '../components/inspection/InspectionList';
import PerformInspection from '../components/inspection/PerformInspection';
import DefectTable from '../components/defect/DefectTable';
import useProjectStore from '../stores/useProjectStore';
import useAssetStore from '../stores/useAssetStore';
import useSystemLibraryStore from '../stores/useSystemLibraryStore';
import usePhotoStore from '../stores/usePhotoStore';
import useInspectionStore from '../stores/useInspectionStore';
import useDefectStore from '../stores/useDefectStore';
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

  useEffect(() => {
    hydrateProjects(); hydrateAssets(); hydrateSystems(); hydratePhotos();
    hydrateInspections(); hydrateDefects();
  }, [hydrateProjects, hydrateAssets, hydrateSystems, hydratePhotos, hydrateInspections, hydrateDefects]);

  const [selectedPhotoAssetId, setSelectedPhotoAssetId] = useState(null);
  const [walkingInspection, setWalkingInspection] = useState(null);

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
      style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}
    >
      <Button variant="ghost" size="sm" onClick={() => navigate('/projects')}>← All projects</Button>

      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
          <div>
            <h2 style={{ margin: 0 }}>{project.name}</h2>
            <div style={{ fontSize: 12, color: 'var(--geist-fg-4)', marginTop: 2 }}>
              <code>{project.code}</code> · {PROJECT_TYPE_LABELS[project.projectType]} · {REGION_LABELS[project.region]}
            </div>
          </div>
          <StatusBadge status={project.status} />
        </div>
        {(project.client || project.siteAddress) && (
          <div style={{ marginTop: 12, fontSize: 13, color: 'var(--geist-fg-2)' }}>
            {project.client && <div>Client: {project.client}</div>}
            {project.siteAddress && <div>Site: {project.siteAddress}</div>}
          </div>
        )}
      </Card>

      <Tabs tabs={tabs} activeTab={tab} onChange={setTab} />

      {tab === TAB_OVERVIEW && <OverviewTab project={project} assets={projectAssets} onChangeStatus={updateProject} onDelete={async () => {
        if (!window.confirm(`Delete project ${project.code}? This removes its assets too.`)) return;
        await deleteProject(project.id);
        navigate('/projects');
      }} />}

      {tab === TAB_ASSETS && (
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <strong>Asset register</strong>
            <Button size="sm" onClick={() => setEditingAsset('new')}>
              <Plus size={14} /> Add asset
            </Button>
          </div>
          <AssetTable
            assets={projectAssets}
            onEdit={(asset) => setEditingAsset(asset)}
            onDelete={async (asset) => {
              if (!window.confirm(`Delete ${asset.tag}? Its photos go too.`)) return;
              await deleteAsset(asset.id);
            }}
          />
        </Card>
      )}

      {tab === TAB_PLANS && (
        <Card>
          <strong>Plans</strong>
          <p style={{ fontSize: 13, color: 'var(--geist-fg-3)', marginTop: 8 }}>
            Drawing upload, scale calibration, and the asset-pin overlay live in the global <Button size="sm" variant="ghost" onClick={() => navigate('/markup')}>Markup tool</Button> for phase 3a. The project-scoped plans tab with pin-drop-to-create-asset arrives in phase 3b.
          </p>
        </Card>
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
          <Card>
            <InspectionList
              inspections={projectInspections}
              results={resultsByInspection}
              onSchedule={(input) => scheduleInspection({ ...input, projectId: id })}
              onPerform={(i) => {
                if (projectAssets.length === 0) {
                  alert('Add assets first; inspections walk the asset register.');
                  return;
                }
                setWalkingInspection(i);
              }}
              onCancel={cancelInspection}
            />
          </Card>
        )
      )}
      {tab === TAB_DEFECTS && (
        <Card>
          <strong style={{ display: 'block', marginBottom: 10 }}>Defect register</strong>
          <DefectTable
            defects={projectDefects}
            assetsById={assetsById}
            onMarkRectified={markRectified}
            onVerify={(defectId) => verifyDefect(defectId, {})}
            onDelete={deleteDefect}
          />
        </Card>
      )}
      {tab === TAB_QUOTE && <StubTab label="Quote" detail="Takeoff-from-plan and line-item quoting lands in phase 6." />}
      {tab === TAB_CERTS && <StubTab label="Cert packs" detail="Form 15, Form 16, AS 1851 baseline and install certification PDFs land in phase 7." />}

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
        <Tile label="Total assets" value={stats.total} />
        <Tile label="Planned" value={stats.planned} />
        <Tile label="Installed" value={stats.installed} />
        <Tile label="Certified" value={stats.certified} />
        <Tile label="Non-conform" value={stats.ncr} accent={stats.ncr > 0 ? 'warning' : 'default'} />
      </div>

      <Card>
        <strong>Lifecycle controls</strong>
        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
          <Button
            variant="ghost"
            onClick={async () => {
              const next = project.status === PROJECT_STATUSES.ARCHIVED ? PROJECT_STATUSES.ACTIVE : PROJECT_STATUSES.ARCHIVED;
              await onChangeStatus(project.id, { status: next });
            }}
          >
            {project.status === PROJECT_STATUSES.ARCHIVED ? 'Restore' : 'Archive'}
          </Button>
          <Button
            variant="ghost"
            onClick={async () => {
              const next = project.status === PROJECT_STATUSES.COMPLETED ? PROJECT_STATUSES.ACTIVE : PROJECT_STATUSES.COMPLETED;
              await onChangeStatus(project.id, { status: next });
            }}
          >
            Mark {project.status === PROJECT_STATUSES.COMPLETED ? 'active' : 'completed'}
          </Button>
          <Button variant="danger" onClick={onDelete}>
            Delete project
          </Button>
        </div>
      </Card>

      {project.notes && (
        <Card>
          <strong>Notes</strong>
          <p style={{ fontSize: 13, color: 'var(--geist-fg-2)', marginTop: 6, whiteSpace: 'pre-wrap' }}>
            {project.notes}
          </p>
        </Card>
      )}
    </div>
  );
}

function Tile({ label, value, accent }) {
  const fg = accent === 'warning' ? 'var(--geist-warning, #b45309)' : 'var(--geist-fg)';
  return (
    <div style={{ padding: 12, border: '1px solid var(--geist-border)', borderRadius: 6, background: 'var(--geist-bg)' }}>
      <div style={{ fontSize: 22, fontWeight: 600, color: fg }}>{value}</div>
      <div style={{ fontSize: 11, color: 'var(--geist-fg-4)', marginTop: 2 }}>{label}</div>
    </div>
  );
}

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
      <Card>
        <strong>Photos</strong>
        <p style={{ fontSize: 13, color: 'var(--geist-fg-3)', marginTop: 8 }}>
          Add an asset first; photos attach to assets.
        </p>
      </Card>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 12 }}>
      <Card>
        <strong style={{ fontSize: 12, color: 'var(--geist-fg-3)', textTransform: 'uppercase', letterSpacing: 0.4 }}>Assets</strong>
        <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {assets.map((a) => {
            const active = (selected && selected.id === a.id);
            return (
              <button
                key={a.id}
                type="button"
                onClick={() => onSelectAsset(a.id)}
                style={{
                  textAlign: 'left',
                  padding: '6px 8px',
                  borderRadius: 4,
                  border: '1px solid ' + (active ? 'var(--geist-fg)' : 'transparent'),
                  background: active ? 'var(--geist-bg-2)' : 'transparent',
                  cursor: 'pointer',
                  fontSize: 12,
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <code>{a.tag}</code>
                <span style={{ color: 'var(--geist-fg-4)' }}>{counts[a.id] || 0}</span>
              </button>
            );
          })}
        </div>
      </Card>
      {selected && <PhotoCapture asset={selected} />}
    </div>
  );
}
