import { LoadingSpinner } from './LoadingStates'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  icon?: React.ReactNode
  children: React.ReactNode
}

type ButtonVariantStyle = {
  background: string
  color: string
  border: string
  hoverBg: string
  hoverBorder?: string
  hoverColor?: string
  shadow: string
  hoverShadow: string
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  children,
  disabled,
  className = '',
  style = {},
  ...props
}: ButtonProps) {
  const variants: Record<NonNullable<ButtonProps['variant']>, ButtonVariantStyle> = {
    primary: {
      background: 'linear-gradient(135deg, #0e4d7d 0%, #1a6ba8 100%)',
      color: '#ffffff',
      border: 'none',
      hoverBg: 'linear-gradient(135deg, #1a6ba8 0%, #0e4d7d 100%)',
      shadow: '0 4px 12px rgba(14, 77, 125, 0.25)',
      hoverShadow: '0 6px 20px rgba(14, 77, 125, 0.35)',
    },
    secondary: {
      background: '#ffffff',
      color: '#1f2937',
      border: '2px solid #e5e7eb',
      hoverBg: '#f9fafb',
      hoverBorder: '#0e4d7d',
      hoverColor: '#0e4d7d',
      shadow: 'none',
      hoverShadow: '0 4px 12px rgba(14, 77, 125, 0.15)',
    },
    danger: {
      background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
      color: '#ffffff',
      border: 'none',
      hoverBg: 'linear-gradient(135deg, #991b1b 0%, #dc2626 100%)',
      shadow: '0 4px 12px rgba(220, 38, 38, 0.25)',
      hoverShadow: '0 6px 20px rgba(220, 38, 38, 0.35)',
    },
    ghost: {
      background: 'transparent',
      color: '#6b7280',
      border: '1px solid transparent',
      hoverBg: '#f3f4f6',
      hoverColor: '#1f2937',
      shadow: 'none',
      hoverShadow: 'none',
    },
  }

  const sizes = {
    sm: { padding: '8px 16px', fontSize: '13px', minHeight: '36px', iconSize: 14 },
    md: { padding: '10px 20px', fontSize: '15px', minHeight: '44px', iconSize: 16 },
    lg: { padding: '14px 28px', fontSize: '16px', minHeight: '52px', iconSize: 18 },
  }

  const variantStyle = variants[variant]
  const sizeStyle = sizes[size]
  const isDisabled = disabled || loading

  return (
    <button
      {...props}
      disabled={isDisabled}
      className={`button-component ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        background: variantStyle.background,
        color: variantStyle.color,
        border: variantStyle.border,
        borderRadius: '12px',
        padding: sizeStyle.padding,
        fontSize: sizeStyle.fontSize,
        fontWeight: 900,
        minHeight: sizeStyle.minHeight,
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        opacity: isDisabled ? 0.6 : 1,
        transition: 'all 0.3s ease',
        boxShadow: variantStyle.shadow,
        whiteSpace: 'nowrap',
        ...style,
      }}
      onMouseEnter={(e) => {
        if (!isDisabled) {
          if (variantStyle.hoverBg) {
            e.currentTarget.style.background = variantStyle.hoverBg
          }
          if (variantStyle.hoverBorder) {
            e.currentTarget.style.borderColor = variantStyle.hoverBorder
          }
          if (variantStyle.hoverColor) {
            e.currentTarget.style.color = variantStyle.hoverColor
          }
          if (variantStyle.hoverShadow) {
            e.currentTarget.style.boxShadow = variantStyle.hoverShadow
          }
          e.currentTarget.style.transform = 'translateY(-2px)'
        }
      }}
      onMouseLeave={(e) => {
        if (!isDisabled) {
          e.currentTarget.style.background = variantStyle.background
          e.currentTarget.style.color = variantStyle.color
          if (variantStyle.border) {
            e.currentTarget.style.borderColor = variantStyle.border.includes('solid')
              ? variantStyle.border.split(' ')[2]
              : 'transparent'
          }
          e.currentTarget.style.boxShadow = variantStyle.shadow
          e.currentTarget.style.transform = 'translateY(0)'
        }
      }}
    >
      {loading ? (
        <>
          <LoadingSpinner size={sizeStyle.iconSize} />
          <span>Đang xử lý...</span>
        </>
      ) : (
        <>
          {icon}
          <span>{children}</span>
        </>
      )}
    </button>
  )
}

// Icon Button variant
interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

export function IconButton({
  icon,
  variant = 'ghost',
  size = 'md',
  loading = false,
  disabled,
  className = '',
  style = {},
  ...props
}: IconButtonProps) {
  const sizes = {
    sm: { size: 32, iconSize: 16 },
    md: { size: 40, iconSize: 18 },
    lg: { size: 48, iconSize: 20 },
  }

  const sizeStyle = sizes[size]

  return (
    <Button
      {...props}
      variant={variant}
      size={size}
      loading={loading}
      disabled={disabled}
      className={className}
      style={{
        width: sizeStyle.size,
        height: sizeStyle.size,
        minHeight: sizeStyle.size,
        padding: 0,
        ...style,
      }}
    >
      {loading ? <LoadingSpinner size={sizeStyle.iconSize} /> : icon}
    </Button>
  )
}
