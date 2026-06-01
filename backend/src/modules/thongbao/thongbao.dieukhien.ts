import { batLoiBatDongBo } from '../../dungchung/batloibatdongbo.js'
import { LoiUngDung } from '../../dungchung/loiungdung.js'
import { danhDauDaDoc, danhDauTatCaDaDoc, demThongBaoChuaDoc, taoVaGuiThongBao } from './thongbao.dichvu.js'
import { kiemTraCapNhatThongBao, kiemTraTaoThongBao } from './thongbao.kiemtra.js'
import { ThongBao } from './thongbao.mohinh.js'

function maNguoiDungTuRequest(yeuCau: any): string {
  const ma = String(yeuCau?.nguoiDung?._id ?? yeuCau?.user?.id ?? '')
  if (!ma) throw new LoiUngDung('Ban can dang nhap de thuc hien thao tac nay', 401, 'UNAUTHORIZED')
  return ma
}

export const dieuKhienThongBao = {
  layDanhSach: batLoiBatDongBo(async (yeuCau, phanHoi) => {
    const maNguoiDung = maNguoiDungTuRequest(yeuCau as any)
    const limitRaw = Number(yeuCau.query.limit ?? 30)
    const limit = Number.isFinite(limitRaw) ? Math.max(1, Math.min(limitRaw, 200)) : 30
    const boLoc: Record<string, unknown> = { maNguoiDung }
    if (yeuCau.query.loai) boLoc.loai = String(yeuCau.query.loai)
    const duLieu = await (ThongBao as any)
      .find(boLoc)
      .sort({ ngayTao: -1 })
      .limit(limit)
    phanHoi.json({ duLieu })
  }),

  layChiTiet: batLoiBatDongBo(async (yeuCau, phanHoi) => {
    const maNguoiDung = maNguoiDungTuRequest(yeuCau as any)
    const ma = String(yeuCau.params.ma ?? '')
    const duLieu = await (ThongBao as any).findOne({ _id: ma, maNguoiDung })
    if (!duLieu) throw new LoiUngDung('Khong tim thay thong bao', 404, 'NOT_FOUND')
    phanHoi.json({ duLieu })
  }),

  taoMoi: batLoiBatDongBo(async (yeuCau, phanHoi) => {
    const payload = kiemTraTaoThongBao.parse(yeuCau.body)
    const nguoiDung = (yeuCau as any).nguoiDung
    const coQuyenTaoThongBaoKhac = nguoiDung?.vaiTro === 'admin'
    const maNguoiDung = coQuyenTaoThongBaoKhac ? payload.maNguoiDung : maNguoiDungTuRequest(yeuCau as any)
    const duLieu = await taoVaGuiThongBao({
      ...payload,
      maNguoiDung,
      loai: payload.loai ?? 'he_thong',
    })
    phanHoi.status(201).json({ duLieu })
  }),

  capNhat: batLoiBatDongBo(async (yeuCau, phanHoi) => {
    const maNguoiDung = maNguoiDungTuRequest(yeuCau as any)
    const payload = kiemTraCapNhatThongBao.parse(yeuCau.body)
    const ma = String(yeuCau.params.ma ?? '')
    const duLieu = await (ThongBao as any).findOneAndUpdate(
      { _id: ma, maNguoiDung },
      payload,
      { new: true, runValidators: true },
    )
    if (!duLieu) throw new LoiUngDung('Khong tim thay thong bao de cap nhat', 404, 'NOT_FOUND')
    phanHoi.json({ duLieu })
  }),

  xoa: batLoiBatDongBo(async (yeuCau, phanHoi) => {
    const maNguoiDung = maNguoiDungTuRequest(yeuCau as any)
    const ma = String(yeuCau.params.ma ?? '')
    const duLieu = await (ThongBao as any).findOneAndDelete({ _id: ma, maNguoiDung })
    if (!duLieu) throw new LoiUngDung('Khong tim thay thong bao de xoa', 404, 'NOT_FOUND')
    phanHoi.status(204).send()
  }),

  danhDauDaDoc: batLoiBatDongBo(async (yeuCau, phanHoi) => {
    const { id } = yeuCau.params
    const maNguoiDung = maNguoiDungTuRequest(yeuCau as any)

    const thongBao = await danhDauDaDoc(String(id), maNguoiDung)
    if (!thongBao) throw new LoiUngDung('Khong tim thay thong bao', 404, 'NOT_FOUND')

    phanHoi.json({
      thongBao: 'Danh dau da doc thanh cong',
      duLieu: thongBao,
    })
  }),

  danhDauTatCaDaDoc: batLoiBatDongBo(async (yeuCau, phanHoi) => {
    const maNguoiDung = maNguoiDungTuRequest(yeuCau as any)
    await danhDauTatCaDaDoc(maNguoiDung)
    phanHoi.json({
      thongBao: 'Danh dau tat ca da doc thanh cong',
    })
  }),

  demChuaDoc: batLoiBatDongBo(async (yeuCau, phanHoi) => {
    const maNguoiDung = maNguoiDungTuRequest(yeuCau as any)
    const soLuong = await demThongBaoChuaDoc(maNguoiDung)
    phanHoi.json({
      duLieu: { soLuong },
    })
  }),
}
