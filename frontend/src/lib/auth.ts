import { API_URL } from './env'

export type VaiTroNguoiDung = 'ung_vien' | 'nha_tuyen_dung' | 'admin'

export type NguoiDungDangNhap = {
  id: string
  email: string
  hoTen: string
  soDienThoai?: string
  vaiTro: VaiTroNguoiDung
  trangThai: string
}

export type PhienDangNhap = {
  accessToken: string
  refreshToken: string
  token?: string
  expiresIn?: number
  tokenType?: string
  nguoiDung: NguoiDungDangNhap
}

let dangLamMoiPhien: Promise<PhienDangNhap> | null = null
let daDangXuatDoHetPhien = false

export const duongDanTheoVaiTro: Record<VaiTroNguoiDung, string> = {
  ung_vien: '/ung-vien',
  nha_tuyen_dung: '/nha-tuyen-dung/dashboard',
  admin: '/quan-tri/dashboard',
}

export function layNguoiDung(): NguoiDungDangNhap | null {
  try {
    return JSON.parse(localStorage.getItem('itjob_nguoidung') ?? 'null')
  } catch {
    return null
  }
}

export function layAccessToken() {
  return localStorage.getItem('itjob_access_token') ?? localStorage.getItem('itjob_token') ?? ''
}

export function layRefreshToken() {
  return localStorage.getItem('itjob_refresh_token') ?? ''
}

export function luuPhienDangNhap(phien: PhienDangNhap) {
  const accessToken = phien.accessToken ?? phien.token
  if (!accessToken) throw new Error('Thiếu access token')

  daDangXuatDoHetPhien = false
  localStorage.setItem('itjob_access_token', accessToken)
  localStorage.setItem('itjob_token', accessToken)
  localStorage.setItem('itjob_refresh_token', phien.refreshToken ?? '')
  localStorage.setItem('itjob_nguoidung', JSON.stringify(phien.nguoiDung))
  window.dispatchEvent(new Event('itjob-auth-change'))
}

export function xoaPhienDangNhap() {
  localStorage.removeItem('itjob_access_token')
  localStorage.removeItem('itjob_refresh_token')
  localStorage.removeItem('itjob_token')
  localStorage.removeItem('itjob_nguoidung')
  window.dispatchEvent(new Event('itjob-auth-change'))
}

function layPayloadJwt(token: string): { exp?: number } | null {
  try {
    const [, payload] = token.split('.')
    if (!payload) return null
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(window.atob(normalized))
  } catch {
    return null
  }
}

function tokenSapHetHan(token: string, leewaySeconds = 120) {
  const payload = layPayloadJwt(token)
  if (!payload?.exp) return false
  return payload.exp * 1000 - Date.now() <= leewaySeconds * 1000
}

export function headerCoXacThuc() {
  const token = layAccessToken()
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

export async function lamMoiPhienDangNhap() {
  if (dangLamMoiPhien) return dangLamMoiPhien

  const refreshToken = layRefreshToken()
  if (!refreshToken) throw new Error('Chưa có refresh token')

  dangLamMoiPhien = (async () => {
    const res = await fetch(`${API_URL}/xacthuc/lam-moi-token`, {
      method: 'POST',
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      if (!daDangXuatDoHetPhien) {
        daDangXuatDoHetPhien = true
        xoaPhienDangNhap()
      }
      throw new Error(data.thongBao ?? 'Phiên đăng nhập đã hết hạn')
    }
    luuPhienDangNhap(data.duLieu)
    return data.duLieu as PhienDangNhap
  })()

  try {
    return await dangLamMoiPhien
  } finally {
    dangLamMoiPhien = null
  }
}

async function damBaoAccessTokenHopLe() {
  const token = layAccessToken()
  if (!token) return
  if (tokenSapHetHan(token) && layRefreshToken()) {
    await lamMoiPhienDangNhap()
  }
}

function docBodyJson(rawText: string) {
  if (!rawText) return {}
  try {
    return JSON.parse(rawText)
  } catch {
    return { thongBao: rawText, message: rawText }
  }
}

function layThongBaoLoi(data: any, macDinh: string) {
  const fieldErrors = data.fieldErrors ?? data.loi
  const firstFieldError = fieldErrors && typeof fieldErrors === 'object'
    ? Object.values(fieldErrors).flat().find(Boolean)
    : ''
  return String(firstFieldError || data.thongBao || data.message || macDinh)
}

export async function apiCoXacThuc(path: string, options: RequestInit = {}, thuLai = true): Promise<any> {
  if (thuLai) await damBaoAccessTokenHopLe()

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    cache: 'no-store',
    headers: { ...headerCoXacThuc(), ...(options.headers ?? {}) },
  })
  const data = docBodyJson(await res.text())

  if (res.status === 401 && thuLai && layRefreshToken()) {
    try {
      await lamMoiPhienDangNhap()
      return apiCoXacThuc(path, options, false)
    } catch (error) {
      if (!daDangXuatDoHetPhien) {
        daDangXuatDoHetPhien = true
        xoaPhienDangNhap()
      }
      throw error instanceof Error ? error : new Error('Phiên đăng nhập đã hết hạn')
    }
  }

  if (!res.ok) throw new Error(layThongBaoLoi(data, 'Thao tác thất bại'))
  return data.duLieu
}

export async function apiUploadCoXacThuc(path: string, formData: FormData, options: RequestInit = {}, thuLai = true): Promise<any> {
  if (thuLai) await damBaoAccessTokenHopLe()

  const token = layAccessToken()
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    method: options.method ?? 'POST',
    cache: 'no-store',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
    body: formData,
  })
  const data = docBodyJson(await res.text())

  if (res.status === 401 && thuLai && layRefreshToken()) {
    try {
      await lamMoiPhienDangNhap()
      return apiUploadCoXacThuc(path, formData, options, false)
    } catch (error) {
      if (!daDangXuatDoHetPhien) {
        daDangXuatDoHetPhien = true
        xoaPhienDangNhap()
      }
      throw error instanceof Error ? error : new Error('Phiên đăng nhập đã hết hạn')
    }
  }

  if (!res.ok) throw new Error(layThongBaoLoi(data, 'Upload thất bại'))
  return data.duLieu
}
