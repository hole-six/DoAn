import { LoiUngDung } from '../../dungchung/loiungdung.js'
import { boUndefined } from '../../dungchung/prismaHelper.js'
import { hydrateHoSoUngTuyenNoiBo, layHoSoUngTuyenDayDuNoiBo } from '../hosoungtuyen/hosoungtuyen.dichvu.js'
import { prisma } from '../../cauhinh/prisma.js'
import {
  thongBaoKetQuaPhongVan,
  thongBaoLichPhongVanThayDoi,
  thongBaoMoiPhongVan,
  thongBaoUngVienChapNhanLich,
  thongBaoUngVienTuChoiLich,
} from '../thongbao/thongbao.helper.js'
import { LichPhongVan } from './lichphongvan.mohinh.js'

// ─── Helpers ───

function strId(value: any): string {
  return String(value?._id ?? value?.id ?? value ?? '')
}

// ─── Hydrate: gắn HoSoUngTuyen đầy đủ vào mỗi lịch ───

async function hydrateLich(rows: any[]) {
  const ids = [...new Set(rows.map(row => strId(row.maHoSoUngTuyen)).filter(Boolean))]
  const hoSoRows = ids.length ? await prisma.hoSoUngTuyen.findMany({ where: { id: { in: ids } } }) : []
  const hoSoDayDu = await hydrateHoSoUngTuyenNoiBo(hoSoRows)
  const hoSoMap = new Map(hoSoDayDu.map(row => [row.id, row]))
  return rows.map(row => ({
    ...row,
    _id: row.id,
    maHoSoUngTuyen: hoSoMap.get(strId(row.maHoSoUngTuyen)) ?? row.maHoSoUngTuyen,
  }))
}

// ─── Map: chuẩn hóa output sau khi đã hydrate ───

function mapLich(row: any) {
  const duLieu = row ?? {}
  const ungTuyen = duLieu.maHoSoUngTuyen
  const isObject = ungTuyen && typeof ungTuyen === 'object'

  const tin = ungTuyen?.maTinTuyenDung
  const ungVien = ungTuyen?.maUngVien

  return {
    id: String(duLieu.id ?? duLieu._id),
    _id: String(duLieu.id ?? duLieu._id),
    maHoSoUngTuyen: isObject ? String(ungTuyen._id ?? ungTuyen.id) : String(ungTuyen ?? ''),
    hoSoUngTuyen: isObject
      ? {
          id: String(ungTuyen._id ?? ungTuyen.id),
          maUngVien: ungVien?._id ? String(ungVien._id) : ungVien ? String(ungVien) : undefined,
          maTinTuyenDung: tin?._id ? String(tin._id) : tin ? String(tin) : undefined,
          trangThai: ungTuyen.trangThai,
          ungVien: ungVien && typeof ungVien === 'object'
            ? {
                id: String(ungVien._id ?? ungVien.id),
                viTriMongMuon: ungVien.viTriMongMuon,
                kinhNghiem: ungVien.kinhNghiem,
                nguoiDung: ungVien.maNguoiDung && typeof ungVien.maNguoiDung === 'object'
                  ? {
                      id: String(ungVien.maNguoiDung._id ?? ungVien.maNguoiDung.id),
                      hoTen: ungVien.maNguoiDung.hoTen,
                      email: ungVien.maNguoiDung.email,
                      soDienThoai: ungVien.maNguoiDung.soDienThoai,
                    }
                  : undefined,
              }
            : undefined,
          tinTuyenDung: tin && typeof tin === 'object'
            ? {
                id: String(tin._id ?? tin.id),
                tieuDe: tin.tieuDe,
                nhaTuyenDung: tin.maNhaTuyenDung && typeof tin.maNhaTuyenDung === 'object'
                  ? {
                      id: String(tin.maNhaTuyenDung._id ?? tin.maNhaTuyenDung.id),
                      maNguoiDung: tin.maNhaTuyenDung.maNguoiDung ? String(tin.maNhaTuyenDung.maNguoiDung) : undefined,
                      tenCongTy: tin.maNhaTuyenDung.tenCongTy,
                      logo: tin.maNhaTuyenDung.logo,
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

// ─── Query helper ───

async function layDayDu(where: any, many = false) {
  const rows = many
    ? await LichPhongVan.findMany({ where, orderBy: { thoiGianBatDau: 'asc' }, take: 300 })
    : await LichPhongVan.findMany({ where, take: 1 })
  const hydrated = await hydrateLich(rows)
  return many ? hydrated : hydrated[0]
}

// ─── Notification helpers ───

async function guiThongBaoMoiPhongVanTuHoSo(hoSo: any, lich: any, duLieu: any) {
  const ungVien = hoSo?.maUngVien
  const tin = hoSo?.maTinTuyenDung
  if (!ungVien || !tin) return
  await thongBaoMoiPhongVan({
    maUngVien: String(ungVien.maNguoiDung?._id ?? ungVien.maNguoiDung ?? ungVien._id),
    tenCongTy: tin.maNhaTuyenDung?.tenCongTy || 'Công ty',
    viTriUngTuyen: tin.tieuDe || 'Vị trí tuyển dụng',
    thoiGian: duLieu.thoiGianBatDau,
    diaChi: duLieu.diaChi || 'Chưa xác định',
    maLichPhongVan: strId(lich),
  })
}

// ─── Service ───

export const dichVuLichPhongVan = {
  async layDanhSach() {
    const danhSach = await layDayDu({}, true)
    return (danhSach as any[]).map(mapLich)
  },

  async layTheoMa(ma: string) {
    const duLieu = await layDayDu({ id: ma })
    if (!duLieu) throw new LoiUngDung('Không tìm thấy lịch phỏng vấn', 404)
    return mapLich(duLieu)
  },

  async taoMoi(duLieu: any) {
    const ketQua = await LichPhongVan.create({ data: boUndefined(duLieu) as any })
    const lichMoi = await this.layTheoMa(String(ketQua.id))
    try {
      const hoSo = await layHoSoUngTuyenDayDuNoiBo(duLieu.maHoSoUngTuyen)
      await guiThongBaoMoiPhongVanTuHoSo(hoSo, ketQua, duLieu)
    } catch (error) {
      console.error('Lỗi gửi thông báo mời phỏng vấn:', error)
    }
    return lichMoi
  },

  async capNhat(ma: string, duLieu: any) {
    const lichCu = await LichPhongVan.findUnique({ where: { id: ma } })
    if (!lichCu) throw new LoiUngDung('Không tìm thấy lịch phỏng vấn để cập nhật', 404)

    const ketQua = await LichPhongVan.update({ where: { id: ma }, data: boUndefined(duLieu) as any })
    const lichDayDu = await layDayDu({ id: ma }) as any

    // Thông báo thay đổi giờ phỏng vấn
    if (duLieu.thoiGianBatDau && lichCu.thoiGianBatDau.getTime() !== new Date(duLieu.thoiGianBatDau).getTime()) {
      try {
        const hoSo = await layHoSoUngTuyenDayDuNoiBo(lichCu.maHoSoUngTuyen)
        const tin = hoSo?.maTinTuyenDung
        const ungVien = hoSo?.maUngVien
        if (ungVien && tin) {
          await thongBaoLichPhongVanThayDoi({
            maUngVien: String(ungVien.maNguoiDung?._id ?? ungVien.maNguoiDung ?? ungVien._id),
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

    // Thông báo thay đổi trạng thái
    if (String(duLieu.trangThai ?? '') && String(duLieu.trangThai) !== String(lichCu.trangThai ?? '')) {
      try {
        const hoSo = await layHoSoUngTuyenDayDuNoiBo(lichCu.maHoSoUngTuyen)
        const tin = hoSo?.maTinTuyenDung
        const ungVien = hoSo?.maUngVien
        const maNguoiDungUngVien = String(ungVien?.maNguoiDung?._id ?? ungVien?.maNguoiDung ?? '')
        const maNguoiDungNhaTuyenDung = String(tin?.maNhaTuyenDung?.maNguoiDung ?? '')
        const tenUngVien = ungVien?.maNguoiDung?.hoTen ?? 'Ứng viên'
        const viTriUngTuyen = tin?.tieuDe || 'Vị trí tuyển dụng'

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
            tenCongTy: tin?.maNhaTuyenDung?.tenCongTy || 'Công ty',
            viTriUngTuyen,
            ketQua: duLieu.ketQua,
            ghiChu: duLieu.ghiChu,
            maLichPhongVan: ma,
          })
        }
      } catch (error) {
        console.error('Lỗi gửi thông báo cập nhật lịch:', error)
      }
    }

    return mapLich(lichDayDu)
  },

  async xoa(ma: string) {
    const ketQua = await layDayDu({ id: ma }) as any
    if (!ketQua) throw new LoiUngDung('Không tìm thấy lịch phỏng vấn để xóa', 404)
    await LichPhongVan.delete({ where: { id: ma } })
    return mapLich(ketQua)
  },
}

export async function layLichPhongVanDayDuNoiBo(ma: string) {
  return layDayDu({ id: ma })
}
