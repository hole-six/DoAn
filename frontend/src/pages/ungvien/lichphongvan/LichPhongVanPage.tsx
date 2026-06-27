import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Building2, CalendarDays, Clock, ExternalLink, MapPin, Monitor, Search, X } from 'lucide-react'
import { PhanTrang, usePhanTrang } from '../../../components/PhanTrang'
import { useConfirm } from '../../../components/ConfirmDialog'
import { DetailDrawer } from '../../../components/DetailDrawer'
import { Button } from '../../../components/ui/Button'
import { apiCoXacThuc } from '../../../lib/auth'
import { formatDateTime, imageUrl } from '../../../lib/format'
import { interviewStatusLabel, toneForInterviewStatus } from '../../../lib/statusLabels'
import { toast } from '../../../lib/toast'
import type { LichPhongVan } from '../../../types/recruitment'
import { Badge, EmptyState, ErrorState, Page, Panel } from '../shared/UngVienAtoms'
import { useUngVienData } from '../shared/useUngVienData'
import { Field, Textarea } from '../../quantrivien/shared/AdminFormControls'
import { ItvDetail } from './ItvDetail'

const inputCls = 'min-h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100'

function idOf(item: { id?: string; _id?: string }) {
  return String(item.id ?? item._id ?? '')
}

function dateOnly(value?: string) {
  if (!value) return 'Chưa cập nhật ngày'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'Chưa cập nhật ngày' : date.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })
}

function timeRange(item: LichPhongVan) {
  const start = new Date(item.thoiGianBatDau)
  const end = item.thoiGianKetThuc ? new Date(item.thoiGianKetThuc) : null
  if (Number.isNaN(start.getTime())) return 'Chưa cập nhật giờ'
  const startText = start.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
  if (!end || Number.isNaN(end.getTime())) return startText
  return `${startText} - ${end.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`
}

function companyOf(item: LichPhongVan) {
  return item.hoSoUngTuyen?.tinTuyenDung?.nhaTuyenDung
}

function nhomLich(item: LichPhongVan) {
  const start = new Date(item.thoiGianBatDau).getTime()
  const now = Date.now()
  const daKetThuc = ['hoan_thanh', 'da_huy'].includes(item.trangThai) || (Number.isFinite(start) && start < now)

  if (['da_len_lich', 'doi_lich'].includes(item.trangThai) && !daKetThuc) {
    return { key: 'can_phan_hoi', label: 'Cần phản hồi', tone: 'yellow' as const, order: 0 }
  }

  if (!daKetThuc) {
    return { key: 'sap_toi', label: 'Sắp tới', tone: 'blue' as const, order: 1 }
  }

  return { key: 'da_ket_thuc', label: 'Đã hoàn thành hoặc đã hủy', tone: 'gray' as const, order: 2 }
}

function InterviewCard({ item, active, onOpen }: { item: LichPhongVan; active?: boolean; onOpen: () => void }) {
  const job = item.hoSoUngTuyen?.tinTuyenDung
  const company = companyOf(item)
  const diaDiem = item.hinhThuc === 'offline' ? item.diaChi : item.linkHop
  const nhom = nhomLich(item)
  const statusLabel = interviewStatusLabel[item.trangThai] ?? item.trangThai

  return (
    <article
      onClick={onOpen}
      className={`uv-interview-card flex cursor-pointer items-center gap-4 rounded-2xl border bg-white px-4 py-3 text-left shadow-sm transition hover:border-sky-300 hover:shadow-md ${active ? 'border-sky-400 bg-sky-50/60' : 'border-slate-200'}`}
    >
      {/* Logo */}
      <span className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
        {company?.logo ? (
          <img src={imageUrl(company.logo)} alt={company.tenCongTy ?? 'Logo'} className="h-full w-full object-contain p-1" />
        ) : (
          <Building2 size={20} className="text-slate-400" />
        )}
      </span>

      {/* Thông tin chính */}
      <div className="min-w-0 flex-1">
        {/* Dòng 1: tiêu đề + badges */}
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-sm font-black text-slate-950">{job?.tieuDe ?? 'Lịch phỏng vấn'}</p>
          <Badge tone={nhom.tone}>{nhom.label}</Badge>
          {statusLabel !== nhom.label && <Badge tone={toneForInterviewStatus(item.trangThai)}>{statusLabel}</Badge>}
        </div>

        {/* Dòng 2: công ty + meta inline */}
        <div className="uv-interview-meta mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs font-semibold text-slate-500">
          <span className="font-bold uppercase tracking-wide text-sky-700">{company?.tenCongTy ?? 'Nhà tuyển dụng'}</span>
          <span className="inline-flex items-center gap-1">
            <CalendarDays size={12} className="text-sky-500" />
            {dateOnly(item.thoiGianBatDau)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock size={12} className="text-sky-500" />
            {timeRange(item)}
          </span>
          {diaDiem && (
            <span className="inline-flex max-w-[260px] items-center gap-1">
              {item.hinhThuc === 'offline'
                ? <MapPin size={12} className="shrink-0 text-sky-500" />
                : <Monitor size={12} className="shrink-0 text-sky-500" />}
              <span className="truncate">{diaDiem}</span>
            </span>
          )}
        </div>
      </div>

      {/* Nút chi tiết */}
      <div className="uv-interview-action shrink-0" onClick={e => e.stopPropagation()}>
        <Button size="sm" variant="secondary" icon={<ExternalLink size={13} />} onClick={onOpen}>Chi tiết</Button>
      </div>
    </article>
  )
}

export default function LichPhongVanPage() {
  const data = useUngVienData()
  const [searchParams] = useSearchParams()
  const queryLich = searchParams.get('lich')
  const openedQueryRef = useRef('')
  const [selected, setSelected] = useState<LichPhongVan | null>(null)
  const [rescheduleOpen, setRescheduleOpen] = useState(false)
  const [rescheduleNote, setRescheduleNote] = useState('')
  const [tuKhoa, setTuKhoa] = useState('')
  const [locTrangThai, setLocTrangThai] = useState('')
  const { confirm: askConfirm, ConfirmDialogComponent } = useConfirm()

  const lichDaBoLoc = useMemo(() => {
    const kw = tuKhoa.trim().toLowerCase()
    return data.lich.filter(item => {
      const khopKw = !kw
        || (item.hoSoUngTuyen?.tinTuyenDung?.nhaTuyenDung?.tenCongTy ?? '').toLowerCase().includes(kw)
        || (item.hoSoUngTuyen?.tinTuyenDung?.tieuDe ?? '').toLowerCase().includes(kw)
      const khopTrangThai = !locTrangThai || item.trangThai === locTrangThai
      return khopKw && khopTrangThai
    })
  }, [data.lich, tuKhoa, locTrangThai])

  useEffect(() => {
    if (!queryLich || openedQueryRef.current === queryLich || !lichDaBoLoc.length) return
    const target = lichDaBoLoc.find(item => idOf(item) === queryLich)
    if (target) {
      openedQueryRef.current = queryLich
      setSelected(target)
    }
  }, [lichDaBoLoc, queryLich])

  const lichSapXep = useMemo(() => {
    return [...lichDaBoLoc].sort((a, b) => {
      const nhomA = nhomLich(a)
      const nhomB = nhomLich(b)
      if (nhomA.order !== nhomB.order) return nhomA.order - nhomB.order
      const startA = new Date(a.thoiGianBatDau).getTime()
      const startB = new Date(b.thoiGianBatDau).getTime()
      if (nhomA.key === 'da_ket_thuc') return startB - startA
      return startA - startB
    })
  }, [lichDaBoLoc])

  const phanTrang = usePhanTrang(lichSapXep)

  const confirm = async () => {
    if (!selected) return
    const target = selected
    askConfirm(
      'Xác nhận lịch phỏng vấn',
      `Xác nhận tham gia lịch phỏng vấn lúc ${formatDateTime(target.thoiGianBatDau)}?`,
      async () => {
        try {
          await apiCoXacThuc(`/lichphongvan/${idOf(target)}/xac-nhan`, { method: 'POST' })
          setSelected(null)
          toast.success('Đã xác nhận lịch phỏng vấn.')
          await data.reload()
        } catch (error) {
          toast.error(error instanceof Error ? error.message : 'Không thể xác nhận lịch phỏng vấn.')
        }
      },
      'info',
      'Xác nhận',
    )
  }

  const openReschedule = () => {
    setRescheduleNote('')
    setRescheduleOpen(true)
  }

  const submitReschedule = async () => {
    if (!selected) return
    const target = selected
    askConfirm(
      'Yêu cầu đổi lịch',
      `Gửi yêu cầu đổi lịch phỏng vấn lúc ${formatDateTime(target.thoiGianBatDau)}?`,
      async () => {
        try {
          await apiCoXacThuc(`/lichphongvan/${idOf(target)}/doi-lich`, { method: 'POST', body: JSON.stringify({ ghiChu: rescheduleNote }) })
          setRescheduleOpen(false)
          setSelected(null)
          toast.success('Đã gửi yêu cầu đổi lịch.')
          await data.reload()
        } catch (error) {
          toast.error(error instanceof Error ? error.message : 'Không thể gửi yêu cầu đổi lịch.')
        }
      },
      'warning',
      'Gửi yêu cầu',
    )
  }

  return (
    <Page title="Lịch phỏng vấn" desc="Theo dõi rõ công ty, vị trí, thời gian và hình thức phỏng vấn trước khi xác nhận hoặc yêu cầu đổi lịch.">
      <ErrorState message={data.error} />
      <Panel>
        <div className="mb-3 grid gap-2 sm:flex sm:items-center">
          <label className="flex min-h-10 flex-1 items-center gap-2 rounded-xl border border-slate-200 px-3 text-slate-400 focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-100">
            <Search size={15} />
            <input
              className="min-w-0 flex-1 border-0 bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400"
              placeholder="Tìm tên công ty, vị trí..."
              value={tuKhoa}
              onChange={e => setTuKhoa(e.target.value)}
            />
            {tuKhoa && <button type="button" onClick={() => setTuKhoa('')}><X size={14} /></button>}
          </label>
          <select className={`${inputCls} sm:w-48`} value={locTrangThai} onChange={e => setLocTrangThai(e.target.value)}>
            <option value="">Tất cả trạng thái</option>
            {Object.entries(interviewStatusLabel).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>

        {lichSapXep.length ? (
          <div className="grid gap-3">
            {phanTrang.danhSachTrang.map(item => (
              <InterviewCard
                key={idOf(item)}
                item={item}
                active={idOf(item) === queryLich || idOf(selected ?? {}) === idOf(item)}
                onOpen={() => setSelected(item)}
              />
            ))}
          </div>
        ) : (
          <EmptyState>{tuKhoa || locTrangThai ? 'Không có lịch phỏng vấn phù hợp bộ lọc.' : 'Chưa có lịch phỏng vấn.'}</EmptyState>
        )}

        <PhanTrang {...phanTrang} donVi="lịch" className="mt-4" />
      </Panel>

      {selected && <ItvDetail item={selected} onClose={() => setSelected(null)} onConfirm={() => void confirm()} onReschedule={openReschedule} />}

      {selected && rescheduleOpen && (
        <DetailDrawer
          title="Yêu cầu đổi lịch"
          subtitle={formatDateTime(selected.thoiGianBatDau)}
          onClose={() => setRescheduleOpen(false)}
          footer={(
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button variant="secondary" onClick={() => setRescheduleOpen(false)}>Hủy</Button>
              <Button onClick={() => void submitReschedule()}>Gửi yêu cầu</Button>
            </div>
          )}
        >
          <Field label="Lý do đổi lịch">
            <Textarea value={rescheduleNote} onChange={event => setRescheduleNote(event.target.value)} placeholder="Nhập lý do hoặc khung giờ mong muốn..." />
          </Field>
        </DetailDrawer>
      )}

      <ConfirmDialogComponent />
    </Page>
  )
}
