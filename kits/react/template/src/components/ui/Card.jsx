
export const Card = ({ 
  children, 
  variant = 'default', 
  hover = false, 
  className = '', 
  style = {},
  ...props 
}) => {
  const baseClass = 'ou-card';
  const variantClass = variant !== 'default' ? `ou-card-${variant}` : '';
  const hoverClass = hover ? 'ou-card-hover' : '';

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
