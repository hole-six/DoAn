import { Router } from 'express'
import { yeuCauDangNhap } from '../../dungchung/xacthuc.js'
import { dieuKhienThongBao } from './thongbao.dieukhien.js'

export const dinhTuyenThongBao = Router()

dinhTuyenThongBao.use(yeuCauDangNhap)

dinhTuyenThongBao.get('/', dieuKhienThongBao.layDanhSach)
dinhTuyenThongBao.get('/dem-chua-doc', dieuKhienThongBao.demChuaDoc)
dinhTuyenThongBao.get('/:ma', dieuKhienThongBao.layChiTiet)
dinhTuyenThongBao.post('/', dieuKhienThongBao.taoMoi)
dinhTuyenThongBao.patch('/:ma', dieuKhienThongBao.capNhat)
dinhTuyenThongBao.patch('/:id/danh-dau-da-doc', dieuKhienThongBao.danhDauDaDoc)
dinhTuyenThongBao.post('/danh-dau-tat-ca-da-doc', dieuKhienThongBao.danhDauTatCaDaDoc)
dinhTuyenThongBao.delete('/:ma', dieuKhienThongBao.xoa)

