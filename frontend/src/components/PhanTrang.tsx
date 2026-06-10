import { useEffect, useMemo, useState } from 'react'
import { clsx } from 'clsx'

/**
 * Phân trang dùng chung cho cả 3 vai trò (ứng viên, nhà tuyển dụng, quản trị viên).
 * Đồng bộ với mẫu phân trang ở trang Quản lý người dùng:
 *  - kích thước trang mặc định 6
 *  - hiển thị "tuSo-denSo / tongSo"
 *  - nút prev/next + danh sách số trang dùng class .page-btn
 */

export const KICH_THUOC_TRANG_MAC_DINH = 6

export type KetQuaPhanTrang<T> = {
  /** Trang hiện tại (đã được kẹp trong khoảng hợp lệ). */
  trang: number
  /** Đổi trang chủ động (prev/next/chọn số trang). */
  setTrang: (trang: number) => void
  /** Tổng số trang (tối thiểu 1). */
  tongTrang: number
  /** Tổng số phần tử sau khi lọc. */
  tongSo: number
  /** Chỉ số phần tử đầu tiên đang hiển thị (bắt đầu từ 1, hoặc 0 nếu rỗng). */
  tuSo: number
  /** Chỉ số phần tử cuối cùng đang hiển thị. */
  denSo: number
  /** Danh sách phần tử của riêng trang hiện tại. */
  danhSachTrang: T[]
}

/**
 * Hook phân trang phía client cho một mảng đã được lọc.
 * Tự động kẹp trang khi danh sách thu nhỏ (ví dụ sau khi đổi bộ lọc hoặc xóa phần tử).
 */
export function usePhanTrang<T>(danhSach: T[], kichThuocTrang = KICH_THUOC_TRANG_MAC_DINH): KetQuaPhanTrang<T> {
  const [trang, setTrang] = useState(1)
  const tongSo = danhSach.length
  const tongTrang = Math.max(1, Math.ceil(tongSo / kichThuocTrang))

  useEffect(() => {
    if (trang > tongTrang) setTrang(tongTrang)
  }, [trang, tongTrang])

  const trangHienTai = Math.min(trang, tongTrang)

  const danhSachTrang = useMemo(
    () => danhSach.slice((trangHienTai - 1) * kichThuocTrang, trangHienTai * kichThuocTrang),
    [danhSach, trangHienTai, kichThuocTrang],
  )

  const tuSo = tongSo ? (trangHienTai - 1) * kichThuocTrang + 1 : 0
  const denSo = Math.min(trangHienTai * kichThuocTrang, tongSo)

  return { trang: trangHienTai, setTrang, tongTrang, tongSo, tuSo, denSo, danhSachTrang }
}

type PhanTrangProps = {
  trang: number
  tongTrang: number
  tongSo: number
  tuSo: number
  denSo: number
  setTrang: (trang: number) => void
  /** Nhãn đơn vị hiển thị bên cạnh tổng số (mặc định: "mục"). */
  donVi?: string
  className?: string
}

/**
 * Thanh phân trang hiển thị "tuSo-denSo / tongSo" và các nút chuyển trang.
 * Truyền thẳng giá trị trả về từ usePhanTrang.
 */
export function PhanTrang({ trang, tongTrang, tongSo, tuSo, denSo, setTrang, donVi = 'mục', className }: PhanTrangProps) {
  if (tongSo === 0) return null

  return (
    <div
      className={clsx(
        'grid w-full min-w-0 gap-2 text-sm font-extrabold text-slate-500 min-[421px]:flex min-[421px]:items-center min-[421px]:justify-between',
        className,
      )}
    >
      <span className="whitespace-nowrap">{tuSo}-{denSo} / {tongSo} {donVi}</span>
      <div className="flex min-w-0 gap-1.5 overflow-x-auto pb-0.5 min-[421px]:justify-end">
        <button type="button" className="page-btn" disabled={trang <= 1} onClick={() => setTrang(trang - 1)} aria-label="Trang trước">{'‹'}</button>
        {Array.from({ length: tongTrang }, (_, index) => index + 1).map((item) => (
          <button
            type="button"
            key={item}
            className={clsx('page-btn', item === trang && 'active')}
            aria-current={item === trang ? 'page' : undefined}
            onClick={() => setTrang(item)}
          >
            {item}
          </button>
        ))}
        <button type="button" className="page-btn" disabled={trang >= tongTrang} onClick={() => setTrang(trang + 1)} aria-label="Trang sau">{'›'}</button>
      </div>
    </div>
  )
}

export default PhanTrang
