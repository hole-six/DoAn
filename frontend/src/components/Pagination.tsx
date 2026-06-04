import { ChevronLeft, ChevronRight } from 'lucide-react'

type Props = {
  page: number
  pageSize: number
  total: number
  pageSizeOptions?: number[]
  onPageChange: (page: number) => void
  onPageSizeChange?: (pageSize: number) => void
}

export default function Pagination({
  page,
  pageSize,
  total,
  pageSizeOptions = [9, 12],
  onPageChange,
  onPageSizeChange,
}: Props) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const safePage = Math.min(Math.max(1, page), totalPages)
  const start = total === 0 ? 0 : (safePage - 1) * pageSize + 1
  const end = Math.min(total, safePage * pageSize)

  return (
    <div className="pagination-bar" aria-label="Phân trang">
      <div className="pagination-bar__meta">
        Hiển thị <strong>{start}-{end}</strong> trong <strong>{total}</strong>
      </div>
      {onPageSizeChange && (
        <label className="pagination-bar__size">
          <span>Mỗi trang</span>
          <select value={pageSize} onChange={event => onPageSizeChange(Number(event.target.value))}>
            {pageSizeOptions.map(option => <option key={option} value={option}>{option}</option>)}
          </select>
        </label>
      )}
      <div className="pagination-bar__actions">
        <button type="button" onClick={() => onPageChange(safePage - 1)} disabled={safePage <= 1}>
          <ChevronLeft size={16} /> Trước
        </button>
        <span>{safePage}/{totalPages}</span>
        <button type="button" onClick={() => onPageChange(safePage + 1)} disabled={safePage >= totalPages}>
          Sau <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}
