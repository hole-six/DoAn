import { z } from 'zod'
import { trangThaiHoSoUngTuyen } from './hosoungtuyen.mohinh.js'

export const kiemTraTaoHoSoUngTuyen = z.object({
  maUngVien: z.string().min(1),
  maTinTuyenDung: z.string().min(1),
  maHoSoNangLuc: z.string().optional(),
  thuXinViec: z.string().optional(),
  diemKhopKyNang: z.number().min(0).max(100).optional(),
  trangThai: z.enum(trangThaiHoSoUngTuyen).optional(),
  ngayNop: z.coerce.date().optional(),
})

export const kiemTraCapNhatHoSoUngTuyen = kiemTraTaoHoSoUngTuyen.partial()
