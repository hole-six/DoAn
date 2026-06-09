function boDauGachCuoi(value: string) {
  return value.replace(/\/+$/, '')
}

const uploadCacheBuster = `${Date.now()}`
const RESOURCE_VERSION_STORAGE_KEY = 'itjob_resource_versions'

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
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? ''

function docBangPhienBanTaiNguyen(): Record<string, string> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.localStorage.getItem(RESOURCE_VERSION_STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function ghiBangPhienBanTaiNguyen(next: Record<string, string>) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(RESOURCE_VERSION_STORAGE_KEY, JSON.stringify(next))
  } catch {
    // ignore storage failures
  }
}

function chuanHoaKhoaTaiNguyen(path?: string) {
  if (!path) return ''
  if (path.startsWith('data:')) return path
  if (/^https?:\/\//i.test(path)) {
    try {
      const url = new URL(path)
      if (url.origin === API_ORIGIN && url.pathname.startsWith('/uploads/')) return url.pathname
      return path
    } catch {
      return path
    }
  }
  return path.startsWith('/') ? path : `/${path}`
}

export function capNhatPhienBanTaiNguyen(path?: string, version = Date.now().toString()) {
  const key = chuanHoaKhoaTaiNguyen(path)
  if (!key || !key.startsWith('/uploads/')) return
  const current = docBangPhienBanTaiNguyen()
  current[key] = version
  ghiBangPhienBanTaiNguyen(current)
}

export function xoaPhienBanTaiNguyen(path?: string) {
  const key = chuanHoaKhoaTaiNguyen(path)
  if (!key) return
  const current = docBangPhienBanTaiNguyen()
  if (!(key in current)) return
  delete current[key]
  ghiBangPhienBanTaiNguyen(current)
}

export function taoUrlPublic(path: string) {
  if (/^https?:\/\//i.test(path)) return path
  return `${PUBLIC_URL}${path.startsWith('/') ? path : `/${path}`}`
}

export function taoUrlTaiNguyen(path?: string) {
  if (!path) return ''
  if (path.startsWith('data:')) return path
  const normalizedPath = chuanHoaKhoaTaiNguyen(path)
  if (/^https?:\/\//i.test(normalizedPath)) return normalizedPath
  const resourceUrl = `${API_ORIGIN}${normalizedPath}`
  if (!normalizedPath.startsWith('/uploads/')) return resourceUrl
  const version = docBangPhienBanTaiNguyen()[normalizedPath] ?? uploadCacheBuster
  return `${resourceUrl}${resourceUrl.includes('?') ? '&' : '?'}v=${version}`
}
