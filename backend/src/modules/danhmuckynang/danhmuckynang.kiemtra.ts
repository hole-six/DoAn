import { z } from 'zod'
import { loaiKyNang } from './danhmuckynang.mohinh.js'

export const kiemTraTaoDanhMucKyNang = z.object({
  tenKyNang: z.string().min(1),
  loaiKyNang: z.enum(loaiKyNang),
})

export const kiemTraCapNhatDanhMucKyNang = kiemTraTaoDanhMucKyNang.partial()
