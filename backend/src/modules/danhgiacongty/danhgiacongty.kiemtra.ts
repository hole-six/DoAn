import { z } from 'zod'

export const kiemTraTaoDanhGiaCongTy = z.object({
  maUngVien: z.string().min(1),
  maNhaTuyenDung: z.string().min(1),
  diem: z.number().int().min(1).max(5),
  noiDung: z.string().min(3),
  anDanh: z.boolean().optional(),
  daDuyet: z.boolean().optional(),
})

export const kiemTraCapNhatDanhGiaCongTy = kiemTraTaoDanhGiaCongTy.partial()
