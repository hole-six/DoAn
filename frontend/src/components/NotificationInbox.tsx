import { useMemo, useState } from 'react'
import { Check, ExternalLink, Eye, Inbox, MessageCircle, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useThongBao } from '../contexts/ThongBaoContext'
import { formatDateTime } from '../lib/format'
import type { ThongBao } from '../types/recruitment'
import { Button } from './ui/Button'

type Props = {
  items: ThongBao[]
  onReload: () => Promise<void> | void
}

const FILTERS = [
  { key: 'all', label: 'Tất cả', icon: Inbox },
  { key: 'ho_so_ung_tuyen', label: 'Hồ sơ', icon: Eye },
  { key: 'lich_phong_van', label: 'Lịch phỏng vấn', icon: Check },
  { key: 'ket_qua_phong_van', label: 'Kết quả', icon: Check },
  { key: 'tin_nhan', label: 'Tin nhắn', icon: MessageCircle },
  { key: 'he_thong', label: 'Hệ thống', icon: Inbox },
] as const

function notificationId(item: ThongBao) {
  return item.id ?? item._id ?? ''
}

function priorityLabel(value?: string) {
  if (value === 'khan_cap') return 'Khẩn cấp'
  if (value === 'cao') return 'Ưu tiên cao'
  if (value === 'thap') return 'Ưu tiên thấp'
  return 'Thông báo'
}

export function NotificationInbox({ items, onReload }: Props) {
  const navigate = useNavigate()
  const { danhDauDaDoc, danhDauTatCaDaDoc } = useThongBao()
  const [filter, setFilter] = useState<string>('all')
  const [selected, setSelected] = useState<ThongBao | null>(null)
  const [busy, setBusy] = useState('')

  const unreadCount = items.filter(item => !item.daDoc).length
  const filterCounts = useMemo(() => {
    const counts = new Map<string, number>()
    items.forEach(item => {
      const type = item.loai ?? 'he_thong'
      counts.set(type, (counts.get(type) ?? 0) + 1)
    })
    return counts
  }, [items])
  const filteredItems = useMemo(
    () => (filter === 'all' ? items : items.filter(item => (item.loai ?? 'he_thong') === filter)),
    [filter, items],
  )

  const markRead = async (item: ThongBao) => {
    const id = notificationId(item)
    if (!id || item.daDoc) return
    setBusy(id)
    try {
      await danhDauDaDoc(id)
      await onReload()
      setSelected(prev => (prev && notificationId(prev) === id ? { ...prev, daDoc: true } : prev))
    } finally {
      setBusy('')
    }
  }

  const markAllRead = async () => {
    if (!unreadCount) return
    setBusy('all')
    try {
      await danhDauTatCaDaDoc()
      await onReload()
      setSelected(prev => (prev ? { ...prev, daDoc: true } : prev))
    } finally {
      setBusy('')
    }
  }

  const openLink = async (item: ThongBao, link?: string) => {
    await markRead(item)
    const target = link ?? item.lienKet
    if (target) navigate(target)
  }

  return (
    <section className="grid gap-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 gap-3">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-sky-50 text-sky-700">
              <Inbox size={22} />
            </span>
            <div className="min-w-0">
              <h2 className="text-xl font-black text-slate-950">{items.length} thông báo</h2>
              <p className="mt-1 text-sm font-semibold text-slate-500">
                {unreadCount ? `${unreadCount} thông báo chưa đọc` : 'Tất cả thông báo đã được đọc'}
              </p>
            </div>
          </div>
          <Button icon={<Check size={16} />} disabled={!unreadCount || busy === 'all'} loading={busy === 'all'} onClick={() => void markAllRead()}>
            Đọc tất cả
          </Button>
        </div>

        <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
          {FILTERS.map(({ key, label, icon: Icon }) => {
            const active = filter === key
            const count = key === 'all' ? items.length : filterCounts.get(key) ?? 0
            return (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key)}
                className={`inline-flex shrink-0 items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-black transition ${
                  active
                    ? 'notification-filter-active border-sky-700 bg-gradient-to-r from-sky-700 to-cyan-600 text-white shadow-[0_12px_24px_rgba(3,105,161,0.24)]'
                    : 'border-slate-200 bg-slate-50 text-slate-700 shadow-sm hover:border-sky-300 hover:bg-white hover:text-sky-800'
                }`}
              >
                <span className={`grid h-6 w-6 place-items-center rounded-full ${active ? 'bg-white/15 text-white' : 'bg-white text-sky-700 ring-1 ring-slate-200'}`}>
                  <Icon size={14} />
                </span>
                {label}
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-black ${active ? 'bg-white/20 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200'}`}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        {filteredItems.length === 0 ? (
          <div className="grid min-h-[260px] place-items-center p-8 text-center">
            <div>
              <Inbox className="mx-auto text-slate-300" size={44} />
              <p className="mt-4 text-base font-black text-slate-700">Không có thông báo trong mục này.</p>
              <p className="mt-2 text-sm font-semibold text-slate-500">Khi có cập nhật mới, hệ thống sẽ hiển thị tại đây.</p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredItems.map(item => {
              const id = notificationId(item)
              return (
                <article
                  key={id}
                  className={`relative grid gap-3 p-4 transition hover:bg-slate-50 sm:grid-cols-[1fr_auto] sm:items-center sm:p-5 ${
                    item.daDoc ? 'bg-white' : 'bg-sky-50/50'
                  }`}
                >
                  {!item.daDoc && <span className="absolute left-0 top-5 h-10 w-1 rounded-r-full bg-sky-600" />}
                  <button type="button" className="min-w-0 text-left" onClick={() => setSelected(item)}>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="min-w-0 break-words text-base font-black text-slate-950">{item.tieuDe}</h3>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-black ${item.daDoc ? 'bg-slate-100 text-slate-500' : 'bg-sky-600 text-white'}`}>
                        {item.daDoc ? 'Đã đọc' : 'Mới'}
                      </span>
                      <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-black text-amber-700">
                        {priorityLabel((item as any).mucDoUuTien)}
                      </span>
                    </div>
                    <p className="mt-2 line-clamp-2 break-words text-sm font-semibold leading-6 text-slate-600">{item.noiDung}</p>
                    <p className="mt-2 text-xs font-black uppercase tracking-wide text-slate-400">{formatDateTime(item.ngayTao)}</p>
                  </button>
                  <div className="flex flex-wrap gap-2 sm:justify-end">
                    <Button size="sm" icon={<Eye size={15} />} onClick={() => setSelected(item)}>
                      Xem chi tiết
                    </Button>
                    {item.lienKet && (
                      <Button size="sm" variant="primary" icon={<ExternalLink size={15} />} onClick={() => void openLink(item)}>
                        Mở xử lý
                      </Button>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 z-[1000] bg-slate-950/45 p-3 backdrop-blur-sm sm:p-6" role="dialog" aria-modal="true">
          <div className="mx-auto flex h-full max-w-2xl items-center">
            <div className="max-h-[calc(100vh-32px)] w-full overflow-hidden rounded-2xl bg-white shadow-2xl">
              <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-5">
                <div className="min-w-0">
                  <span className="inline-flex rounded-full bg-sky-50 px-3 py-1 text-xs font-black uppercase tracking-wide text-sky-700">
                    {priorityLabel((selected as any).mucDoUuTien)}
                  </span>
                  <h3 className="mt-3 break-words text-2xl font-black text-slate-950">{selected.tieuDe}</h3>
                  <p className="mt-1 text-sm font-bold text-slate-400">{formatDateTime(selected.ngayTao)}</p>
                </div>
                <button type="button" className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50" onClick={() => setSelected(null)}>
                  <X size={18} />
                </button>
              </div>
              <div className="max-h-[55vh] overflow-y-auto p-5">
                <p className="whitespace-pre-wrap break-words text-base font-semibold leading-7 text-slate-700">{selected.noiDung}</p>
              </div>
              <div className="flex flex-col gap-2 border-t border-slate-100 p-5 sm:flex-row sm:flex-wrap sm:justify-end">
                {!selected.daDoc && (
                  <Button icon={<Check size={16} />} loading={busy === notificationId(selected)} onClick={() => void markRead(selected)}>
                    Đánh dấu đã đọc
                  </Button>
                )}
                {selected.hanhDong?.map(action => (
                  <Button key={`${action.nhan}-${action.url}`} variant={action.loai === 'primary' ? 'primary' : 'secondary'} icon={<ExternalLink size={16} />} onClick={() => void openLink(selected, action.url)}>
                    {action.nhan}
                  </Button>
                ))}
                {selected.lienKet && (
                  <Button variant="primary" icon={<ExternalLink size={16} />} onClick={() => void openLink(selected)}>
                    Mở xử lý
                  </Button>
                )}
                <Button variant="ghost" onClick={() => setSelected(null)}>Đóng</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
