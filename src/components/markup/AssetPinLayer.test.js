import { describe, it, expect } from 'vitest';
import { ASSET_PIN_TYPE_COLOUR } from './AssetPinLayer';
import { ASSET_TYPES } from '../../utils/constants';

describe('AssetPinLayer pin colour palette', () => {
  it('covers every asset type', () => {
    for (const type of Object.values(ASSET_TYPES)) {
      expect(ASSET_PIN_TYPE_COLOUR[type]).toBeTruthy();
    }
  });

  it('uses distinct colours per type', () => {
    const values = Object.values(ASSET_PIN_TYPE_COLOUR);
    expect(new Set(values).size).toBe(values.length);
  });

  it('colours look like hex strings', () => {
    for (const c of Object.values(ASSET_PIN_TYPE_COLOUR)) {
      expect(c).toMatch(/^#[0-9a-fA-F]{6}$/);
    }
  });
});
