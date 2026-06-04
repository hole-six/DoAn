import { z } from 'zod'
import { vaiTroNguoiDung } from '../nguoidung/nguoidung.mohinh.js'

export const kiemTraDangNhap = z.object({
  email: z.string().email(),
  matKhau: z.string().min(1),
  vaiTro: z.enum(vaiTroNguoiDung).optional(),
})

export const kiemTraLamMoiToken = z.object({
  refreshToken: z.string().min(1),
})

export const kiemTraDangNhapGoogle = z.object({
  credential: z.string().min(1),
  vaiTro: z.enum(vaiTroNguoiDung).optional(),
})

export const kiemTraQuenMatKhau = z.object({
  email: z.string().email(),
})

export const kiemTraDatLaiMatKhau = z.object({
  token: z.string().min(32),
  matKhau: z.string().min(6),
})
