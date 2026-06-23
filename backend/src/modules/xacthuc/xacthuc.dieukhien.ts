import { batLoiBatDongBo } from '../../dungchung/batloibatdongbo.js'
import { dangNhap, dangNhapGoogle, datLaiMatKhau, kiemTraTokenDatLaiMatKhau, lamMoiToken, layNguoiDungTuAccessToken, quenMatKhau } from './xacthuc.dichvu.js'
import { kiemTraDangNhap, kiemTraDangNhapGoogle, kiemTraDatLaiMatKhau, kiemTraLamMoiToken, kiemTraQuenMatKhau } from './xacthuc.kiemtra.js'

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

  quenMatKhau: batLoiBatDongBo(async (yeuCau, phanHoi) => {
    const duLieu = kiemTraQuenMatKhau.parse(yeuCau.body)
    const ketQua = await quenMatKhau(duLieu)

    phanHoi.json({
      thongBao: 'Nếu email tồn tại, hệ thống đã gửi hướng dẫn đặt lại mật khẩu',
      duLieu: ketQua,
    })
  }),

  kiemTraTokenDatLaiMatKhau: batLoiBatDongBo(async (yeuCau, phanHoi) => {
    const token = String(yeuCau.params.token ?? '')
    const ketQua = await kiemTraTokenDatLaiMatKhau(token)
    phanHoi.json({ duLieu: ketQua })
  }),

  datLaiMatKhau: batLoiBatDongBo(async (yeuCau, phanHoi) => {
    const duLieu = kiemTraDatLaiMatKhau.parse(yeuCau.body)
    const ketQua = await datLaiMatKhau(duLieu)

    phanHoi.json({
      thongBao: 'Đặt lại mật khẩu thành công',
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


