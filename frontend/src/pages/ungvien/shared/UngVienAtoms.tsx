import type { ReactNode } from 'react'
import { clsx } from 'clsx'
import { Button } from '../../../components/ui/Button'
import type { Tone } from '../../../lib/statusLabels'
import '../../nhatuyendung/ntd-styles.css'

const toneClass: Record<Tone, string> = {
  blue: 'border-sky-200 bg-sky-50 text-sky-800',
  green: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  yellow: 'border-amber-200 bg-amber-50 text-amber-800',
  red: 'border-rose-200 bg-rose-50 text-rose-800',
  gray: 'border-slate-200 bg-slate-50 text-slate-700',
}

export function Page({ title, desc, action, children }: { title: string; desc: string; action?: ReactNode; children: ReactNode }) {
  return (
    <div className="ntd-page mx-auto grid w-full max-w-[1360px] gap-4 pb-24 sm:pb-6">
      <header className="ntd-header flex min-w-0 flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="text-[11px] font-black uppercase tracking-[0.12em] text-sky-800">ITJob Candidate</p>
          <h1 className="mt-1 break-words text-2xl font-black leading-tight text-slate-950">{title}</h1>
          <p className="mt-1 max-w-3xl text-sm font-semibold leading-relaxed text-slate-500">{desc}</p>
        </div>
        {action && <div className="flex shrink-0 flex-wrap gap-2">{action}</div>}
      </header>
      {children}
    </div>
  )
}

export function Panel({ title, action, children, className }: { title?: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={clsx('ntd-panel min-w-0 rounded-xl border border-slate-200 bg-white p-4 shadow-[0_6px_18px_rgba(15,23,42,0.05)]', className)}>
      {(title || action) && (
        <div className="mb-3 flex min-w-0 items-center justify-between gap-3">
          {title && <h2 className="truncate text-base font-black text-slate-950">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  )
}

export function Badge({ children, tone = 'blue' }: { children: ReactNode; tone?: Tone }) {
  return <span className={clsx('ntd-badge inline-flex w-fit items-center rounded-full border px-2.5 py-1 text-xs font-black', tone, toneClass[tone])}>{children}</span>
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm font-bold text-slate-500">{children}</div>
}

export function ErrorState({ message }: { message?: string }) {
  return message ? <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-extrabold text-rose-700">{message}</div> : null
}

export function Row({ children, active, onClick }: { children: ReactNode; active?: boolean; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        'grid w-full min-w-0 gap-2 rounded-xl border p-3 text-left transition-colors sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center',
        active ? 'border-sky-300 bg-sky-50' : 'border-slate-200 bg-white hover:border-sky-200 hover:bg-slate-50',
      )}
    >
      {children}
    </button>
  )
}

export function Drawer({ title, onClose, children, footer }: { title: string; onClose: () => void; children: ReactNode; footer?: ReactNode }) {
  return (
    <div className="fixed inset-0 z-[300] bg-slate-950/45 backdrop-blur-sm" onClick={onClose}>
      <aside className="ml-auto flex h-dvh w-full max-w-[720px] flex-col bg-white shadow-2xl" onClick={event => event.stopPropagation()}>
        <header className="flex min-h-16 items-center justify-between border-b border-slate-200 px-4">
          <h2 className="min-w-0 truncate text-lg font-black text-slate-950">{title}</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>Đóng</Button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto p-4">{children}</div>
        {footer && <footer className="border-t border-slate-200 bg-slate-50 p-4">{footer}</footer>}
      </aside>
    </div>
  )
}
