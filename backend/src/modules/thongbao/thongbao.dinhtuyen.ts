import { taoDinhTuyenCoBan } from '../../dungchung/dinhtuyencoban.js'
import { dieuKhienThongBao } from './thongbao.dieukhien.js'

const dinhTuyenCoBan = taoDinhTuyenCoBan(dieuKhienThongBao)

// Thêm routes mới
dinhTuyenCoBan.patch('/:id/danh-dau-da-doc', dieuKhienThongBao.danhDauDaDoc)
dinhTuyenCoBan.post('/danh-dau-tat-ca-da-doc', dieuKhienThongBao.danhDauTatCaDaDoc)
dinhTuyenCoBan.get('/dem-chua-doc', dieuKhienThongBao.demChuaDoc)

export const dinhTuyenThongBao = dinhTuyenCoBan
