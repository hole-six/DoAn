import { z } from 'zod'
import { trangThaiHoSoUngTuyen } from '../hosoungtuyen/hosoungtuyen.mohinh.js'

export const kiemTraTaoLichSuHoSoUngTuyen = z.object({
  maHoSoUngTuyen: z.string().min(1),
  trangThaiCu: z.enum(trangThaiHoSoUngTuyen).optional(),
  trangThaiMoi: z.enum(trangThaiHoSoUngTuyen),
  ghiChu: z.string().optional(),
  maNguoiDung: z.string().optional(),
  thoiGian: z.coerce.date().optional(),
})

export const kiemTraCapNhatLichSuHoSoUngTuyen = kiemTraTaoLichSuHoSoUngTuyen.partial()
