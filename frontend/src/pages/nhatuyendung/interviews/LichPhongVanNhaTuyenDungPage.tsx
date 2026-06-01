import { useState } from 'react'
import { CalendarCheck, Edit3 } from 'lucide-react'
import { Button, ButtonGroup } from '../../../components/ui/Button'
import { apiCoXacThuc } from '../../../lib/auth'
import { formatDateTime } from '../../../lib/format'
import { interviewStatusLabel, toneForInterviewStatus } from '../../../lib/statusLabels'
import type { LichPhongVan } from '../../../types/recruitment'
import { Badge, EmptyState, ErrorState, Page, Panel } from '../shared/NtdAtoms'
import { useEmployerData } from '../shared/useEmployerData'
import { ScheduleModal } from './ScheduleModal'

export default function LichPhongVanNhaTuyenDungPage() {
  const data = useEmployerData()
  const [editing, setEditing] = useState<LichPhongVan | null>(null)

  const update = async (value: { thoiGianBatDau: string; thoiGianKetThuc?: string; hinhThuc: 'online' | 'offline'; diaChi?: string; linkHop?: string; ghiChu?: string }) => {
    if (!editing) return
    await apiCoXacThuc(`/lichphongvan/${editing.id}/cap-nhat`, { method: 'PATCH', body: JSON.stringify(value) })
    setEditing(null)
    await data.reload()
  }

  const finish = async (item: LichPhongVan, ketQua: 'dat' | 'khong_dat') => {
    const ghiChu = window.prompt('Ghi chú kết quả?') ?? ''
    await apiCoXacThuc(`/lichphongvan/${item.id}/hoan-thanh`, { method: 'POST', body: JSON.stringify({ ketQua, ghiChu }) })
    await data.reload()
  }

  return (
    <Page title="Lịch phỏng vấn" desc="Quản lý lịch, đổi lịch khi ứng viên yêu cầu và cập nhật kết quả sau buổi phỏng vấn.">
      <ErrorState message={data.error} />
      <Panel>
        <div className="grid gap-2">
          {data.interviews.length ? data.interviews.map(item => (
            <article key={item.id} className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 lg:grid-cols-[minmax(0,1fr)_auto]">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2"><h2 className="truncate text-base font-black text-slate-950">{item.hoSoUngTuyen?.tinTuyenDung?.tieuDe ?? 'Phỏng vấn'}</h2><Badge tone={toneForInterviewStatus(item.trangThai)}>{interviewStatusLabel[item.trangThai]}</Badge></div>
                <p className="mt-1 text-sm font-semibold text-slate-500">{formatDateTime(item.thoiGianBatDau)} · {item.linkHop || item.diaChi || '-'}</p>
              </div>
              <ButtonGroup>
                <Button icon={<Edit3 size={15} />} disabled={['hoan_thanh', 'da_huy'].includes(item.trangThai)} onClick={() => setEditing(item)}>Cập nhật</Button>
                <Button variant="success" icon={<CalendarCheck size={15} />} disabled={!['da_len_lich', 'da_xac_nhan'].includes(item.trangThai)} onClick={() => void finish(item, 'dat')}>Đạt</Button>
                <Button variant="danger" disabled={!['da_len_lich', 'da_xac_nhan'].includes(item.trangThai)} onClick={() => void finish(item, 'khong_dat')}>Không đạt</Button>
              </ButtonGroup>
            </article>
          )) : <EmptyState>Chưa có lịch phỏng vấn.</EmptyState>}
        </div>
      </Panel>
      {editing && <ScheduleModal title="Cập nhật lịch" initial={{ thoiGianBatDau: editing.thoiGianBatDau?.slice(0, 16), thoiGianKetThuc: editing.thoiGianKetThuc?.slice(0, 16), hinhThuc: editing.hinhThuc ?? 'online', diaChi: editing.diaChi, linkHop: editing.linkHop, ghiChu: editing.ghiChu }} onClose={() => setEditing(null)} onSubmit={update} />}
    </Page>
  )
}
