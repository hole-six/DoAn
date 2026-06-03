import { Router } from 'express'
import { dieuKhienTinNhan } from './tinnhan.dieukhien.js'
import { yeuCauDangNhap } from '../../dungchung/xacthuc.js'

export const dinhTuyenTinNhan = Router()
dinhTuyenTinNhan.use(yeuCauDangNhap)

// Conversation routes
dinhTuyenTinNhan.get('/admin-support/contacts', dieuKhienTinNhan.layDanhBaHoTroQuanTri)
dinhTuyenTinNhan.get('/cuoc-tro-chuyen', dieuKhienTinNhan.layDanhSachCuocTroChuyenModel)
dinhTuyenTinNhan.post('/cuoc-tro-chuyen', dieuKhienTinNhan.layHoacTaoCuocTroChuyenModel)
dinhTuyenTinNhan.get('/cuoc-tro-chuyen/:id', dieuKhienTinNhan.layCuocTroChuyenModel)
dinhTuyenTinNhan.post('/cuoc-tro-chuyen/:id/danh-dau-da-doc', dieuKhienTinNhan.danhDauDaDoc)

// Group community routes
dinhTuyenTinNhan.get('/nhom-cong-dong', dieuKhienTinNhan.layNhomCongDong)
dinhTuyenTinNhan.post('/nhom-cong-dong/tham-gia/:id', dieuKhienTinNhan.thamGiaNhomCongDong)

// Message routes
dinhTuyenTinNhan.get('/cuoc-tro-chuyen/:id/tin-nhan', dieuKhienTinNhan.layDanhSachTinNhan)
dinhTuyenTinNhan.post('/cuoc-tro-chuyen/:id/tin-nhan', dieuKhienTinNhan.guiTinNhan)
dinhTuyenTinNhan.delete('/tin-nhan/:maTinNhan', dieuKhienTinNhan.xoaTinNhan)
dinhTuyenTinNhan.post('/tin-nhan/:maTinNhan/phan-ung', dieuKhienTinNhan.themPhanUng)
