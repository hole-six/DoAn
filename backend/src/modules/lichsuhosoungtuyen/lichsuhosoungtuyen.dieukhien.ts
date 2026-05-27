import { taoDieuKhienCoBan } from '../../dungchung/dieukhiencoban.js'
import { dichVuLichSuHoSoUngTuyen } from './lichsuhosoungtuyen.dichvu.js'
import {
  kiemTraCapNhatLichSuHoSoUngTuyen,
  kiemTraTaoLichSuHoSoUngTuyen,
} from './lichsuhosoungtuyen.kiemtra.js'

export const dieuKhienLichSuHoSoUngTuyen = taoDieuKhienCoBan(
  dichVuLichSuHoSoUngTuyen,
  kiemTraTaoLichSuHoSoUngTuyen,
  kiemTraCapNhatLichSuHoSoUngTuyen,
)
