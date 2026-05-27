import { taoDieuKhienCoBan } from '../../dungchung/dieukhiencoban.js'
import { dichVuUngVien } from './ungvien.dichvu.js'
import { kiemTraCapNhatUngVien, kiemTraTaoUngVien } from './ungvien.kiemtra.js'

export const dieuKhienUngVien = taoDieuKhienCoBan(dichVuUngVien, kiemTraTaoUngVien, kiemTraCapNhatUngVien)
