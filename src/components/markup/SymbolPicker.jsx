import { useMemo, useState } from 'react';
import { SYMBOLS, SYMBOL_CATEGORIES, renderSymbolToSVG } from '../../markup/symbolLibrary';

export default function SymbolPicker({ selectedSymbolId, onSelect }) {
  const [filter, setFilter] = useState('');
  const [category, setCategory] = useState('');
  const visible = useMemo(() => {
    const q = filter.trim().toLowerCase();
    return SYMBOLS.filter((s) => {
      if (category && s.category !== category) return false;
      if (q && !s.name.toLowerCase().includes(q) && !s.id.includes(q)) return false;
      return true;
    });
  }, [filter, category]);

  return (
    <div style={wrap}>
      <div style={head}>
        <strong>Symbols</strong>
        <input
          placeholder="Search…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          aria-label="Search symbols"
          style={search}
        />
      </div>
      <div style={cats}>
        <button type="button" onClick={() => setCategory('')} style={chip(category === '')}>All</button>
        {Object.values(SYMBOL_CATEGORIES).map((c) => (
          <button key={c} type="button" onClick={() => setCategory(c)} style={chip(category === c)}>{c}</button>
        ))}
      </div>
      <div style={grid}>
        {visible.map((s) => (
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
          </button>
        ))}
      </div>
    </div>
  );
}

const wrap = { padding: 8, background: 'white', border: '1px solid var(--border, #e5e7eb)', borderRadius: 6, minWidth: 260 };
const head = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 8 };
const search = { flex: 1, padding: '4px 6px', fontSize: 12, border: '1px solid var(--border, #e5e7eb)', borderRadius: 4 };
const cats = { display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 };
const chip = (active) => ({
  fontSize: 11, padding: '2px 8px', borderRadius: 999,
  background: active ? '#0f172a' : 'white', color: active ? 'white' : '#0f172a',
  border: '1px solid #e5e7eb', cursor: 'pointer',
});
const grid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(72px, 1fr))', gap: 6, maxHeight: 360, overflow: 'auto' };
const tile = {
  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
  padding: 6, border: '1px solid var(--border, #e5e7eb)', borderRadius: 6,
  background: 'white', cursor: 'pointer',
};
const tileActive = { borderColor: '#3b82f6', boxShadow: '0 0 0 2px rgba(59,130,246,0.2)' };
const tileLabel = { fontSize: 10, lineHeight: 1.1, textAlign: 'center', minHeight: 22 };
