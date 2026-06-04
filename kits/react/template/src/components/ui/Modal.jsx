import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export const Modal = ({
  isOpen,
  open,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  closeOnOverlay = true,
  className = '',
  style = {},
  ...props
}) => {
  const visible = isOpen ?? open ?? false;
  const titleId = useId();
  const panelRef = useRef(null);
  const previousFocus = useRef(null);

  useEffect(() => {
    if (!visible) return undefined;
    previousFocus.current = document.activeElement;
    const panel = panelRef.current;
    const focusables = panel?.querySelectorAll(FOCUSABLE);
    const first = focusables?.[0];
    if (first && typeof first.focus === 'function') {
      first.focus();
    } else {
      panel?.focus();
    }

    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose?.();
        return;
      }
      if (e.key !== 'Tab' || !panel) return;
      const nodes = [...panel.querySelectorAll(FOCUSABLE)];
      if (!nodes.length) return;
      const firstEl = nodes[0];
      const lastEl = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = prevOverflow;
      const prev = previousFocus.current;
      if (prev && typeof prev.focus === 'function') prev.focus();
    };
  }, [visible, onClose]);

  if (!visible) return null;

  const sizeMap = { sm: '400px', md: '600px', lg: '800px' };

  return createPortal(
    <div
      className="ou-modal-overlay animate-fade-in"
      onClick={closeOnOverlay ? onClose : undefined}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.8)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        padding: '20px',
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        tabIndex={-1}
        className={`ou-modal ${className}`.trim()}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          width: '100%',
          maxWidth: sizeMap[size] || size,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-lg)',
          outline: 'none',
          ...style,
        }}
        {...props}
      >
        <div
          className="ou-modal-header"
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          {title ? (
            <h3 id={titleId} style={{ margin: 0 }}>
              {title}
            </h3>
          ) : (
            <span />
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)' }}
          >
            <X size={20} aria-hidden />
          </button>
        </div>

        <div className="ou-modal-content" style={{ padding: '24px', overflowY: 'auto', maxHeight: '70vh' }}>
          {children}
        </div>

        {footer && (
          <div
            className="ou-modal-footer"
            style={{
              padding: '16px 24px',
              borderTop: '1px solid var(--border)',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
              background: 'var(--bg)',
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};
