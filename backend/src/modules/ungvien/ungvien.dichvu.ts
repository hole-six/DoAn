import { LoiUngDung } from '../../dungchung/loiungdung.js'
import '../danhmuckynang/danhmuckynang.mohinh.js'
import '../nguoidung/nguoidung.mohinh.js'
import { UngVien } from './ungvien.mohinh.js'

function chuanHoaUngVien(taiLieu: any) {
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
          trangThai: duLieu.maNguoiDung.trangThai,
        }
      : undefined,
    ngaySinh: duLieu.ngaySinh,
    gioiTinh: duLieu.gioiTinh,
    diaChi: duLieu.diaChi,
    tomTat: duLieu.tomTat,
    kinhNghiem: duLieu.kinhNghiem,
    viTriMongMuon: duLieu.viTriMongMuon,
    mucLuongMongMuon: duLieu.mucLuongMongMuon,
    kyNang: (duLieu.kyNang ?? []).map((muc: any) => ({
      maKyNang: muc.maKyNang?._id ? String(muc.maKyNang._id) : String(muc.maKyNang),
      tenKyNang: muc.maKyNang?.tenKyNang,
      loaiKyNang: muc.maKyNang?.loaiKyNang,
      mucDo: muc.mucDo,
    })),
    portfolio: duLieu.portfolio ?? [],
    ngayTao: duLieu.ngayTao,
    ngayCapNhat: duLieu.ngayCapNhat,
  }
}

export const dichVuUngVien = {
  async layDanhSach() {
    const danhSach = await (UngVien as any)
      .find()
      .populate('maNguoiDung', 'hoTen email soDienThoai trangThai')
      .populate('kyNang.maKyNang', 'tenKyNang loaiKyNang')
      .sort({ ngayTao: -1 })
      .limit(200)
    return danhSach.map(chuanHoaUngVien)
  },

  async layTheoMa(ma: string) {
    const duLieu = await (UngVien as any)
      .findById(ma)
      .populate('maNguoiDung', 'hoTen email soDienThoai trangThai')
      .populate('kyNang.maKyNang', 'tenKyNang loaiKyNang')
    if (!duLieu) throw new LoiUngDung('Khong tim thay ung vien', 404)
    return chuanHoaUngVien(duLieu)
  },

  async taoMoi(duLieu: unknown) {
    const ketQua = await (UngVien as any).create(duLieu)
    return this.layTheoMa(String(ketQua._id))
  },

  async capNhat(ma: string, duLieu: unknown) {
    const ketQua = await (UngVien as any)
      .findByIdAndUpdate(ma, duLieu, { returnDocument: 'after', runValidators: true })
      .populate('maNguoiDung', 'hoTen email soDienThoai trangThai')
      .populate('kyNang.maKyNang', 'tenKyNang loaiKyNang')
    if (!ketQua) throw new LoiUngDung('Khong tim thay ung vien de cap nhat', 404)
    return chuanHoaUngVien(ketQua)
  },

  async xoa(ma: string) {
    const ketQua = await (UngVien as any).findByIdAndDelete(ma)
    if (!ketQua) throw new LoiUngDung('Khong tim thay ung vien de xoa', 404)
    return chuanHoaUngVien(ketQua)
  },
}
