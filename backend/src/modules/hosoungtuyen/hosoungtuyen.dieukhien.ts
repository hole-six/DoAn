import { taoDieuKhienCoBan } from '../../dungchung/dieukhiencoban.js'
import { dichVuHoSoUngTuyen } from './hosoungtuyen.dichvu.js'
import { kiemTraCapNhatHoSoUngTuyen, kiemTraTaoHoSoUngTuyen } from './hosoungtuyen.kiemtra.js'

export const dieuKhienHoSoUngTuyen = taoDieuKhienCoBan(
  dichVuHoSoUngTuyen,
  kiemTraTaoHoSoUngTuyen,
  kiemTraCapNhatHoSoUngTuyen,
)
