import { taoUrlTaiNguyen } from './env'

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
  return taoUrlTaiNguyen(value)
}
