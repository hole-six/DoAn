import { z } from 'zod'
import { ketQuaDeXuatPhongVan, vaiTroNguoiDanhGiaPhongVan } from './danhgiaphongvan.mohinh.js'

export const kiemTraTaoDanhGiaPhongVan = z.object({
  maLichPhongVan: z.string().min(1),
  maNguoiDung: z.string().min(1),
  vaiTroNguoiDanhGia: z.enum(vaiTroNguoiDanhGiaPhongVan),
  diem: z.number().int().min(1).max(10).optional(),
  noiDung: z.string().min(1),
  ketQuaDeXuat: z.enum(ketQuaDeXuatPhongVan).optional(),
})

export const kiemTraCapNhatDanhGiaPhongVan = kiemTraTaoDanhGiaPhongVan.partial()
