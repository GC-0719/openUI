import React from 'react';

export const Chip = ({ 
  children, 
  icon: Icon, 
  onDelete, 
  className = '', 
  style = {},
  ...props 
}) => {
  return (
    <div 
      className={`l-chip ${className}`}
      style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 12px', borderRadius: '100px', background: 'var(--surface-raised)', border: '1px solid var(--border)', fontSize: '13px', ...style }}
      {...props}
    >
      {Icon && <Icon size={14} className="l-chip-icon" />}
      <span>{children}</span>
      {onDelete && (
        <button 
          onClick={onDelete} 
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', color: 'var(--text-dim)' }}
        >
          ✕
        </button>
      )}
    </div>
  );
};
