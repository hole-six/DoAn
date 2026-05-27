import { taoDieuKhienCoBan } from '../../dungchung/dieukhiencoban.js'
import { dichVuTinTuyenDung } from './tintuyendung.dichvu.js'
import { kiemTraCapNhatTinTuyenDung, kiemTraTaoTinTuyenDung } from './tintuyendung.kiemtra.js'

export const dieuKhienTinTuyenDung = taoDieuKhienCoBan(
  dichVuTinTuyenDung,
  kiemTraTaoTinTuyenDung,
  kiemTraCapNhatTinTuyenDung,
)
