import { taoDieuKhienCoBan } from '../../dungchung/dieukhiencoban.js'
import { dichVuNguoiDung } from './nguoidung.dichvu.js'
import { kiemTraCapNhatNguoiDung, kiemTraTaoNguoiDung } from './nguoidung.kiemtra.js'

export const dieuKhienNguoiDung = taoDieuKhienCoBan(
  dichVuNguoiDung,
  kiemTraTaoNguoiDung,
  kiemTraCapNhatNguoiDung,
)
