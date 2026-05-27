import { z } from 'zod'
import { trangThaiDuyetNhaTuyenDung } from './nhatuyendung.mohinh.js'

export const kiemTraTaoNhaTuyenDung = z.object({
  maNguoiDung: z.string().min(1),
  tenCongTy: z.string().min(2),
  maSoThue: z.string().optional(),
  moTa: z.string().optional(),
  diaChi: z.string().optional(),
  website: z.string().optional(),
  logo: z.string().optional(),
  quyMo: z.number().int().min(1).optional(),
  nganh: z.string().optional(),
  trangThaiDuyet: z.enum(trangThaiDuyetNhaTuyenDung).optional(),
  lyDoTuChoi: z.string().optional(),
  ngayDuyet: z.coerce.date().optional(),
})

export const kiemTraCapNhatNhaTuyenDung = kiemTraTaoNhaTuyenDung.partial()
