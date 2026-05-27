import { Router } from 'express'
import type { RequestHandler } from 'express'

type DieuKhienCoBan = {
  layDanhSach: RequestHandler
  layChiTiet: RequestHandler
  taoMoi: RequestHandler
  capNhat: RequestHandler
  xoa: RequestHandler
}

export function taoDinhTuyenCoBan(dieuKhien: DieuKhienCoBan) {
  const dinhTuyen = Router()

  dinhTuyen.get('/', dieuKhien.layDanhSach)
  dinhTuyen.get('/:ma', dieuKhien.layChiTiet)
  dinhTuyen.post('/', dieuKhien.taoMoi)
  dinhTuyen.patch('/:ma', dieuKhien.capNhat)
  dinhTuyen.delete('/:ma', dieuKhien.xoa)

  return dinhTuyen
}
