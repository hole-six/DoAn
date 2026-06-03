import { Router } from 'express'
import { batLoiBatDongBo } from '../../dungchung/batloibatdongbo.js'
import { yeuCauDangNhap, yeuCauVaiTro } from '../../dungchung/xacthuc.js'
import { dichVuViecLamDaLuu } from './vieclamdaluu.dichvu.js'

export const dinhTuyenViecLamDaLuu = Router()

dinhTuyenViecLamDaLuu.use(yeuCauDangNhap)
dinhTuyenViecLamDaLuu.use(yeuCauVaiTro(['ung_vien']))

dinhTuyenViecLamDaLuu.get('/', batLoiBatDongBo(async (yeuCau, phanHoi) => {
  const maNguoiDung = String((yeuCau as any).nguoiDung._id)
  const danhSach = await dichVuViecLamDaLuu.layDanhSach(maNguoiDung)
  phanHoi.json({ thongBao: 'Lấy danh sách việc làm đã lưu thành công', duLieu: danhSach })
}))

dinhTuyenViecLamDaLuu.post('/:maTinTuyenDung', batLoiBatDongBo(async (yeuCau, phanHoi) => {
  const maNguoiDung = String((yeuCau as any).nguoiDung._id)
  const ketQua = await dichVuViecLamDaLuu.luu(maNguoiDung, String(yeuCau.params.maTinTuyenDung))
  phanHoi.status(201).json({ thongBao: 'Đã lưu việc làm', duLieu: ketQua })
}))

dinhTuyenViecLamDaLuu.delete('/:maTinTuyenDung', batLoiBatDongBo(async (yeuCau, phanHoi) => {
  const maNguoiDung = String((yeuCau as any).nguoiDung._id)
  const ketQua = await dichVuViecLamDaLuu.boLuu(maNguoiDung, String(yeuCau.params.maTinTuyenDung))
  phanHoi.json({ thongBao: 'Đã bỏ lưu việc làm', duLieu: ketQua })
}))
