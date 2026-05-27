import { LoiUngDung } from '../../dungchung/loiungdung.js'
import '../hosoungtuyen/hosoungtuyen.mohinh.js'
import '../nhatuyendung/nhatuyendung.mohinh.js'
import '../tintuyendung/tintuyendung.mohinh.js'
import { LichPhongVan } from './lichphongvan.mohinh.js'

function chuanHoaLich(taiLieu: any) {
  const duLieu = typeof taiLieu.toObject === 'function' ? taiLieu.toObject() : taiLieu
  const ungTuyen = duLieu.maHoSoUngTuyen
  const tin = ungTuyen?.maTinTuyenDung
  return {
    id: String(duLieu._id),
    maHoSoUngTuyen: ungTuyen?._id ? String(ungTuyen._id) : String(ungTuyen),
    hoSoUngTuyen: ungTuyen?._id
      ? {
          id: String(ungTuyen._id),
          trangThai: ungTuyen.trangThai,
          tinTuyenDung: tin?._id
            ? {
                id: String(tin._id),
                tieuDe: tin.tieuDe,
                nhaTuyenDung: tin.maNhaTuyenDung?._id ? { id: String(tin.maNhaTuyenDung._id), tenCongTy: tin.maNhaTuyenDung.tenCongTy } : undefined,
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
  return q.populate({ path: 'maHoSoUngTuyen', populate: { path: 'maTinTuyenDung', populate: { path: 'maNhaTuyenDung', select: 'tenCongTy' } } })
}

export const dichVuLichPhongVan = {
  async layDanhSach() {
    const danhSach = await populate((LichPhongVan as any).find()).sort({ thoiGianBatDau: 1 }).limit(300)
    return danhSach.map(chuanHoaLich)
  },
  async layTheoMa(ma: string) {
    const duLieu = await populate((LichPhongVan as any).findById(ma))
    if (!duLieu) throw new LoiUngDung('Khong tim thay lich phong van', 404)
    return chuanHoaLich(duLieu)
  },
  async taoMoi(duLieu: unknown) {
    const ketQua = await (LichPhongVan as any).create(duLieu)
    return this.layTheoMa(String(ketQua._id))
  },
  async capNhat(ma: string, duLieu: unknown) {
    const ketQua = await populate((LichPhongVan as any).findByIdAndUpdate(ma, duLieu, { returnDocument: 'after', runValidators: true }))
    if (!ketQua) throw new LoiUngDung('Khong tim thay lich phong van de cap nhat', 404)
    return chuanHoaLich(ketQua)
  },
  async xoa(ma: string) {
    const ketQua = await (LichPhongVan as any).findByIdAndDelete(ma)
    if (!ketQua) throw new LoiUngDung('Khong tim thay lich phong van de xoa', 404)
    return chuanHoaLich(ketQua)
  },
}
