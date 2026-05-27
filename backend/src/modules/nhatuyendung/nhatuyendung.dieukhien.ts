import { taoDieuKhienCoBan } from '../../dungchung/dieukhiencoban.js'
import { dichVuNhaTuyenDung } from './nhatuyendung.dichvu.js'
import { kiemTraCapNhatNhaTuyenDung, kiemTraTaoNhaTuyenDung } from './nhatuyendung.kiemtra.js'

export const dieuKhienNhaTuyenDung = taoDieuKhienCoBan(
  dichVuNhaTuyenDung,
  kiemTraTaoNhaTuyenDung,
  kiemTraCapNhatNhaTuyenDung,
)
