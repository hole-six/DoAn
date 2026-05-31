import { AlertTriangle, X } from 'lucide-react'
import { useEffect } from 'react'
import AppIcon from './AppIcon'

interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: 'danger' | 'warning' | 'info'
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  type = 'warning',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  const colors = {
    danger: { bg: '#fee2e2', border: '#dc2626', text: '#991b1b', button: '#dc2626' },
    warning: { bg: '#fef3c7', border: '#f59e0b', text: '#92400e', button: '#f59e0b' },
    info: { bg: '#dbeafe', border: '#0e4d7d', text: '#1e3a8a', button: '#0e4d7d' },
  }

  const color = colors[type]

  return (
    <>
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)',
          zIndex: 9998,
          animation: 'fadeIn 0.2s ease',
        }}
        onClick={onCancel}
      />
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: '#ffffff',
          borderRadius: '16px',
          padding: '24px',
          maxWidth: '480px',
          width: '90%',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          zIndex: 9999,
          animation: 'slideUp 0.3s ease',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '16px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: color.bg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <AppIcon icon={AlertTriangle} size={24} style={{ color: color.button }} />
          </div>
          <div style={{ flex: 1 }}>
            <h3
              style={{
                margin: 0,
                fontSize: '18px',
                fontWeight: 900,
                color: '#1f2937',
                marginBottom: '4px',
              }}
            >
              {title}
            </h3>
            <p
              style={{
                margin: 0,
                fontSize: '14px',
                color: '#6b7280',
                lineHeight: 1.5,
              }}
            >
              {message}
            </p>
          </div>
          <button
            onClick={onCancel}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#9ca3af',
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#1f2937')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#9ca3af')}
          >
            <AppIcon icon={X} size={20} />
          </button>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
          <button
            onClick={onCancel}
            style={{
              background: '#ffffff',
              border: '2px solid #e5e7eb',
              borderRadius: '10px',
              color: '#6b7280',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: 900,
              padding: '10px 20px',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#f9fafb'
              e.currentTarget.style.borderColor = '#d1d5db'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#ffffff'
              e.currentTarget.style.borderColor = '#e5e7eb'
            }}
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm()
              onCancel()
            }}
            style={{
              background: color.button,
              border: 'none',
              borderRadius: '10px',
              color: '#ffffff',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: 900,
              padding: '10px 20px',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = `0 6px 20px ${color.button}40`
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translate(-50%, -45%);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%);
          }
        }
      `}</style>
    </>
  )
}

// Hook để sử dụng ConfirmDialog dễ dàng hơn
export function useConfirm() {
  const [state, setState] = useState<{
    isOpen: boolean
    title: string
    message: string
    type: 'danger' | 'warning' | 'info'
    onConfirm: () => void
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'warning',
    onConfirm: () => {},
  })

  const confirm = (
    title: string,
    message: string,
    onConfirm: () => void,
    type: 'danger' | 'warning' | 'info' = 'warning'
  ) => {
    setState({ isOpen: true, title, message, type, onConfirm })
  }

  const close = () => {
    setState((prev) => ({ ...prev, isOpen: false }))
  }

  const ConfirmDialogComponent = () => (
    <ConfirmDialog
      isOpen={state.isOpen}
      title={state.title}
      message={state.message}
      type={state.type}
      onConfirm={state.onConfirm}
      onCancel={close}
    />
  )

  return { confirm, ConfirmDialogComponent }
}

function useState<T>(initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  // This is a placeholder - React's useState will be used in actual components
  return [initialValue, () => {}] as any
}
