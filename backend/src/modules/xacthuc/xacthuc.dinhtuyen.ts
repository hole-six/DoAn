import { Router } from 'express'
import { dieuKhienXacThuc } from './xacthuc.dieukhien.js'

export const dinhTuyenXacThuc = Router()

dinhTuyenXacThuc.post('/dang-nhap', dieuKhienXacThuc.dangNhap)
