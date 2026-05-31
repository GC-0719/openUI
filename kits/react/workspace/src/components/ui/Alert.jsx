import React from 'react';

export const Alert = ({ 
  children, 
  variant = 'info', 
  glass = false, 
  icon: Icon, 
  className = '', 
  style = {},
  onClose,
  ...props 
}) => {
  const baseClass = 'ou-alert';
  const variantClass = `ou-alert-${variant}`;
  const glassClass = glass ? 'ou-alert-glass' : '';

  return (
    <div 
      className={`${baseClass} ${variantClass} ${glassClass} ${className}`} 
      style={{ display: 'flex', alignItems: 'center', gap: '12px', position: 'relative', ...style }}
      {...props}
    >
      {Icon && <Icon size={20} className="ou-alert-icon" />}
      <div className="ou-alert-content" style={{ flex: 1 }}>{children}</div>
      {onClose && (
        <button 
          onClick={onClose} 
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', opacity: 0.7 }}
        >
          ✕
        </button>
      )}
    </div>
  );
};
