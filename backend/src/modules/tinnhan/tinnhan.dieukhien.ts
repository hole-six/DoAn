import { batLoiBatDongBo } from '../../dungchung/batloibatdongbo.js'
import {
  layDanhSachCuocTroChuyenModel,
  layHoacTaoCuocTroChuyenModel,
  layCuocTroChuyenModelTheoMa,
  danhDauDaDocCuocTroChuyenModel,
  guiTinNhan,
  layDanhSachTinNhan,
  xoaTinNhan,
  themPhanUng,
} from './tinnhan.dichvu.js'

export const dieuKhienTinNhan = {
  // ============================================
  // CONVERSATION CONTROLLERS
  // ============================================

  /**
   * Lấy danh sách cuộc trò chuyện
   */
  layDanhSachCuocTroChuyenModel: batLoiBatDongBo(async (yeuCau, phanHoi) => {
    const maNguoiDung = (yeuCau as any).nguoiDung._id

    const danhSach = await layDanhSachCuocTroChuyenModel(maNguoiDung)

    phanHoi.json({
      thongBao: 'Lay danh sach cuoc tro chuyen thanh cong',
      duLieu: danhSach,
    })
  }),

  /**
   * Lấy hoặc tạo cuộc trò chuyện với người khác
   */
  layHoacTaoCuocTroChuyenModel: batLoiBatDongBo(async (yeuCau, phanHoi) => {
    const maNguoiDung = (yeuCau as any).nguoiDung._id
    const { nguoiNhan, maHoSoUngTuyen, maTinTuyenDung } = yeuCau.body

    const cuocTroChuyenModel = await layHoacTaoCuocTroChuyenModel({
      nguoiThamGia: [maNguoiDung, nguoiNhan],
      maHoSoUngTuyen,
      maTinTuyenDung,
    })

    phanHoi.json({
      thongBao: 'Lay cuoc tro chuyen thanh cong',
      duLieu: cuocTroChuyenModel,
    })
  }),

  /**
   * Lấy chi tiết cuộc trò chuyện
   */
  layCuocTroChuyenModel: batLoiBatDongBo(async (yeuCau, phanHoi) => {
    const maNguoiDung = (yeuCau as any).nguoiDung._id
    const { id } = yeuCau.params

    const cuocTroChuyenModel = await layCuocTroChuyenModelTheoMa(String(id), maNguoiDung)

    phanHoi.json({
      thongBao: 'Lay cuoc tro chuyen thanh cong',
      duLieu: cuocTroChuyenModel,
    })
  }),

  /**
   * Đánh dấu đã đọc
   */
  danhDauDaDoc: batLoiBatDongBo(async (yeuCau, phanHoi) => {
    const maNguoiDung = (yeuCau as any).nguoiDung._id
    const { id } = yeuCau.params

    await danhDauDaDocCuocTroChuyenModel(String(id), maNguoiDung)

    phanHoi.json({
      thongBao: 'Danh dau da doc thanh cong',
    })
  }),

  // ============================================
  // MESSAGE CONTROLLERS
  // ============================================

  /**
   * Lấy danh sách tin nhắn
   */
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

    phanHoi.json({
      thongBao: 'Lay danh sach tin nhan thanh cong',
      duLieu: danhSach,
    })
  }),

  /**
   * Gửi tin nhắn
   */
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

    phanHoi.json({
      thongBao: 'Gui tin nhan thanh cong',
      duLieu: tinNhan,
    })
  }),

  /**
   * Xóa tin nhắn
   */
  xoaTinNhan: batLoiBatDongBo(async (yeuCau, phanHoi) => {
    const maNguoiDung = (yeuCau as any).nguoiDung._id
    const { maTinNhan } = yeuCau.params

    await xoaTinNhan(String(maTinNhan), maNguoiDung)

    phanHoi.json({
      thongBao: 'Xoa tin nhan thanh cong',
    })
  }),

  /**
   * Thêm reaction
   */
  themPhanUng: batLoiBatDongBo(async (yeuCau, phanHoi) => {
    const maNguoiDung = (yeuCau as any).nguoiDung._id
    const { maTinNhan } = yeuCau.params
    const { emoji } = yeuCau.body

    await themPhanUng({
      maTinNhan: String(maTinNhan),
      maNguoiDung,
      emoji,
    })

    phanHoi.json({
      thongBao: 'Them phan ung thanh cong',
    })
  }),
}
