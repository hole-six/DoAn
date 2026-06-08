import { LoiUngDung } from '../../dungchung/loiungdung.js'
import { boUndefined, coId } from '../../dungchung/prismaHelper.js'
import { HoSoNangLuc } from './hosonangluc.mohinh.js'

function chuanHoaChuoi(value: unknown) {
  return typeof value === 'string' ? value : undefined
}

function chuanHoaHoSo(taiLieu: any) {
  const duLieu = taiLieu ?? {}
  return {
    id: String(duLieu.id ?? duLieu._id),
    _id: String(duLieu.id ?? duLieu._id),
    maUngVien: duLieu.maUngVien?._id ? String(duLieu.maUngVien._id) : String(duLieu.maUngVien),
    tieuDe: duLieu.tieuDe,
    hocVan: duLieu.hocVan ?? [],
    kinhNghiemLam: duLieu.kinhNghiemLam ?? [],
    chungChi: duLieu.chungChi ?? [],
    duAn: duLieu.duAn ?? [],
    hoTenHienThi: chuanHoaChuoi(duLieu.hoTenHienThi),
    chucDanh: chuanHoaChuoi(duLieu.chucDanh),
    soDienThoai: chuanHoaChuoi(duLieu.soDienThoai),
    emailLienHe: chuanHoaChuoi(duLieu.emailLienHe),
    facebook: chuanHoaChuoi(duLieu.facebook),
    github: chuanHoaChuoi(duLieu.github),
    portfolioUrl: chuanHoaChuoi(duLieu.portfolioUrl),
    diaDiem: chuanHoaChuoi(duLieu.diaDiem),
    tomTatKinhNghiem: duLieu.tomTatKinhNghiem ?? [],
    kyNangMem: duLieu.kyNangMem ?? [],
    kyNangLapTrinh: duLieu.kyNangLapTrinh ?? [],
    baiVietKyThuat: duLieu.baiVietKyThuat ?? [],
    duAnChiTiet: duLieu.duAnChiTiet ?? [],
    fileCvTen: chuanHoaChuoi(duLieu.fileCvTen),
    fileCvLoai: chuanHoaChuoi(duLieu.fileCvLoai),
    fileCvData: chuanHoaChuoi(duLieu.fileCvData),
    fileCvText: chuanHoaChuoi(duLieu.fileCvText),
    fileCvPath: chuanHoaChuoi(duLieu.fileCvPath),
    fileCvTextStatus: chuanHoaChuoi(duLieu.fileCvTextStatus),
    fileCvTextError: chuanHoaChuoi(duLieu.fileCvTextError),
    loaiHoSo: chuanHoaChuoi(duLieu.loaiHoSo) ?? 'builder',
    anhDaiDien: chuanHoaChuoi(duLieu.anhDaiDien),
    templateCv: chuanHoaChuoi(duLieu.templateCv) ?? 'classic-blue',
    mauChinh: chuanHoaChuoi(duLieu.mauChinh) ?? '#2563eb',
    mauPhu: chuanHoaChuoi(duLieu.mauPhu) ?? '#0f172a',
    font: chuanHoaChuoi(duLieu.font) ?? 'Inter',
    markdownGoc: chuanHoaChuoi(duLieu.markdownGoc) ?? '',
    ghiChuAi: chuanHoaChuoi(duLieu.ghiChuAi) ?? '',
    cvChinh: duLieu.cvChinh,
    congKhai: duLieu.congKhai,
    ngayTao: duLieu.ngayTao,
    ngayCapNhat: duLieu.ngayCapNhat,
  }
}

export const dichVuHoSoNangLuc = {
  async layDanhSach() {
    const danhSach = await HoSoNangLuc.findMany({
      orderBy: [{ cvChinh: 'desc' }, { ngayCapNhat: 'desc' }],
      take: 300,
    })
    return danhSach.map(row => chuanHoaHoSo(coId(row)))
  },
  async layTheoMa(ma: string) {
    const duLieu = await HoSoNangLuc.findUnique({ where: { id: ma } })
    if (!duLieu) throw new LoiUngDung('Không tìm thấy hồ sơ năng lực', 404)
    return chuanHoaHoSo(coId(duLieu))
  },
  async taoMoi(duLieu: unknown) {
    const payload = duLieu as any
    if (payload.cvChinh) await HoSoNangLuc.updateMany({ where: { maUngVien: payload.maUngVien }, data: { cvChinh: false } })
    const ketQua = await HoSoNangLuc.create({ data: boUndefined(payload) as any })
    return chuanHoaHoSo(coId(ketQua))
  },
  async capNhat(ma: string, duLieu: unknown) {
    const payload = duLieu as any
    const hienTai = await HoSoNangLuc.findUnique({ where: { id: ma } })
    if (!hienTai) throw new LoiUngDung('Không tìm thấy hồ sơ năng lực để cập nhật', 404)

    if (payload.cvChinh && (payload.maUngVien || hienTai.maUngVien)) {
      await HoSoNangLuc.updateMany({
        where: { maUngVien: String(payload.maUngVien ?? hienTai.maUngVien), id: { not: ma } },
        data: { cvChinh: false },
      })
    }

    const ketQua = await HoSoNangLuc.update({ where: { id: ma }, data: boUndefined(payload) as any })
    return chuanHoaHoSo(coId(ketQua))
  },
  async xoa(ma: string) {
    const hienTai = await HoSoNangLuc.findUnique({ where: { id: ma } })
    if (!hienTai) throw new LoiUngDung('Không tìm thấy hồ sơ năng lực để xóa', 404)
    await HoSoNangLuc.delete({ where: { id: ma } })
    return chuanHoaHoSo(coId(hienTai))
  },
}
