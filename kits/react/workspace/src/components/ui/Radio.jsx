import React from 'react';

export const Radio = ({ 
  label, 
  name, 
  value, 
  checked, 
  onChange, 
  disabled = false, 
  className = '', 
  style = {},
  ...props 
}) => {
  return (
    <label 
      className={`ou-radio-container ${disabled ? 'ou-disabled' : ''} ${className}`}
      style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1, ...style }}
    >
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <input 
          type="radio" 
          name={name}
          value={value}
          checked={checked} 
          onChange={onChange} 
          disabled={disabled}
          className="ou-radio-input"
          {...props}
          style={{
            appearance: 'none',
            width: '20px',
            height: '20px',
            border: '2px solid var(--border)',
            borderRadius: '50%',
            background: 'transparent',
            borderColor: checked ? 'var(--primary)' : 'var(--border)',
            transition: 'all 0.2s',
          }}
        />
        {checked && (
          <div style={{ 
            position: 'absolute', width: '10px', height: '10px', 
            borderRadius: '50%', background: 'var(--primary)',
            pointerEvents: 'none'
          }} />
        )}
      </div>
      {label && <span style={{ fontSize: '14px', color: 'var(--text)' }}>{label}</span>}
    </label>
  );
};
