import { taoDieuKhienCoBan } from '../../dungchung/dieukhiencoban.js'
import { dichVuThongBao } from './thongbao.dichvu.js'
import { kiemTraCapNhatThongBao, kiemTraTaoThongBao } from './thongbao.kiemtra.js'

export const dieuKhienThongBao = taoDieuKhienCoBan(dichVuThongBao, kiemTraTaoThongBao, kiemTraCapNhatThongBao)
