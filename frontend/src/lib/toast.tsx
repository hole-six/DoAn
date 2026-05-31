import { createRoot } from 'react-dom/client'
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react'
import { useEffect, useState } from 'react'

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface ToastProps {
  id: string
  type: ToastType
  message: string
  duration?: number
  onClose: (id: string) => void
}

const toastIcons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
}

const toastColors = {
  success: { bg: '#d1fae5', border: '#059669', text: '#065f46', icon: '#059669' },
  error: { bg: '#fee2e2', border: '#dc2626', text: '#991b1b', icon: '#dc2626' },
  warning: { bg: '#fef3c7', border: '#f59e0b', text: '#92400e', icon: '#f59e0b' },
  info: { bg: '#dbeafe', border: '#0e4d7d', text: '#1e3a8a', icon: '#0e4d7d' },
}

function ToastItem({ id, type, message, duration = 4000, onClose }: ToastProps) {
  const [isExiting, setIsExiting] = useState(false)
  const Icon = toastIcons[type]
  const colors = toastColors[type]

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true)
      setTimeout(() => onClose(id), 300)
    }, duration)

    return () => clearTimeout(timer)
  }, [id, duration, onClose])

  const handleClose = () => {
    setIsExiting(true)
    setTimeout(() => onClose(id), 300)
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        background: colors.bg,
        border: `2px solid ${colors.border}`,
        borderRadius: '12px',
        padding: '14px 16px',
        minWidth: '320px',
        maxWidth: '480px',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
        animation: isExiting ? 'slideOut 0.3s ease forwards' : 'slideIn 0.3s ease forwards',
        marginBottom: '12px',
      }}
    >
      <Icon size={22} style={{ color: colors.icon, flexShrink: 0 }} />
      <p style={{ flex: 1, margin: 0, color: colors.text, fontSize: '15px', fontWeight: 700, lineHeight: 1.4 }}>
        {message}
      </p>
      <button
        onClick={handleClose}
        style={{
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: colors.text,
          opacity: 0.6,
          transition: 'opacity 0.2s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.6')}
      >
        <X size={18} />
      </button>
    </div>
  )
}

function ToastContainer({ toasts, onClose }: { toasts: ToastProps[]; onClose: (id: string) => void }) {
  return (
    <>
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes slideOut {
          from {
            opacity: 1;
            transform: translateX(0);
          }
          to {
            opacity: 0;
            transform: translateX(100%);
          }
        }
      `}</style>
      <div
        style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
        }}
      >
        {toasts.map((toast) => (
          <ToastItem key={toast.id} {...toast} onClose={onClose} />
        ))}
      </div>
    </>
  )
}

class ToastManager {
  private container: HTMLDivElement | null = null
  private root: any = null
  private toasts: ToastProps[] = []

  private ensureContainer() {
    if (!this.container) {
      this.container = document.createElement('div')
      this.container.id = 'toast-container'
      document.body.appendChild(this.container)
      this.root = createRoot(this.container)
    }
  }

  private render() {
    this.ensureContainer()
    this.root.render(
      <ToastContainer
        toasts={this.toasts}
        onClose={(id) => {
          this.toasts = this.toasts.filter((t) => t.id !== id)
          this.render()
        }}
      />
    )
  }

  private show(type: ToastType, message: string, duration?: number) {
    const id = `toast-${Date.now()}-${Math.random()}`
    this.toasts.push({ id, type, message, duration, onClose: () => {} })
    this.render()
  }

  success(message: string, duration?: number) {
    this.show('success', message, duration)
  }

  error(message: string, duration?: number) {
    this.show('error', message, duration)
  }

  warning(message: string, duration?: number) {
    this.show('warning', message, duration)
  }

  info(message: string, duration?: number) {
    this.show('info', message, duration)
  }
}

export const toast = new ToastManager()
