import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, Bell } from 'lucide-react';

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = (toast) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
    if (toast.duration !== 0) {
      setTimeout(() => removeToast(id), toast.duration || 3000);
    }
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="l-toast-container" style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const ToastContext = React.createContext(null);

export const useToast = () => {
  const context = React.useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};

const Toast = ({ title, message, variant = 'info', onClose }) => {
  const icons = {
    info: Info,
    success: CheckCircle,
    warning: AlertCircle,
    error: X,
    default: Bell
  };
  const Icon = icons[variant] || icons.default;

  return (
    <div 
      className={`l-toast l-toast-${variant} animate-slide-in-right`}
      style={{
        width: '320px', background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: '12px', padding: '16px', display: 'flex', gap: '12px',
        boxShadow: 'var(--shadow-lg)', borderLeft: `4px solid var(--${variant === 'default' ? 'primary' : variant})`
      }}
    >
      <div style={{ color: `var(--${variant === 'default' ? 'primary' : variant})`, flexShrink: 0 }}>
        <Icon size={20} />
      </div>
      <div style={{ flex: 1 }}>
        {title && <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>{title}</div>}
        <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{message}</div>
      </div>
      <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', alignSelf: 'flex-start' }}>
        <X size={14} />
      </button>
    </div>
  );
};
