import { CalendarCheck, RefreshCw } from 'lucide-react'
import { Button, ButtonGroup } from '../../../components/ui/Button'
import { formatDateTime } from '../../../lib/format'
import { interviewResultLabel, interviewStatusLabel, toneForInterviewStatus } from '../../../lib/statusLabels'
import type { LichPhongVan } from '../../../types/recruitment'
import { Badge, Drawer } from '../shared/UngVienAtoms'

export function ItvDetail({ item, onClose, onConfirm, onReschedule }: { item: LichPhongVan; onClose: () => void; onConfirm: () => void; onReschedule: () => void }) {
  return (
    <Drawer title="Chi tiết lịch phỏng vấn" onClose={onClose} footer={<ButtonGroup><Button onClick={onClose}>Đóng</Button><Button variant="success" icon={<CalendarCheck size={16} />} disabled={item.trangThai !== 'da_len_lich'} onClick={onConfirm}>Xác nhận</Button><Button variant="secondary" icon={<RefreshCw size={16} />} disabled={!['da_len_lich', 'da_xac_nhan'].includes(item.trangThai)} onClick={onReschedule}>Yêu cầu đổi lịch</Button></ButtonGroup>}>
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
