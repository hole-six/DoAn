import { CalendarCheck, MessageCircle, RefreshCw } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button, ButtonGroup } from '../../../components/ui/Button'
import { useChat } from '../../../contexts/ChatContext'
import { formatDateTime } from '../../../lib/format'
import { interviewResultLabel, interviewStatusLabel, toneForInterviewStatus } from '../../../lib/statusLabels'
import type { LichPhongVan } from '../../../types/recruitment'
import { Badge, Drawer } from '../shared/UngVienAtoms'

export function ItvDetail({ item, onClose, onConfirm, onReschedule }: { item: LichPhongVan; onClose: () => void; onConfirm: () => void; onReschedule: () => void }) {
  const navigate = useNavigate()
  const { moChatVoiNguoiDung } = useChat()
  const employerUserId = (item.hoSoUngTuyen?.tinTuyenDung?.nhaTuyenDung as any)?.maNguoiDung?.id
    ?? (item.hoSoUngTuyen?.tinTuyenDung?.nhaTuyenDung as any)?.maNguoiDung?._id
    ?? (item.hoSoUngTuyen?.tinTuyenDung?.nhaTuyenDung as any)?.maNguoiDung
    ?? (item.hoSoUngTuyen?.tinTuyenDung?.nhaTuyenDung as any)?.nguoiDung?.id
    ?? (item.hoSoUngTuyen?.tinTuyenDung?.nhaTuyenDung as any)?.nguoiDung?._id
  const canChat = ['dang_xet_duyet', 'moi_phong_van', 'dat'].includes(item.hoSoUngTuyen?.trangThai ?? '') && Boolean(employerUserId)

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
    <Drawer title="Chi tiết lịch phỏng vấn" onClose={onClose} footer={<ButtonGroup><Button size="sm" onClick={onClose}>Đóng</Button><Button size="sm" variant="secondary" icon={<MessageCircle size={16} />} disabled={!canChat} onClick={() => void openChat()}>Nhắn NTD</Button><Button size="sm" variant="success" icon={<CalendarCheck size={16} />} disabled={item.trangThai !== 'da_len_lich'} onClick={onConfirm}>Xác nhận</Button><Button size="sm" variant="secondary" icon={<RefreshCw size={16} />} disabled={!['da_len_lich', 'da_xac_nhan'].includes(item.trangThai)} onClick={onReschedule}>Yêu cầu đổi lịch</Button></ButtonGroup>}>
      <div className="grid gap-4">
        <div className="rounded-xl border border-slate-200 p-4">
          <h3 className="text-xl font-black text-slate-950">{item.hoSoUngTuyen?.tinTuyenDung?.tieuDe ?? 'Phỏng vấn'}</h3>
          <p className="mt-1 text-sm font-semibold text-slate-500">{item.hoSoUngTuyen?.tinTuyenDung?.nhaTuyenDung?.tenCongTy ?? '-'}</p>
        </div>
        <div className="grid gap-3 rounded-xl border border-slate-200 p-4 text-sm font-semibold text-slate-700">
          <p><strong>Thời gian:</strong> {formatDateTime(item.thoiGianBatDau)}</p>
          <p><strong>Hình thức:</strong> {item.hinhThuc === 'offline' ? 'Offline' : 'Online'}</p>
          <p><strong>Địa chỉ/link:</strong> {item.linkHop || item.diaChi || '-'}</p>
          <p><strong>Ghi chú:</strong> {item.ghiChu || '-'}</p>
          <p><strong>Kết quả:</strong> {interviewResultLabel[item.ketQua ?? 'cho_ket_qua']}</p>
          <Badge tone={toneForInterviewStatus(item.trangThai)}>{interviewStatusLabel[item.trangThai]}</Badge>
        </div>
      </div>
    </Drawer>
  )
}
