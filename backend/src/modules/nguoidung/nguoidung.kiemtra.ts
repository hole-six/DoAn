import { z } from 'zod'
import { trangThaiTaiKhoan, vaiTroNguoiDung } from './nguoidung.mohinh.js'

export const kiemTraTaoNguoiDung = z.object({
  email: z.string().email(),
  matKhau: z.string().min(6),
  hoTen: z.string().min(2),
  soDienThoai: z.string().optional(),
  vaiTro: z.enum(vaiTroNguoiDung).optional(),
  trangThai: z.enum(trangThaiTaiKhoan).optional(),
})

export const kiemTraCapNhatNguoiDung = kiemTraTaoNguoiDung.partial()
