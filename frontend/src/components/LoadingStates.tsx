import type { CSSProperties } from 'react'
import { Briefcase, AlertCircle, RefreshCw } from 'lucide-react'
import AppIcon from './AppIcon'

// Loading Skeleton cho Dashboard
export function DashboardSkeleton() {
  return (
    <div style={{ animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}>
      {/* Hero Skeleton */}
      <div
        style={{
          background: 'linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%)',
          borderRadius: '16px',
          height: '180px',
          marginBottom: '24px',
        }}
      />

      {/* Stats Grid Skeleton */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{
              background: '#e5e7eb',
              borderRadius: '16px',
              height: '120px',
            }}
          />
        ))}
      </div>

      {/* Content Skeleton */}
      <div style={{ display: 'grid', gap: '24px', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))' }}>
        {[1, 2].map((i) => (
          <div
            key={i}
            style={{
              background: '#e5e7eb',
              borderRadius: '16px',
              height: '300px',
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  )
}

// Empty State Component
interface EmptyStateProps {
  icon?: React.ComponentType<{ size?: number; className?: string; style?: CSSProperties }>
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
}

export function EmptyState({ 
  icon: Icon = Briefcase, 
  title, 
  description, 
  actionLabel, 
  onAction 
}: EmptyStateProps) {
  return (
    <div
      style={{
        textAlign: 'center',
        padding: '60px 20px',
        background: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e5e7eb',
      }}
    >
      <div
        style={{
          width: '80px',
          height: '80px',
          margin: '0 auto 20px',
          background: '#f3f4f6',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <AppIcon icon={Icon as any} size={40} style={{ color: '#9ca3af' }} />
      </div>
      <h3
        style={{
          fontSize: '20px',
          fontWeight: 900,
          color: '#1f2937',
          marginBottom: '8px',
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontSize: '15px',
          color: '#6b7280',
          marginBottom: actionLabel ? '24px' : '0',
          lineHeight: 1.6,
        }}
      >
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="primary-button"
          style={{
            background: 'linear-gradient(135deg, #0e4d7d 0%, #1a6ba8 100%)',
            border: 'none',
            borderRadius: '12px',
            color: '#ffffff',
            cursor: 'pointer',
            fontSize: '15px',
            fontWeight: 900,
            padding: '12px 24px',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(14, 77, 125, 0.35)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = 'none'
          }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}

// Error State Component
interface ErrorStateProps {
  title?: string
  message: string
  onRetry?: () => void
}

export function ErrorState({ 
  title = 'Có lỗi xảy ra', 
  message, 
  onRetry 
}: ErrorStateProps) {
  return (
    <div
      style={{
        textAlign: 'center',
        padding: '60px 20px',
        background: '#ffffff',
        borderRadius: '16px',
        border: '2px solid #fee2e2',
      }}
    >
      <div
        style={{
          width: '80px',
          height: '80px',
          margin: '0 auto 20px',
          background: '#fee2e2',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <AppIcon icon={AlertCircle} size={40} style={{ color: '#dc2626' }} />
      </div>
      <h3
        style={{
          fontSize: '20px',
          fontWeight: 900,
          color: '#991b1b',
          marginBottom: '8px',
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontSize: '15px',
          color: '#6b7280',
          marginBottom: onRetry ? '24px' : '0',
          lineHeight: 1.6,
        }}
      >
        {message}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            background: '#ffffff',
            border: '2px solid #dc2626',
            borderRadius: '12px',
            color: '#dc2626',
            cursor: 'pointer',
            fontSize: '15px',
            fontWeight: 900,
            padding: '12px 24px',
            transition: 'all 0.3s ease',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#dc2626'
            e.currentTarget.style.color = '#ffffff'
            e.currentTarget.style.transform = 'translateY(-2px)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#ffffff'
            e.currentTarget.style.color = '#dc2626'
            e.currentTarget.style.transform = 'translateY(0)'
          }}
        >
          <AppIcon icon={RefreshCw} />
          Thử lại
        </button>
      )}
    </div>
  )
}

// Loading Spinner Component
export function LoadingSpinner({ size = 40 }: { size?: number }) {
  return (
    <div
      style={{
        display: 'inline-block',
        width: size,
        height: size,
        border: '4px solid #e5e7eb',
        borderTop: '4px solid #0e4d7d',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
      }}
    >
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
