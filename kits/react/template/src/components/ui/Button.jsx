import { Loader2 } from 'lucide-react';

export const Button = ({ children, variant = 'primary', size = 'md', className = '', icon: Icon, as: Component = 'button', loading = false, ...props }) => (
  <Component
    className={`ou-btn ou-btn-${variant} ou-btn-${size} ${className}`}
    disabled={loading || props.disabled}
    {...props}
  >
    {loading
      ? <Loader2 size={size === 'sm' ? 14 : 16} style={{ animation: 'spin 1s linear infinite' }} />
      : Icon && <Icon size={size === 'sm' ? 14 : 16} />
    }
    {children}
  </Component>
);
