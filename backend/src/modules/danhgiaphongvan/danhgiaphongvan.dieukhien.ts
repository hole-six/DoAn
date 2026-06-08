import { taoDieuKhienCoBan } from '../../dungchung/dieukhiencoban.js'
import { dichVuDanhGiaPhongVan } from './danhgiaphongvan.dichvu.js'
import { kiemTraCapNhatDanhGiaPhongVan, kiemTraTaoDanhGiaPhongVan } from './danhgiaphongvan.kiemtra.js'

export const dieuKhienDanhGiaPhongVan = taoDieuKhienCoBan(
  dichVuDanhGiaPhongVan,
  kiemTraTaoDanhGiaPhongVan,
  kiemTraCapNhatDanhGiaPhongVan,
)
