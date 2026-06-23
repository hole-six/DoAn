import { LoiUngDung } from '../../dungchung/loiungdung.js'
import { boUndefined } from '../../dungchung/prismaHelper.js'
import { HoSoNangLuc } from './hosonangluc.mohinh.js'

function chuanHoaHoSo(row: any) {
  if (!row) return row
  return {
    ...row,
    _id: row.id,
    // Đảm bảo Json array fields không null
    hocVan: row.hocVan ?? [],
    kinhNghiemLam: row.kinhNghiemLam ?? [],
    chungChi: row.chungChi ?? [],
    duAn: row.duAn ?? [],
    tomTatKinhNghiem: row.tomTatKinhNghiem ?? [],
    kyNangMem: row.kyNangMem ?? [],
    kyNangLapTrinh: row.kyNangLapTrinh ?? [],
    baiVietKyThuat: row.baiVietKyThuat ?? [],
    duAnChiTiet: row.duAnChiTiet ?? [],
    // Đảm bảo string fields không null -> default
    loaiHoSo: row.loaiHoSo ?? 'builder',
    templateCv: row.templateCv ?? 'classic-blue',
    mauChinh: row.mauChinh ?? '#2563eb',
    mauPhu: row.mauPhu ?? '#0f172a',
    font: row.font ?? 'Inter',
    markdownGoc: row.markdownGoc ?? '',
    ghiChuAi: row.ghiChuAi ?? '',
  }
}

export const dichVuHoSoNangLuc = {
  async layDanhSach() {
    const danhSach = await HoSoNangLuc.findMany({
      orderBy: [{ cvChinh: 'desc' }, { ngayCapNhat: 'desc' }],
      take: 300,
    })
    return danhSach.map(chuanHoaHoSo)
  },
  async layTheoMa(ma: string) {
    const duLieu = await HoSoNangLuc.findUnique({ where: { id: ma } })
    if (!duLieu) throw new LoiUngDung('Không tìm thấy hồ sơ năng lực', 404)
    return chuanHoaHoSo(duLieu)
  },
  async taoMoi(duLieu: unknown) {
    const payload = duLieu as any
    if (payload.cvChinh) await HoSoNangLuc.updateMany({ where: { maUngVien: payload.maUngVien }, data: { cvChinh: false } })
    const ketQua = await HoSoNangLuc.create({ data: boUndefined(payload) as any })
    return chuanHoaHoSo(ketQua)
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
    return chuanHoaHoSo(ketQua)
  },
  async xoa(ma: string) {
    const hienTai = await HoSoNangLuc.findUnique({ where: { id: ma } })
    if (!hienTai) throw new LoiUngDung('Không tìm thấy hồ sơ năng lực để xóa', 404)
    await HoSoNangLuc.delete({ where: { id: ma } })
    return chuanHoaHoSo(hienTai)
  },
}
