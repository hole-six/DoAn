export function formatJobDate(value?: string | null) {
  if (!value) return 'Đang cập nhật'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'Đang cập nhật' : date.toLocaleDateString('vi-VN')
}

export function formatJobDeadlineState(value?: string | null) {
  if (!value) return 'Không giới hạn'
  const now = new Date()
  const deadline = new Date(value)
  if (Number.isNaN(deadline.getTime())) return 'Đang cập nhật'

  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const startDeadline = new Date(deadline.getFullYear(), deadline.getMonth(), deadline.getDate()).getTime()
  const days = Math.round((startDeadline - startToday) / 86400000)

  if (days < 0) return 'Đã hết hạn'
  if (days === 0) return 'Hết hạn hôm nay'
  if (days === 1) return 'Còn 1 ngày'
  return `Còn ${days} ngày`
}

export function formatJobDateLine(ngayDang?: string | null, hanNop?: string | null) {
  return `Đăng ${formatJobDate(ngayDang)} · Hạn nộp ${formatJobDate(hanNop)} · ${formatJobDeadlineState(hanNop)}`
}
