import { Layer, Group, Circle, Text as KText, Rect } from 'react-konva';
import { ASSET_TYPES } from '../../utils/constants';

/**
 * Asset pins rendered as a sibling Konva Layer on top of the markup
 * layer. Pins are interactive (click → onSelect) but do not interfere
 * with selection / lasso / transformer on the underlying markup layer
 * because pin clicks set e.cancelBubble = true.
 *
 * Each pin: a coloured marker circle + monospace tag label inside a
 * small rounded rectangle. Colour codes asset type so installers can
 * tell a fire door from a penetration at a glance.
 *
 * Coordinate convention: asset.locationOnPlan stores raster-pixel
 * coordinates at the canvas's native render scale. Pins move with the
 * stage zoom/pan because they live inside the same Konva Stage as the
 * markup objects.
 */
const TYPE_COLOUR = {
  [ASSET_TYPES.PENETRATION]:        '#3b82f6',
  [ASSET_TYPES.FIRE_DOOR]:          '#a855f7',
  [ASSET_TYPES.FIRE_DAMPER]:        '#ec4899',
  [ASSET_TYPES.FIRE_SHUTTER]:       '#f59e0b',
  [ASSET_TYPES.JOINT_SEAL]:         '#10b981',
  [ASSET_TYPES.STRUCTURAL_COATING]: '#6366f1',
  [ASSET_TYPES.SMOKE_SEAL]:         '#64748b',
};

export default function AssetPinLayer({ pins, selectedId, onSelect }) {
  if (!pins || pins.length === 0) return <Layer listening />;

  return (
    <Layer listening>
      {pins.map((p) => {
        const colour = TYPE_COLOUR[p.assetType] || '#0f172a';
        const isSelected = selectedId === p.id;
        const x = p.locationOnPlan?.x;
        const y = p.locationOnPlan?.y;
        if (x == null || y == null) return null;

        return (
          <Group
            key={p.id}
            x={x}
            y={y}
            onMouseDown={(e) => {
              // Stop the Stage handler from running so neither lasso nor
              // pin-add fires when the user clicks an existing pin.
              e.cancelBubble = true;
              onSelect?.(p.id);
            }}
            onTouchStart={(e) => {
              e.cancelBubble = true;
              onSelect?.(p.id);
            }}
            data-asset-id={p.id}
          >
            {isSelected && (
              <Circle radius={14} fill={colour} opacity={0.18} />
            )}
            <Circle
              radius={7}
              fill="#fff"
              stroke={colour}
              strokeWidth={2.5}
            />
            <Circle radius={3} fill={colour} />

            {/* Tag label box, slightly offset so the marker stays free. */}
            <Group x={10} y={-12}>
              <Rect
                x={0}
                y={0}
                width={Math.max(48, (p.tag?.length || 6) * 6 + 6)}
                height={16}
                fill="rgba(255,255,255,0.94)"
                stroke={colour}
                strokeWidth={1}
                cornerRadius={3}
              />
              <KText
                x={3}
                y={3}
                text={p.tag || ''}
                fontSize={10}
                fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
                fill="#0f172a"
              />
            </Group>
          </Group>
        );
      })}
    </Layer>
  );
}

export { TYPE_COLOUR as ASSET_PIN_TYPE_COLOUR };
