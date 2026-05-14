import { v4 as uuid } from 'uuid';

/**
 * Layer helpers for the markup engine. A page has an ordered array of layers.
 * Objects reference their parent layer by id.
 */

const DEFAULT_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4',
  '#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e', '#0ea5e9',
];

export function newLayer({ name, color } = {}) {
  return {
    id: uuid(),
    name: name || 'New layer',
    color: color || DEFAULT_COLORS[Math.floor(Math.random() * DEFAULT_COLORS.length)],
    visible: true,
    locked: false,
    opacity: 1,
  };
}

export function addLayer(page, attrs = {}) {
  return {
    ...page,
    layers: [...page.layers, newLayer(attrs)],
  };
}

export function updateLayer(page, layerId, patch) {
  return {
    ...page,
    layers: page.layers.map((l) => (l.id === layerId ? { ...l, ...patch } : l)),
  };
}

export function removeLayer(page, layerId) {
  if (page.layers.length === 1) return page; // never delete the last layer
  const fallback = page.layers.find((l) => l.id !== layerId).id;
  return {
    ...page,
    layers: page.layers.filter((l) => l.id !== layerId),
    objects: page.objects.map((o) => (o.layerId === layerId ? { ...o, layerId: fallback } : o)),
  };
}

export function reorderLayer(page, layerId, direction) {
  const idx = page.layers.findIndex((l) => l.id === layerId);
  if (idx === -1) return page;
  const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
  if (targetIdx < 0 || targetIdx >= page.layers.length) return page;
  const layers = [...page.layers];
  const [moved] = layers.splice(idx, 1);
  layers.splice(targetIdx, 0, moved);
  return { ...page, layers };
}
