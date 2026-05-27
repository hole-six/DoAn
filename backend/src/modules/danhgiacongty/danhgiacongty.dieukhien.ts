import { taoDieuKhienCoBan } from '../../dungchung/dieukhiencoban.js'
import { dichVuDanhGiaCongTy } from './danhgiacongty.dichvu.js'
import { kiemTraCapNhatDanhGiaCongTy, kiemTraTaoDanhGiaCongTy } from './danhgiacongty.kiemtra.js'

export const dieuKhienDanhGiaCongTy = taoDieuKhienCoBan(
  dichVuDanhGiaCongTy,
  kiemTraTaoDanhGiaCongTy,
  kiemTraCapNhatDanhGiaCongTy,
)
