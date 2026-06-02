import { batLoiBatDongBo } from '../../dungchung/batloibatdongbo.js'
import { LoiUngDung } from '../../dungchung/loiungdung.js'
import { HoSoUngTuyen } from '../hosoungtuyen/hosoungtuyen.mohinh.js'
import { NguoiDung } from '../nguoidung/nguoidung.mohinh.js'
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

type NguoiDungHienTai = {
  _id: string
  id?: string
  vaiTro: 'ung_vien' | 'nha_tuyen_dung' | 'admin'
}

const TRANG_THAI_CHAT_NTD_UV = ['dang_xet_duyet', 'moi_phong_van', 'dat']

function id(value: any) {
  return String(value?._id ?? value?.id ?? value ?? '')
}

async function timNguoiDungAdminDauTien() {
  const admin = await (NguoiDung as any).findOne({ vaiTro: 'admin' }).select('_id')
  if (!admin) throw new LoiUngDung('He thong chua co tai khoan quan tri vien', 409, 'ADMIN_NOT_FOUND')
  return String(admin._id)
}

async function xacThucChatUngTuyen(nguoiDung: NguoiDungHienTai, nguoiNhan: string, maHoSoUngTuyen?: string, maTinTuyenDung?: string) {
  const vaiTro = String(nguoiDung.vaiTro ?? '')
  const nguoiNhanDoc = await (NguoiDung as any).findById(nguoiNhan).select('_id vaiTro')
  if (!nguoiNhanDoc) throw new LoiUngDung('Khong tim thay nguoi nhan chat', 404, 'RECIPIENT_NOT_FOUND')

  if (vaiTro === 'nha_tuyen_dung') {
    if (String(nguoiNhanDoc.vaiTro ?? '') !== 'ung_vien') {
      throw new LoiUngDung('Nha tuyen dung chi co the chat voi ung vien trong pipeline', 409, 'INVALID_CHAT_TARGET')
    }
    if (!maHoSoUngTuyen && !maTinTuyenDung) {
      throw new LoiUngDung('Can co thong tin ho so ung tuyen de mo chat', 422, 'CHAT_CONTEXT_REQUIRED')
    }
    const hoSo = maHoSoUngTuyen
      ? await (HoSoUngTuyen as any).findById(maHoSoUngTuyen).populate({ path: 'maUngVien', populate: { path: 'maNguoiDung', select: '_id' } }).populate({ path: 'maTinTuyenDung', populate: { path: 'maNhaTuyenDung', select: 'maNguoiDung' } })
      : await (HoSoUngTuyen as any).findOne({ maTinTuyenDung }).populate({ path: 'maUngVien', populate: { path: 'maNguoiDung', select: '_id' } }).populate({ path: 'maTinTuyenDung', populate: { path: 'maNhaTuyenDung', select: 'maNguoiDung' } })
    if (!hoSo) throw new LoiUngDung('Khong tim thay ho so ung tuyen', 404, 'APPLICATION_NOT_FOUND')
    if (id(hoSo.maTinTuyenDung?.maNhaTuyenDung?.maNguoiDung) !== id(nguoiDung._id)) {
      throw new LoiUngDung('Ban khong co quyen chat voi ung vien nay', 403, 'FORBIDDEN')
    }
    if (id(hoSo.maUngVien?.maNguoiDung) !== id(nguoiNhanDoc)) {
      throw new LoiUngDung('Nguoi nhan khong khop voi ung vien cua ho so', 409, 'INVALID_CHAT_TARGET')
    }
    if (!TRANG_THAI_CHAT_NTD_UV.includes(String(hoSo.trangThai ?? ''))) {
      throw new LoiUngDung('Chi co the mo chat khi ho so da duoc xem va dang duoc xu ly', 409, 'CHAT_NOT_ALLOWED')
    }
    return { loai: 'ung_vien_nha_tuyen_dung' as const, nguoiNhan: id(nguoiNhanDoc), context: { maHoSoUngTuyen: id(hoSo), maTinTuyenDung: id(hoSo.maTinTuyenDung) } }
  }

  if (vaiTro === 'ung_vien') {
    if (String(nguoiNhanDoc.vaiTro ?? '') !== 'nha_tuyen_dung') {
      throw new LoiUngDung('Ung vien chi co the chat voi nha tuyen dung trong pipeline', 409, 'INVALID_CHAT_TARGET')
    }
    if (!maHoSoUngTuyen && !maTinTuyenDung) {
      throw new LoiUngDung('Can co thong tin ho so ung tuyen de mo chat', 422, 'CHAT_CONTEXT_REQUIRED')
    }
    const hoSo = maHoSoUngTuyen
      ? await (HoSoUngTuyen as any).findById(maHoSoUngTuyen).populate({ path: 'maUngVien', populate: { path: 'maNguoiDung', select: '_id' } }).populate({ path: 'maTinTuyenDung', populate: { path: 'maNhaTuyenDung', select: 'maNguoiDung' } })
      : await (HoSoUngTuyen as any).findOne({ maTinTuyenDung }).populate({ path: 'maUngVien', populate: { path: 'maNguoiDung', select: '_id' } }).populate({ path: 'maTinTuyenDung', populate: { path: 'maNhaTuyenDung', select: 'maNguoiDung' } })
    if (!hoSo) throw new LoiUngDung('Khong tim thay ho so ung tuyen', 404, 'APPLICATION_NOT_FOUND')
    if (id(hoSo.maUngVien?.maNguoiDung) !== id(nguoiDung._id)) {
      throw new LoiUngDung('Ban khong co quyen chat voi nha tuyen dung nay', 403, 'FORBIDDEN')
    }
    if (id(hoSo.maTinTuyenDung?.maNhaTuyenDung?.maNguoiDung) !== id(nguoiNhanDoc)) {
      throw new LoiUngDung('Nguoi nhan khong khop voi nha tuyen dung cua ho so', 409, 'INVALID_CHAT_TARGET')
    }
    if (!TRANG_THAI_CHAT_NTD_UV.includes(String(hoSo.trangThai ?? ''))) {
      throw new LoiUngDung('Chi co the chat khi ho so da duoc xem va dang duoc xu ly', 409, 'CHAT_NOT_ALLOWED')
    }
    return { loai: 'ung_vien_nha_tuyen_dung' as const, nguoiNhan: id(nguoiNhanDoc), context: { maHoSoUngTuyen: id(hoSo), maTinTuyenDung: id(hoSo.maTinTuyenDung) } }
  }

  if (vaiTro === 'admin') {
    if (String(nguoiNhanDoc.vaiTro ?? '') !== 'nha_tuyen_dung') {
      throw new LoiUngDung('Admin chi co the mo chat ho tro voi nha tuyen dung', 409, 'INVALID_CHAT_TARGET')
    }
    return { loai: 'admin_support' as const, nguoiNhan: id(nguoiNhanDoc), context: {} }
  }

  throw new LoiUngDung('Ban khong co quyen mo chat nay', 403, 'FORBIDDEN')
}

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
    const nguoiDung = (yeuCau as any).nguoiDung as NguoiDungHienTai
    const maNguoiDung = id(nguoiDung)
    const { nguoiNhan: nguoiNhanRaw, maHoSoUngTuyen, maTinTuyenDung, loai } = yeuCau.body
    const nguoiNhan = String(nguoiNhanRaw ?? '')
    if (!nguoiNhan) throw new LoiUngDung('Thieu nguoi nhan tin nhan', 422, 'MISSING_RECEIVER')
    let loaiCuocTroChuyen: 'ung_vien_nha_tuyen_dung' | 'admin_support' | 'nhom_cong_dong' = loai ?? 'ung_vien_nha_tuyen_dung'
    let nguoiNhanThuc = nguoiNhan
    let context: { maHoSoUngTuyen?: string; maTinTuyenDung?: string } = {}

    if (loaiCuocTroChuyen === 'admin_support' || nguoiNhan === 'admin') {
      if (!['nha_tuyen_dung', 'admin'].includes(String(nguoiDung.vaiTro ?? ''))) {
        throw new LoiUngDung('Ban khong co quyen mo chat ho tro', 403, 'FORBIDDEN')
      }
      nguoiNhanThuc = await timNguoiDungAdminDauTien()
      loaiCuocTroChuyen = 'admin_support'
      context = {}
    } else if (loaiCuocTroChuyen === 'ung_vien_nha_tuyen_dung') {
      const ketQua = await xacThucChatUngTuyen(nguoiDung, nguoiNhanThuc, maHoSoUngTuyen, maTinTuyenDung)
      loaiCuocTroChuyen = ketQua.loai
      nguoiNhanThuc = ketQua.nguoiNhan
      context = ketQua.context
    }

    const cuocTroChuyenModel = await layHoacTaoCuocTroChuyenModel({
      nguoiThamGia: [maNguoiDung, nguoiNhanThuc],
      loai: loaiCuocTroChuyen,
      maHoSoUngTuyen: context.maHoSoUngTuyen ?? maHoSoUngTuyen,
      maTinTuyenDung: context.maTinTuyenDung ?? maTinTuyenDung,
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
