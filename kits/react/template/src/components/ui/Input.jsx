import { forwardRef, useId } from 'react';

export const Input = forwardRef(function Input(
  {
    icon: Icon,
    variant = 'default',
    error = false,
    label,
    hint,
    className = '',
    style = {},
    id: idProp,
    required,
    ...props
  },
  ref
) {
  const autoId = useId();
  const inputId = idProp || `ou-input-${autoId.replace(/:/g, '')}`;
  const errorId = `${inputId}-error`;
  const hintId = `${inputId}-hint`;
  const errorMessage = typeof error === 'string' ? error : '';
  const hasError = Boolean(error);
  const describedBy = [
    errorMessage ? errorId : null,
    hint && !errorMessage ? hintId : null,
  ]
    .filter(Boolean)
    .join(' ') || undefined;

  const baseClass = 'ou-input-wrapper';
  const variantClass = variant === 'glass' ? 'ou-input-glass' : '';
  const errorClass = hasError ? 'ou-input-error' : '';

  return (
    <div
      className={`${baseClass} ${variantClass} ${errorClass} ${className}`.trim()}
      style={{ position: 'relative', width: '100%', ...style }}
    >
      {label && (
        <label htmlFor={inputId} className="ou-input-label" style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>
          {label}
          {required && <span aria-hidden style={{ color: 'var(--accent)', marginLeft: 2 }}>*</span>}
        </label>
      )}
      {Icon && (
        <div
          aria-hidden
          style={{
            position: 'absolute',
            left: '12px',
            top: label ? '38px' : '50%',
            transform: label ? 'none' : 'translateY(-50%)',
            color: 'var(--text-dim)',
            pointerEvents: 'none',
          }}
        >
          <Icon size={16} />
        </div>
      )}
      <input
        ref={ref}
        id={inputId}
        className="ou-input"
        required={required}
        aria-invalid={hasError || undefined}
        aria-describedby={describedBy}
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
          transition: 'all 0.2s',
        }}
        {...props}
      />
      {errorMessage && (
        <span id={errorId} role="alert" style={{ fontSize: '12px', color: 'var(--accent)', marginTop: '4px', display: 'block' }}>
          {errorMessage}
        </span>
      )}
      {hint && !errorMessage && (
        <span id={hintId} style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '4px', display: 'block' }}>
          {hint}
        </span>
      )}
    </div>
  );
});

Input.displayName = 'Input';
