import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Loader2 } from 'lucide-react'
import './button.css'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success'
type ButtonSize = 'sm' | 'md' | 'lg' | 'icon'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  icon?: ReactNode
}

export function Button({
  variant = 'secondary',
  size = 'md',
  loading,
  icon,
  className = '',
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`ui-btn ui-btn--${variant} ui-btn--${size} ${className}`.trim()}
    >
      <span className="ui-btn__icon" aria-hidden="true">
        {loading ? <Loader2 size={16} className="ui-btn__spinner" /> : icon}
      </span>
      {children && <span className="ui-btn__label">{children}</span>}
    </button>
  )
}

export function IconButton({ children, ...props }: Omit<ButtonProps, 'size'>) {
  return <Button {...props} size="icon">{children}</Button>
}

export function ButtonGroup({ children }: { children: ReactNode }) {
  return <div className="ui-btn-group">{children}</div>
}
