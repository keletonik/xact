export default function FormField({ label, required, error, children, help }) {
  return (
    <div style={{ marginBottom: 20 }}>
      {label && (
        <label style={{
          display: 'block',
          fontSize: '0.8125rem',
          fontWeight: 600,
          color: 'var(--text-primary)',
          marginBottom: 6,
        }}>
          {label}
          {required && <span style={{ color: 'var(--color-danger-500)', marginLeft: 2 }}>*</span>}
        </label>
      )}
      {children}
      {error && (
        <p style={{ fontSize: '0.75rem', color: 'var(--color-danger-500)', marginTop: 4 }}>
          {error}
        </p>
      )}
      {help && !error && (
        <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: 4 }}>
          {help}
        </p>
      )}
    </div>
  );
}

export function TextInput({ value, onChange, placeholder, type = 'text', disabled, ...props }) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      style={{
        width: '100%',
        height: 40,
        padding: '0 12px',
        backgroundColor: 'var(--bg-input)',
        border: '1px solid var(--border-primary)',
        borderRadius: 'var(--radius-md)',
        color: 'var(--text-primary)',
        fontSize: '0.875rem',
        outline: 'none',
        transition: 'border-color var(--transition-fast)',
        opacity: disabled ? 0.5 : 1,
      }}
      onFocus={e => e.target.style.borderColor = 'var(--border-focus)'}
      onBlur={e => e.target.style.borderColor = 'var(--border-primary)'}
      {...props}
    />
  );
}

export function TextArea({ value, onChange, placeholder, rows = 3, disabled }) {
  return (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      disabled={disabled}
      style={{
        width: '100%',
        padding: 12,
        backgroundColor: 'var(--bg-input)',
        border: '1px solid var(--border-primary)',
        borderRadius: 'var(--radius-md)',
        color: 'var(--text-primary)',
        fontSize: '0.875rem',
        outline: 'none',
        resize: 'vertical',
        transition: 'border-color var(--transition-fast)',
        opacity: disabled ? 0.5 : 1,
      }}
      onFocus={e => e.target.style.borderColor = 'var(--border-focus)'}
      onBlur={e => e.target.style.borderColor = 'var(--border-primary)'}
    />
  );
}

export function SelectInput({ value, onChange, options, placeholder, disabled }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      disabled={disabled}
      style={{
        width: '100%',
        height: 40,
        padding: '0 12px',
        backgroundColor: 'var(--bg-input)',
        border: '1px solid var(--border-primary)',
        borderRadius: 'var(--radius-md)',
        color: value ? 'var(--text-primary)' : 'var(--text-tertiary)',
        fontSize: '0.875rem',
        outline: 'none',
        cursor: 'pointer',
        transition: 'border-color var(--transition-fast)',
        opacity: disabled ? 0.5 : 1,
      }}
      onFocus={e => e.target.style.borderColor = 'var(--border-focus)'}
      onBlur={e => e.target.style.borderColor = 'var(--border-primary)'}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  );
}
