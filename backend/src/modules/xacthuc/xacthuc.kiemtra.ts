import { z } from 'zod'
import { vaiTroNguoiDung } from '../nguoidung/nguoidung.mohinh.js'

export const kiemTraDangNhap = z.object({
  email: z.string().email(),
  matKhau: z.string().min(1),
  vaiTro: z.enum(vaiTroNguoiDung).optional(),
})
