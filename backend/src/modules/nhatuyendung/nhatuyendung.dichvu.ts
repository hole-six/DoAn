import { LoiUngDung } from '../../dungchung/loiungdung.js'
import '../nguoidung/nguoidung.mohinh.js'
import { NhaTuyenDung } from './nhatuyendung.mohinh.js'

function chuanHoaNhaTuyenDung(taiLieu: any) {
  const duLieu = typeof taiLieu.toObject === 'function' ? taiLieu.toObject() : taiLieu

  return {
    id: String(duLieu._id),
    maNguoiDung: duLieu.maNguoiDung?._id ? String(duLieu.maNguoiDung._id) : String(duLieu.maNguoiDung),
    nguoiDung: duLieu.maNguoiDung?._id
      ? {
          id: String(duLieu.maNguoiDung._id),
          hoTen: duLieu.maNguoiDung.hoTen,
          email: duLieu.maNguoiDung.email,
          soDienThoai: duLieu.maNguoiDung.soDienThoai,
        }
      : undefined,
    tenCongTy: duLieu.tenCongTy,
    maSoThue: duLieu.maSoThue,
    moTa: duLieu.moTa,
    diaChi: duLieu.diaChi,
    website: duLieu.website,
    logo: duLieu.logo,
    quyMo: duLieu.quyMo,
    nganh: duLieu.nganh,
    trangThaiDuyet: duLieu.trangThaiDuyet,
    lyDoTuChoi: duLieu.lyDoTuChoi,
    ngayDuyet: duLieu.ngayDuyet,
    ngayTao: duLieu.ngayTao,
    ngayCapNhat: duLieu.ngayCapNhat,
  }
}

export const dichVuNhaTuyenDung = {
  async layDanhSach() {
    const danhSach = await (NhaTuyenDung as any)
      .find()
      .populate('maNguoiDung', 'hoTen email soDienThoai')
      .sort({ ngayTao: -1 })
      .limit(200)

    return danhSach.map(chuanHoaNhaTuyenDung)
  },

  async layTheoMa(ma: string) {
    const duLieu = await (NhaTuyenDung as any).findById(ma).populate('maNguoiDung', 'hoTen email soDienThoai')
    if (!duLieu) throw new LoiUngDung('Không tìm thấy nhà tuyển dụng', 404)
    return chuanHoaNhaTuyenDung(duLieu)
  },

  async taoMoi(duLieu: unknown) {
    const ketQua = await (NhaTuyenDung as any).create(duLieu)
    return chuanHoaNhaTuyenDung(await (NhaTuyenDung as any).findById(ketQua._id).populate('maNguoiDung', 'hoTen email soDienThoai'))
  },

  async capNhat(ma: string, duLieuNhan: unknown) {
    const duLieu = duLieuNhan as Record<string, unknown>
    const hienTai = await (NhaTuyenDung as any).findById(ma)
    if (!hienTai) throw new LoiUngDung('Không tìm thấy nhà tuyển dụng để cập nhật', 404)
    if (hienTai.trangThaiDuyet === 'da_duyet' && duLieu.trangThaiDuyet === 'tu_choi') {
      throw new LoiUngDung('Không thể từ chối công ty đã được duyệt. Nếu hồ sơ có vấn đề, hãy xóa hoặc khóa công ty.', 409, 'COMPANY_ALREADY_APPROVED')
    }

    const duLieuCapNhat = {
      ...duLieu,
      ...(duLieu.trangThaiDuyet === 'da_duyet' ? { ngayDuyet: new Date(), lyDoTuChoi: undefined } : {}),
    }
    const ketQua = await (NhaTuyenDung as any)
      .findByIdAndUpdate(ma, duLieuCapNhat, { returnDocument: 'after', runValidators: true })
      .populate('maNguoiDung', 'hoTen email soDienThoai')

    if (!ketQua) throw new LoiUngDung('Không tìm thấy nhà tuyển dụng để cập nhật', 404)
    return chuanHoaNhaTuyenDung(ketQua)
  },

  async xoa(ma: string) {
    const ketQua = await (NhaTuyenDung as any).findByIdAndDelete(ma).populate('maNguoiDung', 'hoTen email soDienThoai')
    if (!ketQua) throw new LoiUngDung('Không tìm thấy nhà tuyển dụng để xóa', 404)
    return chuanHoaNhaTuyenDung(ketQua)
  },
}



