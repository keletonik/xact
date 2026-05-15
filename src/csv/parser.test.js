import { describe, expect, it } from 'vitest';
import { _sanitiseRow, normaliseHeader } from './parser';

describe('parser sanitiseRow', () => {
  it('strips __proto__ key and does not pollute Object.prototype', () => {
    const out = _sanitiseRow({ __proto__: { polluted: true }, name: 'ok' });
    expect(out.name).toBe('ok');
    // The crucial assertion: nothing else has acquired the .polluted property.
    expect(Object.prototype.polluted).toBeUndefined();
    expect({}.polluted).toBeUndefined();
    // The returned object is null-prototype (Object.create(null)), so its
    // own __proto__ access yields undefined — that's the right defence.
    expect(out.__proto__).toBeUndefined();
  });
  it('strips constructor key', () => {
    const out = _sanitiseRow({ constructor: 'bad', name: 'ok' });
    expect(out.constructor).not.toBe('bad');
    expect(out.name).toBe('ok');
  });
  it('preserves all other keys verbatim', () => {
    const out = _sanitiseRow({ sku: 'A', name: 'B', 'Default Price': '10' });
    expect(out.sku).toBe('A');
    expect(out['Default Price']).toBe('10');
  });
});

describe('normaliseHeader', () => {
  it('lowercases and snake-cases', () => {
    expect(normaliseHeader('Default Price')).toBe('default_price');
    expect(normaliseHeader('Unit Description')).toBe('unit_description');
    expect(normaliseHeader('SKU')).toBe('sku');
    expect(normaliseHeader('  Part No.  ')).toBe('part_no');
  });
  it('strips leading/trailing separators', () => {
    expect(normaliseHeader('-foo-')).toBe('foo');
  });
});
