import { guiThongBaoChoNguoiDung } from '../../cauhinh/socket.js'
import { taoDichVuCoBan } from '../../dungchung/dichvucoban.js'
import { coId } from '../../dungchung/prismaHelper.js'
import { ThongBao } from './thongbao.mohinh.js'

export const dichVuThongBao = taoDichVuCoBan(ThongBao)

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
  const thongBao = coId(await ThongBao.create({ data: duLieu })) as any

  guiThongBaoChoNguoiDung(duLieu.maNguoiDung, 'thong_bao_moi', {
    _id: thongBao._id,
    id: thongBao.id,
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

export async function danhDauDaDoc(maThongBao: string, maNguoiDung: string) {
  const thongBao = await ThongBao.findFirst({ where: { id: maThongBao, maNguoiDung } })
  if (!thongBao) return null
  return coId(await ThongBao.update({ where: { id: maThongBao }, data: { daDoc: true } }))
}

export async function danhDauTatCaDaDoc(maNguoiDung: string) {
  await ThongBao.updateMany({ where: { maNguoiDung, daDoc: false }, data: { daDoc: true } })
}

export async function demThongBaoChuaDoc(maNguoiDung: string) {
  return ThongBao.count({ where: { maNguoiDung, daDoc: false } })
}

export async function xoaThongBaoCu() {
  const ngayCu = new Date()
  ngayCu.setDate(ngayCu.getDate() - 30)
  const ketQua = await ThongBao.deleteMany({ where: { ngayTao: { lt: ngayCu }, daDoc: true } })
  return ketQua.count
}
