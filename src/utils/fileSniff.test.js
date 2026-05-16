import { describe, expect, it } from 'vitest';
import { sniffFileKind, assertFileKind } from './fileSniff';

function makeFile(bytes, name = 'x') {
  return new File([new Uint8Array(bytes)], name);
}

describe('sniffFileKind', () => {
  it('detects PDF magic bytes', async () => {
    const f = makeFile([0x25, 0x50, 0x44, 0x46, 0x2D, 0x31, 0x2E, 0x37]);
    expect(await sniffFileKind(f)).toBe('pdf');
  });
  it('detects PNG', async () => {
    const f = makeFile([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
    expect(await sniffFileKind(f)).toBe('png');
  });
  it('detects JPEG', async () => {
    const f = makeFile([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10]);
    expect(await sniffFileKind(f)).toBe('jpeg');
  });
  it('detects WEBP (RIFF...WEBP)', async () => {
    const f = makeFile([0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50, 0, 0, 0, 0]);
    expect(await sniffFileKind(f)).toBe('webp');
  });
  it('detects ZIP-based formats (xlsx/ods)', async () => {
    const f = makeFile([0x50, 0x4B, 0x03, 0x04, 0x14, 0]);
    expect(await sniffFileKind(f)).toBe('zip');
  });
  it('rejects unknown bytes', async () => {
    const f = makeFile([0x00, 0x01, 0x02, 0x03, 0x04, 0x05]);
    expect(await sniffFileKind(f)).toBeNull();
  });
  it('rejects a renamed EXE pretending to be PDF', async () => {
    // MZ Windows-PE header
    const f = makeFile([0x4D, 0x5A, 0x90, 0x00], 'innocent.pdf');
    expect(await sniffFileKind(f)).toBeNull();
  });
});

describe('assertFileKind', () => {
  it('returns the kind on match', async () => {
    const f = makeFile([0x25, 0x50, 0x44, 0x46]);
    await expect(assertFileKind(f, ['pdf'])).resolves.toBe('pdf');
  });
  it('throws when the kind is not in the allow-list', async () => {
    const f = makeFile([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
    await expect(assertFileKind(f, ['pdf'])).rejects.toThrow(/png/);
  });
  it('throws when the format is unrecognised', async () => {
    const f = makeFile([0, 0, 0, 0]);
    await expect(assertFileKind(f, ['pdf'])).rejects.toThrow(/Unrecognised/);
  });
});
