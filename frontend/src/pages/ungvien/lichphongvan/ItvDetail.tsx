import { Building2, CalendarCheck, Clock, Link as LinkIcon, MapPin, MessageCircle, RefreshCw, Video } from 'lucide-react'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, ButtonGroup } from '../../../components/ui/Button'
import { useChat } from '../../../contexts/ChatContext'
import { formatDateTime } from '../../../lib/format'
import { imageUrl } from '../../../lib/format'
import { interviewResultLabel, interviewStatusLabel, toneForInterviewStatus } from '../../../lib/statusLabels'
import type { LichPhongVan } from '../../../types/recruitment'
import { Badge, Drawer } from '../shared/UngVienAtoms'

const TRANG_THAI_HO_SO_DUOC_CHAT = ['da_xem', 'dang_xet_duyet', 'moi_phong_van', 'dat']
const TRANG_THAI_LICH_DUOC_CHAT = ['da_len_lich', 'da_xac_nhan', 'doi_lich']

function idOf(value: any) {
  return String(value?._id ?? value?.id ?? value ?? '')
}

function DetailLine({ icon, label, value }: { icon: ReactNode; label: string; value?: ReactNode }) {
  return (
    <div className="grid gap-1 rounded-xl border border-slate-200 bg-slate-50 p-3">
      <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wide text-slate-500">{icon}{label}</span>
      <strong className="break-words text-sm font-black text-slate-900">{value || 'Chưa cập nhật'}</strong>
    </div>
  )
}

export function ItvDetail({ item, onClose, onConfirm, onReschedule }: { item: LichPhongVan; onClose: () => void; onConfirm: () => void; onReschedule: () => void }) {
  const navigate = useNavigate()
  const { moChatVoiNguoiDung } = useChat()
  const job = item.hoSoUngTuyen?.tinTuyenDung
  const company = job?.nhaTuyenDung
  const employerUserId = idOf((company as any)?.maNguoiDung) || idOf((company as any)?.nguoiDung)
  const canChat = TRANG_THAI_HO_SO_DUOC_CHAT.includes(item.hoSoUngTuyen?.trangThai ?? '')
    && TRANG_THAI_LICH_DUOC_CHAT.includes(item.trangThai)
    && Boolean(employerUserId)

  const openChat = async () => {
    if (!employerUserId) return
    const cuocTroChuyen = await moChatVoiNguoiDung(employerUserId, {
      loai: 'ung_vien_nha_tuyen_dung',
      maHoSoUngTuyen: item.maHoSoUngTuyen,
      maTinTuyenDung: item.hoSoUngTuyen?.maTinTuyenDung,
    })
    const id = (cuocTroChuyen as any)?._id ?? (cuocTroChuyen as any)?.id
    navigate(id ? `/ung-vien/chat?cuocTroChuyen=${id}` : '/ung-vien/chat')
  }

  return (
    <Drawer
      title="Chi tiết lịch phỏng vấn"
      onClose={onClose}
      footer={(
        <ButtonGroup>
          <Button size="sm" onClick={onClose}>Đóng</Button>
          <Button size="sm" variant="secondary" icon={<MessageCircle size={16} />} disabled={!canChat} onClick={() => void openChat()}>Nhắn nhà tuyển dụng</Button>
          <Button size="sm" variant="success" icon={<CalendarCheck size={16} />} disabled={item.trangThai !== 'da_len_lich'} onClick={onConfirm}>Xác nhận</Button>
          <Button size="sm" variant="secondary" icon={<RefreshCw size={16} />} disabled={item.trangThai !== 'da_len_lich'} onClick={onReschedule}>Yêu cầu đổi lịch</Button>
        </ButtonGroup>
      )}
    >
      <div className="grid gap-4">
        <section className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-[76px_minmax(0,1fr)]">
          <span className="grid h-16 w-16 place-items-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
            {company?.logo ? <img src={imageUrl(company.logo)} alt={company.tenCongTy ?? 'Logo công ty'} className="h-full w-full object-contain p-2" /> : <Building2 className="text-slate-400" size={26} />}
          </span>
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-[0.12em] text-sky-700">{company?.tenCongTy ?? 'Nhà tuyển dụng'}</p>
            <h3 className="mt-1 break-words text-2xl font-black leading-tight text-slate-950">{job?.tieuDe ?? 'Phỏng vấn'}</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge tone={toneForInterviewStatus(item.trangThai)}>{interviewStatusLabel[item.trangThai] ?? item.trangThai}</Badge>
              <Badge tone="gray">{interviewResultLabel[item.ketQua ?? 'cho_ket_qua'] ?? 'Chờ kết quả'}</Badge>
            </div>
          </div>
        </section>

        <section className="grid gap-3 sm:grid-cols-2">
          <DetailLine icon={<Clock size={15} />} label="Bắt đầu" value={formatDateTime(item.thoiGianBatDau)} />
          <DetailLine icon={<Clock size={15} />} label="Kết thúc" value={item.thoiGianKetThuc ? formatDateTime(item.thoiGianKetThuc) : 'Chưa cập nhật'} />
          <DetailLine icon={<Video size={15} />} label="Hình thức" value={item.hinhThuc === 'offline' ? 'Phỏng vấn trực tiếp' : 'Phỏng vấn online'} />
          <DetailLine
            icon={item.hinhThuc === 'offline' ? <MapPin size={15} /> : <LinkIcon size={15} />}
            label={item.hinhThuc === 'offline' ? 'Địa điểm phỏng vấn' : 'Link phỏng vấn online'}
            value={item.hinhThuc === 'offline' ? item.diaChi : item.linkHop}
          />
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4">
          <h4 className="text-sm font-black uppercase tracking-wide text-slate-500">Ghi chú từ nhà tuyển dụng</h4>
          <p className="mt-2 whitespace-pre-wrap break-words text-sm font-semibold leading-6 text-slate-700">{item.ghiChu || 'Chưa có ghi chú.'}</p>
        </section>
      </div>
    </Drawer>
  )
}
