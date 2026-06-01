import { useState } from 'react'
import { Calendar } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { apiCoXacThuc } from '../../../lib/auth'
import { formatDateTime } from '../../../lib/format'
import { interviewStatusLabel, toneForInterviewStatus } from '../../../lib/statusLabels'
import type { LichPhongVan } from '../../../types/recruitment'
import { Badge, EmptyState, ErrorState, Page, Panel, Row } from '../shared/UngVienAtoms'
import { useUngVienData } from '../shared/useUngVienData'
import { ItvDetail } from './ItvDetail'

export default function LichPhongVanPage() {
  const data = useUngVienData()
  const [selected, setSelected] = useState<LichPhongVan | null>(null)

  const confirm = async () => {
    if (!selected) return
    await apiCoXacThuc(`/lichphongvan/${selected.id}/xac-nhan`, { method: 'POST' })
    setSelected(null)
    await data.reload()
  }

  const reschedule = async () => {
    if (!selected) return
    const reason = window.prompt('Lý do muốn đổi lịch?') ?? ''
    await apiCoXacThuc(`/lichphongvan/${selected.id}/doi-lich`, { method: 'POST', body: JSON.stringify({ ghiChu: reason }) })
    setSelected(null)
    await data.reload()
  }

  return (
    <Page title="Lịch phỏng vấn" desc="Xác nhận lịch hoặc yêu cầu đổi lịch rõ ràng, không mặc định im lặng là đồng ý.">
      <ErrorState message={data.error} />
      <Panel>
        <div className="grid gap-2">
          {data.lich.length ? data.lich.map(item => (
            <Row key={item.id} onClick={() => setSelected(item)}>
              <div className="min-w-0">
                <strong className="block truncate text-sm font-black text-slate-950">{item.hoSoUngTuyen?.tinTuyenDung?.tieuDe ?? 'Lịch phỏng vấn'}</strong>
                <p className="mt-1 truncate text-xs font-semibold text-slate-500">{formatDateTime(item.thoiGianBatDau)} · {item.hinhThuc ?? 'online'}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={toneForInterviewStatus(item.trangThai)}>{interviewStatusLabel[item.trangThai]}</Badge>
                <Button size="sm" icon={<Calendar size={14} />}>Chi tiết</Button>
              </div>
            </Row>
          )) : <EmptyState>Chưa có lịch phỏng vấn.</EmptyState>}
        </div>
      </Panel>
      {selected && <ItvDetail item={selected} onClose={() => setSelected(null)} onConfirm={() => void confirm()} onReschedule={() => void reschedule()} />}
    </Page>
  )
}
