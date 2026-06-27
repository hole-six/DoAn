import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, MessageCircle, Search, X } from 'lucide-react'
import { useConfirm } from '../../../components/ConfirmDialog'
import { PhanTrang, usePhanTrang } from '../../../components/PhanTrang'
import { Button } from '../../../components/ui/Button'
import { apiCoXacThuc } from '../../../lib/auth'
import { useChat } from '../../../contexts/ChatContext'
import { employerApplicationStatusLabel, toneForApplicationStatus } from '../../../lib/statusLabels'
import { toast } from '../../../lib/toast'
import type { HoSoUngTuyen } from '../../../types/recruitment'
import { Badge, EmptyState, ErrorState, Page, Panel } from '../shared/NtdAtoms'
import { useEmployerData } from '../shared/useEmployerData'
import { ScheduleModal } from '../interviews/ScheduleModal'
import type { ScheduleValue } from '../interviews/ScheduleModal'
import { CandidateDrawer } from './CandidateDrawer'

const inputCls = 'min-h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100'
const TRANG_THAI_CHAT = ['da_xem', 'dang_xet_duyet', 'moi_phong_van', 'dat'] as const

export default function UngVienNhaTuyenDungPage() {
  const data = useEmployerData()
  const navigate = useNavigate()
  const [selected, setSelected] = useState<HoSoUngTuyen | null>(null)
  const [scheduling, setScheduling] = useState<HoSoUngTuyen | null>(null)
  const { moChatVoiNguoiDung } = useChat()
  const { confirm, ConfirmDialogComponent } = useConfirm()
  const [tuKhoa, setTuKhoa] = useState('')
  const [locTrangThai, setLocTrangThai] = useState('')

  const danhSachHienThi = useMemo(() => {
    const kw = tuKhoa.trim().toLowerCase()
    return data.applications.filter(item => {
      const khopKw = !kw
        || (item.hoSoNangLuc?.hoTenHienThi ?? item.ungVien?.nguoiDung?.hoTen ?? '').toLowerCase().includes(kw)
        || (item.tinTuyenDung?.tieuDe ?? '').toLowerCase().includes(kw)
      const khopTrangThai = !locTrangThai || item.trangThai === locTrangThai
      return khopKw && khopTrangThai
    })
  }, [data.applications, tuKhoa, locTrangThai])

  const phanTrang = usePhanTrang(danhSachHienThi)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const hoSo = params.get('hoSo')
    if (!hoSo || selected || scheduling || !data.applications.length) return
    const found = data.applications.find(item => item.id === hoSo || item._id === hoSo)
    if (found) {
      setSelected(found)
      if (params.get('action') === 'moi-phong-van') setScheduling(found)
      window.history.replaceState(null, '', window.location.pathname)
    }
  }, [data.applications, selected, scheduling])

  const view = async () => {
    if (!selected) return
    const updated = await apiCoXacThuc(`/hosoungtuyen/${selected.id}/xem`, { method: 'POST' }) as HoSoUngTuyen
    setSelected(updated)
    await data.reload()
  }

  const review = async (trangThai: 'dang_xet_duyet' | 'tu_choi', giaiDoanTuChoi: 'sang_loc' | 'phong_van' = 'sang_loc') => {
    if (!selected) return
    const ghiChu = trangThai === 'tu_choi'
      ? 'Hồ sơ chưa phù hợp'
      : 'Nhà tuyển dụng đang xét duyệt hồ sơ'
    const target = selected
    const rejecting = trangThai === 'tu_choi'
    confirm(
      rejecting ? 'Từ chối ứng viên' : 'Chuyển sang xét duyệt',
      `${rejecting ? 'Từ chối' : 'Chuyển trạng thái'} hồ sơ của "${target.hoSoNangLuc?.hoTenHienThi || target.ungVien?.nguoiDung?.hoTen || 'ứng viên này'}"?`,
      async () => {
        try {
          const updated = await apiCoXacThuc(`/hosoungtuyen/${target.id}/danh-gia`, {
            method: 'POST',
            body: JSON.stringify({ trangThai, ghiChu, giaiDoanTuChoi }),
          }) as HoSoUngTuyen
          setSelected(updated)
          toast.success(rejecting ? 'Đã từ chối ứng viên.' : 'Đã cập nhật trạng thái hồ sơ.')
          await data.reload()
        } catch (error) {
          toast.error(error instanceof Error ? error.message : 'Không thể cập nhật hồ sơ ứng viên.')
        }
      },
      rejecting ? 'warning' : 'info',
      rejecting ? 'Từ chối' : 'Cập nhật',
    )
  }

  const completeInterview = async (ketQua: 'dat' | 'khong_dat') => {
    if (!selected) return
    const lich = data.interviews.find(item => String((item as any).maHoSoUngTuyen?._id ?? item.maHoSoUngTuyen) === selected.id)
    if (!lich) {
      setScheduling(selected)
      return
    }
    const target = selected
    confirm(
      ketQua === 'dat' ? 'Đánh dấu ứng viên đạt' : 'Đánh dấu ứng viên không đạt',
      `Cập nhật kết quả phỏng vấn cho "${target.hoSoNangLuc?.hoTenHienThi || target.ungVien?.nguoiDung?.hoTen || 'ứng viên này'}"?`,
      async () => {
        try {
          await apiCoXacThuc(`/lichphongvan/${lich.id}/hoan-thanh`, {
            method: 'POST',
            body: JSON.stringify({ ketQua, ghiChu: ketQua === 'dat' ? 'Ứng viên đạt phỏng vấn' : 'Ứng viên không đạt phỏng vấn' }),
          })
          const updated = await apiCoXacThuc(`/hosoungtuyen/${target.id}`) as HoSoUngTuyen
          setSelected(updated)
          toast.success('Đã cập nhật kết quả phỏng vấn.')
          await data.reload()
        } catch (error) {
          toast.error(error instanceof Error ? error.message : 'Không thể cập nhật kết quả phỏng vấn.')
        }
      },
      ketQua === 'dat' ? 'info' : 'warning',
      'Cập nhật',
    )
  }

  const schedule = async (value: ScheduleValue) => {
    if (!scheduling) return
    try {
      await apiCoXacThuc(`/hosoungtuyen/${scheduling.id}/moi-phong-van`, { method: 'POST', body: JSON.stringify(value) })
      setScheduling(null)
      setSelected(null)
      toast.success('Đã gửi lời mời phỏng vấn.')
      await data.reload()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể gửi lời mời phỏng vấn.')
    }
  }

  const openChat = async (item: HoSoUngTuyen) => {
    const userId = item.ungVien?.nguoiDung?.id ?? item.ungVien?.nguoiDung?._id
    if (!userId || !TRANG_THAI_CHAT.includes(item.trangThai as any)) return
    const cuocTroChuyen = await moChatVoiNguoiDung(userId, {
      loai: 'ung_vien_nha_tuyen_dung',
      maHoSoUngTuyen: item.id,
      maTinTuyenDung: item.maTinTuyenDung,
    })
    const id = (cuocTroChuyen as any)?._id ?? (cuocTroChuyen as any)?.id
    navigate(id ? `/nha-tuyen-dung/chat?cuocTroChuyen=${id}` : '/nha-tuyen-dung/chat')
  }

  return (
    <Page title="Pipeline ứng viên" desc="Xem hồ sơ, đánh giá CV, mời phỏng vấn hoặc từ chối theo đúng workflow.">
      <ErrorState message={data.error} />
      <Panel>
        <div className="mb-3 grid gap-2 sm:flex sm:items-center">
          <label className="flex min-h-10 flex-1 items-center gap-2 rounded-xl border border-slate-200 px-3 text-slate-400 focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-100">
            <Search size={15} />
            <input
              className="min-w-0 flex-1 border-0 bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400"
              placeholder="Tìm tên ứng viên, vị trí..."
              value={tuKhoa}
              onChange={e => setTuKhoa(e.target.value)}
            />
            {tuKhoa && <button type="button" onClick={() => setTuKhoa('')}><X size={14} /></button>}
          </label>
          <select className={`${inputCls} sm:w-48`} value={locTrangThai} onChange={e => setLocTrangThai(e.target.value)}>
            <option value="">Tất cả trạng thái</option>
            {Object.entries(employerApplicationStatusLabel).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>
        <div className="grid gap-2">
          {danhSachHienThi.length ? phanTrang.danhSachTrang.map(item => (
            <article
              key={item.id}
              className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 transition hover:border-sky-300 hover:bg-slate-50"
              onClick={() => setSelected(item)}
            >
              {/* Avatar chữ cái */}
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-100 to-blue-200 text-sm font-black text-sky-700">
                {(item.hoSoNangLuc?.hoTenHienThi || item.ungVien?.nguoiDung?.hoTen || 'U').charAt(0).toUpperCase()}
              </div>

              {/* Thông tin chính */}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <strong className="text-sm font-black text-slate-900">
                    {item.hoSoNangLuc?.hoTenHienThi || item.ungVien?.nguoiDung?.hoTen || 'Ứng viên'}
                  </strong>
                  <Badge tone={toneForApplicationStatus(item.trangThai)}>
                    {employerApplicationStatusLabel[item.trangThai] ?? item.trangThai}
                  </Badge>
                </div>
                <span className="mt-0.5 block truncate text-xs font-semibold text-slate-500">
                  {item.tinTuyenDung?.tieuDe ?? '-'}
                </span>
                <div className="mt-1 flex flex-wrap gap-1">
                  {item.hoSoNangLuc?.tieuDe && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                      <FileText size={11} /> {item.hoSoNangLuc.tieuDe}
                    </span>
                  )}
                  {item.hoSoNangLuc?.fileCvData && (
                    <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-600">
                      Có file CV
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex shrink-0 gap-2" onClick={event => event.stopPropagation()}>
                <Button size="sm" icon={<Search size={14} />} onClick={() => setSelected(item)}>Chi tiết</Button>
                <Button
                  size="sm"
                  variant="secondary"
                  icon={<MessageCircle size={14} />}
                  disabled={!item.ungVien?.nguoiDung?.id || !TRANG_THAI_CHAT.includes(item.trangThai as any)}
                  onClick={() => void openChat(item)}
                >Chat</Button>
              </div>
            </article>
          )) : <EmptyState>{tuKhoa || locTrangThai ? 'Không có hồ sơ phù hợp bộ lọc.' : 'Chưa có ứng viên nào.'}</EmptyState>}
        </div>
        <PhanTrang {...phanTrang} donVi="hồ sơ" className="mt-4" />
      </Panel>
      {selected && (
        <CandidateDrawer
          item={selected}
          onClose={() => setSelected(null)}
          onView={() => void view()}
          onAdvance={(status) => {
            if (status === 'dang_xet_duyet') return void review('dang_xet_duyet', 'sang_loc')
            if (status === 'dat') return void completeInterview('dat')
          }}
          onReject={(phase) => {
            if (phase === 'sang_loc') return void review('tu_choi', 'sang_loc')
            return void completeInterview('khong_dat')
          }}
          onSchedule={() => setScheduling(selected)}
        />
      )}
      {scheduling && <ScheduleModal onClose={() => setScheduling(null)} onSubmit={schedule} />}
      <ConfirmDialogComponent />
    </Page>
  )
}
