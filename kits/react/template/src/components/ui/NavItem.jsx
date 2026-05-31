
export const NavItem = ({ 
  children, 
  icon: Icon, 
  active = false, 
  className = '', 
  style = {},
  ...props 
}) => {
  return (
    <div 
      className={`ou-nav-item ${active ? 'ou-nav-item-active' : ''} ${className}`}
      style={{
        display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px',
        borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s',
        color: active ? 'var(--primary)' : 'var(--text-muted)',
        background: active ? 'var(--primary-soft)' : 'transparent',
        fontSize: '14px', fontWeight: active ? '600' : '400',
        ...style
      }}
      {...props}
    >
      {Icon && <Icon size={18} />}
      <span>{children}</span>
    </div>
  );
};
