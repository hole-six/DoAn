import { Router } from 'express'
import { yeuCauDangNhap } from '../../dungchung/xacthuc.js'
import { dieuKhienUngVien } from './ungvien.dieukhien.js'

export const dinhTuyenUngVien = Router()

dinhTuyenUngVien.use(yeuCauDangNhap)
dinhTuyenUngVien.get('/dashboard', dieuKhienUngVien.layDashboard)
dinhTuyenUngVien.get('/toi', dieuKhienUngVien.layHoSoCuaToi)
dinhTuyenUngVien.get('/', dieuKhienUngVien.layDanhSach)
dinhTuyenUngVien.get('/:ma', dieuKhienUngVien.layChiTiet)
dinhTuyenUngVien.post('/', dieuKhienUngVien.taoMoi)
dinhTuyenUngVien.patch('/:ma', dieuKhienUngVien.capNhatCoQuyen)
dinhTuyenUngVien.delete('/:ma', dieuKhienUngVien.xoaCoQuyen)
