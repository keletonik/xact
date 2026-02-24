import { Search, X } from 'lucide-react';

export default function SearchInput({ value, onChange, placeholder = 'Search...' }) {
  return (
    <div style={{
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
    }}>
      <Search
        size={16}
        style={{
          position: 'absolute',
          left: 12,
          color: 'var(--text-tertiary)',
          pointerEvents: 'none',
        }}
      />
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%',
          height: 38,
          paddingLeft: 36,
          paddingRight: value ? 36 : 12,
          backgroundColor: 'var(--bg-input)',
          border: '1px solid var(--border-primary)',
          borderRadius: 'var(--radius-md)',
          color: 'var(--text-primary)',
          fontSize: '0.8125rem',
          outline: 'none',
          transition: 'border-color var(--transition-fast)',
        }}
        onFocus={e => e.target.style.borderColor = 'var(--border-focus)'}
        onBlur={e => e.target.style.borderColor = 'var(--border-primary)'}
      />
      {value && (
        <button
          onClick={() => onChange('')}
          style={{
            position: 'absolute',
            right: 8,
            padding: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text-tertiary)',
          }}
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
