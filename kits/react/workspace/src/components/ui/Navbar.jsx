
/**
 * Navbar Component
 * A high-level layout component for headers.
 */
export const Navbar = ({ 
  children, 
  variant = 'default', 
  sticky = true,
  className = '',
  style = {},
  ...props 
}) => {
  const isGlass = variant === 'glass';
  
  const baseStyle = {
    height: '72px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 32px',
    width: '100%',
    zIndex: 1000,
    transition: 'all 0.3s ease',
    borderBottom: '1px solid var(--border)',
    position: sticky ? 'sticky' : 'relative',
    top: 0,
    background: isGlass ? 'var(--glass-bg)' : 'var(--surface)',
    backdropFilter: isGlass ? 'blur(12px)' : 'none',
    WebkitBackdropFilter: isGlass ? 'blur(12px)' : 'none',
    flexShrink: 0, // PREVENT SHRINKING IN FLEX CONTAINERS
  };

  return (
    <header 
      className={`ou-navbar ${isGlass ? 'ou-navbar-glass' : ''} ${className}`}
      style={{ ...baseStyle, ...style }}
      {...props}
    >
      {children}
    </header>
  );
};

export const NavbarBrand = ({ children, className = '', style = {}, ...props }) => (
  <div 
    className={`ou-navbar-brand ${className}`} 
    style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0, ...style }}
    {...props}
  >
    {children}
  </div>
);

export const NavbarActions = ({ children, className = '', style = {}, ...props }) => (
  <div 
    className={`ou-navbar-actions ${className}`} 
    style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0, ...style }}
    {...props}
  >
    {children}
  </div>
);
