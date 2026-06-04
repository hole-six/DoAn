import { useState } from 'react'
import { CalendarCheck, Edit3, MessageCircle, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button, ButtonGroup } from '../../../components/ui/Button'
import { useChat } from '../../../contexts/ChatContext'
import { apiCoXacThuc } from '../../../lib/auth'
import { formatDateTime } from '../../../lib/format'
import { interviewStatusLabel, toneForInterviewStatus } from '../../../lib/statusLabels'
import type { LichPhongVan } from '../../../types/recruitment'
import { Badge, EmptyState, ErrorState, Page, Panel } from '../shared/NtdAtoms'
import { useEmployerData } from '../shared/useEmployerData'
import { ScheduleModal } from './ScheduleModal'

function candidateUserId(item: LichPhongVan) {
  const nguoiDung = item.hoSoUngTuyen?.ungVien?.nguoiDung as any
  return nguoiDung?.id ?? nguoiDung?._id ?? (typeof nguoiDung === 'string' ? nguoiDung : '')
}

function jobId(item: LichPhongVan) {
  return item.hoSoUngTuyen?.maTinTuyenDung ?? item.hoSoUngTuyen?.tinTuyenDung?.id ?? item.hoSoUngTuyen?.tinTuyenDung?._id
}

export default function LichPhongVanNhaTuyenDungPage() {
  const data = useEmployerData()
  const [editing, setEditing] = useState<LichPhongVan | null>(null)
  const [resultTarget, setResultTarget] = useState<{ item: LichPhongVan; ketQua: 'dat' | 'khong_dat' } | null>(null)
  const [ghiChuKetQua, setGhiChuKetQua] = useState('')
  const [chatError, setChatError] = useState('')
  const navigate = useNavigate()
  const { moChatVoiNguoiDung } = useChat()

  const openChat = async (item: LichPhongVan) => {
    const userId = candidateUserId(item)
    if (!userId) {
      setChatError('Lịch phỏng vấn này chưa có thông tin tài khoản ứng viên để mở chat.')
      return
    }
    setChatError('')
    const cuocTroChuyen = await moChatVoiNguoiDung(userId, {
      loai: 'ung_vien_nha_tuyen_dung',
      maHoSoUngTuyen: item.maHoSoUngTuyen,
      maTinTuyenDung: jobId(item),
    })
    const id = (cuocTroChuyen as any)?._id ?? (cuocTroChuyen as any)?.id
    navigate(id ? `/nha-tuyen-dung/chat?cuocTroChuyen=${id}` : '/nha-tuyen-dung/chat')
  }

  const update = async (value: { thoiGianBatDau: string; thoiGianKetThuc?: string; hinhThuc: 'online' | 'offline'; diaChi?: string; linkHop?: string; ghiChu?: string }) => {
    if (!editing) return
    await apiCoXacThuc(`/lichphongvan/${editing.id}/cap-nhat`, { method: 'PATCH', body: JSON.stringify(value) })
    setEditing(null)
    await data.reload()
  }

  const openResultModal = (item: LichPhongVan, ketQua: 'dat' | 'khong_dat') => {
    setResultTarget({ item, ketQua })
    setGhiChuKetQua('')
  }

  const finish = async () => {
    if (!resultTarget) return
    await apiCoXacThuc(`/lichphongvan/${resultTarget.item.id}/hoan-thanh`, { method: 'POST', body: JSON.stringify({ ketQua: resultTarget.ketQua, ghiChu: ghiChuKetQua }) })
    setResultTarget(null)
    setGhiChuKetQua('')
    await data.reload()
  }
  return (
    <Page title="Lịch phỏng vấn" desc="Quản lý lịch, đổi lịch khi ứng viên yêu cầu và cập nhật kết quả sau buổi phỏng vấn.">
      <ErrorState message={data.error || chatError} />
      <Panel>
        <div className="ntd-list grid gap-2">
          {data.interviews.length ? data.interviews.map(item => {
            const userId = candidateUserId(item)
            return (
              <article key={item.id} className="ntd-list-card grid gap-3 rounded-xl border border-slate-200 bg-white p-4 lg:grid-cols-[minmax(0,1fr)_auto]">
                <div className="ntd-list-main min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="truncate text-base font-black text-slate-950">{item.hoSoUngTuyen?.ungVien?.nguoiDung?.hoTen ?? 'Ứng viên'}</h2>
                    <Badge tone={toneForInterviewStatus(item.trangThai)}>{interviewStatusLabel[item.trangThai]}</Badge>
                  </div>
                  <p className="ntd-list-meta mt-1 truncate text-sm font-semibold text-slate-500">
                    {item.hoSoUngTuyen?.tinTuyenDung?.tieuDe ?? 'Phỏng vấn'} · {item.hoSoUngTuyen?.tinTuyenDung?.nhaTuyenDung?.tenCongTy ?? '-'}
                  </p>
                  <p className="ntd-list-meta mt-1 text-sm font-semibold text-slate-500">{formatDateTime(item.thoiGianBatDau)} · {item.linkHop || item.diaChi || '-'}</p>
                </div>
                <div className="ntd-list-actions">
                <ButtonGroup>
                  <Button size="sm" variant="secondary" icon={<MessageCircle size={15} />} disabled={!userId || ['hoan_thanh', 'da_huy'].includes(item.trangThai)} onClick={() => void openChat(item)}>
                    Nhắn ứng viên
                  </Button>
                  <Button size="sm" icon={<Edit3 size={15} />} disabled={['hoan_thanh', 'da_huy'].includes(item.trangThai)} onClick={() => setEditing(item)}>Cập nhật</Button>
                  <Button size="sm" variant="success" icon={<CalendarCheck size={15} />} disabled={!['da_len_lich', 'da_xac_nhan'].includes(item.trangThai)} onClick={() => openResultModal(item, 'dat')}>Đạt</Button>
                  <Button size="sm" variant="danger" disabled={!['da_len_lich', 'da_xac_nhan'].includes(item.trangThai)} onClick={() => openResultModal(item, 'khong_dat')}>Không đạt</Button>
                </ButtonGroup>
                </div>
              </article>
            )
          }) : <EmptyState>Chưa có lịch phỏng vấn.</EmptyState>}
        </div>
      </Panel>
      {editing && <ScheduleModal title="Cập nhật lịch" initial={{ thoiGianBatDau: editing.thoiGianBatDau?.slice(0, 16), thoiGianKetThuc: editing.thoiGianKetThuc?.slice(0, 16), hinhThuc: editing.hinhThuc ?? 'online', diaChi: editing.diaChi, linkHop: editing.linkHop, ghiChu: editing.ghiChu }} onClose={() => setEditing(null)} onSubmit={update} />}
      {resultTarget && (
        <div className="fixed inset-0 z-[1000] grid place-items-center bg-slate-950/60 p-4">
          <section className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">Kết quả phỏng vấn</p>
                <h2 className="mt-1 text-xl font-black text-slate-950">{resultTarget.ketQua === 'dat' ? 'Đánh dấu đạt' : 'Đánh dấu không đạt'}</h2>
              </div>
              <button className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700" onClick={() => setResultTarget(null)}>
                <X size={18} />
              </button>
            </div>
            <label className="mt-5 block text-sm font-black text-slate-700">
              Ghi chú gửi kèm kết quả
              <textarea
                className="mt-2 min-h-32 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold outline-none focus:border-blue-500"
                value={ghiChuKetQua}
                onChange={event => setGhiChuKetQua(event.target.value)}
                placeholder="Nhập nhận xét, bước tiếp theo hoặc lý do..."
              />
            </label>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button variant="secondary" onClick={() => setResultTarget(null)}>Hủy</Button>
              <Button variant={resultTarget.ketQua === 'dat' ? 'success' : 'danger'} onClick={() => void finish()}>
                Cập nhật kết quả
              </Button>
            </div>
          </section>
        </div>
      )}
    </Page>
  )
}

