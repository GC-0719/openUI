import { useState, useRef, useEffect, useCallback, useId } from 'react';
import { createPortal } from 'react-dom';

export const Dropdown = ({
  trigger,
  children,
  align = 'left',
  className = '',
  style = {},
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState({});
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const menuId = useId();

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const base = {
      position: 'fixed',
      top: rect.bottom + 6,
      zIndex: 9999,
      minWidth: Math.max(rect.width, 200),
    };
    if (align === 'right') {
      base.right = window.innerWidth - rect.right;
    } else if (align === 'center') {
      base.left = rect.left + rect.width / 2;
      base.transform = 'translateX(-50%)';
    } else {
      base.left = rect.left;
    }
    setMenuStyle(base);
  }, [align]);

  useEffect(() => {
    if (isOpen) updatePosition();
  }, [isOpen, updatePosition]);

  useEffect(() => {
    const close = (e) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };
    const onScroll = () => setIsOpen(false);
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    if (isOpen) {
      document.addEventListener('mousedown', close);
      window.addEventListener('scroll', onScroll, true);
      document.addEventListener('keydown', onKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', close);
      window.removeEventListener('scroll', onScroll, true);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen]);

  const menu = isOpen
    ? createPortal(
        <div
          ref={menuRef}
          id={menuId}
          role="menu"
          className="ou-dropdown-menu animate-fade-in"
          style={{
            ...menuStyle,
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            boxShadow: 'var(--shadow-lg)',
            overflow: 'hidden',
          }}
        >
          {children}
        </div>,
        document.body
      )
    : null;

  return (
    <div
      className={`ou-dropdown ${className}`.trim()}
      style={{ position: 'relative', display: 'inline-block', ...style }}
      {...props}
    >
      <div ref={triggerRef}>
        {trigger ?? (
          <button
            type="button"
            className="ou-btn ou-btn-outline"
            aria-haspopup="menu"
            aria-expanded={isOpen}
            aria-controls={menuId}
            onClick={() => setIsOpen((o) => !o)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            Options
          </button>
        )}
      </div>
      {menu}
    </div>
  );
};

export const DropdownItem = ({ children, icon: Icon, onClick, danger = false, disabled = false, ...props }) => (
  <button
    type="button"
    role="menuitem"
    disabled={disabled}
    className={`ou-dropdown-item ${danger ? 'ou-dropdown-item-danger' : ''}`.trim()}
    onClick={onClick}
    style={{
      width: '100%',
      border: 'none',
      background: 'transparent',
      padding: '10px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      cursor: disabled ? 'not-allowed' : 'pointer',
      transition: 'all 0.2s',
      fontSize: '14px',
      color: danger ? 'var(--accent)' : 'var(--text)',
      opacity: disabled ? 0.5 : 1,
      textAlign: 'left',
      fontFamily: 'inherit',
    }}
    onMouseEnter={(e) => {
      if (disabled) return;
      e.currentTarget.style.background = danger ? 'var(--accent-soft)' : 'var(--surface-raised)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = 'transparent';
    }}
    {...props}
  >
    {Icon && <Icon size={16} aria-hidden />}
    <span style={{ flex: 1 }}>{children}</span>
  </button>
);

export const DropdownDivider = () => (
  <div role="separator" style={{ height: '1px', background: 'var(--border)', margin: '4px 0' }} />
);
