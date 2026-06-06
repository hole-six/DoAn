import { LoiUngDung } from '../../dungchung/loiungdung.js'
import { guiThongBaoChoNguoiDung } from '../../cauhinh/socket.js'
import { CuocTroChuyenModel, TinNhanModel } from './tinnhan.mohinh.js'
import { taoVaGuiThongBao } from '../thongbao/thongbao.dichvu.js'
import { NguoiDung } from '../nguoidung/nguoidung.mohinh.js'
import { NhaTuyenDung } from '../nhatuyendung/nhatuyendung.mohinh.js'
import { HoSoUngTuyen } from '../hosoungtuyen/hosoungtuyen.mohinh.js'

// ============================================
// CONVERSATION SERVICES
// ============================================

/**
 * Lấy hoặc tạo cuộc trò chuyện giữa 2 người
 */
export async function layHoacTaoCuocTroChuyenModel(params: {
  nguoiThamGia: string[]
  loai?: string
  maHoSoUngTuyen?: string
  maTinTuyenDung?: string
}) {
  const nguoiThamGiaSorted = [...params.nguoiThamGia].sort()
  const loai = params.loai || 'ung_vien_nha_tuyen_dung'

  const dieuKienTimKiem: Record<string, unknown> = {
    nguoiThamGia: { $all: nguoiThamGiaSorted, $size: nguoiThamGiaSorted.length },
    daLuuTru: false,
    loai,
  }

  const danhSachTrung = await CuocTroChuyenModel.find(dieuKienTimKiem).sort({ ngayCapNhat: -1, ngayTao: -1 })
  let cuocTroChuyenModel = danhSachTrung[0] || null

  if (cuocTroChuyenModel && danhSachTrung.length > 1) {
    await hopNhatCuocTroChuyenTrungLap(cuocTroChuyenModel, danhSachTrung.slice(1))
  }

  if (!cuocTroChuyenModel) {
    cuocTroChuyenModel = await CuocTroChuyenModel.create({
      nguoiThamGia: nguoiThamGiaSorted,
      loai,
      maHoSoUngTuyen: params.maHoSoUngTuyen,
      maTinTuyenDung: params.maTinTuyenDung,
      maHoSoUngTuyenGanNhat: params.maHoSoUngTuyen,
      maTinTuyenDungGanNhat: params.maTinTuyenDung,
      soChuaDoc: Object.fromEntries(nguoiThamGiaSorted.map((id) => [id, 0])),
    })
  }

  await capNhatNguCanhCuocTroChuyen(cuocTroChuyenModel, params)
  await cuocTroChuyenModel.populate('nguoiThamGia', 'hoTen email vaiTro')
  return cuocTroChuyenModel
}

async function taoTomTatNguCanh(params: { maHoSoUngTuyen?: string; maTinTuyenDung?: string }) {
  if (!params.maHoSoUngTuyen && !params.maTinTuyenDung) return undefined

  const hoSo = params.maHoSoUngTuyen
    ? await (HoSoUngTuyen as any)
      .findById(params.maHoSoUngTuyen)
      .populate({ path: 'maTinTuyenDung', select: 'tieuDe maNhaTuyenDung', populate: { path: 'maNhaTuyenDung', select: 'tenCongTy' } })
    : await (HoSoUngTuyen as any)
      .findOne({ maTinTuyenDung: params.maTinTuyenDung })
      .sort({ ngayCapNhat: -1 })
      .populate({ path: 'maTinTuyenDung', select: 'tieuDe maNhaTuyenDung', populate: { path: 'maNhaTuyenDung', select: 'tenCongTy' } })

  const tin = hoSo?.maTinTuyenDung
  return {
    tieuDeTin: tin?.tieuDe,
    tenCongTy: tin?.maNhaTuyenDung?.tenCongTy,
    maHoSoUngTuyen: params.maHoSoUngTuyen || (hoSo?._id ? String(hoSo._id) : undefined),
    maTinTuyenDung: params.maTinTuyenDung || (tin?._id ? String(tin._id) : undefined),
    capNhatLuc: new Date(),
  }
}

async function capNhatNguCanhCuocTroChuyen(cuocTroChuyenModel: any, params: { maHoSoUngTuyen?: string; maTinTuyenDung?: string }) {
  if (!params.maHoSoUngTuyen && !params.maTinTuyenDung) return
  const summary = await taoTomTatNguCanh(params)
  cuocTroChuyenModel.maHoSoUngTuyen = params.maHoSoUngTuyen || cuocTroChuyenModel.maHoSoUngTuyen
  cuocTroChuyenModel.maTinTuyenDung = params.maTinTuyenDung || cuocTroChuyenModel.maTinTuyenDung
  cuocTroChuyenModel.maHoSoUngTuyenGanNhat = params.maHoSoUngTuyen || cuocTroChuyenModel.maHoSoUngTuyenGanNhat
  cuocTroChuyenModel.maTinTuyenDungGanNhat = params.maTinTuyenDung || cuocTroChuyenModel.maTinTuyenDungGanNhat
  if (summary) cuocTroChuyenModel.contextSummary = summary
  await cuocTroChuyenModel.save()
}

async function hopNhatCuocTroChuyenTrungLap(cuocChinh: any, danhSachTrung: any[]) {
  for (const cuocTrung of danhSachTrung) {
    await TinNhanModel.updateMany(
      { maCuocTroChuyenId: cuocTrung._id },
      { $set: { maCuocTroChuyenId: cuocChinh._id } },
    )

    for (const nguoi of cuocChinh.nguoiThamGia) {
      const maNguoi = String(nguoi)
      const hienTai = Number(cuocChinh.soChuaDoc?.get(maNguoi) || 0)
      const boSung = Number(cuocTrung.soChuaDoc?.get(maNguoi) || 0)
      cuocChinh.soChuaDoc.set(maNguoi, hienTai + boSung)
    }

    const thoiGianCuoiCungTrung = cuocTrung.tinNhanCuoiCung?.thoiGian ? new Date(cuocTrung.tinNhanCuoiCung.thoiGian).getTime() : 0
    const thoiGianCuoiCungChinh = cuocChinh.tinNhanCuoiCung?.thoiGian ? new Date(cuocChinh.tinNhanCuoiCung.thoiGian).getTime() : 0
    if (thoiGianCuoiCungTrung > thoiGianCuoiCungChinh) {
      cuocChinh.tinNhanCuoiCung = cuocTrung.tinNhanCuoiCung
    }

    cuocTrung.daLuuTru = true
    cuocTrung.thoiGianLuuTru = new Date()
    await cuocTrung.save()
  }
  await cuocChinh.save()
}

async function hopNhatCuocTroChuyenCuaNguoiDung(maNguoiDung: string) {
  const danhSach = await CuocTroChuyenModel.find({
    nguoiThamGia: maNguoiDung,
    daLuuTru: false,
    loai: { $ne: 'nhom_cong_dong' },
  }).sort({ ngayCapNhat: -1, ngayTao: -1 })

  const groups = new Map<string, any[]>()
  for (const item of danhSach) {
    const participants = [...(item.nguoiThamGia || [])].map((value: any) => String(value)).sort().join('|')
    const key = `${item.loai || 'ung_vien_nha_tuyen_dung'}:${participants}`
    groups.set(key, [...(groups.get(key) || []), item])
  }

  for (const items of groups.values()) {
    if (items.length > 1) {
      await hopNhatCuocTroChuyenTrungLap(items[0], items.slice(1))
    }
  }
}

async function timAdminDauTien() {
  return (NguoiDung as any).findOne({ vaiTro: 'admin', trangThai: { $ne: 'bi_khoa' } }).select('_id')
}

async function congTyDaDuyet(maNguoiDung: string) {
  const congTy = await (NhaTuyenDung as any).findOne({ maNguoiDung }).select('_id trangThaiDuyet')
  return Boolean(congTy && congTy.trangThaiDuyet === 'da_duyet')
}

export async function damBaoCuocTroChuyenHoTroQuanTri(maNguoiDung: string, vaiTro: string) {
  if (vaiTro === 'admin') {
    const congTyList = await (NhaTuyenDung as any)
      .find({ trangThaiDuyet: 'da_duyet' })
      .select('maNguoiDung')
      .limit(500)

    await Promise.all(congTyList.map((congTy: any) => layHoacTaoCuocTroChuyenModel({
      nguoiThamGia: [maNguoiDung, String(congTy.maNguoiDung)],
      loai: 'admin_support',
    })))
  }

  if (vaiTro === 'nha_tuyen_dung') {
    if (!await congTyDaDuyet(maNguoiDung)) return
    const admin = await timAdminDauTien()
    if (admin) {
      await layHoacTaoCuocTroChuyenModel({
        nguoiThamGia: [maNguoiDung, String(admin._id)],
        loai: 'admin_support',
      })
    }
  }
}

export async function layDanhSachNhomCongDong() {
  const danhSach = await CuocTroChuyenModel.find({
    loai: 'nhom_cong_dong',
    daLuuTru: false,
  })
    .populate('nguoiThamGia', 'hoTen email vaiTro')
    .populate('quanTriNhom', 'hoTen email')
    .sort({ ngayCapNhat: -1 })

  return danhSach.map((doc) => {
    const obj = doc.toObject()
    return {
      ...obj,
      id: String(obj._id),
      soThanhVien: obj.nguoiThamGia?.length || 0,
    }
  })
}

export async function thamGiaNhomCongDong(maNhom: string, maNguoiDung: string) {
  const nhom = await CuocTroChuyenModel.findById(maNhom)
  if (!nhom) throw new LoiUngDung('Không tìm thấy nhóm', 404)
  if (nhom.loai !== 'nhom_cong_dong') throw new LoiUngDung('Đây không phải nhóm cộng đồng', 400)

  const daCoMat = nhom.nguoiThamGia.some((id: any) => String(id) === maNguoiDung)
  if (!daCoMat) {
    nhom.nguoiThamGia.push(maNguoiDung as any)
    nhom.soChuaDoc.set(maNguoiDung, 0)
    await nhom.save()

    await TinNhanModel.create({
      maCuocTroChuyenId: maNhom,
      nguoiGui: maNguoiDung,
      noiDung: 'đã tham gia nhóm',
      loai: 'system',
    })
  }

  return nhom
}

/**
 * Lấy danh sách cuộc trò chuyện của user
 */
export async function layDanhSachCuocTroChuyenModel(maNguoiDung: string) {
  await hopNhatCuocTroChuyenCuaNguoiDung(maNguoiDung)

  const danhSach = await CuocTroChuyenModel.find({
    nguoiThamGia: maNguoiDung,
    daLuuTru: false,
  })
    .populate('nguoiThamGia', 'hoTen email vaiTro')
    .populate('tinNhanCuoiCung.nguoiGui', 'hoTen')
    .populate('maHoSoUngTuyenGanNhat', 'trangThai')
    .populate('maTinTuyenDungGanNhat', 'tieuDe')
    .sort({ ngayCapNhat: -1 })
    .limit(50)

  return danhSach.map((doc) => {
    const obj = doc.toObject()
    return {
      ...obj,
      id: String(obj._id),
      soChuaDocCuaToi: obj.soChuaDoc?.get(maNguoiDung) || 0,
    }
  })
}

/**
 * Lấy chi tiết cuộc trò chuyện
 */
export async function layCuocTroChuyenModelTheoMa(maCuocTroChuyenModel: string, maNguoiDung: string) {
  const cuocTroChuyenModel = await CuocTroChuyenModel.findById(maCuocTroChuyenModel).populate('nguoiThamGia', 'hoTen email vaiTro')

  if (!cuocTroChuyenModel) {
    throw new LoiUngDung('Không tìm thấy cuộc trò chuyện', 404)
  }

  // Kiểm tra quyền truy cập
  const coQuyen = cuocTroChuyenModel.nguoiThamGia.some((ng: any) => String(ng._id) === maNguoiDung)
  if (!coQuyen) {
    throw new LoiUngDung('Bạn không có quyền truy cập cuộc trò chuyện này', 403)
  }

  return cuocTroChuyenModel
}

/**
 * Đánh dấu đã đọc tất cả tin nhắn trong cuộc trò chuyện
 */
export async function danhDauDaDocCuocTroChuyenModel(maCuocTroChuyenModel: string, maNguoiDung: string) {
  const cuocTroChuyenModel = await CuocTroChuyenModel.findById(maCuocTroChuyenModel)
  if (!cuocTroChuyenModel) {
    throw new LoiUngDung('Không tìm thấy cuộc trò chuyện', 404)
  }

  // Reset số chưa đọc
  cuocTroChuyenModel.soChuaDoc.set(maNguoiDung, 0)
  await cuocTroChuyenModel.save()

  // Đánh dấu tất cả tin nhắn chưa đọc
  await TinNhanModel.updateMany(
    {
      maCuocTroChuyenId: maCuocTroChuyenModel,
      nguoiGui: { $ne: maNguoiDung },
      'daDuocDocBoi.nguoiDung': { $ne: maNguoiDung },
    },
    {
      $push: {
        daDuocDocBoi: {
          nguoiDung: maNguoiDung,
          thoiGian: new Date(),
        },
      },
    },
  )

  return cuocTroChuyenModel
}

// ============================================
// MESSAGE SERVICES
// ============================================

/**
 * Gửi tin nhắn
 */
export async function guiTinNhan(params: {
  maCuocTroChuyenId: string
  nguoiGui: string
  noiDung: string
  loai?: string
  tepDinhKem?: any[]
  traloiTinNhan?: string
}) {
  // Kiểm tra quyền
  const cuocTroChuyenModel = await layCuocTroChuyenModelTheoMa(params.maCuocTroChuyenId, params.nguoiGui)

  // Tạo tin nhắn
  const tinNhan = await TinNhanModel.create({
    maCuocTroChuyenId: params.maCuocTroChuyenId,
    nguoiGui: params.nguoiGui,
    noiDung: params.noiDung,
    loai: params.loai || 'text',
    tepDinhKem: params.tepDinhKem || [],
    traloiTinNhan: params.traloiTinNhan,
  })

  // Populate để trả về đầy đủ thông tin
  await tinNhan.populate('nguoiGui', 'hoTen email vaiTro')
  if (params.traloiTinNhan) {
    await tinNhan.populate('traloiTinNhan')
  }

  // Cập nhật cuộc trò chuyện
  cuocTroChuyenModel.tinNhanCuoiCung = {
    noiDung: params.noiDung,
    nguoiGui: params.nguoiGui as any,
    thoiGian: new Date(),
  }

  // Tăng số chưa đọc cho người khác
  for (const nguoiThamGia of cuocTroChuyenModel.nguoiThamGia) {
    const id = String((nguoiThamGia as any)._id)
    if (id !== params.nguoiGui) {
      const current = cuocTroChuyenModel.soChuaDoc.get(id) || 0
      cuocTroChuyenModel.soChuaDoc.set(id, current + 1)
    }
  }

  await cuocTroChuyenModel.save()

  // Gửi real-time qua Socket.IO cho người nhận
  const tinNhanObj = tinNhan.toObject()
  for (const nguoiThamGia of cuocTroChuyenModel.nguoiThamGia) {
    const id = String((nguoiThamGia as any)._id)
    if (id !== params.nguoiGui) {
      guiThongBaoChoNguoiDung(id, 'tin_nhan_moi', {
        maCuocTroChuyenId: params.maCuocTroChuyenId,
        tinNhan: {
          ...tinNhanObj,
          id: String(tinNhanObj._id),
        },
      })

      // Gửi notification nếu user offline
      const vaiTroNhan = (nguoiThamGia as any).vaiTro
      const duongDanChat = vaiTroNhan === 'admin'
        ? '/quan-tri/chat'
        : vaiTroNhan === 'ung_vien'
          ? '/ung-vien/chat'
          : '/nha-tuyen-dung/chat'
      await taoVaGuiThongBao({
        maNguoiDung: id,
        loai: 'tin_nhan',
        tieuDe: `Tin nhắn mới từ ${(tinNhan.nguoiGui as any).hoTen}`,
        noiDung: params.noiDung.substring(0, 100),
        lienKet: `${duongDanChat}?cuocTroChuyen=${params.maCuocTroChuyenId}`,
        mucDoUuTien: 'trung_binh',
        icon: '💬',
        mauSac: '#8b5cf6',
      })
    }
  }

  return {
    ...tinNhanObj,
    id: String(tinNhanObj._id),
  }
}

/**
 * Lấy danh sách tin nhắn trong cuộc trò chuyện
 */
export async function layDanhSachTinNhan(params: {
  maCuocTroChuyenId: string
  maNguoiDung: string
  limit?: number
  truocTinNhan?: string
}) {
  // Kiểm tra quyền
  await layCuocTroChuyenModelTheoMa(params.maCuocTroChuyenId, params.maNguoiDung)

  const query: any = {
    maCuocTroChuyenId: params.maCuocTroChuyenId,
    daXoa: false,
  }

  // Pagination
  if (params.truocTinNhan) {
    const tinNhanTruoc = await TinNhanModel.findById(params.truocTinNhan)
    if (tinNhanTruoc) {
      query.ngayTao = { $lt: tinNhanTruoc.ngayTao }
    }
  }

  const danhSach = await TinNhanModel.find(query)
    .populate('nguoiGui', 'hoTen email vaiTro')
    .populate('traloiTinNhan')
    .sort({ ngayTao: -1 })
    .limit(params.limit || 50)

  return danhSach.reverse().map((doc) => {
    const obj = doc.toObject()
    return {
      ...obj,
      id: String(obj._id),
      daToi: obj.daDuocDocBoi?.some((d: any) => String(d.nguoiDung) === params.maNguoiDung),
    }
  })
}

/**
 * Xóa tin nhắn
 */
export async function xoaTinNhan(maTinNhan: string, maNguoiDung: string) {
  const tinNhan = await TinNhanModel.findById(maTinNhan)
  if (!tinNhan) {
    throw new LoiUngDung('Không tìm thấy tin nhắn', 404)
  }

  // Chỉ người gửi mới được xóa
  if (String(tinNhan.nguoiGui) !== maNguoiDung) {
    throw new LoiUngDung('Bạn không có quyền xóa tin nhắn này', 403)
  }

  tinNhan.daXoa = true
  tinNhan.noiDung = 'Tin nhắn đã bị xóa'
  await tinNhan.save()

  // Gửi real-time
  const cuocTroChuyenModel = await CuocTroChuyenModel.findById(tinNhan.maCuocTroChuyenId)
  if (cuocTroChuyenModel) {
    for (const nguoiThamGia of cuocTroChuyenModel.nguoiThamGia) {
      guiThongBaoChoNguoiDung(String(nguoiThamGia), 'tin_nhan_da_xoa', {
        maCuocTroChuyenId: String(tinNhan.maCuocTroChuyenId),
        maTinNhan,
      })
    }
  }

  return tinNhan
}

/**
 * Thêm reaction vào tin nhắn
 */
export async function themPhanUng(params: {
  maTinNhan: string
  maNguoiDung: string
  emoji: string
}) {
  const tinNhan = await TinNhanModel.findById(params.maTinNhan)
  if (!tinNhan) {
    throw new LoiUngDung('Không tìm thấy tin nhắn', 404)
  }

  // Xóa reaction cũ của user này (nếu có)
  tinNhan.phanUng = tinNhan.phanUng.filter((r: any) => String(r.nguoiDung) !== params.maNguoiDung)

  // Thêm reaction mới
  tinNhan.phanUng.push({
    nguoiDung: params.maNguoiDung as any,
    emoji: params.emoji,
  })

  await tinNhan.save()

  // Gửi real-time
  const cuocTroChuyenModel = await CuocTroChuyenModel.findById(tinNhan.maCuocTroChuyenId)
  if (cuocTroChuyenModel) {
    for (const nguoiThamGia of cuocTroChuyenModel.nguoiThamGia) {
      guiThongBaoChoNguoiDung(String(nguoiThamGia), 'phan_ung_moi', {
        maCuocTroChuyenId: String(tinNhan.maCuocTroChuyenId),
        maTinNhan: params.maTinNhan,
        nguoiDung: params.maNguoiDung,
        emoji: params.emoji,
      })
    }
  }

  return tinNhan
}



