import { Router } from 'express'
import { dieuKhienXacThuc } from './xacthuc.dieukhien.js'

export const dinhTuyenXacThuc = Router()

dinhTuyenXacThuc.post('/dang-nhap', dieuKhienXacThuc.dangNhap)
dinhTuyenXacThuc.post('/dang-nhap-google', dieuKhienXacThuc.dangNhapGoogle)
dinhTuyenXacThuc.post('/lam-moi-token', dieuKhienXacThuc.lamMoiToken)
dinhTuyenXacThuc.get('/toi', dieuKhienXacThuc.toi)
dinhTuyenXacThuc.post('/dang-xuat', dieuKhienXacThuc.dangXuat)
