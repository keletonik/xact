import { distancePx } from './geometry';

/**
 * Page-scale model. A page's scale is `mmPerPixel` — multiply any pixel
 * measurement by this number to get millimetres.
 *
 * Calibration is the only way to set a true scale. Without it, a "nominal"
 * scale is used (1 px = 1 mm) and the UI must warn the user.
 */
export const DEFAULT_NOMINAL_MM_PER_PX = 1;

export function makePage(pageNumber, options = {}) {
  return {
    pageNumber,
    scale: {
      mmPerPx: options.mmPerPx ?? DEFAULT_NOMINAL_MM_PER_PX,
      isCalibrated: Boolean(options.mmPerPx),
      calibrationPoints: null,
      calibrationKnownMm: null,
    },
    displayUnit: options.displayUnit ?? 'm',
    rotation: 0,
    layers: [{ id: 'default', name: 'Default', color: '#ef4444', visible: true, locked: false, opacity: 1 }],
    objects: [],
  };
}

/**
 * Two-point calibration. The user clicks two endpoints of a known dimension
 * and enters the real-world length in millimetres.
 */
export function calibratePage(page, pointA, pointB, knownMm) {
  if (!knownMm || knownMm <= 0) {
    throw new Error('Calibration length must be positive');
  }
  const pixelDistance = distancePx(pointA, pointB);
  if (pixelDistance <= 0) {
    throw new Error('Calibration points cannot be coincident');
  }
  return {
    ...page,
    scale: {
      mmPerPx: knownMm / pixelDistance,
      isCalibrated: true,
      calibrationPoints: [pointA, pointB],
      calibrationKnownMm: knownMm,
    },
  };
}

/**
 * Apply a "drawing scale" preset (e.g. 1:100 means 1 mm on paper = 100 mm in
 * reality). DPI is required: PDF renders default to 96 DPI. For other DPIs the
 * caller must pass the value.
 */
export function applyDrawingScale(page, ratio, dpi = 96) {
  if (!ratio || ratio <= 0) throw new Error('Drawing-scale ratio must be positive');
  const mmPerPx = (25.4 / dpi) * ratio;
  return {
    ...page,
    scale: {
      mmPerPx,
      isCalibrated: true,
      calibrationPoints: null,
      calibrationKnownMm: null,
    },
  };
}
