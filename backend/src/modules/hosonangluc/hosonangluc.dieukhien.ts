import { taoDieuKhienCoBan } from '../../dungchung/dieukhiencoban.js'
import { dichVuHoSoNangLuc } from './hosonangluc.dichvu.js'
import { kiemTraCapNhatHoSoNangLuc, kiemTraTaoHoSoNangLuc } from './hosonangluc.kiemtra.js'

export const dieuKhienHoSoNangLuc = taoDieuKhienCoBan(
  dichVuHoSoNangLuc,
  kiemTraTaoHoSoNangLuc,
  kiemTraCapNhatHoSoNangLuc,
)
