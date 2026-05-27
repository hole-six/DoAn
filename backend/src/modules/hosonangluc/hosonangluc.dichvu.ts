import { LoiUngDung } from '../../dungchung/loiungdung.js'
import '../ungvien/ungvien.mohinh.js'
import { HoSoNangLuc } from './hosonangluc.mohinh.js'

function chuanHoaHoSo(taiLieu: any) {
  const duLieu = typeof taiLieu.toObject === 'function' ? taiLieu.toObject() : taiLieu
  return {
    id: String(duLieu._id),
    maUngVien: duLieu.maUngVien?._id ? String(duLieu.maUngVien._id) : String(duLieu.maUngVien),
    tieuDe: duLieu.tieuDe,
    hocVan: duLieu.hocVan ?? [],
    kinhNghiemLam: duLieu.kinhNghiemLam ?? [],
    chungChi: duLieu.chungChi ?? [],
    duAn: duLieu.duAn ?? [],
    anhDaiDien: duLieu.anhDaiDien,
    templateCv: duLieu.templateCv ?? 'classic-blue',
    mauChinh: duLieu.mauChinh ?? '#2563eb',
    mauPhu: duLieu.mauPhu ?? '#0f172a',
    font: duLieu.font ?? 'Inter',
    markdownGoc: duLieu.markdownGoc ?? '',
    ghiChuAi: duLieu.ghiChuAi ?? '',
    cvChinh: duLieu.cvChinh,
    congKhai: duLieu.congKhai,
    ngayTao: duLieu.ngayTao,
    ngayCapNhat: duLieu.ngayCapNhat,
  }
}

export const dichVuHoSoNangLuc = {
  async layDanhSach() {
    const danhSach = await (HoSoNangLuc as any).find().sort({ cvChinh: -1, ngayCapNhat: -1 }).limit(300)
    return danhSach.map(chuanHoaHoSo)
  },
  async layTheoMa(ma: string) {
    const duLieu = await (HoSoNangLuc as any).findById(ma)
    if (!duLieu) throw new LoiUngDung('Khong tim thay ho so nang luc', 404)
    return chuanHoaHoSo(duLieu)
  },
  async taoMoi(duLieu: unknown) {
    const payload = duLieu as any
    if (payload.cvChinh) await (HoSoNangLuc as any).updateMany({ maUngVien: payload.maUngVien }, { $set: { cvChinh: false } })
    const ketQua = await (HoSoNangLuc as any).create(payload)
    return chuanHoaHoSo(ketQua)
  },
  async capNhat(ma: string, duLieu: unknown) {
    const payload = duLieu as any
    if (payload.cvChinh && payload.maUngVien) await (HoSoNangLuc as any).updateMany({ maUngVien: payload.maUngVien, _id: { $ne: ma } }, { $set: { cvChinh: false } })
    const ketQua = await (HoSoNangLuc as any).findByIdAndUpdate(ma, payload, { returnDocument: 'after', runValidators: true })
    if (!ketQua) throw new LoiUngDung('Khong tim thay ho so nang luc de cap nhat', 404)
    return chuanHoaHoSo(ketQua)
  },
  async xoa(ma: string) {
    const ketQua = await (HoSoNangLuc as any).findByIdAndDelete(ma)
    if (!ketQua) throw new LoiUngDung('Khong tim thay ho so nang luc de xoa', 404)
    return chuanHoaHoSo(ketQua)
  },
}
