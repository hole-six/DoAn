import { useMemo, useState } from 'react'
import { Eye, Search, X } from 'lucide-react'
import { useConfirm } from '../../../components/ConfirmDialog'
import { DetailDrawer } from '../../../components/DetailDrawer'
import { PhanTrang, usePhanTrang } from '../../../components/PhanTrang'
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

const inputCls = 'min-h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100'

export default function UngTuyenPage() {
  const data = useUngVienData()
  const [selected, setSelected] = useState<HoSoUngTuyen | null>(null)
  const [withdrawOpen, setWithdrawOpen] = useState(false)
  const [withdrawReason, setWithdrawReason] = useState('')
  const [tuKhoa, setTuKhoa] = useState('')
  const [locTrangThai, setLocTrangThai] = useState('')
  const { confirm, ConfirmDialogComponent } = useConfirm()

  const danhSachHienThi = useMemo(() => {
    const kw = tuKhoa.trim().toLowerCase()
    return data.ungTuyen.filter(item => {
      const khopKw = !kw
        || (item.tinTuyenDung?.tieuDe ?? '').toLowerCase().includes(kw)
        || (item.tinTuyenDung?.nhaTuyenDung?.tenCongTy ?? '').toLowerCase().includes(kw)
      const khopTrangThai = !locTrangThai || item.trangThai === locTrangThai
      return khopKw && khopTrangThai
    })
  }, [data.ungTuyen, tuKhoa, locTrangThai])

  const phanTrang = usePhanTrang(danhSachHienThi)

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
        <div className="mb-3 grid gap-2 sm:flex sm:items-center">
          <label className="flex min-h-10 flex-1 items-center gap-2 rounded-xl border border-slate-200 px-3 text-slate-400 focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-100">
            <Search size={15} />
            <input
              className="min-w-0 flex-1 border-0 bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400"
              placeholder="Tìm vị trí, công ty..."
              value={tuKhoa}
              onChange={e => { setTuKhoa(e.target.value) }}
            />
            {tuKhoa && <button type="button" onClick={() => setTuKhoa('')}><X size={14} /></button>}
          </label>
          <select className={`${inputCls} sm:w-48`} value={locTrangThai} onChange={e => setLocTrangThai(e.target.value)}>
            <option value="">Tất cả trạng thái</option>
            {Object.entries(applicationStatusLabel).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>
        <div className="grid gap-2">
          {danhSachHienThi.length ? phanTrang.danhSachTrang.map(item => (
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
          )) : <EmptyState>{tuKhoa || locTrangThai ? 'Không có hồ sơ phù hợp bộ lọc.' : 'Bạn chưa ứng tuyển vị trí nào.'}</EmptyState>}
        </div>
        <PhanTrang {...phanTrang} donVi="hồ sơ" className="mt-4" />
      </Panel>
      {selected && (
        <AppDrawer
          item={selected}
          danhGia={data.danhGiaCongTy.find(item => item.maHoSoUngTuyen === selected.id)}
          coKetQuaPhongVan={data.lich.some(item => (
            item.maHoSoUngTuyen === selected.id
            && item.trangThai === 'hoan_thanh'
            && ['dat', 'khong_dat'].includes(String(item.ketQua ?? ''))
          ))}
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
