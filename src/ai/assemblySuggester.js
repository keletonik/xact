import Fuse from 'fuse.js';
import { getSymbol } from '../markup/symbolLibrary';

/**
 * Suggest an assembly for a placed take-off symbol.
 *
 * Strategy:
 *   1. If the symbol has a `mappedAssemblyId`, prefer it.
 *   2. Otherwise, fuzzy-match the symbol's name + standard against the
 *      caller-supplied assembly list (Fuse.js over name, description, scope).
 *
 * Returns ranked candidates: [{ assemblyId, score, reason }].
 */
export function suggestAssemblyForSymbol(symbolId, assemblies) {
  const sym = getSymbol(symbolId);
  if (!sym) return [];
  const direct = sym.mappedAssemblyId
    ? assemblies.find((a) => a.id === sym.mappedAssemblyId)
    : null;
  if (direct) {
    return [{ assemblyId: direct.id, score: 1.0, reason: 'Symbol library mapping' }];
  }
  const fuse = new Fuse(assemblies, {
    keys: ['name', 'description', 'scope'],
    threshold: 0.4,
    includeScore: true,
  });
  const tokens = [sym.name, sym.standard, sym.category].filter(Boolean).join(' ');
  const hits = fuse.search(tokens).slice(0, 5);
  return hits.map((h) => ({
    assemblyId: h.item.id,
    score: 1 - (h.score ?? 0),
    reason: `Matched "${sym.name}" against "${h.item.name}"`,
  }));
}
