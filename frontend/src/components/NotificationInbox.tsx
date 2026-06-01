import { useEffect, useMemo, useState } from 'react'
import { Check, ExternalLink, Inbox } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button, ButtonGroup } from './ui/Button'
import { apiCoXacThuc } from '../lib/auth'
import { formatDateTime } from '../lib/format'
import type { ThongBao } from '../types/recruitment'

const FILTERS = [
  { key: 'all', label: 'Tất cả' },
  { key: 'ho_so_ung_tuyen', label: 'Hồ sơ' },
  { key: 'lich_phong_van', label: 'Lịch phỏng vấn' },
  { key: 'ket_qua_phong_van', label: 'Kết quả' },
  { key: 'tin_nhan', label: 'Tin nhắn' },
  { key: 'he_thong', label: 'Hệ thống' },
]

export function NotificationInbox({ items, onReload }: { items: ThongBao[]; onReload: () => Promise<void> }) {
  const navigate = useNavigate()
  const [filter, setFilter] = useState('all')
  const [selectedId, setSelectedId] = useState('')
  const filtered = useMemo(() => items.filter(item => filter === 'all' || item.loai === filter), [filter, items])
  const selected = filtered.find(item => (item.id ?? item._id) === selectedId) ?? filtered[0]

  useEffect(() => {
    if (selected && !filtered.some(item => (item.id ?? item._id) === selectedId)) setSelectedId(String(selected.id ?? selected._id ?? ''))
  }, [filtered, selected, selectedId])

  const markRead = async (item?: ThongBao) => {
    const id = item?.id ?? item?._id
    if (!id) return
    await apiCoXacThuc(`/thongbao/${id}/danh-dau-da-doc`, { method: 'PATCH' })
    await onReload()
  }

  const openLink = async (item?: ThongBao, url?: string) => {
    if (!item && !url) return
    if (item && !item.daDoc) await markRead(item)
    const target = url ?? item?.lienKet
    if (target) navigate(target)
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)_minmax(320px,420px)]">
      <aside className="rounded-2xl border border-slate-200 bg-white p-3">
        <div className="mb-3 flex min-h-10 items-center gap-2 px-2 text-sm font-black text-slate-800"><Inbox size={16} /> Bộ lọc</div>
        <div className="grid grid-cols-2 gap-1 sm:grid-cols-3 lg:grid-cols-1">
          {FILTERS.map(item => (
            <button key={item.key} className={`min-h-10 rounded-xl px-3 text-left text-sm font-black ${filter === item.key ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`} onClick={() => setFilter(item.key)}>
              {item.label}
            </button>
          ))}
        </div>
      </aside>

      <section className="min-w-0 rounded-2xl border border-slate-200 bg-white">
        <div className="flex min-h-14 flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-4 py-2">
          <strong className="text-sm text-slate-900">{filtered.length} thông báo</strong>
          <Button size="sm" icon={<Check size={15} />} onClick={async () => { await apiCoXacThuc('/thongbao/danh-dau-tat-ca-da-doc', { method: 'POST' }); await onReload() }}>Đọc tất cả</Button>
        </div>
        <div className="max-h-[520px] overflow-auto">
          {filtered.map(item => {
            const id = item.id ?? item._id ?? item.tieuDe
            const active = id === (selected?.id ?? selected?._id)
            return (
              <button key={id} className={`grid w-full min-w-0 gap-1 border-b border-slate-100 p-4 text-left ${active ? 'bg-blue-50' : 'bg-white hover:bg-slate-50'}`} onClick={() => setSelectedId(String(id))}>
                <span className="flex min-w-0 items-start justify-between gap-3">
                  <strong className="min-w-0 break-words text-sm text-slate-950">{item.tieuDe}</strong>
                  {!item.daDoc && <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-blue-600" />}
                </span>
                <span className="line-clamp-2 break-words text-sm font-semibold leading-6 text-slate-600">{item.noiDung}</span>
                <span className="text-xs font-bold text-slate-400">{formatDateTime(item.ngayTao)}</span>
              </button>
            )
          })}
          {!filtered.length && <div className="grid min-h-56 place-items-center p-6 text-sm font-bold text-slate-500">Không có thông báo.</div>}
        </div>
      </section>

      <aside className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5">
        {selected ? (
          <div className="grid gap-4">
            <div>
              <h2 className="break-words text-lg font-black text-slate-950">{selected.tieuDe}</h2>
              <p className="mt-2 break-words text-sm font-semibold leading-7 text-slate-600">{selected.noiDung}</p>
              <p className="mt-3 text-xs font-bold text-slate-400">{formatDateTime(selected.ngayTao)}</p>
            </div>
            <ButtonGroup>
              {!selected.daDoc && <Button icon={<Check size={16} />} onClick={() => void markRead(selected)}>Đánh dấu đã đọc</Button>}
              {selected.lienKet && <Button variant="primary" icon={<ExternalLink size={16} />} onClick={() => void openLink(selected)}>Mở xử lý</Button>}
            </ButtonGroup>
            {selected.hanhDong?.length ? (
              <div className="grid gap-2">
                {selected.hanhDong.map(action => (
                  <Button key={`${action.nhan}-${action.url}`} variant={action.loai === 'danger' ? 'danger' : action.loai === 'primary' ? 'primary' : 'secondary'} onClick={() => void openLink(selected, action.url)}>
                    {action.nhan}
                  </Button>
                ))}
              </div>
            ) : null}
          </div>
        ) : (
          <div className="grid min-h-56 place-items-center text-center text-sm font-bold text-slate-500">Chọn thông báo để xem chi tiết.</div>
        )}
      </aside>
    </div>
  )
}
