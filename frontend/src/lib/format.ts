const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api'
const API_ORIGIN = API_URL.replace(/\/api\/?$/, '')

export function formatDateTime(value?: string | Date) {
  return value ? new Date(value).toLocaleString('vi-VN', { hour12: false }) : '-'
}

export function formatDate(value?: string | Date) {
  return value ? new Date(value).toLocaleDateString('vi-VN') : '-'
}

export function formatMoney(value?: number) {
  return typeof value === 'number' && value > 0 ? `${value.toLocaleString('vi-VN')} VND` : 'Thỏa thuận'
}

export function imageUrl(value?: string) {
  if (!value) return ''
  if (/^https?:\/\//i.test(value) || value.startsWith('data:')) return value
  return `${API_ORIGIN}${value.startsWith('/') ? value : `/${value}`}`
}
