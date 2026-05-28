import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import Card from '../components/common/Card';
import SearchInput from '../components/common/SearchInput';
import EmptyState from '../components/common/EmptyState';
import { SYMBOLS, SYMBOL_CATEGORIES, renderSymbolToSVG } from '../markup/symbolLibrary';

/**
 * Symbol catalog: the ~90 passive-fire plan-markup symbols used by the
 * Markup tool's palette. This page is the searchable browser.
 */
export default function Catalog() {
  const [filter, setFilter] = useState('');
  const [category, setCategory] = useState('all');

  const visible = useMemo(() => {
    const q = filter.trim().toLowerCase();
    return SYMBOLS
      .filter((s) => category === 'all' || s.category === category)
      .filter((s) => !q || [s.name, s.id, s.category].some((v) => (v || '').toLowerCase().includes(q)));
  }, [filter, category]);

  const categories = Object.values(SYMBOL_CATEGORIES);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <h1 style={{ margin: 0, fontSize: 22 }}>Symbol catalog</h1>
        <span style={{ fontSize: 12, color: 'var(--geist-fg-4)' }}>{visible.length} / {SYMBOLS.length}</span>
      </div>

      <Card>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: 220 }}>
            <SearchInput value={filter} onChange={setFilter} placeholder="Search symbols" />
          </div>
          <select value={category} onChange={(e) => setCategory(e.target.value)} style={selectStyle}>
            <option value="all">All categories</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </Card>

      {visible.length === 0 ? (
        <EmptyState icon={Search} title="No matching symbols" description="Adjust the filter or category." />
      ) : (
        <Card>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
            gap: 8,
          }}>
            {visible.map((s) => (
              <div key={s.id} style={tile}>
                <div
                  style={{ display: 'flex', justifyContent: 'center', padding: 8 }}
                  dangerouslySetInnerHTML={{ __html: renderSymbolToSVG(s.id, 'var(--geist-fg, #111)', 36) }}
                />
                <div style={{ fontSize: 12, textAlign: 'center', padding: '0 4px 6px', color: 'var(--geist-fg)' }}>
                  {s.name}
                </div>
                <div style={{ fontSize: 10, textAlign: 'center', color: 'var(--geist-fg-4)', paddingBottom: 6 }}>
                  {s.category}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

const tile = {
  border: '1px solid var(--geist-border)',
  borderRadius: 6,
  display: 'flex',
  flexDirection: 'column',
};
const selectStyle = {
  padding: '6px 10px',
  border: '1px solid var(--geist-border-strong)',
  borderRadius: 4,
  background: 'var(--geist-bg)',
  fontSize: 12,
};
