import { guiThongBaoChoNguoiDung } from '../../cauhinh/socket.js'
import { taoDichVuCoBan } from '../../dungchung/dichvucoban.js'
import { ThongBao } from './thongbao.mohinh.js'

export const dichVuThongBao = taoDichVuCoBan(ThongBao)

// Tao va gui thong bao real-time
export async function taoVaGuiThongBao(duLieu: {
  maNguoiDung: string
  loai: string
  tieuDe: string
  noiDung: string
  lienKet?: string
  mucDoUuTien?: string
  icon?: string
  mauSac?: string
  hanhDong?: Array<{ nhan: string; url: string; loai: string }>
  [key: string]: any
}) {
  const thongBao = await ThongBao.create(duLieu)

  guiThongBaoChoNguoiDung(duLieu.maNguoiDung, 'thong_bao_moi', {
    _id: thongBao._id,
    loai: thongBao.loai,
    tieuDe: thongBao.tieuDe,
    noiDung: thongBao.noiDung,
    lienKet: thongBao.lienKet,
    maHoSoUngTuyen: thongBao.maHoSoUngTuyen,
    maLichPhongVan: thongBao.maLichPhongVan,
    maTinTuyenDung: thongBao.maTinTuyenDung,
    mucDoUuTien: thongBao.mucDoUuTien,
    icon: thongBao.icon,
    mauSac: thongBao.mauSac,
    hanhDong: thongBao.hanhDong,
    ngayTao: thongBao.ngayTao,
  })

  return thongBao
}

// Danh dau da doc
export async function danhDauDaDoc(maThongBao: string, maNguoiDung: string) {
  const thongBao = await ThongBao.findOneAndUpdate(
    { _id: maThongBao, maNguoiDung },
    { daDoc: true },
    { new: true },
  )
  return thongBao
}

// Danh dau tat ca da doc
export async function danhDauTatCaDaDoc(maNguoiDung: string) {
  await ThongBao.updateMany({ maNguoiDung, daDoc: false }, { daDoc: true })
}

// Lay so thong bao chua doc
export async function demThongBaoChuaDoc(maNguoiDung: string) {
  return await ThongBao.countDocuments({ maNguoiDung, daDoc: false })
}

// Xoa thong bao cu (> 30 ngay)
export async function xoaThongBaoCu() {
  const ngayCu = new Date()
  ngayCu.setDate(ngayCu.getDate() - 30)

  const ketQua = await ThongBao.deleteMany({
    ngayTao: { $lt: ngayCu },
    daDoc: true,
  })

  return ketQua.deletedCount
}


