import { useMemo, useState } from 'react'
import { Building2, CalendarDays, Eye, MapPin, Search, X } from 'lucide-react'
import { useConfirm } from '../../../components/ConfirmDialog'
import { DetailDrawer } from '../../../components/DetailDrawer'
import { PhanTrang, usePhanTrang } from '../../../components/PhanTrang'
import { Button } from '../../../components/ui/Button'
import { apiCoXacThuc } from '../../../lib/auth'
import { formatDate, formatMoney } from '../../../lib/format'
import { applicationStatusLabel, toneForApplicationStatus } from '../../../lib/statusLabels'
import { toast } from '../../../lib/toast'
import { taoUrlTaiNguyen } from '../../../lib/env'
import type { HoSoUngTuyen } from '../../../types/recruitment'
import { Badge, EmptyState, ErrorState, Page, Panel } from '../shared/UngVienAtoms'
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
          {danhSachHienThi.length ? phanTrang.danhSachTrang.map(item => {
            const cty = item.tinTuyenDung?.nhaTuyenDung
            const logoUrl = taoUrlTaiNguyen(cty?.logo)
            const luong = (item.tinTuyenDung?.luongMin || item.tinTuyenDung?.luongMax)
              ? `${formatMoney(item.tinTuyenDung.luongMin)} - ${formatMoney(item.tinTuyenDung.luongMax)}`
              : null

            return (
              <article
                key={item.id}
                className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 transition hover:border-sky-300 hover:bg-slate-50"
                onClick={() => setSelected(item)}
              >
                {/* Logo công ty */}
                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
                  {logoUrl
                    ? <img src={logoUrl} alt={cty?.tenCongTy} className="h-full w-full object-contain p-1" />
                    : <Building2 size={22} className="text-slate-400" />
                  }
                </div>

                {/* Thông tin chính */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <strong className="truncate text-sm font-black text-slate-900">
                      {item.tinTuyenDung?.tieuDe ?? '-'}
                    </strong>
                    <Badge tone={toneForApplicationStatus(item.trangThai)}>
                      {applicationStatusLabel[item.trangThai]}
                    </Badge>
                  </div>
                  <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs font-semibold text-slate-500">
                    {cty?.tenCongTy && (
                      <span className="flex items-center gap-1">
                        <Building2 size={11} /> {cty.tenCongTy}
                      </span>
                    )}
                    {item.tinTuyenDung?.diaChi && (
                      <span className="flex items-center gap-1">
                        <MapPin size={11} /> {item.tinTuyenDung.diaChi}
                      </span>
                    )}
                    {luong && (
                      <span className="font-bold text-emerald-700">{luong} VND</span>
                    )}
                    <span className="flex items-center gap-1 text-slate-400">
                      <CalendarDays size={11} /> Nộp {formatDate(item.ngayNop)}
                    </span>
                  </div>
                </div>

                {/* Nút xem */}
                <div className="shrink-0" onClick={e => e.stopPropagation()}>
                  <Button size="sm" icon={<Eye size={14} />} onClick={() => setSelected(item)}>Xem</Button>
                </div>
              </article>
            )
          }) : <EmptyState>{tuKhoa || locTrangThai ? 'Không có hồ sơ phù hợp bộ lọc.' : 'Bạn chưa ứng tuyển vị trí nào.'}</EmptyState>}
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
