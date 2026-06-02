const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api'

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
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      xoaPhienDangNhap()
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

export async function apiCoXacThuc(path: string, options: RequestInit = {}, thuLai = true) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { ...headerCoXacThuc(), ...(options.headers ?? {}) },
  })
  const rawText = await res.text()
  let data: any = {}
  if (rawText) {
    try {
      data = JSON.parse(rawText)
    } catch {
      data = { thongBao: rawText, message: rawText }
    }
  }

  if (res.status === 401 && thuLai && layRefreshToken()) {
    try {
      await lamMoiPhienDangNhap()
      return apiCoXacThuc(path, options, false)
    } catch (error) {
      xoaPhienDangNhap()
      throw error instanceof Error ? error : new Error('Phiên đăng nhập đã hết hạn')
    }
  }

  if (!res.ok) {
    const fieldErrors = data.fieldErrors ?? data.loi
    const firstFieldError = fieldErrors && typeof fieldErrors === 'object'
      ? Object.values(fieldErrors).flat().find(Boolean)
      : ''
    throw new Error(String(firstFieldError || data.thongBao || 'Thao tác thất bại'))
  }
  return data.duLieu
}

export async function apiUploadCoXacThuc(path: string, formData: FormData, options: RequestInit = {}, thuLai = true) {
  const token = layAccessToken()
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    method: options.method ?? 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
    body: formData,
  })
  const rawText = await res.text()
  let data: any = {}
  if (rawText) {
    try {
      data = JSON.parse(rawText)
    } catch {
      data = { thongBao: rawText, message: rawText }
    }
  }

  if (res.status === 401 && thuLai && layRefreshToken()) {
    try {
      await lamMoiPhienDangNhap()
      return apiUploadCoXacThuc(path, formData, options, false)
    } catch (error) {
      xoaPhienDangNhap()
      throw error instanceof Error ? error : new Error('Phiên đăng nhập đã hết hạn')
    }
  }

  if (!res.ok) throw new Error(data.thongBao || 'Upload thất bại')
  return data.duLieu
}
