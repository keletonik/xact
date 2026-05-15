import { useMemo, useState } from 'react';
import { Pin, PinOff, Plus, RotateCcw, Search } from 'lucide-react';
import { SYMBOLS, SYMBOL_CATEGORIES, renderSymbolToSVG, getSymbol } from '../../markup/symbolLibrary';

/**
 * Customisable symbol palette. Top row shows the user's pinned symbols (drawn
 * from useToolbarPrefs). Click "+" to open the full picker; click "pin" on any
 * symbol to add it to the top row. Recent symbols appear in their own band.
 */
export default function CustomisableSymbolPalette({
  selectedSymbolId,
  onSelect,
  prefs,
  togglePin,
  resetDefaults,
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [filter, setFilter] = useState('');
  const [category, setCategory] = useState('');

  const pinned = useMemo(
    () => prefs.pinned.map(getSymbol).filter(Boolean),
    [prefs.pinned],
  );
  const recent = useMemo(
    () => prefs.recent.map(getSymbol).filter(Boolean).filter((s) => !prefs.pinned.includes(s.id)),
    [prefs.recent, prefs.pinned],
  );
  const all = useMemo(() => {
    const q = filter.trim().toLowerCase();
    return SYMBOLS.filter((s) => {
      if (category && s.category !== category) return false;
      if (q && !s.name.toLowerCase().includes(q) && !s.id.toLowerCase().includes(q) && !s.category.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [filter, category]);

  return (
    <div style={wrap}>
      <div style={head}>
        <strong style={{ fontSize: 13 }}>Symbols</strong>
        <button type="button" style={iconBtn} onClick={() => setPickerOpen((v) => !v)} title="Add / remove symbols" aria-label="Add or remove symbols">
          <Plus size={14} />
        </button>
      </div>

      <SymbolBand
        title="Pinned"
        symbols={pinned}
        selectedSymbolId={selectedSymbolId}
        onSelect={onSelect}
        onPin={togglePin}
        isPinned
        emptyMessage="No pinned symbols yet — click + to add."
      />

      {recent.length > 0 && (
        <SymbolBand
          title="Recent"
          symbols={recent}
          selectedSymbolId={selectedSymbolId}
          onSelect={onSelect}
          onPin={togglePin}
        />
      )}

      {pickerOpen && (
        <div style={picker}>
          <div style={pickerHead}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={14} style={{ position: 'absolute', left: 8, top: 6, color: '#94a3b8' }} />
              <input
                placeholder="Search…"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                aria-label="Search symbols"
                style={search}
              />
            </div>
            <button type="button" style={miniBtn} onClick={resetDefaults} title="Reset to defaults" aria-label="Reset toolbar to defaults">
              <RotateCcw size={12} /> Reset
            </button>
          </div>
          <div style={cats}>
            <button type="button" onClick={() => setCategory('')} style={chip(category === '')}>All</button>
            {Object.values(SYMBOL_CATEGORIES).map((c) => (
              <button key={c} type="button" onClick={() => setCategory(c)} style={chip(category === c)}>{c}</button>
            ))}
          </div>
          <div style={grid}>
            {all.map((s) => {
              const pinnedNow = prefs.pinned.includes(s.id);
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => onSelect(s.id)}
                  title={`${s.name}${s.standard ? ` (${s.standard})` : ''}`}
                  aria-pressed={s.id === selectedSymbolId}
                  style={{ ...tile, ...(s.id === selectedSymbolId ? tileActive : null) }}
                >
                  <span dangerouslySetInnerHTML={{ __html: renderSymbolToSVG(s.id, '#0f172a', 28) }} />
                  <span style={tileLabel}>{s.name}</span>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); togglePin(s.id); }}
                    title={pinnedNow ? 'Unpin' : 'Pin to toolbar'}
                    aria-label={pinnedNow ? 'Unpin from toolbar' : 'Pin to toolbar'}
                    style={pinBtn}
                  >
                    {pinnedNow ? <PinOff size={11} color="#dc2626" /> : <Pin size={11} color="#0f172a" />}
                  </button>
                </button>
              );
            })}
          </div>
          {all.length === 0 && <div style={{ fontSize: 12, color: '#64748b', textAlign: 'center', padding: 12 }}>No matches.</div>}
        </div>
      )}
    </div>
  );
}

function SymbolBand({ title, symbols, selectedSymbolId, onSelect, onPin, isPinned = false, emptyMessage }) {
  if (symbols.length === 0 && !emptyMessage) return null;
  return (
    <div style={band}>
      <div style={bandHead}>{title} <span style={{ color: '#94a3b8' }}>({symbols.length})</span></div>
      {symbols.length === 0 ? (
        <div style={{ fontSize: 11, color: '#94a3b8', padding: '4px 2px' }}>{emptyMessage}</div>
      ) : (
        <div style={bandGrid}>
          {symbols.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => onSelect(s.id)}
              title={`${s.name}${s.standard ? ` (${s.standard})` : ''}`}
              aria-pressed={s.id === selectedSymbolId}
              style={{ ...miniTile, ...(s.id === selectedSymbolId ? miniTileActive : null) }}
            >
              <span dangerouslySetInnerHTML={{ __html: renderSymbolToSVG(s.id, '#0f172a', 26) }} />
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onPin(s.id); }}
                title={isPinned ? 'Unpin' : 'Pin'}
                aria-label={isPinned ? 'Unpin' : 'Pin'}
                style={pinBadge}
              >
                {isPinned ? <PinOff size={10} color="#dc2626" /> : <Pin size={10} color="#0f172a" />}
              </button>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const wrap = { padding: 8, background: 'white', border: '1px solid var(--border, #d1d5db)', borderRadius: 6 };
const head = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 };
const iconBtn = { background: 'transparent', border: '1px solid var(--border, #d1d5db)', borderRadius: 4, cursor: 'pointer', padding: 4, color: '#0f172a' };
const miniBtn = { background: 'white', border: '1px solid var(--border, #d1d5db)', borderRadius: 4, cursor: 'pointer', padding: '4px 8px', color: '#0f172a', fontSize: 11, display: 'inline-flex', alignItems: 'center', gap: 4 };
const band = { marginBottom: 8 };
const bandHead = { fontSize: 11, color: '#475569', textTransform: 'uppercase', letterSpacing: 0.6, fontWeight: 600, marginBottom: 4 };
const bandGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(54px, 1fr))', gap: 4 };
const miniTile = { position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 6, border: '1px solid var(--border, #d1d5db)', borderRadius: 6, background: 'white', cursor: 'pointer', color: '#0f172a', minHeight: 40 };
const miniTileActive = { borderColor: '#3b82f6', boxShadow: '0 0 0 2px rgba(59,130,246,0.2)' };
const pinBadge = { position: 'absolute', top: 1, right: 1, background: 'transparent', border: 'none', cursor: 'pointer', padding: 1 };
const picker = { marginTop: 8, padding: 8, border: '1px solid var(--border, #d1d5db)', borderRadius: 6, background: '#f8fafc' };
const pickerHead = { display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 };
const search = { width: '100%', padding: '4px 6px 4px 26px', fontSize: 12, border: '1px solid var(--border, #d1d5db)', borderRadius: 4, color: '#0f172a' };
const cats = { display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 };
const chip = (active) => ({
  fontSize: 10.5, padding: '3px 8px', borderRadius: 999,
  background: active ? '#0f172a' : 'white', color: active ? 'white' : '#0f172a',
  border: '1px solid #d1d5db', cursor: 'pointer',
});
const grid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(76px, 1fr))', gap: 6, maxHeight: 320, overflow: 'auto' };
const tile = { position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: 6, border: '1px solid var(--border, #d1d5db)', borderRadius: 6, background: 'white', cursor: 'pointer', color: '#0f172a' };
const tileActive = { borderColor: '#3b82f6', boxShadow: '0 0 0 2px rgba(59,130,246,0.2)' };
const tileLabel = { fontSize: 10, lineHeight: 1.15, textAlign: 'center', minHeight: 22 };
const pinBtn = { position: 'absolute', top: 2, right: 2, background: 'rgba(255,255,255,0.9)', border: '1px solid var(--border, #d1d5db)', borderRadius: 4, cursor: 'pointer', padding: 2 };
