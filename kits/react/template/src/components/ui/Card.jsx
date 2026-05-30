import React from 'react';

export const Card = ({ 
  children, 
  variant = 'default', 
  hover = false, 
  className = '', 
  style = {},
  ...props 
}) => {
  const baseClass = 'l-card';
  const variantClass = variant !== 'default' ? `l-card-${variant}` : '';
  const hoverClass = hover ? 'l-card-hover' : '';

  return (
    <div 
      className={`${baseClass} ${variantClass} ${hoverClass} ${className}`}
      style={{ ...style }}
      {...props}
    >
      {children}
    </div>
  );
};
