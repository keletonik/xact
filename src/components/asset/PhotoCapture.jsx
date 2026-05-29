import { useEffect, useMemo, useRef, useState } from 'react';
import { Camera, Trash2, Upload, ImagePlus } from 'lucide-react';
import PaperCard from '../draft/PaperCard';
import CalloutBalloon from '../draft/CalloutBalloon';
import InkStamp from '../draft/InkStamp';
import usePhotoStore, { resolveObjectURL } from '../../stores/usePhotoStore';
import {
  PHOTO_STAGES, PHOTO_STAGE_LABELS,
} from '../../utils/constants';
import { formatDateTime } from '../../utils/formatters';

const STAGE_ORDER = [
  PHOTO_STAGES.PRE_INSTALL,
  PHOTO_STAGES.DURING,
  PHOTO_STAGES.POST_INSTALL,
  PHOTO_STAGES.ANNUAL_INSPECTION,
];

const STAGE_CODE = {
  [PHOTO_STAGES.PRE_INSTALL]:      '01',
  [PHOTO_STAGES.DURING]:           '02',
  [PHOTO_STAGES.POST_INSTALL]:     '03',
  [PHOTO_STAGES.ANNUAL_INSPECTION]:'AN',
};

/**
 * Per-asset photo schedule, rendered as a sheet of contact prints.
 * Each stage occupies its own row with a thumbnail strip; the entire
 * panel reads like a project photo register, not a media gallery.
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

  const postOk = grouped[PHOTO_STAGES.POST_INSTALL]?.length > 0;

  return (
    <PaperCard
      title="photo register"
      meta={
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <CalloutBalloon size="sm">{asset.tag}</CalloutBalloon>
          <span>{totalCount} captured</span>
          {postOk && <InkStamp tone="certified" size="sm" rotate={-3}>post ok</InkStamp>}
        </span>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {allowedStages.map((stage, i) => (
          <StageRow
            key={stage}
            stage={stage}
            photos={grouped[stage]}
            isFirst={i === 0}
            onAdd={(file) => addPhoto({ assetId: asset.id, stage, file })}
            onDelete={deletePhoto}
          />
        ))}
      </div>
      {totalCount === 0 && (
        <p style={{
          marginTop: 12,
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          letterSpacing: '0.04em',
          color: 'var(--ink-3)',
        }}>
          pre / during / post-install evidence is mandatory before this asset can be certified. annual-inspection photos feed AS 1851 reports.
        </p>
      )}
    </PaperCard>
  );
}

function StageRow({ stage, photos, isFirst, onAdd, onDelete }) {
  return (
    <div style={{
      padding: '14px 0',
      borderTop: isFirst ? 'none' : '1px solid var(--rule)',
      display: 'grid',
      gridTemplateColumns: '120px 1fr auto',
      gap: 14,
      alignItems: 'flex-start',
    }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: 'var(--ink-4)',
            letterSpacing: '0.06em',
          }}>
            {STAGE_CODE[stage]}
          </span>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            letterSpacing: 'var(--tracking-label)',
            textTransform: 'uppercase',
            color: 'var(--ink)',
            fontWeight: 600,
          }}>
            {PHOTO_STAGE_LABELS[stage]}
          </span>
        </div>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          color: 'var(--ink-3)',
          marginTop: 4,
        }}>
          {photos.length} photo{photos.length === 1 ? '' : 's'}
        </div>
      </div>

      {photos.length === 0 ? (
        <div style={dropzone}>
          <ImagePlus size={16} color="var(--ink-4)" />
          <span style={{ marginLeft: 8 }}>no exposures on file</span>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
          gap: 8,
        }}>
          {photos.map((p) => (
            <PhotoTile key={p.id} photo={p} onDelete={() => onDelete(p.id)} />
          ))}
        </div>
      )}

      <StagePickButtons stage={stage} onPick={onAdd} />
    </div>
  );
}

function StagePickButtons({ stage, onPick }) {
  const fileRef = useRef(null);
  const cameraRef = useRef(null);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: 'none' }}
        onChange={(e) => { for (const f of e.target.files || []) onPick(f); e.target.value = ''; }}
      />
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: 'none' }}
        onChange={(e) => { for (const f of e.target.files || []) onPick(f); e.target.value = ''; }}
      />
      <button
        type="button"
        onClick={() => cameraRef.current?.click()}
        aria-label={`Take ${PHOTO_STAGE_LABELS[stage]} photo`}
        style={inkBtn}
      >
        <Camera size={11} /> capture
      </button>
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        aria-label={`Upload ${PHOTO_STAGE_LABELS[stage]} files`}
        style={ghostBtn}
      >
        <Upload size={11} /> upload
      </button>
    </div>
  );
}

function PhotoTile({ photo, onDelete }) {
  const [url, setUrl] = useState(null);
  const [hover, setHover] = useState(false);
  useEffect(() => {
    let alive = true;
    resolveObjectURL(photo.blobHash).then((u) => { if (alive) setUrl(u); });
    return () => { alive = false; };
  }, [photo.blobHash]);

  return (
    <figure
      style={{
        margin: 0,
        border: '1px solid var(--rule-strong)',
        background: 'var(--paper-2)',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div style={{
        width: '100%', aspectRatio: '4 / 3',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {url ? (
          <img
            src={url}
            alt={`${PHOTO_STAGE_LABELS[photo.stage]} for asset`}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <ImagePlus size={20} color="var(--ink-4)" />
        )}
      </div>
      <figcaption style={{
        padding: '4px 6px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        borderTop: '1px solid var(--rule)',
        background: 'var(--paper-1)',
        fontFamily: 'var(--font-mono)',
        fontSize: 9,
        letterSpacing: '0.06em',
        color: 'var(--ink-3)',
      }}>
        <span>{photo.takenAt ? formatDateTime(photo.takenAt) : '—'}</span>
        <span style={{ color: 'var(--ink-4)' }}>{(photo.sizeBytes / 1024).toFixed(0)} kb</span>
      </figcaption>
      {hover && (
        <button
          type="button"
          onClick={() => { if (window.confirm('Delete this photo?')) onDelete(); }}
          style={tileDelete}
          aria-label="Delete photo"
        >
          <Trash2 size={11} />
        </button>
      )}
    </figure>
  );
}

const inkBtn = {
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
  whiteSpace: 'nowrap',
};
const ghostBtn = {
  background: 'transparent',
  color: 'var(--ink-2)',
  border: '1px solid var(--rule-strong)',
  padding: '6px 10px',
  fontFamily: 'var(--font-mono)',
  fontSize: 10,
  letterSpacing: 'var(--tracking-label)',
  textTransform: 'uppercase',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 5,
  whiteSpace: 'nowrap',
};
const dropzone = {
  display: 'flex',
  alignItems: 'center',
  padding: '12px 14px',
  border: '1px dashed var(--rule-strong)',
  background: 'rgba(14, 14, 15, 0.015)',
  fontFamily: 'var(--font-mono)',
  fontSize: 11,
  letterSpacing: 'var(--tracking-label)',
  textTransform: 'uppercase',
  color: 'var(--ink-4)',
};
const tileDelete = {
  position: 'absolute',
  top: 4, right: 4,
  background: 'var(--paper-1)',
  border: '1px solid var(--accent)',
  color: 'var(--accent)',
  padding: 3,
  cursor: 'pointer',
};
