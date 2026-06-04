import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

export const Button = forwardRef(function Button(
  {
    children,
    variant = 'primary',
    size = 'md',
    className = '',
    icon: Icon,
    as: Component = 'button',
    loading = false,
    disabled,
    type = 'button',
    ...props
  },
  ref
) {
  const isDisabled = loading || disabled;
  const iconSize = size === 'sm' ? 14 : 16;

  return (
    <Component
      ref={ref}
      type={Component === 'button' ? type : undefined}
      className={`ou-btn ou-btn-${variant} ou-btn-${size} ${className}`.trim()}
      disabled={Component === 'button' ? isDisabled : undefined}
      aria-busy={loading || undefined}
      aria-disabled={isDisabled || undefined}
      {...props}
    >
      {loading ? (
        <>
          <Loader2
            size={iconSize}
            aria-hidden
            style={{ animation: 'spin 1s linear infinite' }}
          />
          <span className="ou-sr-only">Loading</span>
        </>
      ) : (
        Icon && <Icon size={iconSize} aria-hidden />
      )}
      {children}
    </Component>
  );
});

Button.displayName = 'Button';
