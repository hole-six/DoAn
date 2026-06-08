import { useState } from 'react'
import { CalendarCheck, Edit3, MessageCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { DetailDrawer } from '../../../components/DetailDrawer'
import { Button, ButtonGroup } from '../../../components/ui/Button'
import { useChat } from '../../../contexts/ChatContext'
import { apiCoXacThuc } from '../../../lib/auth'
import { formatDateTime } from '../../../lib/format'
import { interviewStatusLabel, toneForInterviewStatus } from '../../../lib/statusLabels'
import { toast } from '../../../lib/toast'
import type { LichPhongVan } from '../../../types/recruitment'
import { Badge, EmptyState, ErrorState, Page, Panel } from '../shared/NtdAtoms'
import { useEmployerData } from '../shared/useEmployerData'
import { ScheduleModal } from './ScheduleModal'
import { Field, Textarea } from '../../quantrivien/shared/AdminFormControls'

const TRANG_THAI_LICH_DUOC_CHAT = ['da_len_lich', 'da_xac_nhan', 'doi_lich']

function candidateUserId(item: LichPhongVan) {
  const nguoiDung = item.hoSoUngTuyen?.ungVien?.nguoiDung as any
  return nguoiDung?.id ?? nguoiDung?._id ?? (typeof nguoiDung === 'string' ? nguoiDung : '')
}

function jobId(item: LichPhongVan) {
  return item.hoSoUngTuyen?.maTinTuyenDung ?? item.hoSoUngTuyen?.tinTuyenDung?.id ?? item.hoSoUngTuyen?.tinTuyenDung?._id
}

export default function LichPhongVanNhaTuyenDungPage() {
  const data = useEmployerData()
  const [selected, setSelected] = useState<LichPhongVan | null>(null)
  const [editing, setEditing] = useState<LichPhongVan | null>(null)
  const [resultTarget, setResultTarget] = useState<{ item: LichPhongVan; ketQua: 'dat' | 'khong_dat' } | null>(null)
  const [ghiChuKetQua, setGhiChuKetQua] = useState('')
  const [chatError, setChatError] = useState('')
  const navigate = useNavigate()
  const { moChatVoiNguoiDung } = useChat()

  const openChat = async (item: LichPhongVan) => {
    const userId = candidateUserId(item)
    if (!TRANG_THAI_LICH_DUOC_CHAT.includes(item.trangThai)) return
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
    toast.success('Đã cập nhật lịch phỏng vấn.')
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
    toast.success('Đã cập nhật kết quả phỏng vấn.')
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
              <article key={item.id} className="ntd-list-card grid cursor-pointer gap-3 rounded-xl border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-sky-200 lg:grid-cols-[minmax(0,1fr)_auto]" onClick={() => setSelected(item)}>
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
                <div className="ntd-list-actions" onClick={event => event.stopPropagation()}>
                  <ButtonGroup>
                    <Button size="sm" variant="secondary" icon={<MessageCircle size={15} />} disabled={!userId || !TRANG_THAI_LICH_DUOC_CHAT.includes(item.trangThai)} onClick={() => void openChat(item)}>
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

      {selected && (
        <DetailDrawer
          title={selected.hoSoUngTuyen?.ungVien?.nguoiDung?.hoTen ?? 'Ứng viên'}
          subtitle={selected.hoSoUngTuyen?.tinTuyenDung?.tieuDe ?? 'Chi tiết lịch phỏng vấn'}
          onClose={() => setSelected(null)}
          footer={(
            <ButtonGroup>
              <Button variant="secondary" icon={<MessageCircle size={15} />} disabled={!candidateUserId(selected) || !TRANG_THAI_LICH_DUOC_CHAT.includes(selected.trangThai)} onClick={() => void openChat(selected)}>Nhắn ứng viên</Button>
              <Button icon={<Edit3 size={15} />} disabled={['hoan_thanh', 'da_huy'].includes(selected.trangThai)} onClick={() => setEditing(selected)}>Cập nhật lịch</Button>
              <Button variant="success" icon={<CalendarCheck size={15} />} disabled={!['da_len_lich', 'da_xac_nhan'].includes(selected.trangThai)} onClick={() => openResultModal(selected, 'dat')}>Đạt</Button>
              <Button variant="danger" disabled={!['da_len_lich', 'da_xac_nhan'].includes(selected.trangThai)} onClick={() => openResultModal(selected, 'khong_dat')}>Không đạt</Button>
            </ButtonGroup>
          )}
        >
          <div className="grid gap-4">
            <section className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-1 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <span className="text-xs font-black uppercase tracking-wide text-slate-500">Trạng thái</span>
                <strong className="text-sm font-black text-slate-950">{interviewStatusLabel[selected.trangThai]}</strong>
              </div>
              <div className="grid gap-1 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <span className="text-xs font-black uppercase tracking-wide text-slate-500">Thời gian</span>
                <strong className="text-sm font-black text-slate-950">{formatDateTime(selected.thoiGianBatDau)}</strong>
              </div>
              <div className="grid gap-1 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <span className="text-xs font-black uppercase tracking-wide text-slate-500">Hình thức</span>
                <strong className="text-sm font-black text-slate-950">{selected.hinhThuc === 'offline' ? 'Phỏng vấn trực tiếp' : 'Phỏng vấn online'}</strong>
              </div>
              <div className="grid gap-1 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <span className="text-xs font-black uppercase tracking-wide text-slate-500">{selected.hinhThuc === 'offline' ? 'Địa chỉ' : 'Link họp'}</span>
                <strong className="break-words text-sm font-black text-slate-950">{selected.diaChi || selected.linkHop || '-'}</strong>
              </div>
            </section>
            <section className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <span className="text-xs font-black uppercase tracking-wide text-slate-500">Ghi chú</span>
              <p className="mt-2 whitespace-pre-wrap text-sm font-semibold leading-6 text-slate-700">{selected.ghiChu || 'Chưa có ghi chú.'}</p>
            </section>
          </div>
        </DetailDrawer>
      )}

      {editing && <ScheduleModal title="Cập nhật lịch" initial={{ thoiGianBatDau: editing.thoiGianBatDau?.slice(0, 16), thoiGianKetThuc: editing.thoiGianKetThuc?.slice(0, 16), hinhThuc: editing.hinhThuc ?? 'online', diaChi: editing.diaChi, linkHop: editing.linkHop, ghiChu: editing.ghiChu }} onClose={() => setEditing(null)} onSubmit={update} />}
      {resultTarget && (
        <DetailDrawer
          title={resultTarget.ketQua === 'dat' ? 'Đánh dấu đạt' : 'Đánh dấu không đạt'}
          subtitle={formatDateTime(resultTarget.item.thoiGianBatDau)}
          onClose={() => setResultTarget(null)}
          footer={(
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button variant="secondary" onClick={() => setResultTarget(null)}>Hủy</Button>
              <Button variant={resultTarget.ketQua === 'dat' ? 'success' : 'danger'} onClick={() => void finish()}>
                Cập nhật kết quả
              </Button>
            </div>
          )}
        >
          <Field label="Ghi chú gửi kèm kết quả">
            <Textarea value={ghiChuKetQua} onChange={event => setGhiChuKetQua(event.target.value)} placeholder="Nhập nhận xét, bước tiếp theo hoặc lý do..." />
          </Field>
        </DetailDrawer>
      )}
    </Page>
  )
}
