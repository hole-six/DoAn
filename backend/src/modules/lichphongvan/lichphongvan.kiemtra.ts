import { z } from 'zod'
import { hinhThucPhongVan, ketQuaPhongVan, trangThaiLichPhongVan } from './lichphongvan.mohinh.js'

export const kiemTraTaoLichPhongVan = z.object({
  maHoSoUngTuyen: z.string().min(1),
  thoiGianBatDau: z.coerce.date(),
  thoiGianKetThuc: z.coerce.date().optional(),
  diaChi: z.string().optional(),
  hinhThuc: z.enum(hinhThucPhongVan).optional(),
  linkHop: z.string().optional(),
  ghiChu: z.string().optional(),
  trangThai: z.enum(trangThaiLichPhongVan).optional(),
  ketQua: z.enum(ketQuaPhongVan).optional(),
})

export const kiemTraCapNhatLichPhongVan = kiemTraTaoLichPhongVan.partial()
