import { motion } from 'framer-motion';

export default function Tabs({ tabs, activeTab, onChange, size = 'md' }) {
  const sizes = {
    sm: { padding: '6px 12px', fontSize: '0.75rem' },
    md: { padding: '8px 16px', fontSize: '0.8125rem' },
    lg: { padding: '10px 20px', fontSize: '0.875rem' },
  };

  return (
    <div style={{
      display: 'flex',
      gap: 2,
      borderBottom: '2px solid var(--color-border)',
      position: 'relative',
    }}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            style={{
              ...sizes[size],
              background: 'transparent',
              border: 'none',
              borderBottom: `2px solid ${isActive ? 'var(--color-fire-500)' : 'transparent'}`,
              marginBottom: -2,
              color: isActive ? 'var(--color-fire-500)' : 'var(--color-text-secondary)',
              fontWeight: isActive ? 600 : 400,
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              whiteSpace: 'nowrap',
            }}
          >
            {tab.icon && <tab.icon size={14} />}
            {tab.label}
            {tab.count != null && (
              <span style={{
                background: isActive ? 'var(--color-fire-100)' : 'var(--color-bg-tertiary)',
                color: isActive ? 'var(--color-fire-700)' : 'var(--color-text-tertiary)',
                padding: '1px 6px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.7rem',
                fontWeight: 600,
              }}>
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
