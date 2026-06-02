import { LoiUngDung } from '../../dungchung/loiungdung.js'
import '../hosonangluc/hosonangluc.mohinh.js'
import '../nhatuyendung/nhatuyendung.mohinh.js'
import '../nguoidung/nguoidung.mohinh.js'
import '../tintuyendung/tintuyendung.mohinh.js'
import '../ungvien/ungvien.mohinh.js'
import { NhaTuyenDung } from '../nhatuyendung/nhatuyendung.mohinh.js'
import { thongBaoHeThong, thongBaoHoSoDuocXem, thongBaoHoSoMoiUngTuyen } from '../thongbao/thongbao.helper.js'
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
                maNguoiDung: tin.maNhaTuyenDung.maNguoiDung?._id
                  ? {
                      id: String(tin.maNhaTuyenDung.maNguoiDung._id),
                      hoTen: tin.maNhaTuyenDung.maNguoiDung.hoTen,
                      email: tin.maNhaTuyenDung.maNguoiDung.email,
                    }
                  : tin.maNhaTuyenDung.maNguoiDung ? String(tin.maNhaTuyenDung.maNguoiDung) : undefined,
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
          loaiHoSo: duLieu.maHoSoNangLuc.loaiHoSo,
          cvChinh: duLieu.maHoSoNangLuc.cvChinh,
          congKhai: duLieu.maHoSoNangLuc.congKhai,
          hoTenHienThi: duLieu.maHoSoNangLuc.hoTenHienThi,
          chucDanh: duLieu.maHoSoNangLuc.chucDanh,
          soDienThoai: duLieu.maHoSoNangLuc.soDienThoai,
          emailLienHe: duLieu.maHoSoNangLuc.emailLienHe,
          facebook: duLieu.maHoSoNangLuc.facebook,
          github: duLieu.maHoSoNangLuc.github,
          portfolioUrl: duLieu.maHoSoNangLuc.portfolioUrl,
          diaDiem: duLieu.maHoSoNangLuc.diaDiem,
          tomTatKinhNghiem: duLieu.maHoSoNangLuc.tomTatKinhNghiem,
          kyNangMem: duLieu.maHoSoNangLuc.kyNangMem,
          kyNangLapTrinh: duLieu.maHoSoNangLuc.kyNangLapTrinh,
          hocVan: duLieu.maHoSoNangLuc.hocVan,
          kinhNghiemLam: duLieu.maHoSoNangLuc.kinhNghiemLam,
          chungChi: duLieu.maHoSoNangLuc.chungChi,
          duAn: duLieu.maHoSoNangLuc.duAn,
          baiVietKyThuat: duLieu.maHoSoNangLuc.baiVietKyThuat,
          duAnChiTiet: duLieu.maHoSoNangLuc.duAnChiTiet,
          fileCvTen: duLieu.maHoSoNangLuc.fileCvTen,
          fileCvLoai: duLieu.maHoSoNangLuc.fileCvLoai,
          fileCvĐạta: duLieu.maHoSoNangLuc.fileCvĐạta,
          anhDaiDien: duLieu.maHoSoNangLuc.anhDaiDien,
          templateCv: duLieu.maHoSoNangLuc.templateCv,
          mauChinh: duLieu.maHoSoNangLuc.mauChinh,
          mauPhu: duLieu.maHoSoNangLuc.mauPhu,
          font: duLieu.maHoSoNangLuc.font,
          ngayCapNhat: duLieu.maHoSoNangLuc.ngayCapNhat,
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
    .populate({ path: 'maTinTuyenDung', populate: { path: 'maNhaTuyenDung', select: 'tenCongTy logo maNguoiDung', populate: { path: 'maNguoiDung', select: 'hoTen email' } } })
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
      .populate({ path: 'maTinTuyenDung', populate: { path: 'maNhaTuyenDung', select: 'tenCongTy logo maNguoiDung', populate: { path: 'maNguoiDung', select: 'hoTen email' } } })
      .populate({ path: 'maUngVien', populate: { path: 'maNguoiDung', select: 'hoTen email soDienThoai' } })
      .populate('maHoSoNangLuc')
    if (!duLieu) throw new LoiUngDung('Không tìm thấy hồ sơ ứng tuyển', 404)
    return chuanHoaUngTuyen(duLieu)
  },
  async taoMoi(duLieu: unknown) {
    try {
      const ketQua = await (HoSoUngTuyen as any).create(duLieu)
      const hoSoMoi = await this.layTheoMa(String(ketQua._id))

      try {
        const maCongTy = hoSoMoi.tinTuyenDung?.nhaTuyenDung?.id
        const congTy = maCongTy ? await (NhaTuyenDung as any).findById(maCongTy).select('maNguoiDung') : null
        const maNguoiDungNhaTuyenDung = String(congTy?.maNguoiDung ?? '')
        if (maNguoiDungNhaTuyenDung) {
          await thongBaoHoSoMoiUngTuyen({
            maNhaTuyenDung: maNguoiDungNhaTuyenDung,
            tenUngVien: hoSoMoi.ungVien?.nguoiDung?.hoTen ?? 'Ứng viên',
            viTriUngTuyen: hoSoMoi.tinTuyenDung?.tieuDe ?? 'Vi tri ung tuyen',
            maHoSoUngTuyen: hoSoMoi.id,
            kinhNghiem: `${hoSoMoi.ungVien?.kinhNghiem ?? 0} nam kinh nghiem`,
          })
        }
      } catch (error) {
        console.error('Lỗi gửi thông báo hồ sơ mới:', error)
      }

      return hoSoMoi
    } catch (loi: any) {
      if (loi?.code === 11000) throw new LoiUngDung('Ban da ung tuyen tin nay', 409)
      throw loi
    }
  },
  async capNhat(ma: string, duLieu: unknown) {
    const truocKhiCapNhat = await (HoSoUngTuyen as any)
      .findById(ma)
      .populate({ path: 'maTinTuyenDung', populate: { path: 'maNhaTuyenDung', select: 'tenCongTy logo maNguoiDung', populate: { path: 'maNguoiDung', select: 'hoTen email' } } })
      .populate({ path: 'maUngVien', populate: { path: 'maNguoiDung', select: 'hoTen email soDienThoai' } })
      .populate('maHoSoNangLuc')

    const ketQua = await (HoSoUngTuyen as any)
      .findByIdAndUpdate(ma, duLieu, { returnDocument: 'after', runValidators: true })
      .populate({ path: 'maTinTuyenDung', populate: { path: 'maNhaTuyenDung', select: 'tenCongTy logo maNguoiDung', populate: { path: 'maNguoiDung', select: 'hoTen email' } } })
      .populate({ path: 'maUngVien', populate: { path: 'maNguoiDung', select: 'hoTen email soDienThoai' } })
      .populate('maHoSoNangLuc')
    if (!ketQua) throw new LoiUngDung('Không tìm thấy hồ sơ ứng tuyển de cap nhat', 404)
    const ketQuaChuanHoa = chuanHoaUngTuyen(ketQua)

    try {
      const trangThaiCu = String(truocKhiCapNhat?.trangThai ?? '')
      const trangThaiMoi = String(ketQuaChuanHoa.trangThai ?? '')
      const maNguoiDungUngVien = ketQuaChuanHoa.ungVien?.nguoiDung?.id
      const tenCongTy = ketQuaChuanHoa.tinTuyenDung?.nhaTuyenDung?.tenCongTy ?? 'Cong ty'
      const viTriUngTuyen = ketQuaChuanHoa.tinTuyenDung?.tieuDe ?? 'Vi tri ung tuyen'

      if (trangThaiCu !== 'da_xem' && trangThaiMoi === 'da_xem' && maNguoiDungUngVien) {
        await thongBaoHoSoDuocXem({
          maUngVien: maNguoiDungUngVien,
          tenCongTy,
          viTriUngTuyen,
          maHoSoUngTuyen: ketQuaChuanHoa.id,
        })
      }

      if (trangThaiCu !== trangThaiMoi && ['dat', 'tu_choi'].includes(trangThaiMoi) && maNguoiDungUngVien) {
        await thongBaoHeThong({
          maNguoiDung: maNguoiDungUngVien,
          tieuDe: trangThaiMoi === 'dat' ? 'Ho so ung tuyen da dat' : 'Ho so ung tuyen bi tu choi',
          noiDung: `${tenCongTy} đã cập nhật kết quả hồ sơ ung tuyen vi tri ${viTriUngTuyen}: ${trangThaiMoi === 'dat' ? 'Đạt' : 'Từ chối'}.`,
          lienKet: '/ung-vien/ung-tuyen',
          mucDoUuTien: 'cao',
        })
      }
    } catch (error) {
      console.error('Lỗi gửi thông báo cập nhật hồ sơ ứng tuyển:', error)
    }

    return ketQuaChuanHoa
  },
  async xoa(ma: string) {
    const ketQua = await (HoSoUngTuyen as any).findByIdAndDelete(ma)
    if (!ketQua) throw new LoiUngDung('Không tìm thấy hồ sơ ứng tuyển de xoa', 404)
    return chuanHoaUngTuyen(ketQua)
  },
}



