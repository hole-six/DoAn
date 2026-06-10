import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Building2, CalendarDays, Clock, ExternalLink, MapPin, Monitor, Search, X } from 'lucide-react'
import { useConfirm } from '../../../components/ConfirmDialog'
import { DetailDrawer } from '../../../components/DetailDrawer'
import { Button } from '../../../components/ui/Button'
import { apiCoXacThuc } from '../../../lib/auth'
import { formatDateTime } from '../../../lib/format'
import { imageUrl } from '../../../lib/format'
import { interviewStatusLabel, toneForInterviewStatus } from '../../../lib/statusLabels'
import { toast } from '../../../lib/toast'
import type { LichPhongVan } from '../../../types/recruitment'
import { Badge, EmptyState, ErrorState, Page, Panel } from '../shared/UngVienAtoms'
import { useUngVienData } from '../shared/useUngVienData'
import { ItvDetail } from './ItvDetail'
import { Field, Textarea } from '../../quantrivien/shared/AdminFormControls'

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

function InterviewCard({ item, active, onOpen }: { item: LichPhongVan; active?: boolean; onOpen: () => void }) {
  const job = item.hoSoUngTuyen?.tinTuyenDung
  const company = companyOf(item)
  const diaDiem = item.hinhThuc === 'offline' ? item.diaChi : item.linkHop

  return (
    <button
      type="button"
      onClick={onOpen}
      className={`grid w-full min-w-0 items-center gap-3 rounded-xl border bg-white px-4 py-3 text-left shadow-sm transition hover:border-sky-200 hover:shadow-sm sm:grid-cols-[40px_minmax(0,1fr)_auto] ${active ? 'border-sky-400 bg-sky-50/50' : 'border-slate-200'}`}
    >
      <span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
        {company?.logo ? (
          <img src={imageUrl(company.logo)} alt={company.tenCongTy ?? 'Logo'} className="h-full w-full object-contain p-1" />
        ) : (
          <Building2 size={18} className="text-slate-400" />
        )}
      </span>

      <span className="min-w-0">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-sm font-black text-slate-950">{job?.tieuDe ?? 'Lịch phỏng vấn'}</span>
          <Badge tone={toneForInterviewStatus(item.trangThai)}>{interviewStatusLabel[item.trangThai] ?? item.trangThai}</Badge>
        </div>
        <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs font-semibold text-slate-500">
          <span className="inline-flex items-center gap-1"><CalendarDays size={12} className="shrink-0 text-sky-700" /> {dateOnly(item.thoiGianBatDau)}</span>
          <span className="inline-flex items-center gap-1"><Clock size={12} className="shrink-0 text-sky-700" /> {timeRange(item)}</span>
          <span className="inline-flex items-center gap-1"><MapPin size={12} className="shrink-0 text-sky-700" /> <span className="truncate">{diaDiem || 'Chưa cập nhật địa điểm/link'}</span></span>
        </p>
      </span>

      <span className="hidden sm:flex">
        <Button size="sm" variant="secondary" icon={<ExternalLink size={14} />}>Chi tiết</Button>
      </span>
    </button>
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
        || (item.hoSoUngTuyen?.ungVien?.nguoiDung?.hoTen ?? '').toLowerCase().includes(kw)
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

  const groups = useMemo(() => {
    const now = Date.now()
    const canPhanHoi: LichPhongVan[] = []
    const sapToi: LichPhongVan[] = []
    const daKetThuc: LichPhongVan[] = []

    for (const item of lichDaBoLoc) {
      const start = new Date(item.thoiGianBatDau).getTime()
      const ended = ['hoan_thanh', 'da_huy'].includes(item.trangThai) || (Number.isFinite(start) && start < now)
      if (['da_len_lich', 'doi_lich'].includes(item.trangThai) && !ended) canPhanHoi.push(item)
      else if (!ended) sapToi.push(item)
      else daKetThuc.push(item)
    }

    const sortByStart = (items: LichPhongVan[]) => [...items].sort((a, b) => new Date(a.thoiGianBatDau).getTime() - new Date(b.thoiGianBatDau).getTime())
    return [
      { key: 'can-phan-hoi', title: 'Cần phản hồi', desc: 'Những lịch cần bạn xác nhận hoặc trao đổi lại với nhà tuyển dụng.', items: sortByStart(canPhanHoi) },
      { key: 'sap-toi', title: 'Sắp tới', desc: 'Các lịch đã rõ thời gian và đang chờ diễn ra.', items: sortByStart(sapToi) },
      { key: 'da-ket-thuc', title: 'Đã hoàn thành hoặc đã hủy', desc: 'Lịch đã qua, đã hoàn thành hoặc không còn hiệu lực.', items: sortByStart(daKetThuc).reverse() },
    ].filter(group => group.items.length)
  }, [lichDaBoLoc])

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
        {lichDaBoLoc.length ? (
          <div className="grid gap-3">
            {lichDaBoLoc.map(item => (
              <InterviewCard key={idOf(item)} item={item} active={idOf(item) === queryLich || idOf(selected ?? {}) === idOf(item)} onOpen={() => setSelected(item)} />
            ))}
          </div>
        ) : (
          <EmptyState>{tuKhoa || locTrangThai ? 'Không có lịch phỏng vấn phù hợp bộ lọc.' : 'Chưa có lịch phỏng vấn.'}</EmptyState>
        )}
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
