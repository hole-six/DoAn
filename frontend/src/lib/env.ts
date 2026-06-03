function boDauGachCuoi(value: string) {
  return value.replace(/\/+$/, '')
}

function layOriginHienTai() {
  return typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173'
}

function layApiUrl() {
  const tuEnv = import.meta.env.VITE_API_URL
  if (tuEnv) return boDauGachCuoi(tuEnv)
  if (import.meta.env.PROD) return `${layOriginHienTai()}/api`
  return 'http://localhost:5000/api'
}

export const API_URL = layApiUrl()
export const API_ORIGIN = API_URL.replace(/\/api\/?$/, '')
export const PUBLIC_URL = boDauGachCuoi(import.meta.env.VITE_PUBLIC_URL || layOriginHienTai())
export const SOCKET_URL = boDauGachCuoi(import.meta.env.VITE_SOCKET_URL || API_ORIGIN)

export function taoUrlPublic(path: string) {
  if (/^https?:\/\//i.test(path)) return path
  return `${PUBLIC_URL}${path.startsWith('/') ? path : `/${path}`}`
}

export function taoUrlTaiNguyen(path?: string) {
  if (!path) return ''
  if (/^https?:\/\//i.test(path) || path.startsWith('data:')) return path
  return `${API_ORIGIN}${path.startsWith('/') ? path : `/${path}`}`
}
