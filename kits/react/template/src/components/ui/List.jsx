import React from 'react';

export const List = ({ children, className = '', style = {}, ...props }) => (
  <ul className={`ou-list ${className}`} style={{ listStyle: 'none', padding: 0, margin: 0, ...style }} {...props}>
    {children}
  </ul>
);

export const ListItem = ({ children, icon: Icon, className = '', style = {}, ...props }) => (
  <li 
    className={`ou-list-item ${className}`} 
    style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderBottom: '1px solid var(--border)', ...style }}
    {...props}
  >
    {Icon && <Icon size={18} color="var(--text-dim)" />}
    <span style={{ flex: 1 }}>{children}</span>
  </li>
);
