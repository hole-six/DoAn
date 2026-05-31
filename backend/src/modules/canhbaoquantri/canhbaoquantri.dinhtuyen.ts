import { Router } from 'express'
import { batLoiBatDongBo } from '../../dungchung/batloibatdongbo.js'
import { laySnapshotCanhBaoQuanTri, tinhCanhBaoQuanTri } from './canhbaoquantri.dichvu.js'

export const dinhTuyenCanhBaoQuanTri = Router()

dinhTuyenCanhBaoQuanTri.get('/', batLoiBatDongBo(async (_yeuCau, phanHoi) => {
  const duLieu = await laySnapshotCanhBaoQuanTri()
  phanHoi.json({ duLieu })
}))

dinhTuyenCanhBaoQuanTri.post('/tinh-lai', batLoiBatDongBo(async (_yeuCau, phanHoi) => {
  const duLieu = await tinhCanhBaoQuanTri()
  phanHoi.json({ duLieu })
}))
