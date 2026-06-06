import { z } from 'zod'

export const kiemTraTaoDanhGiaCongTy = z.object({
  maUngVien: z.string().min(1),
  maNhaTuyenDung: z.string().min(1),
  maHoSoUngTuyen: z.string().min(1).optional(),
  diem: z.number().int().min(1).max(5),
  noiDung: z.string().min(3),
  anDanh: z.boolean().optional(),
  daDuyet: z.boolean().optional(),
})

export const kiemTraUngVienTaoDanhGiaCongTy = z.object({
  diem: z.number().int().min(1).max(5),
  noiDung: z.string().trim().min(10, 'Nội dung đánh giá cần ít nhất 10 ký tự'),
  anDanh: z.boolean().optional(),
})

export const kiemTraCapNhatDanhGiaCongTy = kiemTraTaoDanhGiaCongTy.partial()
