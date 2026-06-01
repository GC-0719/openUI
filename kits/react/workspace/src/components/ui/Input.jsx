
export const Input = ({ 
  icon: Icon, 
  variant = 'default', 
  error = false, 
  className = '', 
  style = {},
  ...props 
}) => {
  const baseClass = 'ou-input-wrapper';
  const variantClass = variant === 'glass' ? 'ou-input-glass' : '';
  const errorClass = error ? 'ou-input-error' : '';

  return (
    <div className={`${baseClass} ${variantClass} ${errorClass} ${className}`} style={{ position: 'relative', width: '100%', ...style }}>
      {Icon && (
        <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)', pointerEvents: 'none' }}>
          <Icon size={16} />
        </div>
      )}
      <input 
        className="ou-input" 
        style={{ 
          width: '100%', 
          paddingLeft: Icon ? '40px' : '16px',
          paddingRight: '16px',
          height: '44px',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          color: 'var(--text)',
          outline: 'none',
          transition: 'all 0.2s'
        }}
        {...props} 
      />
      {error && typeof error === 'string' && (
        <span style={{ fontSize: '12px', color: 'var(--accent)', marginTop: '4px', display: 'block' }}>{error}</span>
      )}
    </div>
  );
};
