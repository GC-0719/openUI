import React from 'react';
import { ChevronRight } from 'lucide-react';

export const Breadcrumbs = ({ 
  items = [], 
  separator = ChevronRight, 
  className = '', 
  style = {},
  ...props 
}) => {
  const SeparatorIcon = separator;

  return (
    <nav 
      className={`l-breadcrumbs ${className}`} 
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '4px', 
        fontSize: '14px', 
        color: 'var(--text-dim)',
        ...style 
      }}
      {...props}
    >
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        const label = typeof item === 'string' ? item : item.label;
        const href = typeof item === 'object' ? item.href : null;

        return (
          <React.Fragment key={idx}>
            {href && !isLast ? (
              <a 
                href={href} 
                className="l-breadcrumb-link"
                style={{ 
                  color: 'var(--text-dim)', 
                  textDecoration: 'none',
                  transition: 'color 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer'
                }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-dim)'}
              >
                {label}
              </a>
            ) : (
              <span 
                className={isLast ? 'l-breadcrumb-active' : 'l-breadcrumb-item'}
                style={{ 
                  color: isLast ? 'var(--text)' : 'var(--text-dim)',
                  fontWeight: isLast ? '600' : '400'
                }}
              >
                {label}
              </span>
            )}
            
            {!isLast && (
              <SeparatorIcon 
                size={14} 
                style={{ opacity: 0.5, margin: '0 4px' }} 
              />
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
