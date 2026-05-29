import { useMemo, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import FormField from '../common/FormField';
import useSystemLibraryStore from '../../stores/useSystemLibraryStore';
import usePhotoStore from '../../stores/usePhotoStore';
import {
  ASSET_TYPES, ASSET_TYPE_LABELS,
  ASSET_STATUSES, ASSET_STATUS_LABELS,
  SUBSTRATES, SUBSTRATE_LABELS,
  SERVICE_TYPES, SERVICE_TYPE_LABELS,
} from '../../utils/constants';
import { searchSystems, assetTypeAllowedOn, frlMeets, canCertify } from '../../domain/passiveFire';
import { validFrl } from '../../utils/validators';

/**
 * Type-aware asset editor. Common fields up top, then a specialisation block
 * that swaps in/out based on assetType (penetration, fire door, fire damper).
 * Other types (joint seal, smoke seal, coating, shutter) use only the common fields.
 */
export default function AssetEditor({
  initial,
  defaultProjectId,
  defaultDrawingId,
  defaultLocation,
  initialSpecialisation,
  onClose,
  onSave,
}) {
  const systems = useSystemLibraryStore((s) => s.systems);
  const photos = usePhotoStore((s) => s.photos);

  const [common, setCommon] = useState(() => initial ? {
    assetType: initial.assetType,
    tag: initial.tag,
    substrate: initial.substrate || '',
    requiredFrl: initial.requiredFrl || '',
    achievedFrl: initial.achievedFrl || '',
    testedSystemId: initial.testedSystemId || '',
    status: initial.status || ASSET_STATUSES.PLANNED,
    notes: initial.notes || '',
    installDate: initial.installDate || '',
  } : {
    assetType: ASSET_TYPES.PENETRATION,
    tag: '',
    substrate: '',
    requiredFrl: localStorage.getItem('xact-default-frl') || '-/120/120',
    achievedFrl: '',
    testedSystemId: '',
    status: ASSET_STATUSES.PLANNED,
    notes: '',
    installDate: '',
  });

  const [pen, setPen] = useState(() => initialSpecialisation?.penetration || {
    servicesPassing: [],
    openingSize: '',
    sealantDepth: '',
    backingMaterial: '',
  });

  const [door, setDoor] = useState(() => initialSpecialisation?.fireDoor || {
    doorSetId: '',
    leafCount: 1,
    gapTopMm: '',
    gapSidesMm: '',
    gapBottomMm: '',
    intumescentSealsOk: false,
    smokeSealsOk: false,
    selfCloserOk: false,
    hingeCount: 3,
    hingeIntumescentOk: false,
    ironmongerySet: '',
  });

  const [damper, setDamper] = useState(() => initialSpecialisation?.fireDamper || {
    makeModel: '',
    driveType: 'fusible_link',
    fusibleLinkRatingC: 72,
    ductDimensions: '',
    lastDropTestDate: '',
  });

  const [error, setError] = useState(null);

  const setC = (patch) => setCommon((s) => ({ ...s, ...patch }));

  // Auto-promote achieved FRL when a tested system is chosen.
  const handleSystemChange = (systemId) => {
    const sys = systems.find((s) => s.id === systemId);
    setC({
      testedSystemId: systemId,
      achievedFrl: sys?.testedFrl || common.achievedFrl,
    });
  };

  const matrixHits = useMemo(() => {
    if (!common.substrate || !common.requiredFrl) return null;
    return searchSystems(systems, {
      requiredFrl: common.requiredFrl,
      substrate: common.substrate,
      serviceTypes: common.assetType === ASSET_TYPES.PENETRATION
        ? pen.servicesPassing.map((s) => s.type).filter(Boolean)
        : [],
    });
  }, [systems, common.substrate, common.requiredFrl, common.assetType, pen.servicesPassing]);

  const submit = (e) => {
    e.preventDefault();
    setError(null);

    if (common.substrate && !assetTypeAllowedOn(common.assetType, common.substrate)) {
      return setError(`${ASSET_TYPE_LABELS[common.assetType]} not allowed on ${SUBSTRATE_LABELS[common.substrate]}`);
    }
    if (common.requiredFrl) {
      const e1 = validFrl(common.requiredFrl);
      if (e1) return setError(`Required FRL: ${e1}`);
    }
    if (common.achievedFrl) {
      const e2 = validFrl(common.achievedFrl);
      if (e2) return setError(`Achieved FRL: ${e2}`);
    }
    if (common.requiredFrl && common.achievedFrl && !frlMeets(common.requiredFrl, common.achievedFrl)) {
      return setError(`Achieved FRL ${common.achievedFrl} does not meet required ${common.requiredFrl}`);
    }
    // Evidence gate: an asset can only be moved to Certified once it is
    // Installed and has at least one post-install photo on file.
    const certifying = common.status === ASSET_STATUSES.CERTIFIED
      && initial?.status !== ASSET_STATUSES.CERTIFIED;
    if (certifying && !canCertify(initial, photos)) {
      return setError('Cannot certify: the asset must be Installed and have at least one post-install photo as evidence before it can be marked Certified.');
    }

    const assetPatch = {
      assetType: common.assetType,
      tag: common.tag || undefined,
      substrate: common.substrate || null,
      requiredFrl: common.requiredFrl,
      achievedFrl: common.achievedFrl,
      testedSystemId: common.testedSystemId || null,
      status: common.status,
      notes: common.notes,
      installDate: common.installDate || null,
    };

    let specialisation = null;
    switch (common.assetType) {
      case ASSET_TYPES.PENETRATION:
        specialisation = {
          servicesPassing: pen.servicesPassing.filter((s) => s.type),
          openingSize: numOrNull(pen.openingSize),
          sealantDepth: numOrNull(pen.sealantDepth),
          backingMaterial: pen.backingMaterial,
        };
        break;
      case ASSET_TYPES.FIRE_DOOR:
        specialisation = {
          ...door,
          leafCount: Number(door.leafCount) || 1,
          gapTopMm: numOrNull(door.gapTopMm),
          gapSidesMm: numOrNull(door.gapSidesMm),
          gapBottomMm: numOrNull(door.gapBottomMm),
          hingeCount: Number(door.hingeCount) || 3,
        };
        break;
      case ASSET_TYPES.FIRE_DAMPER:
        specialisation = {
          ...damper,
          fusibleLinkRatingC: numOrNull(damper.fusibleLinkRatingC),
          lastDropTestDate: damper.lastDropTestDate || null,
        };
        break;
      default:
        specialisation = null;
    }

    onSave({
      assetPatch: { ...assetPatch, projectId: defaultProjectId, drawingId: defaultDrawingId || null, locationOnPlan: defaultLocation || null },
      specialisation,
    });
  };

  return (
    <Modal isOpen onClose={onClose} title={initial ? `Edit ${initial.tag}` : 'New asset'} size="lg">
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <FormField label="Asset type" required>
            <select style={inputStyle} value={common.assetType} onChange={(e) => setC({ assetType: e.target.value })} disabled={!!initial}>
              {Object.values(ASSET_TYPES).map((t) => (
                <option key={t} value={t}>{ASSET_TYPE_LABELS[t]}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Tag" help={initial ? null : 'Leave blank to auto-generate'}>
            <input style={inputStyle} value={common.tag} onChange={(e) => setC({ tag: e.target.value })} placeholder="auto" />
          </FormField>
          <FormField label="Substrate">
            <select style={inputStyle} value={common.substrate} onChange={(e) => setC({ substrate: e.target.value })}>
              <option value="">—</option>
              {Object.values(SUBSTRATES).map((s) => (
                <option key={s} value={s} disabled={!assetTypeAllowedOn(common.assetType, s)}>
                  {SUBSTRATE_LABELS[s]}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Status">
            <select style={inputStyle} value={common.status} onChange={(e) => setC({ status: e.target.value })}>
              {Object.values(ASSET_STATUSES).map((s) => (
                <option key={s} value={s}>{ASSET_STATUS_LABELS[s]}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Required FRL" help="e.g. -/120/120">
            <input style={inputStyle} value={common.requiredFrl} onChange={(e) => setC({ requiredFrl: e.target.value })} />
          </FormField>
          <FormField label="Achieved FRL">
            <input style={inputStyle} value={common.achievedFrl} onChange={(e) => setC({ achievedFrl: e.target.value })} />
          </FormField>
          <FormField label="Install date">
            <input style={inputStyle} type="date" value={common.installDate} onChange={(e) => setC({ installDate: e.target.value })} />
          </FormField>
          <FormField label="Tested system">
            <select style={inputStyle} value={common.testedSystemId} onChange={(e) => handleSystemChange(e.target.value)}>
              <option value="">— pick from library —</option>
              {systems.map((sys) => (
                <option key={sys.id} value={sys.id}>
                  {sys.manufacturer} {sys.systemName} ({sys.testedFrl})
                </option>
              ))}
            </select>
          </FormField>
        </div>

        {matrixHits && matrixHits.length > 0 && (
          <div style={{ background: 'var(--geist-bg-2)', padding: 10, borderRadius: 6, fontSize: 12 }}>
            <strong>Compliant tested systems for this substrate + FRL:</strong>{' '}
            {matrixHits.slice(0, 4).map((s) => `${s.manufacturer} ${s.systemName}`).join(', ')}
            {matrixHits.length > 4 ? `, +${matrixHits.length - 4} more` : ''}
          </div>
        )}
        {matrixHits && matrixHits.length === 0 && (
          <div style={{ background: 'var(--geist-error-soft, #fef2f2)', color: 'var(--geist-error, #b91c1c)', padding: 10, borderRadius: 6, fontSize: 12 }}>
            No SystemLibrary entries satisfy this substrate + FRL combination. Either lower the requirement, change the substrate, or add a tested system.
          </div>
        )}

        {common.assetType === ASSET_TYPES.PENETRATION && (
          <PenetrationFields pen={pen} setPen={setPen} />
        )}
        {common.assetType === ASSET_TYPES.FIRE_DOOR && (
          <FireDoorFields door={door} setDoor={setDoor} />
        )}
        {common.assetType === ASSET_TYPES.FIRE_DAMPER && (
          <FireDamperFields damper={damper} setDamper={setDamper} />
        )}

        <FormField label="Notes">
          <textarea
            style={{ ...inputStyle, minHeight: 50, resize: 'vertical' }}
            value={common.notes}
            onChange={(e) => setC({ notes: e.target.value })}
          />
        </FormField>

        {error && <div style={{ color: 'var(--color-danger-500, #dc2626)', fontSize: 12 }}>{error}</div>}

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <Button variant="ghost" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit">{initial ? 'Save changes' : 'Create asset'}</Button>
        </div>
      </form>
    </Modal>
  );
}

function PenetrationFields({ pen, setPen }) {
  const update = (patch) => setPen((p) => ({ ...p, ...patch }));
  const addService = () => update({ servicesPassing: [...pen.servicesPassing, { type: '', size: '', qty: 1 }] });
  const updateService = (idx, patch) => update({
    servicesPassing: pen.servicesPassing.map((s, i) => (i === idx ? { ...s, ...patch } : s)),
  });
  const removeService = (idx) => update({ servicesPassing: pen.servicesPassing.filter((_, i) => i !== idx) });

  return (
    <div style={fieldset}>
      <legend style={fieldsetLegend}>Penetration details</legend>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
        <FormField label="Opening size (mm)">
          <input style={inputStyle} value={pen.openingSize} onChange={(e) => update({ openingSize: e.target.value })} inputMode="numeric" />
        </FormField>
        <FormField label="Sealant depth (mm)">
          <input style={inputStyle} value={pen.sealantDepth} onChange={(e) => update({ sealantDepth: e.target.value })} inputMode="numeric" />
        </FormField>
        <FormField label="Backing material">
          <input style={inputStyle} value={pen.backingMaterial} onChange={(e) => update({ backingMaterial: e.target.value })} placeholder="e.g. mineral wool 50 mm" />
        </FormField>
      </div>

      <div style={{ marginTop: 4 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <span style={{ fontSize: 12, fontWeight: 600 }}>Services passing through</span>
          <Button type="button" size="sm" variant="ghost" onClick={addService}>
            <Plus size={12} /> Add service
          </Button>
        </div>
        {pen.servicesPassing.length === 0 ? (
          <div style={{ fontSize: 12, color: 'var(--geist-fg-4)' }}>No services added (use Empty opening for a blank penetration).</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {pen.servicesPassing.map((s, idx) => (
              <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 70px auto', gap: 6, alignItems: 'center' }}>
                <select style={inputStyle} value={s.type} onChange={(e) => updateService(idx, { type: e.target.value })}>
                  <option value="">— service type —</option>
                  {Object.values(SERVICE_TYPES).map((v) => (
                    <option key={v} value={v}>{SERVICE_TYPE_LABELS[v]}</option>
                  ))}
                </select>
                <input style={inputStyle} value={s.size} onChange={(e) => updateService(idx, { size: e.target.value })} placeholder="size (mm)" />
                <input style={inputStyle} value={s.qty} onChange={(e) => updateService(idx, { qty: Number(e.target.value) || 1 })} inputMode="numeric" />
                <button type="button" onClick={() => removeService(idx)} style={iconBtn} aria-label="Remove service">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function FireDoorFields({ door, setDoor }) {
  const update = (patch) => setDoor((d) => ({ ...d, ...patch }));
  return (
    <div style={fieldset}>
      <legend style={fieldsetLegend}>Fire door details</legend>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
        <FormField label="Door set ID">
          <input style={inputStyle} value={door.doorSetId} onChange={(e) => update({ doorSetId: e.target.value })} />
        </FormField>
        <FormField label="Leaf count">
          <input style={inputStyle} type="number" min="1" max="2" value={door.leafCount} onChange={(e) => update({ leafCount: e.target.value })} />
        </FormField>
        <FormField label="Hinge count">
          <input style={inputStyle} type="number" min="2" max="6" value={door.hingeCount} onChange={(e) => update({ hingeCount: e.target.value })} />
        </FormField>
        <FormField label="Gap top (mm)">
          <input style={inputStyle} value={door.gapTopMm} onChange={(e) => update({ gapTopMm: e.target.value })} inputMode="numeric" />
        </FormField>
        <FormField label="Gap sides (mm)">
          <input style={inputStyle} value={door.gapSidesMm} onChange={(e) => update({ gapSidesMm: e.target.value })} inputMode="numeric" />
        </FormField>
        <FormField label="Gap bottom (mm)">
          <input style={inputStyle} value={door.gapBottomMm} onChange={(e) => update({ gapBottomMm: e.target.value })} inputMode="numeric" />
        </FormField>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 4 }}>
        <Toggle label="Intumescent seals OK" checked={door.intumescentSealsOk} onChange={(v) => update({ intumescentSealsOk: v })} />
        <Toggle label="Smoke seals OK"       checked={door.smokeSealsOk}       onChange={(v) => update({ smokeSealsOk: v })} />
        <Toggle label="Self-closer OK"       checked={door.selfCloserOk}       onChange={(v) => update({ selfCloserOk: v })} />
        <Toggle label="Hinge intumescent OK" checked={door.hingeIntumescentOk} onChange={(v) => update({ hingeIntumescentOk: v })} />
      </div>
      <FormField label="Ironmongery set">
        <input style={inputStyle} value={door.ironmongerySet} onChange={(e) => update({ ironmongerySet: e.target.value })} placeholder="e.g. ASSA-ABLOY DC500" />
      </FormField>
    </div>
  );
}

function FireDamperFields({ damper, setDamper }) {
  const update = (patch) => setDamper((d) => ({ ...d, ...patch }));
  return (
    <div style={fieldset}>
      <legend style={fieldsetLegend}>Fire damper details</legend>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <FormField label="Make / model">
          <input style={inputStyle} value={damper.makeModel} onChange={(e) => update({ makeModel: e.target.value })} />
        </FormField>
        <FormField label="Duct dimensions">
          <input style={inputStyle} value={damper.ductDimensions} onChange={(e) => update({ ductDimensions: e.target.value })} placeholder="e.g. 400 x 300 mm" />
        </FormField>
        <FormField label="Drive type">
          <select style={inputStyle} value={damper.driveType} onChange={(e) => update({ driveType: e.target.value })}>
            <option value="fusible_link">Fusible link</option>
            <option value="motorised">Motorised actuator</option>
            <option value="spring_return">Spring-return actuator</option>
          </select>
        </FormField>
        <FormField label="Fusible link rating (°C)">
          <input style={inputStyle} value={damper.fusibleLinkRatingC} onChange={(e) => update({ fusibleLinkRatingC: e.target.value })} inputMode="numeric" />
        </FormField>
        <FormField label="Last drop-test date">
          <input style={inputStyle} type="date" value={damper.lastDropTestDate} onChange={(e) => update({ lastDropTestDate: e.target.value })} />
        </FormField>
      </div>
    </div>
  );
}

function Toggle({ label, checked, onChange }) {
  return (
    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, cursor: 'pointer' }}>
      <input type="checkbox" checked={!!checked} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  );
}

function numOrNull(v) {
  if (v === '' || v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
}

const inputStyle = {
  padding: '8px 10px',
  border: '1px solid var(--geist-border-strong)',
  borderRadius: 4,
  background: 'var(--geist-bg)',
  color: 'var(--geist-fg)',
  fontSize: 13,
  width: '100%',
  boxSizing: 'border-box',
};
const fieldset = {
  border: '1px solid var(--geist-border)',
  borderRadius: 6,
  padding: 10,
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
};
const fieldsetLegend = { padding: '0 6px', fontSize: 12, color: 'var(--geist-fg-3)' };
const iconBtn = {
  background: 'transparent',
  border: '1px solid var(--geist-border)',
  borderRadius: 4,
  padding: 6,
  cursor: 'pointer',
  color: 'var(--geist-fg-3)',
};
