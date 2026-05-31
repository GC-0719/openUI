
export const Avatar = ({ 
  src, 
  alt = 'Avatar', 
  size = 'md', 
  ring = false, 
  className = '', 
  style = {},
  ...props 
}) => {
  const sizeMap = {
    sm: '32px',
    md: '40px',
    lg: '56px',
    xl: '80px'
  };

  const finalSize = sizeMap[size] || size;

  return (
    <div 
      className={`ou-avatar ${ring ? 'ou-avatar-ring' : ''} ${className}`}
      style={{ 
        width: finalSize, 
        height: finalSize, 
        borderRadius: '50%', 
        overflow: 'hidden', 
        border: ring ? '2px solid var(--primary)' : '1px solid var(--border)',
        flexShrink: 0,
        ...style 
      }}
      {...props}
    >
      {src ? (
        <img src={src} alt={alt} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        <div style={{ width: '100%', height: '100%', background: 'var(--surface-raised)', display: 'flex', alignItems: 'center', justifyCenter: 'center', fontSize: '12px' }}>
          {alt.charAt(0).toUpperCase()}
        </div>
      )}
    </div>
  );
};
