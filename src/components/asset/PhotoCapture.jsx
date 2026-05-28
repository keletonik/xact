import { useEffect, useMemo, useRef, useState } from 'react';
import { Camera, Trash2, Upload, ImagePlus } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';
import EmptyState from '../common/EmptyState';
import usePhotoStore, { resolveObjectURL } from '../../stores/usePhotoStore';
import {
  PHOTO_STAGES, PHOTO_STAGE_LABELS, ASSET_STATUSES,
} from '../../utils/constants';
import { formatDateTime } from '../../utils/formatters';

const STAGE_ORDER = [
  PHOTO_STAGES.PRE_INSTALL,
  PHOTO_STAGES.DURING,
  PHOTO_STAGES.POST_INSTALL,
  PHOTO_STAGES.ANNUAL_INSPECTION,
];

/**
 * Per-asset photo grid grouped by stage (pre / during / post / annual).
 * Capture uses the input[type=file capture] camera trigger on mobile and
 * the file picker on desktop. Photos persist to dexie blobs by SHA-256.
 */
export default function PhotoCapture({ asset, allowedStages = STAGE_ORDER }) {
  const photos = usePhotoStore((s) => s.photos);
  const hydrate = usePhotoStore((s) => s.hydrate);
  const addPhoto = usePhotoStore((s) => s.addPhoto);
  const deletePhoto = usePhotoStore((s) => s.deletePhoto);

  useEffect(() => { hydrate(); }, [hydrate]);

  const grouped = useMemo(() => {
    const out = {};
    for (const stage of allowedStages) out[stage] = [];
    for (const p of photos) {
      if (p.assetId !== asset.id) continue;
      (out[p.stage] ??= []).push(p);
    }
    for (const stage of Object.keys(out)) {
      out[stage].sort((a, b) => (a.takenAt || '').localeCompare(b.takenAt || ''));
    }
    return out;
  }, [photos, asset.id, allowedStages]);

  const totalCount = useMemo(
    () => photos.filter((p) => p.assetId === asset.id).length,
    [photos, asset.id],
  );

  if (totalCount === 0) {
    return (
      <Card>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <strong>Photos for {asset.tag}</strong>
            <span style={{ fontSize: 12, color: 'var(--geist-fg-4)' }}>none yet</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${allowedStages.length}, 1fr)`, gap: 8 }}>
            {allowedStages.map((stage) => (
              <StageDropzone
                key={stage}
                stage={stage}
                onPick={(file) => addPhoto({ assetId: asset.id, stage, file })}
              />
            ))}
          </div>
          <EmptyState
            icon={Camera}
            title="No photos captured"
            description="Pre / during / post-install evidence is mandatory for cert pack release; annual inspection photos feed into AS 1851 reports."
          />
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <strong>Photos for {asset.tag}</strong>
          <span style={{ fontSize: 12, color: 'var(--geist-fg-4)' }}>{totalCount} captured</span>
        </div>
        {allowedStages.map((stage) => (
          <StageRow
            key={stage}
            stage={stage}
            photos={grouped[stage]}
            onAdd={(file) => addPhoto({ assetId: asset.id, stage, file })}
            onDelete={deletePhoto}
          />
        ))}
      </div>
    </Card>
  );
}

function StageRow({ stage, photos, onAdd, onDelete }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 12, fontWeight: 600 }}>{PHOTO_STAGE_LABELS[stage]}</span>
        <span style={{ fontSize: 11, color: 'var(--geist-fg-4)' }}>{photos.length}</span>
        <div style={{ marginLeft: 'auto' }}>
          <StagePickButton stage={stage} onPick={onAdd} />
        </div>
      </div>
      {photos.length === 0 ? (
        <div style={{ fontSize: 11, color: 'var(--geist-fg-4)' }}>No {PHOTO_STAGE_LABELS[stage].toLowerCase()} photos yet.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 8 }}>
          {photos.map((p) => (
            <PhotoTile key={p.id} photo={p} onDelete={() => onDelete(p.id)} />
          ))}
        </div>
      )}
    </div>
  );
}

function StageDropzone({ stage, onPick }) {
  return (
    <div style={{
      border: '1px dashed var(--geist-border-strong)',
      borderRadius: 6, padding: 10,
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
      fontSize: 11, color: 'var(--geist-fg-3)',
    }}>
      <div style={{ fontWeight: 600 }}>{PHOTO_STAGE_LABELS[stage]}</div>
      <StagePickButton stage={stage} onPick={onPick} />
    </div>
  );
}

function StagePickButton({ stage, onPick }) {
  const fileRef = useRef(null);
  const cameraRef = useRef(null);
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: 'none' }}
        onChange={(e) => {
          for (const f of e.target.files || []) onPick(f);
          e.target.value = '';
        }}
      />
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: 'none' }}
        onChange={(e) => {
          for (const f of e.target.files || []) onPick(f);
          e.target.value = '';
        }}
      />
      <Button size="sm" variant="ghost" onClick={() => cameraRef.current?.click()} aria-label={`Take ${PHOTO_STAGE_LABELS[stage]} photo`}>
        <Camera size={12} /> Camera
      </Button>
      <Button size="sm" variant="ghost" onClick={() => fileRef.current?.click()} aria-label={`Upload ${PHOTO_STAGE_LABELS[stage]} files`}>
        <Upload size={12} /> Upload
      </Button>
    </div>
  );
}

function PhotoTile({ photo, onDelete }) {
  const [url, setUrl] = useState(null);

  useEffect(() => {
    let alive = true;
    resolveObjectURL(photo.blobHash).then((u) => { if (alive) setUrl(u); });
    return () => { alive = false; };
  }, [photo.blobHash]);

  return (
    <div style={{
      border: '1px solid var(--geist-border)',
      borderRadius: 6,
      overflow: 'hidden',
      background: 'var(--geist-bg)',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <div style={{
        width: '100%', aspectRatio: '4 / 3',
        background: 'var(--geist-bg-2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {url ? (
          <img
            src={url}
            alt={`${PHOTO_STAGE_LABELS[photo.stage]} for asset`}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <ImagePlus size={20} color="var(--geist-fg-4)" />
        )}
      </div>
      <div style={{ padding: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 10, color: 'var(--geist-fg-4)' }}>
          {photo.takenAt ? formatDateTime(photo.takenAt) : ''}
        </span>
        <button
          type="button"
          onClick={() => {
            if (window.confirm('Delete this photo?')) onDelete();
          }}
          style={iconBtn}
          aria-label="Delete photo"
        >
          <Trash2 size={11} />
        </button>
      </div>
    </div>
  );
}

const iconBtn = {
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  color: 'var(--geist-fg-3)',
  padding: 2,
};

/**
 * Gate: an asset cannot be marked CERTIFIED without at least one
 * post-install photo. Returns true if the gate is satisfied.
 */
export function canCertify(asset, photos) {
  if (asset.status !== ASSET_STATUSES.INSTALLED) return false;
  return photos.some((p) => p.assetId === asset.id && p.stage === PHOTO_STAGES.POST_INSTALL);
}
