import React from 'react';
import { Check } from 'lucide-react';

export const Checkbox = ({ 
  label, 
  checked, 
  onChange, 
  className = '', 
  style = {},
  disabled = false,
  ...props 
}) => {
  return (
    <label 
      className={`l-checkbox-container ${disabled ? 'l-disabled' : ''} ${className}`}
      style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: disabled ? 'not-allowed' : 'pointer', ...style }}
    >
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <input 
          type="checkbox" 
          checked={checked} 
          onChange={onChange} 
          disabled={disabled}
          className="l-checkbox-input"
          {...props}
          style={{
            appearance: 'none',
            width: '20px',
            height: '20px',
            border: '2px solid var(--border)',
            borderRadius: '4px',
            background: checked ? 'var(--primary)' : 'transparent',
            borderColor: checked ? 'var(--primary)' : 'var(--border)',
            transition: 'all 0.2s',
          }}
        />
        {checked && <Check size={14} color="white" style={{ position: 'absolute', pointerEvents: 'none' }} />}
      </div>
      {label && <span style={{ fontSize: '14px', color: 'var(--text)' }}>{label}</span>}
    </label>
  );
};
