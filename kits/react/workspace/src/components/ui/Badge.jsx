import React from 'react';

export const Badge = ({ 
  children, 
  variant = 'primary', 
  dot = false, 
  className = '', 
  style = {},
  ...props 
}) => {
  return (
    <span 
      className={`l-badge l-badge-${variant} ${dot ? 'l-badge-dot' : ''} ${className}`}
      style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', ...style }}
      {...props}
    >
      {dot && <span className="l-badge-dot-inner" style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor' }}></span>}
      {children}
    </span>
  );
};
