import { batLoiBatDongBo } from '../../dungchung/batloibatdongbo.js'
import { LoiUngDung } from '../../dungchung/loiungdung.js'
import {
  layDanhSachCuocTroChuyenModel,
  layHoacTaoCuocTroChuyenModel,
  layCuocTroChuyenModelTheoMa,
  danhDauDaDocCuocTroChuyenModel,
  guiTinNhan,
  layDanhSachTinNhan,
  xoaTinNhan,
  themPhanUng,
  layDanhSachNhomCongDong,
  thamGiaNhomCongDong,
} from './tinnhan.dichvu.js'

export const dieuKhienTinNhan = {
  // ============================================
  // CONVERSATION CONTROLLERS
  // ============================================

  layDanhSachCuocTroChuyenModel: batLoiBatDongBo(async (yeuCau, phanHoi) => {
    const maNguoiDung = (yeuCau as any).nguoiDung._id
    const danhSach = await layDanhSachCuocTroChuyenModel(maNguoiDung)
    phanHoi.json({ thongBao: 'Lay danh sach cuoc tro chuyen thanh cong', duLieu: danhSach })
  }),

  layHoacTaoCuocTroChuyenModel: batLoiBatDongBo(async (yeuCau, phanHoi) => {
    const maNguoiDung = (yeuCau as any).nguoiDung._id
    const { nguoiNhan, maHoSoUngTuyen, maTinTuyenDung, loai } = yeuCau.body
    if (!nguoiNhan) throw new LoiUngDung('Thieu nguoi nhan tin nhan', 422, 'MISSING_RECEIVER')
    const cuocTroChuyenModel = await layHoacTaoCuocTroChuyenModel({
      nguoiThamGia: [maNguoiDung, nguoiNhan],
      loai,
      maHoSoUngTuyen,
      maTinTuyenDung,
    })
    phanHoi.json({ thongBao: 'Lay cuoc tro chuyen thanh cong', duLieu: cuocTroChuyenModel })
  }),

  layCuocTroChuyenModel: batLoiBatDongBo(async (yeuCau, phanHoi) => {
    const maNguoiDung = (yeuCau as any).nguoiDung._id
    const { id } = yeuCau.params
    const cuocTroChuyenModel = await layCuocTroChuyenModelTheoMa(String(id), maNguoiDung)
    phanHoi.json({ thongBao: 'Lay cuoc tro chuyen thanh cong', duLieu: cuocTroChuyenModel })
  }),

  danhDauDaDoc: batLoiBatDongBo(async (yeuCau, phanHoi) => {
    const maNguoiDung = (yeuCau as any).nguoiDung._id
    const { id } = yeuCau.params
    await danhDauDaDocCuocTroChuyenModel(String(id), maNguoiDung)
    phanHoi.json({ thongBao: 'Danh dau da doc thanh cong' })
  }),

  // ============================================
  // GROUP COMMUNITY CONTROLLERS
  // ============================================

  layNhomCongDong: batLoiBatDongBo(async (_yeuCau, phanHoi) => {
    const danhSach = await layDanhSachNhomCongDong()
    phanHoi.json({ thongBao: 'Lay danh sach nhom cong dong thanh cong', duLieu: danhSach })
  }),

  thamGiaNhomCongDong: batLoiBatDongBo(async (yeuCau, phanHoi) => {
    const maNguoiDung = (yeuCau as any).nguoiDung._id
    const { id } = yeuCau.params
    const nhom = await thamGiaNhomCongDong(String(id), maNguoiDung)
    phanHoi.json({ thongBao: 'Tham gia nhom thanh cong', duLieu: nhom })
  }),

  // ============================================
  // MESSAGE CONTROLLERS
  // ============================================

  layDanhSachTinNhan: batLoiBatDongBo(async (yeuCau, phanHoi) => {
    const maNguoiDung = (yeuCau as any).nguoiDung._id
    const { id } = yeuCau.params
    const { limit, truocTinNhan } = yeuCau.query
    const danhSach = await layDanhSachTinNhan({
      maCuocTroChuyenId: String(id),
      maNguoiDung,
      limit: limit ? Number(limit) : undefined,
      truocTinNhan: truocTinNhan as string,
    })
    phanHoi.json({ thongBao: 'Lay danh sach tin nhan thanh cong', duLieu: danhSach })
  }),

  guiTinNhan: batLoiBatDongBo(async (yeuCau, phanHoi) => {
    const maNguoiDung = (yeuCau as any).nguoiDung._id
    const { id } = yeuCau.params
    const { noiDung, loai, tepDinhKem, traloiTinNhan } = yeuCau.body
    const tinNhan = await guiTinNhan({
      maCuocTroChuyenId: String(id),
      nguoiGui: maNguoiDung,
      noiDung,
      loai,
      tepDinhKem,
      traloiTinNhan,
    })
    phanHoi.json({ thongBao: 'Gui tin nhan thanh cong', duLieu: tinNhan })
  }),

  xoaTinNhan: batLoiBatDongBo(async (yeuCau, phanHoi) => {
    const maNguoiDung = (yeuCau as any).nguoiDung._id
    const { maTinNhan } = yeuCau.params
    await xoaTinNhan(String(maTinNhan), maNguoiDung)
    phanHoi.json({ thongBao: 'Xoa tin nhan thanh cong' })
  }),

  themPhanUng: batLoiBatDongBo(async (yeuCau, phanHoi) => {
    const maNguoiDung = (yeuCau as any).nguoiDung._id
    const { maTinNhan } = yeuCau.params
    const { emoji } = yeuCau.body
    await themPhanUng({ maTinNhan: String(maTinNhan), maNguoiDung, emoji })
    phanHoi.json({ thongBao: 'Them phan ung thanh cong' })
  }),
}
