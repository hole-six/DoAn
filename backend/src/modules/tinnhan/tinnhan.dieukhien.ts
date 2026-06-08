import { batLoiBatDongBo } from '../../dungchung/batloibatdongbo.js'
import { LoiUngDung } from '../../dungchung/loiungdung.js'
import { prisma } from '../../cauhinh/prisma.js'
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
  damBaoCuocTroChuyenHoTroQuanTri,
} from './tinnhan.dichvu.js'

type NguoiDungHienTai = { _id: string; id?: string; vaiTro: 'ung_vien' | 'nha_tuyen_dung' | 'admin' }
const TRANG_THAI_CHAT_NTD_UV = ['da_xem', 'dang_xet_duyet', 'moi_phong_van', 'dat']

function id(value: any) {
  return String(value?._id ?? value?.id ?? value ?? '')
}

async function timNguoiDungAdminDauTien() {
  const admin = await prisma.nguoiDung.findFirst({ where: { vaiTro: 'admin' }, select: { id: true } })
  if (!admin) throw new LoiUngDung('Hệ thống chưa có tài khoản quản trị viên', 409, 'ADMIN_NOT_FOUND')
  return admin.id
}

async function layHoSoChat(maHoSoUngTuyen?: string, maTinTuyenDung?: string) {
  const hoSo = maHoSoUngTuyen
    ? await prisma.hoSoUngTuyen.findUnique({ where: { id: maHoSoUngTuyen } })
    : await prisma.hoSoUngTuyen.findFirst({ where: { maTinTuyenDung }, orderBy: { ngayCapNhat: 'desc' } })
  if (!hoSo) return null
  const [ungVien, tin] = await Promise.all([
    prisma.ungVien.findUnique({ where: { id: hoSo.maUngVien } }),
    prisma.tinTuyenDung.findUnique({ where: { id: hoSo.maTinTuyenDung } }),
  ])
  const congTy = tin ? await prisma.nhaTuyenDung.findUnique({ where: { id: tin.maNhaTuyenDung } }) : null
  return { ...hoSo, _id: hoSo.id, maUngVien: ungVien ? { ...ungVien, _id: ungVien.id } : hoSo.maUngVien, maTinTuyenDung: tin ? { ...tin, _id: tin.id, maNhaTuyenDung: congTy ? { ...congTy, _id: congTy.id } : tin.maNhaTuyenDung } : hoSo.maTinTuyenDung }
}

async function xacThucChatUngTuyen(nguoiDung: NguoiDungHienTai, nguoiNhan: string, maHoSoUngTuyen?: string, maTinTuyenDung?: string) {
  const vaiTro = String(nguoiDung.vaiTro ?? '')
  const nguoiNhanDoc = await prisma.nguoiDung.findUnique({ where: { id: nguoiNhan }, select: { id: true, vaiTro: true } })
  if (!nguoiNhanDoc) throw new LoiUngDung('Không tìm thấy người nhận chat', 404, 'RECIPIENT_NOT_FOUND')

  if (vaiTro === 'nha_tuyen_dung') {
    if (String(nguoiNhanDoc.vaiTro ?? '') !== 'ung_vien') throw new LoiUngDung('Nhà tuyển dụng chỉ có thể chat với ứng viên trong pipeline', 409, 'INVALID_CHAT_TARGET')
    if (!maHoSoUngTuyen && !maTinTuyenDung) throw new LoiUngDung('Cần có thông tin hồ sơ ứng tuyển để mở chat', 422, 'CHAT_CONTEXT_REQUIRED')
    const hoSo = await layHoSoChat(maHoSoUngTuyen, maTinTuyenDung)
    if (!hoSo) throw new LoiUngDung('Không tìm thấy hồ sơ ứng tuyển', 404, 'APPLICATION_NOT_FOUND')
    if (id((hoSo as any).maTinTuyenDung?.maNhaTuyenDung?.maNguoiDung) !== id(nguoiDung._id)) throw new LoiUngDung('Bạn không có quyền chat với ứng viên này', 403, 'FORBIDDEN')
    if (id((hoSo as any).maUngVien?.maNguoiDung) !== id(nguoiNhanDoc)) throw new LoiUngDung('Người nhận không khớp với ứng viên của hồ sơ', 409, 'INVALID_CHAT_TARGET')
    if (!TRANG_THAI_CHAT_NTD_UV.includes(String(hoSo.trangThai ?? ''))) throw new LoiUngDung('Chỉ có thể mở chat khi hồ sơ đã được xem và đang được xử lý', 409, 'CHAT_NOT_ALLOWED')
    return { loai: 'ung_vien_nha_tuyen_dung' as const, nguoiNhan: id(nguoiNhanDoc), context: { maHoSoUngTuyen: id(hoSo), maTinTuyenDung: id((hoSo as any).maTinTuyenDung) } }
  }

  if (vaiTro === 'ung_vien') {
    if (String(nguoiNhanDoc.vaiTro ?? '') !== 'nha_tuyen_dung') throw new LoiUngDung('Ứng viên chỉ có thể chat với nhà tuyển dụng trong pipeline', 409, 'INVALID_CHAT_TARGET')
    if (!maHoSoUngTuyen && !maTinTuyenDung) throw new LoiUngDung('Cần có thông tin hồ sơ ứng tuyển để mở chat', 422, 'CHAT_CONTEXT_REQUIRED')
    const hoSo = await layHoSoChat(maHoSoUngTuyen, maTinTuyenDung)
    if (!hoSo) throw new LoiUngDung('Không tìm thấy hồ sơ ứng tuyển', 404, 'APPLICATION_NOT_FOUND')
    if (id((hoSo as any).maUngVien?.maNguoiDung) !== id(nguoiDung._id)) throw new LoiUngDung('Bạn không có quyền chat với nhà tuyển dụng này', 403, 'FORBIDDEN')
    if (id((hoSo as any).maTinTuyenDung?.maNhaTuyenDung?.maNguoiDung) !== id(nguoiNhanDoc)) throw new LoiUngDung('Người nhận không khớp với nhà tuyển dụng của hồ sơ', 409, 'INVALID_CHAT_TARGET')
    if (!TRANG_THAI_CHAT_NTD_UV.includes(String(hoSo.trangThai ?? ''))) throw new LoiUngDung('Chỉ có thể chat khi hồ sơ đã được xem và đang được xử lý', 409, 'CHAT_NOT_ALLOWED')
    return { loai: 'ung_vien_nha_tuyen_dung' as const, nguoiNhan: id(nguoiNhanDoc), context: { maHoSoUngTuyen: id(hoSo), maTinTuyenDung: id((hoSo as any).maTinTuyenDung) } }
  }

  if (vaiTro === 'admin') {
    if (String(nguoiNhanDoc.vaiTro ?? '') !== 'nha_tuyen_dung') throw new LoiUngDung('Admin chỉ có thể mở chat hỗ trợ với nhà tuyển dụng', 409, 'INVALID_CHAT_TARGET')
    return { loai: 'admin_support' as const, nguoiNhan: id(nguoiNhanDoc), context: {} }
  }

  throw new LoiUngDung('Bạn không có quyền mở chat này', 403, 'FORBIDDEN')
}

export const dieuKhienTinNhan = {
  layDanhSachCuocTroChuyenModel: batLoiBatDongBo(async (yeuCau, phanHoi) => {
    const nguoiDung = (yeuCau as any).nguoiDung
    const maNguoiDung = nguoiDung._id
    await damBaoCuocTroChuyenHoTroQuanTri(String(maNguoiDung), String(nguoiDung.vaiTro ?? ''))
    const danhSach = await layDanhSachCuocTroChuyenModel(maNguoiDung)
    phanHoi.json({ thongBao: 'Lấy danh sách cuộc trò chuyện thành công', duLieu: danhSach })
  }),

  layDanhBaHoTroQuanTri: batLoiBatDongBo(async (yeuCau, phanHoi) => {
    const nguoiDung = (yeuCau as any).nguoiDung
    const maNguoiDung = nguoiDung._id
    await damBaoCuocTroChuyenHoTroQuanTri(String(maNguoiDung), String(nguoiDung.vaiTro ?? ''))
    const danhSach = await layDanhSachCuocTroChuyenModel(maNguoiDung)
    phanHoi.json({ thongBao: 'Lấy danh bạ hỗ trợ quản trị thành công', duLieu: danhSach.filter((item: any) => item.loai === 'admin_support') })
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
      if (!['nha_tuyen_dung', 'admin'].includes(String(nguoiDung.vaiTro ?? ''))) throw new LoiUngDung('Bạn không có quyền mở chat hỗ trợ', 403, 'FORBIDDEN')
      if (String(nguoiDung.vaiTro ?? '') === 'nha_tuyen_dung') nguoiNhanThuc = await timNguoiDungAdminDauTien()
      else {
        const nguoiNhanDoc = await prisma.nguoiDung.findUnique({ where: { id: nguoiNhan }, select: { id: true, vaiTro: true } })
        if (!nguoiNhanDoc || String(nguoiNhanDoc.vaiTro ?? '') !== 'nha_tuyen_dung') throw new LoiUngDung('Admin chỉ có thể mở chat hỗ trợ với nhà tuyển dụng', 409, 'INVALID_CHAT_TARGET')
        nguoiNhanThuc = id(nguoiNhanDoc)
      }
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
    phanHoi.json({ thongBao: 'Lấy cuộc trò chuyện thành công', duLieu: cuocTroChuyenModel })
  }),

  layCuocTroChuyenModel: batLoiBatDongBo(async (yeuCau, phanHoi) => {
    const maNguoiDung = (yeuCau as any).nguoiDung._id
    const { id: ma } = yeuCau.params
    const cuocTroChuyenModel = await layCuocTroChuyenModelTheoMa(String(ma), maNguoiDung)
    phanHoi.json({ thongBao: 'Lay cuoc tro chuyen thanh cong', duLieu: cuocTroChuyenModel })
  }),

  danhDauDaDoc: batLoiBatDongBo(async (yeuCau, phanHoi) => {
    const maNguoiDung = (yeuCau as any).nguoiDung._id
    const { id: ma } = yeuCau.params
    await danhDauDaDocCuocTroChuyenModel(String(ma), maNguoiDung)
    phanHoi.json({ thongBao: 'Danh dau da doc thanh cong' })
  }),

  layNhomCongDong: batLoiBatDongBo(async (_yeuCau, phanHoi) => {
    const danhSach = await layDanhSachNhomCongDong()
    phanHoi.json({ thongBao: 'Lay danh sach nhom cong dong thanh cong', duLieu: danhSach })
  }),

  thamGiaNhomCongDong: batLoiBatDongBo(async (yeuCau, phanHoi) => {
    const maNguoiDung = (yeuCau as any).nguoiDung._id
    const { id: ma } = yeuCau.params
    const nhom = await thamGiaNhomCongDong(String(ma), maNguoiDung)
    phanHoi.json({ thongBao: 'Tham gia nhom thanh cong', duLieu: nhom })
  }),

  layDanhSachTinNhan: batLoiBatDongBo(async (yeuCau, phanHoi) => {
    const maNguoiDung = (yeuCau as any).nguoiDung._id
    const { id: ma } = yeuCau.params
    const { limit, truocTinNhan } = yeuCau.query
    const danhSach = await layDanhSachTinNhan({ maCuocTroChuyenId: String(ma), maNguoiDung, limit: limit ? Number(limit) : undefined, truocTinNhan: truocTinNhan as string })
    phanHoi.json({ thongBao: 'Lay danh sach tin nhan thanh cong', duLieu: danhSach })
  }),

  guiTinNhan: batLoiBatDongBo(async (yeuCau, phanHoi) => {
    const maNguoiDung = (yeuCau as any).nguoiDung._id
    const { id: ma } = yeuCau.params
    const { noiDung, loai, tepDinhKem, traloiTinNhan } = yeuCau.body
    const tinNhan = await guiTinNhan({ maCuocTroChuyenId: String(ma), nguoiGui: maNguoiDung, noiDung, loai, tepDinhKem, traloiTinNhan })
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
