import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

export const Tooltip = ({
  children,
  content,
  position = 'top',
  className = '',
  style = {},
  ...props
}) => {
  const [visible, setVisible] = useState(false);
  const [tipStyle, setTipStyle] = useState({});
  const triggerRef = useRef(null);

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const r = triggerRef.current.getBoundingClientRect();
    const GAP = 8;

    const base = {
      position: 'fixed',
      zIndex: 99999,
      pointerEvents: 'none',
    };

    if (position === 'top') {
      base.bottom = window.innerHeight - r.top + GAP;
      base.left = r.left + r.width / 2;
      base.transform = 'translateX(-50%)';
    } else if (position === 'bottom') {
      base.top = r.bottom + GAP;
      base.left = r.left + r.width / 2;
      base.transform = 'translateX(-50%)';
    } else if (position === 'left') {
      base.right = window.innerWidth - r.left + GAP;
      base.top = r.top + r.height / 2;
      base.transform = 'translateY(-50%)';
    } else {
      base.left = r.right + GAP;
      base.top = r.top + r.height / 2;
      base.transform = 'translateY(-50%)';
    }

    setTipStyle(base);
  }, [position]);

  useEffect(() => {
    if (visible) updatePosition();
  }, [visible, updatePosition]);

  const arrowStyle = {
    position: 'absolute',
    width: 0,
    height: 0,
    borderStyle: 'solid',
    ...(position === 'top'    && { bottom: '-4px', left: '50%', transform: 'translateX(-50%)', borderWidth: '4px 4px 0', borderColor: 'rgba(0,0,0,0.9) transparent transparent' }),
    ...(position === 'bottom' && { top: '-4px',    left: '50%', transform: 'translateX(-50%)', borderWidth: '0 4px 4px', borderColor: 'transparent transparent rgba(0,0,0,0.9)' }),
    ...(position === 'left'   && { right: '-4px',  top: '50%',  transform: 'translateY(-50%)', borderWidth: '4px 0 4px 4px', borderColor: 'transparent transparent transparent rgba(0,0,0,0.9)' }),
    ...(position === 'right'  && { left: '-4px',   top: '50%',  transform: 'translateY(-50%)', borderWidth: '4px 4px 4px 0', borderColor: 'transparent rgba(0,0,0,0.9) transparent transparent' }),
  };

  const tip = visible && content
    ? createPortal(
        <div
          className={`l-tooltip animate-fade-in ${className}`}
          style={{
            ...tipStyle,
            background: 'rgba(0,0,0,0.9)',
            color: '#fff',
            padding: '6px 12px',
            borderRadius: '6px',
            fontSize: '11px',
            lineHeight: '1.4',
            whiteSpace: 'nowrap',
            fontWeight: 500,
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          }}
        >
          {content}
          <div style={arrowStyle} />
        </div>,
        document.body
      )
    : null;

  return (
    <div
      ref={triggerRef}
      className="l-tooltip-wrapper"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      style={{ position: 'relative', display: 'inline-block', ...style }}
      {...props}
    >
      {children}
      {tip}
    </div>
  );
};
