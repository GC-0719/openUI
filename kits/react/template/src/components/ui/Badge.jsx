
export const Badge = ({ 
  children, 
  variant = 'primary', 
  dot = false, 
  className = '', 
  style = {},
  ...props 
}) => {
  return (
    <span 
      className={`ou-badge ou-badge-${variant} ${dot ? 'ou-badge-dot' : ''} ${className}`}
      style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', ...style }}
      {...props}
    >
      {dot && <span className="ou-badge-dot-inner" style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor' }}></span>}
      {children}
    </span>
  );
};
