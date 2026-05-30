import React from 'react';

export const Tabs = ({ 
  tabs = [], 
  activeTab, 
  onChange, 
  variant = 'pill', 
  className = '', 
  style = {},
  ...props 
}) => {
  return (
    <div 
      className={`l-tabs l-tabs-${variant} ${className}`}
      style={{ display: 'flex', gap: '4px', background: 'var(--surface-raised)', padding: '4px', borderRadius: '10px', ...style }}
      {...props}
    >
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`l-tab ${activeTab === tab.id ? 'active' : ''}`}
          style={{
            padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer',
            fontSize: '13px', fontWeight: '500', transition: 'all 0.2s',
            background: activeTab === tab.id ? 'var(--surface)' : 'transparent',
            color: activeTab === tab.id ? 'var(--text)' : 'var(--text-dim)',
            boxShadow: activeTab === tab.id ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
          }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};
