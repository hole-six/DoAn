import { Router } from 'express'
import { batLoiBatDongBo } from '../../dungchung/batloibatdongbo.js'
import { yeuCauDangNhap, yeuCauVaiTro } from '../../dungchung/xacthuc.js'
import { dichVuDanhGiaCongTy } from './danhgiacongty.dichvu.js'
import { dieuKhienDanhGiaCongTy } from './danhgiacongty.dieukhien.js'
import { kiemTraUngVienTaoDanhGiaCongTy } from './danhgiacongty.kiemtra.js'

export const dinhTuyenDanhGiaCongTy = Router()

dinhTuyenDanhGiaCongTy.get('/', dieuKhienDanhGiaCongTy.layDanhSach)

dinhTuyenDanhGiaCongTy.get('/toi', yeuCauDangNhap, yeuCauVaiTro(['ung_vien']), batLoiBatDongBo(async (yeuCau, phanHoi) => {
  const duLieu = await dichVuDanhGiaCongTy.layCuaUngVien((yeuCau as any).nguoiDung)
  phanHoi.json({ duLieu })
}))

dinhTuyenDanhGiaCongTy.post('/tu-ho-so/:maHoSoUngTuyen', yeuCauDangNhap, yeuCauVaiTro(['ung_vien']), batLoiBatDongBo(async (yeuCau, phanHoi) => {
  const duLieuHopLe = kiemTraUngVienTaoDanhGiaCongTy.parse(yeuCau.body)
  const duLieu = await dichVuDanhGiaCongTy.taoTuHoSo(
    (yeuCau as any).nguoiDung,
    String(yeuCau.params.maHoSoUngTuyen ?? ''),
    duLieuHopLe,
  )
  phanHoi.status(201).json({ duLieu })
}))

dinhTuyenDanhGiaCongTy.get('/:ma', dieuKhienDanhGiaCongTy.layChiTiet)
dinhTuyenDanhGiaCongTy.post('/', yeuCauDangNhap, yeuCauVaiTro(['admin']), dieuKhienDanhGiaCongTy.taoMoi)
dinhTuyenDanhGiaCongTy.patch('/:ma', yeuCauDangNhap, yeuCauVaiTro(['admin']), dieuKhienDanhGiaCongTy.capNhat)
dinhTuyenDanhGiaCongTy.delete('/:ma', yeuCauDangNhap, yeuCauVaiTro(['admin']), dieuKhienDanhGiaCongTy.xoa)

