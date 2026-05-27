import { taoDieuKhienCoBan } from '../../dungchung/dieukhiencoban.js'
import { dichVuLichPhongVan } from './lichphongvan.dichvu.js'
import { kiemTraCapNhatLichPhongVan, kiemTraTaoLichPhongVan } from './lichphongvan.kiemtra.js'

export const dieuKhienLichPhongVan = taoDieuKhienCoBan(
  dichVuLichPhongVan,
  kiemTraTaoLichPhongVan,
  kiemTraCapNhatLichPhongVan,
)
