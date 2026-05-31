import React from 'react';

export const Progress = ({ 
  value = 0, 
  max = 100, 
  variant = 'primary', 
  striped = false, 
  className = '', 
  style = {},
  ...props 
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div 
      className={`ou-progress-container ${className}`}
      style={{
        width: '100%', height: '8px', background: 'var(--surface-raised)',
        borderRadius: '999px', overflow: 'hidden', ...style
      }}
      {...props}
    >
      <div 
        className={`ou-progress-bar ou-progress-${variant} ${striped ? 'ou-progress-striped' : ''}`}
        style={{
          width: `${percentage}%`, height: '100%', 
          background: `var(--${variant})`, transition: 'width 0.3s ease',
          borderRadius: '999px'
        }}
      />
    </div>
  );
};
