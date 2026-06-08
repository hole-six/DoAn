import { Router } from 'express'
import { taoDinhTuyenCoBan } from '../../dungchung/dinhtuyencoban.js'
import { yeuCauDangNhap } from '../../dungchung/xacthuc.js'
import { dieuKhienDanhGiaPhongVan } from './danhgiaphongvan.dieukhien.js'

const dinhTuyenCoBan = taoDinhTuyenCoBan(dieuKhienDanhGiaPhongVan)

export const dinhTuyenDanhGiaPhongVan = Router()
dinhTuyenDanhGiaPhongVan.use(yeuCauDangNhap)
dinhTuyenDanhGiaPhongVan.use(dinhTuyenCoBan)
