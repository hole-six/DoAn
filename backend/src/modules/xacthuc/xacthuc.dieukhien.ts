import { batLoiBatDongBo } from '../../dungchung/batloibatdongbo.js'
import { dangNhap } from './xacthuc.dichvu.js'
import { kiemTraDangNhap } from './xacthuc.kiemtra.js'

export const dieuKhienXacThuc = {
  dangNhap: batLoiBatDongBo(async (yeuCau, phanHoi) => {
    const duLieu = kiemTraDangNhap.parse(yeuCau.body)
    const ketQua = await dangNhap(duLieu)

    phanHoi.json({
      thongBao: 'Dang nhap thanh cong',
      duLieu: ketQua,
    })
  }),
}
