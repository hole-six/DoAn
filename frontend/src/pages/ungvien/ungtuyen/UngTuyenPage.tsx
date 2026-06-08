import { useState } from 'react'
import { Eye } from 'lucide-react'
import { useConfirm } from '../../../components/ConfirmDialog'
import { DetailDrawer } from '../../../components/DetailDrawer'
import { Button } from '../../../components/ui/Button'
import { apiCoXacThuc } from '../../../lib/auth'
import { formatDateTime } from '../../../lib/format'
import { applicationStatusLabel, toneForApplicationStatus } from '../../../lib/statusLabels'
import { toast } from '../../../lib/toast'
import type { HoSoUngTuyen } from '../../../types/recruitment'
import { Badge, EmptyState, ErrorState, Page, Panel, Row } from '../shared/UngVienAtoms'
import { useUngVienData } from '../shared/useUngVienData'
import { AppDrawer } from './AppDrawer'
import { Field, Textarea } from '../../quantrivien/shared/AdminFormControls'

export default function UngTuyenPage() {
  const data = useUngVienData()
  const [selected, setSelected] = useState<HoSoUngTuyen | null>(null)
  const [withdrawOpen, setWithdrawOpen] = useState(false)
  const [withdrawReason, setWithdrawReason] = useState('')
  const { confirm, ConfirmDialogComponent } = useConfirm()

  const openWithdraw = () => {
    setWithdrawReason('')
    setWithdrawOpen(true)
  }

  const withdraw = async () => {
    if (!selected) return
    const target = selected
    confirm(
      'Rút hồ sơ ứng tuyển',
      `Bạn chắc chắn muốn rút hồ sơ ứng tuyển vị trí "${target.tinTuyenDung?.tieuDe ?? 'này'}"?`,
      async () => {
        try {
          await apiCoXacThuc(`/hosoungtuyen/${target.id}/rut`, { method: 'POST', body: JSON.stringify({ ghiChu: withdrawReason }) })
          setWithdrawOpen(false)
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
          onWithdraw={openWithdraw}
          onReviewSubmitted={async () => { await data.reload() }}
        />
      )}
      {selected && withdrawOpen && (
        <DetailDrawer
          title="Rút hồ sơ ứng tuyển"
          subtitle={selected.tinTuyenDung?.tieuDe ?? 'Thêm lý do nếu cần trước khi gửi'}
          onClose={() => setWithdrawOpen(false)}
          footer={(
            <div className="flex flex-wrap justify-end gap-2">
              <Button variant="secondary" onClick={() => setWithdrawOpen(false)}>Hủy</Button>
              <Button variant="danger" onClick={() => void withdraw()}>Rút hồ sơ</Button>
            </div>
          )}
        >
          <Field label="Lý do rút hồ sơ">
            <Textarea value={withdrawReason} onChange={event => setWithdrawReason(event.target.value)} placeholder="Ví dụ: thay đổi định hướng công việc..." />
          </Field>
        </DetailDrawer>
      )}
      <ConfirmDialogComponent />
    </Page>
  )
}
