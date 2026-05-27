import { Router } from 'express'
import { batLoiBatDongBo } from '../../dungchung/batloibatdongbo.js'
import { dieuKhienPortfolio } from './portfolio.dieukhien.js'

export const dinhTuyenPortfolio = Router()

dinhTuyenPortfolio.get('/', batLoiBatDongBo(dieuKhienPortfolio.layDanhSach))
dinhTuyenPortfolio.post('/', batLoiBatDongBo(dieuKhienPortfolio.taoMoi))
dinhTuyenPortfolio.get('/:ma', batLoiBatDongBo(dieuKhienPortfolio.layTheoMa))
dinhTuyenPortfolio.patch('/:ma', batLoiBatDongBo(dieuKhienPortfolio.capNhat))
dinhTuyenPortfolio.post('/:ma/preview', batLoiBatDongBo(dieuKhienPortfolio.preview))
dinhTuyenPortfolio.get('/:ma/export', batLoiBatDongBo(dieuKhienPortfolio.exportHtml))
