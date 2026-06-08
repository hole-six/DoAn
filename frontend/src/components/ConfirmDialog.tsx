import { AlertTriangle, X } from 'lucide-react'
import { createPortal } from 'react-dom'
import { useEffect, useState } from 'react'
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
    if (!isOpen) return
    const oldOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = oldOverflow
    }
  }, [isOpen])

  if (!isOpen) return null

  const colors = {
    danger: { bg: '#fee2e2', button: '#dc2626' },
    warning: { bg: '#fef3c7', button: '#f59e0b' },
    info: { bg: '#dbeafe', button: '#0e4d7d' },
  } as const

  const color = colors[type]

  return createPortal(
    <>
      <div
        className="fixed inset-0 z-[2147483646] bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div className="fixed left-1/2 top-1/2 z-[2147483647] w-[92vw] max-w-[480px] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-start gap-3">
          <div
            className="grid h-12 w-12 shrink-0 place-items-center rounded-full"
            style={{ backgroundColor: color.bg }}
          >
            <AppIcon icon={AlertTriangle} size={24} style={{ color: color.button }} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="m-0 text-lg font-black text-slate-900">{title}</h3>
            <p className="mt-1 text-sm font-medium leading-relaxed text-slate-600">{message}</p>
          </div>
          <button
            onClick={onCancel}
            className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            type="button"
            aria-label="Đóng"
          >
            <AppIcon icon={X} size={18} />
          </button>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onCancel}
            type="button"
            className="inline-flex min-h-10 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-black text-slate-700 transition hover:bg-slate-50"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm()
              onCancel()
            }}
            type="button"
            className="inline-flex min-h-10 items-center justify-center rounded-lg px-4 text-sm font-black text-white transition hover:brightness-95"
            style={{ backgroundColor: color.button }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </>,
    document.body,
  )
}

export function useConfirm() {
  const [state, setState] = useState<{
    isOpen: boolean
    title: string
    message: string
    confirmText?: string
    cancelText?: string
    type: 'danger' | 'warning' | 'info'
    onConfirm: () => void
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'warning',
    onConfirm: () => undefined,
  })

  const confirm = (
    title: string,
    message: string,
    onConfirm: () => void,
    type: 'danger' | 'warning' | 'info' = 'warning',
    confirmText?: string,
    cancelText?: string,
  ) => {
    setState({ isOpen: true, title, message, type, onConfirm, confirmText, cancelText })
  }

  const close = () => {
    setState(prev => ({ ...prev, isOpen: false }))
  }

  const ConfirmDialogComponent = () => (
    <ConfirmDialog
      isOpen={state.isOpen}
      title={state.title}
      message={state.message}
      type={state.type}
      confirmText={state.confirmText}
      cancelText={state.cancelText}
      onConfirm={state.onConfirm}
      onCancel={close}
    />
  )

  return { confirm, close, ConfirmDialogComponent }
}
