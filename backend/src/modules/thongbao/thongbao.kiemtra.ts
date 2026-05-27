import { z } from 'zod'
import { loaiThongBao } from './thongbao.mohinh.js'

export const kiemTraTaoThongBao = z.object({
  maNguoiDung: z.string().min(1),
  loai: z.enum(loaiThongBao).optional(),
  tieuDe: z.string().min(2),
  noiDung: z.string().min(2),
  lienKet: z.string().optional(),
  maHoSoUngTuyen: z.string().optional(),
  maLichPhongVan: z.string().optional(),
  daDoc: z.boolean().optional(),
})

export const kiemTraCapNhatThongBao = kiemTraTaoThongBao.partial()
