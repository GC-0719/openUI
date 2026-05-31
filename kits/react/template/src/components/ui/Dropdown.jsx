import React, { useState, useRef, useEffect, useCallback } from 'react';
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
        menuRef.current && !menuRef.current.contains(e.target) &&
        triggerRef.current && !triggerRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };
    const onScroll = () => setIsOpen(false);
    if (isOpen) {
      document.addEventListener('mousedown', close);
      window.addEventListener('scroll', onScroll, true);
    }
    return () => {
      document.removeEventListener('mousedown', close);
      window.removeEventListener('scroll', onScroll, true);
    };
  }, [isOpen]);

  const menu = isOpen
    ? createPortal(
        <div
          ref={menuRef}
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
      className={`ou-dropdown ${className}`}
      style={{ position: 'relative', display: 'inline-block', ...style }}
      {...props}
    >
      <div ref={triggerRef} onClick={() => setIsOpen(o => !o)} style={{ cursor: 'pointer' }}>
        {trigger ?? (
          <button className="ou-btn ou-btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            Options
          </button>
        )}
      </div>
      {menu}
    </div>
  );
};

export const DropdownItem = ({ children, icon: Icon, onClick, danger = false, ...props }) => (
  <div
    className={`ou-dropdown-item ${danger ? 'ou-dropdown-item-danger' : ''}`}
    onClick={onClick}
    style={{
      padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '12px',
      cursor: 'pointer', transition: 'all 0.2s', fontSize: '14px',
      color: danger ? 'var(--accent)' : 'var(--text)',
    }}
    onMouseEnter={e => e.currentTarget.style.background = danger ? 'var(--accent-soft)' : 'var(--surface-raised)'}
    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    {...props}
  >
    {Icon && <Icon size={16} />}
    <span style={{ flex: 1 }}>{children}</span>
  </div>
);

export const DropdownDivider = () => (
  <div style={{ height: '1px', background: 'var(--border)', margin: '4px 0' }} />
);
