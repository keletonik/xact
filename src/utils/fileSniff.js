/**
 * Magic-byte file-type sniffing. The browser's `<input accept="...">` and
 * `File.type` are advisory only — a user can drop `evil.exe` renamed to
 * `evil.pdf` and it'll arrive with whatever MIME type the OS guessed.
 *
 * For Evalax's narrow needs we check the first 12 bytes against a small set
 * of known signatures. This is not bullet-proof anti-malware — it's the
 * minimum sanity check to reject obviously-wrong inputs at the door.
 */

const SIGS = [
  { kind: 'pdf',   bytes: [0x25, 0x50, 0x44, 0x46] },                                       // %PDF
  { kind: 'png',   bytes: [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A] },               // PNG
  { kind: 'jpeg',  bytes: [0xFF, 0xD8, 0xFF] },                                              // JPEG
  { kind: 'webp',  bytes: [0x52, 0x49, 0x46, 0x46], offset: 0,
                   tail:  { bytes: [0x57, 0x45, 0x42, 0x50], offset: 8 } },                 // RIFF…WEBP
  { kind: 'zip',   bytes: [0x50, 0x4B, 0x03, 0x04] },                                        // .xlsx / .ods / .zip
  { kind: 'zip',   bytes: [0x50, 0x4B, 0x05, 0x06] },                                        // empty .zip
  { kind: 'csv-utf8-bom', bytes: [0xEF, 0xBB, 0xBF] },                                       // UTF-8 BOM
];

function matches(view, sig) {
  const off = sig.offset ?? 0;
  for (let i = 0; i < sig.bytes.length; i++) {
    if (view[off + i] !== sig.bytes[i]) return false;
  }
  if (sig.tail) {
    for (let i = 0; i < sig.tail.bytes.length; i++) {
      if (view[sig.tail.offset + i] !== sig.tail.bytes[i]) return false;
    }
  }
  return true;
}

/**
 * Returns the detected kind ('pdf' | 'png' | 'jpeg' | 'webp' | 'zip' | null).
 * 'zip' covers xlsx, xlsm, ods (all OOXML/ODF containers).
 */
export async function sniffFileKind(file) {
  if (!file || typeof file.slice !== 'function') return null;
  const head = await file.slice(0, 16).arrayBuffer();
  const view = new Uint8Array(head);
  for (const sig of SIGS) {
    if (matches(view, sig)) return sig.kind;
  }
  return null;
}

/**
 * Validate `file` against the allowed `kinds` list. Returns the detected
 * kind on match; otherwise throws.
 */
export async function assertFileKind(file, kinds) {
  const kind = await sniffFileKind(file);
  if (kind === null) {
    throw new Error(`Unrecognised file format (${file.name || 'untitled'}).`);
  }
  if (!kinds.includes(kind)) {
    throw new Error(`File ${file.name || 'untitled'} appears to be ${kind}; expected ${kinds.join(' / ')}.`);
  }
  return kind;
}
