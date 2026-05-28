import { useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import PaperCard from '../components/draft/PaperCard';
import { SYMBOLS, SYMBOL_CATEGORIES, renderSymbolToSVG } from '../markup/symbolLibrary';

/**
 * Symbol catalogue rendered as a drafting sheet's plate library.
 * Each symbol sits in a square paper tile with a hairline border,
 * carrying its name and category in mono caps below.
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
    <div className="xc-stagger" style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 18 }}>
      <section style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        alignItems: 'flex-end',
        gap: 22,
        borderBottom: '1.5px solid var(--rule-ink)',
        paddingBottom: 14,
      }}>
        <div>
          <div className="xc-stamp" style={{ marginBottom: 6 }}>library · symbol catalogue</div>
          <h1 className="xc-display-italic" style={{ margin: 0, fontSize: 48, lineHeight: 1 }}>
            Plate library
          </h1>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-3)', marginTop: 12 }}>
            {visible.length}/{SYMBOLS.length} symbols on file · drag onto a plan in the markup tool
          </p>
        </div>
      </section>

      <PaperCard title="filter · query">
        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 12 }}>
          <div style={searchWrap}>
            <Search size={14} color="var(--ink-3)" style={{ marginRight: 8 }} />
            <input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="symbol name, id, category"
              style={searchInput}
            />
            {filter && (
              <button type="button" onClick={() => setFilter('')} style={searchClear}><X size={12} /></button>
            )}
          </div>
          <select value={category} onChange={(e) => setCategory(e.target.value)} style={selectStyle}>
            <option value="all">ALL CATEGORIES</option>
            {categories.map((c) => <option key={c} value={c}>{c.toUpperCase()}</option>)}
          </select>
        </div>
      </PaperCard>

      <PaperCard title={`plates · ${visible.length}`} meta="ink stroke 1.5pt">
        {visible.length === 0 ? (
          <div style={emptyDraft}>no symbols match the filter</div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
            gap: 8,
          }}>
            {visible.map((s) => (
              <figure key={s.id} style={plate}>
                <div
                  style={{ display: 'flex', justifyContent: 'center', padding: '14px 8px', background: 'var(--paper-1)' }}
                  dangerouslySetInnerHTML={{ __html: renderSymbolToSVG(s.id, 'var(--ink)', 40) }}
                />
                <figcaption style={plateCap}>
                  <div style={{ color: 'var(--ink)', fontFamily: 'var(--font-sans)', fontSize: 12 }}>
                    {s.name}
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 9,
                    letterSpacing: 'var(--tracking-label)',
                    textTransform: 'uppercase',
                    color: 'var(--ink-4)',
                    marginTop: 2,
                  }}>
                    {s.category}
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        )}
      </PaperCard>
    </div>
  );
}

const plate = {
  margin: 0,
  border: '1px solid var(--rule-strong)',
  background: 'var(--paper-1)',
  display: 'flex',
  flexDirection: 'column',
};
const plateCap = {
  padding: '8px 10px',
  borderTop: '1px solid var(--rule)',
  background: 'var(--paper-2)',
  textAlign: 'center',
};
const searchWrap = {
  display: 'flex',
  alignItems: 'center',
  background: 'var(--paper-1)',
  border: '1px solid var(--rule-strong)',
  padding: '8px 10px',
};
const searchInput = {
  flex: 1,
  border: 'none',
  outline: 'none',
  background: 'transparent',
  fontSize: 13,
  color: 'var(--ink)',
  fontFamily: 'var(--font-mono)',
  letterSpacing: '0.04em',
};
const searchClear = {
  background: 'transparent',
  border: 'none',
  color: 'var(--ink-4)',
  cursor: 'pointer',
  padding: 4,
};
const selectStyle = {
  background: 'var(--paper-1)',
  border: '1px solid var(--rule-strong)',
  padding: '8px 10px',
  fontFamily: 'var(--font-mono)',
  fontSize: 11,
  letterSpacing: 'var(--tracking-label)',
  textTransform: 'uppercase',
  color: 'var(--ink)',
};
const emptyDraft = {
  padding: '40px 20px',
  textAlign: 'center',
  fontFamily: 'var(--font-mono)',
  fontSize: 11,
  letterSpacing: 'var(--tracking-label)',
  textTransform: 'uppercase',
  color: 'var(--ink-4)',
};
