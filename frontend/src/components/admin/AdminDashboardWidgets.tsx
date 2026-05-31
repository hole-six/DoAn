import { clsx } from 'clsx'
import type { LucideIcon } from 'lucide-react'
import { CheckCircle, AlertTriangle, Users, Briefcase, Building2, Server, Clock } from 'lucide-react'

import { Link } from 'react-router-dom'
import AppIcon from '../AppIcon'
import { ConfirmDialog } from '../ConfirmDialog'


export type ConfirmState = {
  title: string
  message: string
  type: 'danger' | 'warning' | 'info'
  onConfirm: () => void
} | null

export type StatTone = 'blue' | 'green' | 'red' | 'yellow'

export type StatCardModel = {
  icon: LucideIcon
  so: string
  nhan: string
  phu: string
  tone: StatTone
}

const toneClass: Record<StatTone, string> = {
  blue: 'bg-blue-100 text-[#0e4d7d]',
  green: 'bg-emerald-100 text-emerald-700',
  red: 'bg-red-100 text-red-600',
  yellow: 'bg-yellow-100 text-yellow-700',
}

export function StatCard({ item }: { item: StatCardModel }) {
  const Icon = item.icon
  return (
    <div key={item.nhan} className="grid min-w-0 gap-2 rounded-xl border border-slate-200 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
      <div className={clsx('inline-flex h-10 w-10 items-center justify-center rounded-lg', toneClass[item.tone])}>
        <AppIcon icon={Icon} size={20} />
      </div>
      <p className="text-[11px] font-black uppercase leading-snug tracking-wide text-slate-500">{item.nhan}</p>
      <strong className="text-[28px] font-black leading-none text-slate-950">{item.so}</strong>
      <span className="text-[11px] font-bold leading-snug text-slate-500">{item.phu}</span>
    </div>
  )
}

export type PendingJobModel = {
  id: string | number
  tieuDe: string
  congTy: string
  diaDiem: string
  thoiGian: string
  trangThai: string
}

export function PendingJobRow({
  tin,
  onReject,
  onApprove,
}: {
  tin: PendingJobModel
  onReject: (tin: PendingJobModel) => void
  onApprove: (tin: PendingJobModel) => void
}) {
  const actionButtonClass =
    'inline-flex min-h-10 items-center justify-center gap-1.5 rounded-lg px-3 text-sm font-black shadow-sm transition'

  return (
    <div className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50/80 p-3 transition hover:border-sky-200 hover:bg-white sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
      <div className="min-w-0">
        <div className="mb-1.5 flex flex-wrap items-center gap-2">
          <span
            className={clsx(
              'rounded-full px-2.5 py-1 text-[11px] font-black',
              tin.trangThai === 'Chờ lâu' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-[#0e4d7d]',
            )}
          >
            {tin.trangThai}
          </span>
          <span className="text-[11px] font-extrabold text-slate-400">{tin.thoiGian}</span>
        </div>
        <h3 className="line-clamp-2 text-sm font-black leading-snug text-slate-950">{tin.tieuDe}</h3>
        <p className="mt-1 text-xs font-bold leading-relaxed text-slate-500">
          {tin.congTy} - {tin.diaDiem}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-2 min-[420px]:grid-cols-2 sm:w-52">
        <button
          className={clsx(actionButtonClass, '!border !border-red-700 !bg-red-700 !text-white hover:!bg-red-800')}
          onClick={() => onReject(tin)}
        >
          <AppIcon icon={AlertTriangle} size={15} />
          Từ chối
        </button>
        <button
          className={clsx(actionButtonClass, '!border !border-[#062a4d] !bg-[#062a4d] !text-white hover:!bg-[#041b33]')}
          onClick={() => onApprove(tin)}
        >
          <AppIcon icon={CheckCircle} size={15} />
          Duyệt
        </button>
      </div>
    </div>
  )
}

export type AlertModel = {
  loai: 'error' | 'warning'
  icon: LucideIcon
  tieu: string
  moTa: string
}

export function AlertItem({ item }: { item: AlertModel }) {
  const Icon = item.icon

  return (
    <div
      key={item.tieu}
      className={clsx(
        'flex gap-3 rounded-xl border p-3',
        item.loai === 'error' ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-amber-200 bg-amber-50 text-amber-700',
      )}
    >
      <AppIcon icon={Icon} size={18} className="mt-0.5 shrink-0" />
      <div className="min-w-0">
        <strong className="block text-sm font-black text-slate-950">{item.tieu}</strong>
        <p className="mt-1 text-xs font-semibold leading-relaxed text-slate-500">{item.moTa}</p>
      </div>
    </div>
  )
}

export type QuickActionModel = {
  icon: LucideIcon
  label: string
  to: string
}

export function QuickActionCard({ item }: { item: QuickActionModel }) {
  const Icon = item.icon
  return (
    <Link
      to={item.to}
      className="grid min-h-24 place-items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-4 text-center text-xs font-black text-slate-900 shadow-[0_8px_22px_rgba(15,23,42,0.05)] transition hover:border-[#062a4d]/35 hover:bg-slate-50"
    >
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[#062a4d] text-white shadow-sm">
        <AppIcon icon={Icon} size={18} />
      </span>
      <span className="max-w-full leading-snug">{item.label}</span>
    </Link>
  )
}

export function useDummyConfirm() {
  // Placeholder for future refactor; actual confirm state is kept in page.
  return { Confirm: ConfirmDialog, state: null as ConfirmState }
}

// Re-export icons for convenience (optional)
export const Icons = {
  Users,
  Briefcase,
  Building2,
  Server,
  Clock,
  AlertTriangle,
}

