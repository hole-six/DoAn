import { useState } from 'react'
import { Eye } from 'lucide-react'
import { useConfirm } from '../../../components/ConfirmDialog'
import { Button } from '../../../components/ui/Button'
import { apiCoXacThuc } from '../../../lib/auth'
import { formatDateTime } from '../../../lib/format'
import { applicationStatusLabel, toneForApplicationStatus } from '../../../lib/statusLabels'
import { toast } from '../../../lib/toast'
import type { HoSoUngTuyen } from '../../../types/recruitment'
import { Badge, EmptyState, ErrorState, Page, Panel, Row } from '../shared/UngVienAtoms'
import { useUngVienData } from '../shared/useUngVienData'
import { AppDrawer } from './AppDrawer'

export default function UngTuyenPage() {
  const data = useUngVienData()
  const [selected, setSelected] = useState<HoSoUngTuyen | null>(null)
  const { confirm, ConfirmDialogComponent } = useConfirm()

  const withdraw = async () => {
    if (!selected) return
    const reason = window.prompt('Lý do rút hồ sơ?') ?? ''
    const target = selected
    confirm(
      'Rút hồ sơ ứng tuyển',
      `Bạn chắc chắn muốn rút hồ sơ ứng tuyển vị trí "${target.tinTuyenDung?.tieuDe ?? 'này'}"?`,
      async () => {
        try {
          await apiCoXacThuc(`/hosoungtuyen/${target.id}/rut`, { method: 'POST', body: JSON.stringify({ ghiChu: reason }) })
          setSelected(null)
          toast.success('Đã rút hồ sơ ứng tuyển.')
          await data.reload()
        } catch (error) {
          toast.error(error instanceof Error ? error.message : 'Không thể rút hồ sơ ứng tuyển.')
        }
      },
      'warning',
      'Rút hồ sơ',
    )
  }

  return (
    <Page title="Hồ sơ ứng tuyển" desc="Theo dõi tiến trình từng vị trí đã nộp và xử lý rút hồ sơ khi cần.">
      <ErrorState message={data.error} />
      <Panel>
        <div className="grid gap-2">
          {data.ungTuyen.length ? data.ungTuyen.map(item => (
            <Row key={item.id} onClick={() => setSelected(item)}>
              <div className="min-w-0">
                <strong className="block truncate text-sm font-black text-slate-950">{item.tinTuyenDung?.tieuDe ?? '-'}</strong>
                <p className="mt-1 truncate text-xs font-semibold text-slate-500">{item.tinTuyenDung?.nhaTuyenDung?.tenCongTy ?? '-'} · {formatDateTime(item.ngayNop)}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={toneForApplicationStatus(item.trangThai)}>{applicationStatusLabel[item.trangThai]}</Badge>
                <Button size="sm" icon={<Eye size={14} />}>Xem</Button>
              </div>
            </Row>
          )) : <EmptyState>Bạn chưa ứng tuyển vị trí nào.</EmptyState>}
        </div>
      </Panel>
      {selected && (
        <AppDrawer
          item={selected}
          danhGia={data.danhGiaCongTy.find(item => item.maHoSoUngTuyen === selected.id)}
          coLichPhongVan={data.lich.some(item => item.maHoSoUngTuyen === selected.id)}
          onClose={() => setSelected(null)}
          onWithdraw={() => void withdraw()}
          onReviewSubmitted={async () => { await data.reload() }}
        />
      )}
      <ConfirmDialogComponent />
    </Page>
  )
}
