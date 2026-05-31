interface CardProps {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
  padding?: 'none' | 'sm' | 'md' | 'lg'
  hover?: boolean
  onClick?: () => void
}

export function Card({
  children,
  className = '',
  style = {},
  padding = 'md',
  hover = false,
  onClick,
}: CardProps) {
  const paddings = {
    none: '0',
    sm: '16px',
    md: '22px',
    lg: '32px',
  }

  return (
    <div
      className={`card-component ${className}`}
      onClick={onClick}
      style={{
        background: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: '16px',
        padding: paddings[padding],
        boxShadow: '0 2px 8px rgba(14, 77, 125, 0.06)',
        transition: 'all 0.3s ease',
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}
      onMouseEnter={(e) => {
        if (hover || onClick) {
          e.currentTarget.style.transform = 'translateY(-4px)'
          e.currentTarget.style.boxShadow = '0 10px 40px rgba(14, 77, 125, 0.12)'
        }
      }}
      onMouseLeave={(e) => {
        if (hover || onClick) {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(14, 77, 125, 0.06)'
        }
      }}
    >
      {children}
    </div>
  )
}

interface CardHeaderProps {
  title: string
  subtitle?: string
  action?: React.ReactNode
  icon?: React.ReactNode
}

export function CardHeader({ title, subtitle, action, icon }: CardHeaderProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: '16px',
        marginBottom: subtitle ? '8px' : '16px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
        {icon && (
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #e0f2fe 0%, #dbeafe 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0e4d7d',
              flexShrink: 0,
            }}
          >
            {icon}
          </div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3
            style={{
              margin: 0,
              fontSize: '18px',
              fontWeight: 900,
              color: '#1f2937',
              lineHeight: 1.2,
            }}
          >
            {title}
          </h3>
          {subtitle && (
            <p
              style={{
                margin: '4px 0 0',
                fontSize: '14px',
                color: '#6b7280',
                lineHeight: 1.4,
              }}
            >
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {action && <div style={{ flexShrink: 0 }}>{action}</div>}
    </div>
  )
}

export function CardBody({ children }: { children: React.ReactNode }) {
  return <div style={{ marginTop: '16px' }}>{children}</div>
}

export function CardFooter({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        marginTop: '20px',
        paddingTop: '16px',
        borderTop: '1px solid #f3f4f6',
        display: 'flex',
        gap: '12px',
        justifyContent: 'flex-end',
      }}
    >
      {children}
    </div>
  )
}

// KPI Card Component
interface KpiCardProps {
  icon: React.ReactNode
  label: string
  value: string | number
  trend?: {
    value: number
    isPositive: boolean
  }
  color?: string
  onClick?: () => void
}

export function KpiCard({ icon, label, value, trend, color = '#0e4d7d', onClick }: KpiCardProps) {
  return (
    <Card
      padding="md"
      hover
      onClick={onClick}
      style={{
        minHeight: '124px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: `${color}18`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: color,
          }}
        >
          {icon}
        </div>
        {trend && (
          <div
            style={{
              fontSize: '13px',
              fontWeight: 900,
              color: trend.isPositive ? '#059669' : '#dc2626',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
          </div>
        )}
      </div>
      <div style={{ marginTop: '12px' }}>
        <p
          style={{
            margin: 0,
            fontSize: '14px',
            fontWeight: 700,
            color: '#6b7280',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          {label}
        </p>
        <strong
          style={{
            display: 'block',
            marginTop: '4px',
            fontSize: 'clamp(28px, 4vw, 38px)',
            fontWeight: 900,
            color: '#1f2937',
            lineHeight: 1,
          }}
        >
          {value}
        </strong>
      </div>
    </Card>
  )
}
