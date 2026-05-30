import React from 'react';

export const Skeleton = ({ 
  width, 
  height, 
  circle = false, 
  className = '', 
  style = {},
  ...props 
}) => {
  return (
    <div 
      className={`l-skeleton ${className}`}
      style={{
        width: width || '100%',
        height: height || '16px',
        borderRadius: circle ? '50%' : '4px',
        background: 'var(--surface-raised)',
        position: 'relative',
        overflow: 'hidden',
        ...style
      }}
      {...props}
    >
      <div className="l-skeleton-shimmer"></div>
    </div>
  );
};
