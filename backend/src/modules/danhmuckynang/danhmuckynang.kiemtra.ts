import { z } from 'zod'

export const kiemTraTaoDanhMucKyNang = z.object({
  tenKyNang: z.string().trim().min(1),
  loaiKyNang: z.string().trim().min(2),
})

export const kiemTraCapNhatDanhMucKyNang = kiemTraTaoDanhMucKyNang.partial()
