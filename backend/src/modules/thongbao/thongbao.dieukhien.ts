import { batLoiBatDongBo } from '../../dungchung/batloibatdongbo.js'
import { taoDieuKhienCoBan } from '../../dungchung/dieukhiencoban.js'
import { danhDauDaDoc, danhDauTatCaDaDoc, demThongBaoChuaDoc, dichVuThongBao } from './thongbao.dichvu.js'
import { kiemTraCapNhatThongBao, kiemTraTaoThongBao } from './thongbao.kiemtra.js'

const dieuKhienCoBan = taoDieuKhienCoBan(dichVuThongBao, kiemTraTaoThongBao, kiemTraCapNhatThongBao)

export const dieuKhienThongBao = {
  ...dieuKhienCoBan,

  // Đánh dấu đã đọc
  danhDauDaDoc: batLoiBatDongBo(async (yeuCau, phanHoi) => {
    const { id } = yeuCau.params
    const maNguoiDung = (yeuCau as any).nguoiDung._id

    const thongBao = await danhDauDaDoc(String(id), maNguoiDung)

    phanHoi.json({
      thongBao: 'Danh dau da doc thanh cong',
      duLieu: thongBao,
    })
  }),

  // Đánh dấu tất cả đã đọc
  danhDauTatCaDaDoc: batLoiBatDongBo(async (yeuCau, phanHoi) => {
    const maNguoiDung = (yeuCau as any).nguoiDung._id

    await danhDauTatCaDaDoc(maNguoiDung)

    phanHoi.json({
      thongBao: 'Danh dau tat ca da doc thanh cong',
    })
  }),

  // Đếm thông báo chưa đọc
  demChuaDoc: batLoiBatDongBo(async (yeuCau, phanHoi) => {
    const maNguoiDung = (yeuCau as any).nguoiDung._id

    const soLuong = await demThongBaoChuaDoc(maNguoiDung)

    phanHoi.json({
      duLieu: { soLuong },
    })
  }),
}
