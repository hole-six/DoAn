import { batLoiBatDongBo } from '../../dungchung/batloibatdongbo.js'
import { dangNhap, dangNhapGoogle, lamMoiToken, layNguoiDungTuAccessToken } from './xacthuc.dichvu.js'
import { kiemTraDangNhap, kiemTraDangNhapGoogle, kiemTraLamMoiToken } from './xacthuc.kiemtra.js'

export const dieuKhienXacThuc = {
  dangNhap: batLoiBatDongBo(async (yeuCau, phanHoi) => {
    const duLieu = kiemTraDangNhap.parse(yeuCau.body)
    const ketQua = await dangNhap(duLieu)

    phanHoi.json({
      thongBao: 'Đăng nhập thành công',
      duLieu: ketQua,
    })
  }),

  dangNhapGoogle: batLoiBatDongBo(async (yeuCau, phanHoi) => {
    const duLieu = kiemTraDangNhapGoogle.parse(yeuCau.body)
    const ketQua = await dangNhapGoogle(duLieu)

    phanHoi.json({
      thongBao: 'Đăng nhập Google thành công',
      duLieu: ketQua,
    })
  }),

  lamMoiToken: batLoiBatDongBo(async (yeuCau, phanHoi) => {
    const duLieu = kiemTraLamMoiToken.parse(yeuCau.body)
    const ketQua = await lamMoiToken(duLieu)

    phanHoi.json({
      thongBao: 'Làm mới token thành công',
      duLieu: ketQua,
    })
  }),

  toi: batLoiBatDongBo(async (yeuCau, phanHoi) => {
    const nguoiDung = await layNguoiDungTuAccessToken(yeuCau.headers.authorization)
    phanHoi.json({ duLieu: nguoiDung })
  }),

  dangXuat: batLoiBatDongBo(async (_yeuCau, phanHoi) => {
    phanHoi.status(204).send()
  }),
}


