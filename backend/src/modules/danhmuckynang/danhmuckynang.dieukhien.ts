import { taoDieuKhienCoBan } from '../../dungchung/dieukhiencoban.js'
import { dichVuDanhMucKyNang } from './danhmuckynang.dichvu.js'
import { kiemTraCapNhatDanhMucKyNang, kiemTraTaoDanhMucKyNang } from './danhmuckynang.kiemtra.js'

export const dieuKhienDanhMucKyNang = taoDieuKhienCoBan(
  dichVuDanhMucKyNang,
  kiemTraTaoDanhMucKyNang,
  kiemTraCapNhatDanhMucKyNang,
)
