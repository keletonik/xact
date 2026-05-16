import { describe, expect, it } from 'vitest';
import { SYMBOLS, getSymbol, getSymbolsByCategory, renderSymbolToSVG, SYMBOL_CATEGORIES } from './symbolLibrary';

describe('symbolLibrary', () => {
  it('every symbol has id, name, category, svg', () => {
    for (const sym of SYMBOLS) {
      expect(sym.id).toBeTruthy();
      expect(sym.name).toBeTruthy();
      expect(sym.category).toBeTruthy();
      expect(sym.svg).toBeTruthy();
    }
  });

  it('symbol ids are unique', () => {
    const ids = SYMBOLS.map((s) => s.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it('getSymbol returns by id', () => {
    const sym = SYMBOLS[0];
    expect(getSymbol(sym.id)).toBe(sym);
    expect(getSymbol('nonsense_id_does_not_exist')).toBeNull();
  });

  it('getSymbolsByCategory filters correctly', () => {
    const passive = getSymbolsByCategory(SYMBOL_CATEGORIES.PASSIVE);
    for (const sym of passive) {
      expect(sym.category).toBe(SYMBOL_CATEGORIES.PASSIVE);
    }
  });
});

describe('symbolLibrary, SVG well-formedness', () => {
  // Regression: three entries previously contained `${SW}"` with a stray
  // double-quote, producing invalid `stroke-width="2.5""` markup. Parsing
  // every SVG via DOMParser catches this and any similar template-literal
  // mistakes on future edits.

  it('every symbol parses as well-formed XML', () => {
    const parser = new DOMParser();
    for (const sym of SYMBOLS) {
      const xml = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">${sym.svg}</svg>`;
      const doc = parser.parseFromString(xml, 'image/svg+xml');
      const errorNode = doc.querySelector('parsererror');
      if (errorNode) {
        throw new Error(`Symbol '${sym.id}' produced parser error: ${errorNode.textContent}`);
      }
    }
  });

  it('no symbol contains a stray double-quote pattern after stroke-width', () => {
    // Direct string check as a belt-and-braces guard. The pattern that
    // caused the original bug.
    for (const sym of SYMBOLS) {
      expect(sym.svg).not.toMatch(/stroke-width="[\d.]+""/);
    }
  });
});

describe('renderSymbolToSVG, colour validation', () => {
  it('accepts 3, 4, 6, and 8-digit hex', () => {
    expect(renderSymbolToSVG(SYMBOLS[0].id, '#f00')).toContain('color:#f00');
    expect(renderSymbolToSVG(SYMBOLS[0].id, '#f00f')).toContain('color:#f00f');
    expect(renderSymbolToSVG(SYMBOLS[0].id, '#ff0000')).toContain('color:#ff0000');
    expect(renderSymbolToSVG(SYMBOLS[0].id, '#ff0000ff')).toContain('color:#ff0000ff');
  });

  it('rejects invalid hex shorthand (#1234, #12345) and falls back to default', () => {
    // Regression: previous regex `^#[0-9a-fA-F]{3,8}$` accepted lengths
    // 3 through 8, including the invalid 4-digit-with-prefix `#1234`
    // (technically 4-digit hex is RGBA so that one's valid, but #12345
    // is not). The new regex enforces exact 3/4/6/8 alternatives.
    expect(renderSymbolToSVG(SYMBOLS[0].id, '#12345')).toContain('color:#0f172a');
    expect(renderSymbolToSVG(SYMBOLS[0].id, '#1234567')).toContain('color:#0f172a');
  });

  it('rejects non-string colour and falls back', () => {
    expect(renderSymbolToSVG(SYMBOLS[0].id, 'javascript:alert(1)')).toContain('color:#0f172a');
    expect(renderSymbolToSVG(SYMBOLS[0].id, 'red')).toContain('color:#0f172a');
  });

  it('clamps size to 8..256 range', () => {
    expect(renderSymbolToSVG(SYMBOLS[0].id, '#000', 1)).toContain('width="8"');
    expect(renderSymbolToSVG(SYMBOLS[0].id, '#000', 999)).toContain('width="256"');
  });

  it('returns empty string for an unknown symbol', () => {
    expect(renderSymbolToSVG('nonsense_id_does_not_exist')).toBe('');
  });
});
