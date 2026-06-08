import type { ReactNode } from 'react'
import { X } from 'lucide-react'
import { Button } from './ui/Button'

export function DetailDrawer({
  title,
  subtitle,
  onClose,
  children,
  footer,
}: {
  title: string
  subtitle?: string
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
}) {
  return (
    <div className="fixed inset-0 z-[1000] bg-slate-950/50 backdrop-blur-sm" onClick={onClose}>
      <aside className="ml-auto flex h-dvh w-full max-w-[820px] flex-col bg-white shadow-2xl" onClick={event => event.stopPropagation()}>
        <header className="flex min-h-16 items-start justify-between gap-3 border-b border-slate-200 px-4 py-3">
          <div className="min-w-0">
            <h2 className="truncate text-lg font-black text-slate-950">{title}</h2>
            {subtitle && <p className="mt-1 text-sm font-semibold text-slate-500">{subtitle}</p>}
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X size={16} /> Đóng
          </Button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">{children}</div>
        {footer && <footer className="border-t border-slate-200 bg-slate-50 p-4">{footer}</footer>}
      </aside>
    </div>
  )
}
