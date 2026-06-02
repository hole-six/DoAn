import { LoiUngDung } from '../../dungchung/loiungdung.js'
import { HoSoUngTuyen } from '../hosoungtuyen/hosoungtuyen.mohinh.js'
import '../nhatuyendung/nhatuyendung.mohinh.js'
import '../tintuyendung/tintuyendung.mohinh.js'
import {
  thongBaoKetQuaPhongVan,
  thongBaoLichPhongVanThayDoi,
  thongBaoMoiPhongVan,
  thongBaoUngVienChapNhanLich,
  thongBaoUngVienTuChoiLich,
} from '../thongbao/thongbao.helper.js'
import { LichPhongVan } from './lichphongvan.mohinh.js'

function chuanHoaLich(taiLieu: any) {
  const duLieu = typeof taiLieu.toObject === 'function' ? taiLieu.toObject() : taiLieu
  const ungTuyen = duLieu.maHoSoUngTuyen
  const tin = ungTuyen?.maTinTuyenDung
  const ungVien = ungTuyen?.maUngVien
  return {
    id: String(duLieu._id),
    maHoSoUngTuyen: ungTuyen?._id ? String(ungTuyen._id) : String(ungTuyen),
    hoSoUngTuyen: ungTuyen?._id
      ? {
          id: String(ungTuyen._id),
          maUngVien: ungVien?._id ? String(ungVien._id) : ungVien ? String(ungVien) : undefined,
          maTinTuyenDung: tin?._id ? String(tin._id) : tin ? String(tin) : undefined,
          trangThai: ungTuyen.trangThai,
          ungVien: ungVien?._id
            ? {
                id: String(ungVien._id),
                viTriMongMuon: ungVien.viTriMongMuon,
                kinhNghiem: ungVien.kinhNghiem,
                nguoiDung: ungVien.maNguoiDung?._id
                  ? {
                      id: String(ungVien.maNguoiDung._id),
                      hoTen: ungVien.maNguoiDung.hoTen,
                      email: ungVien.maNguoiDung.email,
                      soDienThoai: ungVien.maNguoiDung.soDienThoai,
                    }
                  : undefined,
              }
            : undefined,
          tinTuyenDung: tin?._id
            ? {
                id: String(tin._id),
                tieuDe: tin.tieuDe,
                nhaTuyenDung: tin.maNhaTuyenDung?._id
                  ? {
                      id: String(tin.maNhaTuyenDung._id),
                      tenCongTy: tin.maNhaTuyenDung.tenCongTy,
                    }
                  : undefined,
              }
            : undefined,
        }
      : undefined,
    thoiGianBatDau: duLieu.thoiGianBatDau,
    thoiGianKetThuc: duLieu.thoiGianKetThuc,
    diaChi: duLieu.diaChi,
    hinhThuc: duLieu.hinhThuc,
    linkHop: duLieu.linkHop,
    ghiChu: duLieu.ghiChu,
    trangThai: duLieu.trangThai,
    ketQua: duLieu.ketQua,
    ngayTao: duLieu.ngayTao,
    ngayCapNhat: duLieu.ngayCapNhat,
  }
}

function populate(q: any) {
  return q.populate({
    path: 'maHoSoUngTuyen',
    populate: [
      { path: 'maUngVien', populate: { path: 'maNguoiDung', select: 'hoTen email soDienThoai' } },
      { path: 'maTinTuyenDung', populate: { path: 'maNhaTuyenDung', select: 'tenCongTy maNguoiDung' } },
    ],
  })
}

export const dichVuLichPhongVan = {
  async layDanhSach() {
    const danhSach = await populate((LichPhongVan as any).find()).sort({ thoiGianBatDau: 1 }).limit(300)
    return danhSach.map(chuanHoaLich)
  },
  async layTheoMa(ma: string) {
    const duLieu = await populate((LichPhongVan as any).findById(ma))
    if (!duLieu) throw new LoiUngDung('Không tìm thấy lịch phỏng vấn', 404)
    return chuanHoaLich(duLieu)
  },
  async taoMoi(duLieu: any) {
    const ketQua = await (LichPhongVan as any).create(duLieu)
    const lichMoi = await this.layTheoMa(String(ketQua._id))

    try {
      const hoSo = await (HoSoUngTuyen as any)
        .findById(duLieu.maHoSoUngTuyen)
        .populate('maUngVien maTinTuyenDung')
      if (hoSo?.maUngVien && hoSo?.maTinTuyenDung) {
        const tin = await hoSo.maTinTuyenDung.populate('maNhaTuyenDung')
        await thongBaoMoiPhongVan({
          maUngVien: String(hoSo.maUngVien.maNguoiDung ?? hoSo.maUngVien._id),
          tenCongTy: tin.maNhaTuyenDung?.tenCongTy || 'Công ty',
          viTriUngTuyen: tin.tieuDe || 'Vị trí tuyển dụng',
          thoiGian: duLieu.thoiGianBatDau,
          diaChi: duLieu.diaChi || 'Chưa xác định',
          maLichPhongVan: String(ketQua._id),
        })
      }
    } catch (error) {
      console.error('Lỗi gửi thông báo mời phỏng vấn:', error)
    }

    return lichMoi
  },
  async capNhat(ma: string, duLieu: any) {
    const lichCu = await (LichPhongVan as any).findById(ma).populate('maHoSoUngTuyen')
    const ketQua = await populate(
      (LichPhongVan as any).findByIdAndUpdate(ma, duLieu, {
        returnDocument: 'after',
        runValidators: true,
      }),
    )
    if (!ketQua) throw new LoiUngDung('Không tìm thấy lịch phỏng vấn để cập nhật', 404)

    if (
      lichCu &&
      duLieu.thoiGianBatDau &&
      lichCu.thoiGianBatDau.getTime() !== new Date(duLieu.thoiGianBatDau).getTime()
    ) {
      try {
        const hoSo = await (HoSoUngTuyen as any)
          .findById(lichCu.maHoSoUngTuyen)
          .populate('maUngVien maTinTuyenDung')
        if (hoSo?.maUngVien && hoSo?.maTinTuyenDung) {
          const tin = await hoSo.maTinTuyenDung.populate('maNhaTuyenDung')
          await thongBaoLichPhongVanThayDoi({
            maUngVien: String(hoSo.maUngVien.maNguoiDung ?? hoSo.maUngVien._id),
            tenCongTy: tin.maNhaTuyenDung?.tenCongTy || 'Công ty',
            viTriUngTuyen: tin.tieuDe || 'Vị trí tuyển dụng',
            thoiGianMoi: duLieu.thoiGianBatDau,
            lyDo: duLieu.ghiChu,
            maLichPhongVan: ma,
          })
        }
      } catch (error) {
        console.error('Lỗi gửi thông báo thay đổi lịch:', error)
      }
    }

    if (
      lichCu &&
      String(duLieu.trangThai ?? '') &&
      String(duLieu.trangThai) !== String(lichCu.trangThai ?? '')
    ) {
      try {
        const hoSo = await (HoSoUngTuyen as any)
          .findById(lichCu.maHoSoUngTuyen?._id ?? lichCu.maHoSoUngTuyen)
          .populate('maUngVien maTinTuyenDung')
        if (hoSo?.maUngVien && hoSo?.maTinTuyenDung) {
          const tin = await hoSo.maTinTuyenDung.populate('maNhaTuyenDung')
          const maNguoiDungUngVien = String(hoSo.maUngVien.maNguoiDung ?? hoSo.maUngVien._id)
          const maNguoiDungNhaTuyenDung = String(
            tin.maNhaTuyenDung?.maNguoiDung ?? tin.maNhaTuyenDung?._id ?? '',
          )
          const tenUngVien = hoSo.maUngVien?.hoTen ?? hoSo.maUngVien?.tenUngVien ?? 'Ứng viên'
          const viTriUngTuyen = tin.tieuDe || 'Vị trí tuyển dụng'

          if (duLieu.trangThai === 'da_xac_nhan' && maNguoiDungNhaTuyenDung) {
            await thongBaoUngVienChapNhanLich({
              maNhaTuyenDung: maNguoiDungNhaTuyenDung,
              tenUngVien,
              viTriUngTuyen,
              thoiGian: ketQua.thoiGianBatDau,
              maLichPhongVan: ma,
            })
          }

          if (duLieu.trangThai === 'da_huy' && maNguoiDungNhaTuyenDung) {
            await thongBaoUngVienTuChoiLich({
              maNhaTuyenDung: maNguoiDungNhaTuyenDung,
              tenUngVien,
              viTriUngTuyen,
              lyDo: duLieu.ghiChu,
              maLichPhongVan: ma,
            })
          }

          if (duLieu.trangThai === 'hoan_thanh' && duLieu.ketQua && maNguoiDungUngVien) {
            await thongBaoKetQuaPhongVan({
              maUngVien: maNguoiDungUngVien,
              tenCongTy: tin.maNhaTuyenDung?.tenCongTy || 'Công ty',
              viTriUngTuyen,
              ketQua: duLieu.ketQua,
              ghiChu: duLieu.ghiChu,
              maLichPhongVan: ma,
            })
          }
        }
      } catch (error) {
        console.error('Lỗi gửi thông báo cập nhật lịch:', error)
      }
    }

    return chuanHoaLich(ketQua)
  },
  async xoa(ma: string) {
    const ketQua = await (LichPhongVan as any).findByIdAndDelete(ma)
    if (!ketQua) throw new LoiUngDung('Không tìm thấy lịch phỏng vấn để xóa', 404)
    return chuanHoaLich(ketQua)
  },
}



