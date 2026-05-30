import React from 'react';

export const Switch = ({ 
  active, 
  onChange = () => {}, 
  className = '', 
  style = {},
  disabled = false,
  ...props 
}) => {
  return (
    <div 
      className={`l-switch ${active ? 'l-switch-active' : ''} ${disabled ? 'l-disabled' : ''} ${className}`}
      onClick={() => !disabled && onChange(!active)}
      style={{
        width: '44px', height: '24px', background: active ? 'var(--primary)' : 'var(--surface-raised)',
        borderRadius: '24px', position: 'relative', cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.3s ease', opacity: disabled ? 0.5 : 1, ...style
      }}
      {...props}
    >
      <div style={{
        position: 'absolute', top: '2px', left: active ? '22px' : '2px',
        width: '20px', height: '20px', background: 'white', borderRadius: '50%',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
      }} />
    </div>
  );
};
