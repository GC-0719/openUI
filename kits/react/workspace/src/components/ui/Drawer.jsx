import React from 'react';
import { X } from 'lucide-react';

export const Drawer = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  position = 'right', 
  size = 'md',
  className = '',
  style = {},
  ...props 
}) => {
  if (!isOpen) return null;

  const sizeMap = {
    sm: '300px',
    md: '450px',
    lg: '600px'
  };

  const posStyles = {
    right: { top: 0, right: 0, bottom: 0, height: '100vh', transform: 'translateX(0)' },
    left: { top: 0, left: 0, bottom: 0, height: '100vh', transform: 'translateX(0)' }
  };

  return (
    <div 
      className="ou-drawer-overlay animate-fade-in" 
      onClick={onClose}
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
        zIndex: 3000
      }}
    >
      <div 
        className={`ou-drawer ou-drawer-${position} animate-slide-in-${position}`}
        onClick={e => e.stopPropagation()}
        style={{
          position: 'fixed', background: 'var(--surface)', borderLeft: position === 'right' ? '1px solid var(--border)' : 'none',
          borderRight: position === 'left' ? '1px solid var(--border)' : 'none',
          width: sizeMap[size] || size, display: 'flex', flexDirection: 'column',
          boxShadow: 'var(--shadow-lg)', ...posStyles[position], ...style
        }}
        {...props}
      >
        <div className="ou-drawer-header" style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0 }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)' }}><X size={20} /></button>
        </div>
        <div className="ou-drawer-content" style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
          {children}
        </div>
      </div>
    </div>
  );
};
