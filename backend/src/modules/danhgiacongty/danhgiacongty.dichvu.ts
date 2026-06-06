import { LoiUngDung } from '../../dungchung/loiungdung.js'
import '../nguoidung/nguoidung.mohinh.js'
import '../nhatuyendung/nhatuyendung.mohinh.js'
import '../ungvien/ungvien.mohinh.js'
import { HoSoUngTuyen } from '../hosoungtuyen/hosoungtuyen.mohinh.js'
import { LichPhongVan } from '../lichphongvan/lichphongvan.mohinh.js'
import { LichSuHoSoUngTuyen } from '../lichsuhosoungtuyen/lichsuhosoungtuyen.mohinh.js'
import { UngVien } from '../ungvien/ungvien.mohinh.js'
import { DanhGiaCongTy } from './danhgiacongty.mohinh.js'

type NguoiDungHienTai = {
  id: string
  vaiTro: string
}

type DuLieuTaoTuHoSo = {
  diem: number
  noiDung: string
  anDanh?: boolean
}

function id(value: any) {
  return String(value?._id ?? value ?? '')
}

function chuanHoaDanhGia(taiLieu: any) {
  const duLieu = typeof taiLieu.toObject === 'function' ? taiLieu.toObject() : taiLieu

  return {
    id: String(duLieu._id),
    maUngVien: duLieu.maUngVien?._id ? String(duLieu.maUngVien._id) : String(duLieu.maUngVien),
    maNhaTuyenDung: duLieu.maNhaTuyenDung?._id ? String(duLieu.maNhaTuyenDung._id) : String(duLieu.maNhaTuyenDung),
    maHoSoUngTuyen: duLieu.maHoSoUngTuyen?._id
      ? String(duLieu.maHoSoUngTuyen._id)
      : duLieu.maHoSoUngTuyen
        ? String(duLieu.maHoSoUngTuyen)
        : undefined,
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

async function layUngVienCuaNguoiDung(nguoiDung: NguoiDungHienTai) {
  if (nguoiDung.vaiTro !== 'ung_vien') {
    throw new LoiUngDung('Bạn cần đăng nhập bằng tài khoản ứng viên để đánh giá công ty', 403, 'FORBIDDEN')
  }
  const ungVien = await (UngVien as any).findOne({ maNguoiDung: nguoiDung.id })
  if (!ungVien) throw new LoiUngDung('Bạn cần tạo hồ sơ ứng viên trước khi đánh giá công ty', 422, 'CANDIDATE_PROFILE_REQUIRED')
  return ungVien
}

async function damBaoDaDuocMoiPhongVan(hoSo: any) {
  if (String(hoSo.trangThai ?? '') === 'moi_phong_van') return

  const [lichPhongVan, lichSuMoiPhongVan] = await Promise.all([
    (LichPhongVan as any).findOne({ maHoSoUngTuyen: hoSo._id }).select('_id'),
    (LichSuHoSoUngTuyen as any).findOne({ maHoSoUngTuyen: hoSo._id, trangThaiMoi: 'moi_phong_van' }).select('_id'),
  ])

  if (!lichPhongVan && !lichSuMoiPhongVan) {
    throw new LoiUngDung('Bạn chỉ có thể đánh giá công ty sau khi được mời phỏng vấn.', 409, 'REVIEW_REQUIRES_INTERVIEW_INVITE')
  }
}

export const dichVuDanhGiaCongTy = {
  async layDanhSach() {
    const danhSach = await (DanhGiaCongTy as any)
      .find()
      .populate({ path: 'maUngVien', select: 'maNguoiDung viTriMongMuon', populate: { path: 'maNguoiDung', select: 'hoTen email' } })
      .populate('maNhaTuyenDung', 'tenCongTy logo')
      .populate('maHoSoUngTuyen', 'trangThai ngayNop')
      .sort({ ngayTao: -1 })
      .limit(300)

    return danhSach.map(chuanHoaDanhGia)
  },

  async layCuaUngVien(nguoiDung: NguoiDungHienTai) {
    const ungVien = await layUngVienCuaNguoiDung(nguoiDung)
    const danhSach = await (DanhGiaCongTy as any)
      .find({ maUngVien: ungVien._id })
      .populate({ path: 'maUngVien', select: 'maNguoiDung viTriMongMuon', populate: { path: 'maNguoiDung', select: 'hoTen email' } })
      .populate('maNhaTuyenDung', 'tenCongTy logo')
      .populate('maHoSoUngTuyen', 'trangThai ngayNop')
      .sort({ ngayTao: -1 })
      .limit(300)
    return danhSach.map(chuanHoaDanhGia)
  },

  async layTheoMa(ma: string) {
    const duLieu = await (DanhGiaCongTy as any)
      .findById(ma)
      .populate({ path: 'maUngVien', select: 'maNguoiDung viTriMongMuon', populate: { path: 'maNguoiDung', select: 'hoTen email' } })
      .populate('maNhaTuyenDung', 'tenCongTy logo')
      .populate('maHoSoUngTuyen', 'trangThai ngayNop')
    if (!duLieu) throw new LoiUngDung('Không tìm thấy đánh giá công ty', 404)
    return chuanHoaDanhGia(duLieu)
  },

  async taoMoi(duLieu: unknown) {
    const ketQua = await (DanhGiaCongTy as any).create(duLieu)
    return chuanHoaDanhGia(await this.layTheoMa(String(ketQua._id)))
  },

  async taoTuHoSo(nguoiDung: NguoiDungHienTai, maHoSoUngTuyen: string, duLieu: DuLieuTaoTuHoSo) {
    const ungVien = await layUngVienCuaNguoiDung(nguoiDung)
    const hoSo = await (HoSoUngTuyen as any)
      .findById(maHoSoUngTuyen)
      .populate({ path: 'maTinTuyenDung', select: 'maNhaTuyenDung tieuDe' })

    if (!hoSo) throw new LoiUngDung('Không tìm thấy hồ sơ ứng tuyển', 404, 'APPLICATION_NOT_FOUND')
    if (id(hoSo.maUngVien) !== id(ungVien)) {
      throw new LoiUngDung('Bạn không có quyền đánh giá từ hồ sơ ứng tuyển này', 403, 'FORBIDDEN')
    }

    await damBaoDaDuocMoiPhongVan(hoSo)

    const maNhaTuyenDung = id(hoSo.maTinTuyenDung?.maNhaTuyenDung)
    if (!maNhaTuyenDung) throw new LoiUngDung('Không tìm thấy công ty của hồ sơ ứng tuyển', 404, 'COMPANY_NOT_FOUND')

    const daCoDanhGia = await (DanhGiaCongTy as any).findOne({ maHoSoUngTuyen })
    if (daCoDanhGia) {
      throw new LoiUngDung('Bạn đã đánh giá công ty từ hồ sơ ứng tuyển này.', 409, 'REVIEW_ALREADY_EXISTS')
    }

    const ketQua = await (DanhGiaCongTy as any).create({
      maUngVien: ungVien._id,
      maNhaTuyenDung,
      maHoSoUngTuyen,
      diem: duLieu.diem,
      noiDung: duLieu.noiDung,
      anDanh: duLieu.anDanh ?? false,
      daDuyet: false,
    })

    return this.layTheoMa(id(ketQua))
  },

  async capNhat(ma: string, duLieu: unknown) {
    const ketQua = await (DanhGiaCongTy as any)
      .findByIdAndUpdate(ma, duLieu, { returnDocument: 'after', runValidators: true })
      .populate({ path: 'maUngVien', select: 'maNguoiDung viTriMongMuon', populate: { path: 'maNguoiDung', select: 'hoTen email' } })
      .populate('maNhaTuyenDung', 'tenCongTy logo')
      .populate('maHoSoUngTuyen', 'trangThai ngayNop')

    if (!ketQua) throw new LoiUngDung('Không tìm thấy đánh giá công ty de cap nhat', 404)
    return chuanHoaDanhGia(ketQua)
  },

  async xoa(ma: string) {
    const ketQua = await (DanhGiaCongTy as any)
      .findByIdAndDelete(ma)
      .populate({ path: 'maUngVien', select: 'maNguoiDung viTriMongMuon', populate: { path: 'maNguoiDung', select: 'hoTen email' } })
      .populate('maNhaTuyenDung', 'tenCongTy logo')
      .populate('maHoSoUngTuyen', 'trangThai ngayNop')
    if (!ketQua) throw new LoiUngDung('Không tìm thấy đánh giá công ty de xoa', 404)
    return chuanHoaDanhGia(ketQua)
  },
}

