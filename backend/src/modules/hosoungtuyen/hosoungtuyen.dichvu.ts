import { LoiUngDung } from '../../dungchung/loiungdung.js'
import '../hosonangluc/hosonangluc.mohinh.js'
import '../nhatuyendung/nhatuyendung.mohinh.js'
import '../nguoidung/nguoidung.mohinh.js'
import '../tintuyendung/tintuyendung.mohinh.js'
import '../ungvien/ungvien.mohinh.js'
import { HoSoUngTuyen } from './hosoungtuyen.mohinh.js'

function chuanHoaUngTuyen(taiLieu: any) {
  const duLieu = typeof taiLieu.toObject === 'function' ? taiLieu.toObject() : taiLieu
  const tin = duLieu.maTinTuyenDung
  return {
    id: String(duLieu._id),
    maUngVien: duLieu.maUngVien?._id ? String(duLieu.maUngVien._id) : String(duLieu.maUngVien),
    maTinTuyenDung: tin?._id ? String(tin._id) : String(tin),
    maHoSoNangLuc: duLieu.maHoSoNangLuc?._id ? String(duLieu.maHoSoNangLuc._id) : duLieu.maHoSoNangLuc ? String(duLieu.maHoSoNangLuc) : undefined,
    tinTuyenDung: tin?._id
      ? {
          id: String(tin._id),
          tieuDe: tin.tieuDe,
          diaChi: tin.diaChi,
          luongMin: tin.luongMin,
          luongMax: tin.luongMax,
          capBac: tin.capBac,
          loaiHinh: tin.loaiHinh,
          trangThai: tin.trangThai,
          nhaTuyenDung: tin.maNhaTuyenDung?._id
            ? {
                id: String(tin.maNhaTuyenDung._id),
                tenCongTy: tin.maNhaTuyenDung.tenCongTy,
                logo: tin.maNhaTuyenDung.logo,
              }
            : undefined,
        }
      : undefined,
    ungVien: duLieu.maUngVien?._id
      ? {
          id: String(duLieu.maUngVien._id),
          viTriMongMuon: duLieu.maUngVien.viTriMongMuon,
          kinhNghiem: duLieu.maUngVien.kinhNghiem,
          diaChi: duLieu.maUngVien.diaChi,
          mucLuongMongMuon: duLieu.maUngVien.mucLuongMongMuon,
          tomTat: duLieu.maUngVien.tomTat,
          portfolio: duLieu.maUngVien.portfolio ?? [],
          nguoiDung: duLieu.maUngVien.maNguoiDung?._id
            ? {
                id: String(duLieu.maUngVien.maNguoiDung._id),
                hoTen: duLieu.maUngVien.maNguoiDung.hoTen,
                email: duLieu.maUngVien.maNguoiDung.email,
                soDienThoai: duLieu.maUngVien.maNguoiDung.soDienThoai,
              }
            : undefined,
        }
      : undefined,
    hoSoNangLuc: duLieu.maHoSoNangLuc?._id
      ? {
          id: String(duLieu.maHoSoNangLuc._id),
          tieuDe: duLieu.maHoSoNangLuc.tieuDe,
          hocVan: duLieu.maHoSoNangLuc.hocVan,
          kinhNghiemLam: duLieu.maHoSoNangLuc.kinhNghiemLam,
          chungChi: duLieu.maHoSoNangLuc.chungChi,
          duAn: duLieu.maHoSoNangLuc.duAn,
        }
      : undefined,
    thuXinViec: duLieu.thuXinViec,
    diemKhopKyNang: duLieu.diemKhopKyNang,
    trangThai: duLieu.trangThai,
    ngayNop: duLieu.ngayNop,
    ngayTao: duLieu.ngayTao,
    ngayCapNhat: duLieu.ngayCapNhat,
  }
}

function query() {
  return (HoSoUngTuyen as any)
    .find()
    .populate({ path: 'maTinTuyenDung', populate: { path: 'maNhaTuyenDung', select: 'tenCongTy logo' } })
    .populate({ path: 'maUngVien', populate: { path: 'maNguoiDung', select: 'hoTen email soDienThoai' } })
    .populate('maHoSoNangLuc')
}

export const dichVuHoSoUngTuyen = {
  async layDanhSach() {
    const danhSach = await query().sort({ ngayNop: -1 }).limit(300)
    return danhSach.map(chuanHoaUngTuyen)
  },
  async layTheoMa(ma: string) {
    const duLieu = await (HoSoUngTuyen as any)
      .findById(ma)
      .populate({ path: 'maTinTuyenDung', populate: { path: 'maNhaTuyenDung', select: 'tenCongTy logo' } })
      .populate({ path: 'maUngVien', populate: { path: 'maNguoiDung', select: 'hoTen email soDienThoai' } })
      .populate('maHoSoNangLuc')
    if (!duLieu) throw new LoiUngDung('Khong tim thay ho so ung tuyen', 404)
    return chuanHoaUngTuyen(duLieu)
  },
  async taoMoi(duLieu: unknown) {
    try {
      const ketQua = await (HoSoUngTuyen as any).create(duLieu)
      return this.layTheoMa(String(ketQua._id))
    } catch (loi: any) {
      if (loi?.code === 11000) throw new LoiUngDung('Ban da ung tuyen tin nay', 409)
      throw loi
    }
  },
  async capNhat(ma: string, duLieu: unknown) {
    const ketQua = await (HoSoUngTuyen as any)
      .findByIdAndUpdate(ma, duLieu, { returnDocument: 'after', runValidators: true })
      .populate({ path: 'maTinTuyenDung', populate: { path: 'maNhaTuyenDung', select: 'tenCongTy logo' } })
      .populate({ path: 'maUngVien', populate: { path: 'maNguoiDung', select: 'hoTen email soDienThoai' } })
      .populate('maHoSoNangLuc')
    if (!ketQua) throw new LoiUngDung('Khong tim thay ho so ung tuyen de cap nhat', 404)
    return chuanHoaUngTuyen(ketQua)
  },
  async xoa(ma: string) {
    const ketQua = await (HoSoUngTuyen as any).findByIdAndDelete(ma)
    if (!ketQua) throw new LoiUngDung('Khong tim thay ho so ung tuyen de xoa', 404)
    return chuanHoaUngTuyen(ketQua)
  },
}
