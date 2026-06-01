import type { ReactNode } from 'react'
import { Button } from '../../../components/ui/Button'

export function AdminPage({ title, desc, action, children }: { title: string; desc: string; action?: ReactNode; children: ReactNode }) {
  return (
    <div className="mx-auto grid w-full max-w-[1400px] gap-4 pb-24 sm:pb-6">
      <header className="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="text-[11px] font-black uppercase tracking-[0.12em] text-sky-800">ITJob Admin</p><h1 className="mt-1 text-2xl font-black text-slate-950">{title}</h1><p className="mt-1 text-sm font-semibold text-slate-500">{desc}</p></div>
        {action}
      </header>
      {children}
    </div>
  )
}

export function AdminPanel({ children }: { children: ReactNode }) {
  return <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_6px_18px_rgba(15,23,42,0.05)]">{children}</section>
}

export function AdminTable({ heads, children, minWidth = 820 }: { heads: string[]; children: ReactNode; minWidth?: number }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200">
      <table className="w-full border-collapse text-left" style={{ minWidth }}>
        <thead><tr>{heads.map(head => <th key={head} className="bg-slate-50 px-3 py-2.5 text-xs font-black uppercase tracking-wide text-slate-500">{head}</th>)}</tr></thead>
        <tbody className="[&_td]:border-t [&_td]:border-slate-100 [&_td]:px-3 [&_td]:py-3 [&_td]:align-middle">{children}</tbody>
      </table>
    </div>
  )
}

export function EmptyRow({ cols }: { cols: number }) {
  return <tr><td colSpan={cols} className="py-10 text-center text-sm font-bold text-slate-400">Không có dữ liệu phù hợp.</td></tr>
}

export function RefreshButton({ onClick }: { onClick: () => void }) {
  return <Button onClick={onClick}>Làm mới</Button>
}
