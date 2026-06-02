import { LoiUngDung } from '../../dungchung/loiungdung.js'
import '../nguoidung/nguoidung.mohinh.js'
import '../nhatuyendung/nhatuyendung.mohinh.js'
import '../ungvien/ungvien.mohinh.js'
import { DanhGiaCongTy } from './danhgiacongty.mohinh.js'

function chuanHoaDanhGia(taiLieu: any) {
  const duLieu = typeof taiLieu.toObject === 'function' ? taiLieu.toObject() : taiLieu

  return {
    id: String(duLieu._id),
    maUngVien: duLieu.maUngVien?._id ? String(duLieu.maUngVien._id) : String(duLieu.maUngVien),
    maNhaTuyenDung: duLieu.maNhaTuyenDung?._id ? String(duLieu.maNhaTuyenDung._id) : String(duLieu.maNhaTuyenDung),
    ungVien: duLieu.maUngVien?._id
      ? {
          id: String(duLieu.maUngVien._id),
          maNguoiDung: duLieu.maUngVien.maNguoiDung?._id ? String(duLieu.maUngVien.maNguoiDung._id) : String(duLieu.maUngVien.maNguoiDung),
          hoTen: duLieu.maUngVien.maNguoiDung?.hoTen,
          email: duLieu.maUngVien.maNguoiDung?.email,
          viTriMongMuon: duLieu.maUngVien.viTriMongMuon,
        }
      : undefined,
    nhaTuyenDung: duLieu.maNhaTuyenDung?._id
      ? {
          id: String(duLieu.maNhaTuyenDung._id),
          tenCongTy: duLieu.maNhaTuyenDung.tenCongTy,
          logo: duLieu.maNhaTuyenDung.logo,
        }
      : undefined,
    diem: duLieu.diem,
    noiDung: duLieu.noiDung,
    anDanh: duLieu.anDanh,
    daDuyet: duLieu.daDuyet,
    ngayTao: duLieu.ngayTao,
    ngayCapNhat: duLieu.ngayCapNhat,
  }
}

export const dichVuDanhGiaCongTy = {
  async layDanhSach() {
    const danhSach = await (DanhGiaCongTy as any)
      .find()
      .populate({ path: 'maUngVien', select: 'maNguoiDung viTriMongMuon', populate: { path: 'maNguoiDung', select: 'hoTen email' } })
      .populate('maNhaTuyenDung', 'tenCongTy logo')
      .sort({ ngayTao: -1 })
      .limit(300)

    return danhSach.map(chuanHoaDanhGia)
  },

  async layTheoMa(ma: string) {
    const duLieu = await (DanhGiaCongTy as any)
      .findById(ma)
      .populate({ path: 'maUngVien', select: 'maNguoiDung viTriMongMuon', populate: { path: 'maNguoiDung', select: 'hoTen email' } })
      .populate('maNhaTuyenDung', 'tenCongTy logo')
    if (!duLieu) throw new LoiUngDung('Không tìm thấy đánh giá công ty', 404)
    return chuanHoaDanhGia(duLieu)
  },

  async taoMoi(duLieu: unknown) {
    const ketQua = await (DanhGiaCongTy as any).create(duLieu)
    return chuanHoaDanhGia(await this.layTheoMa(String(ketQua._id)))
  },

  async capNhat(ma: string, duLieu: unknown) {
    const ketQua = await (DanhGiaCongTy as any)
      .findByIdAndUpdate(ma, duLieu, { returnDocument: 'after', runValidators: true })
      .populate({ path: 'maUngVien', select: 'maNguoiDung viTriMongMuon', populate: { path: 'maNguoiDung', select: 'hoTen email' } })
      .populate('maNhaTuyenDung', 'tenCongTy logo')

    if (!ketQua) throw new LoiUngDung('Không tìm thấy đánh giá công ty de cap nhat', 404)
    return chuanHoaDanhGia(ketQua)
  },

  async xoa(ma: string) {
    const ketQua = await (DanhGiaCongTy as any)
      .findByIdAndDelete(ma)
      .populate({ path: 'maUngVien', select: 'maNguoiDung viTriMongMuon', populate: { path: 'maNguoiDung', select: 'hoTen email' } })
      .populate('maNhaTuyenDung', 'tenCongTy logo')
    if (!ketQua) throw new LoiUngDung('Không tìm thấy đánh giá công ty de xoa', 404)
    return chuanHoaDanhGia(ketQua)
  },
}

