import { LoiUngDung } from '../../dungchung/loiungdung.js'
import { boUndefined, coId } from '../../dungchung/prismaHelper.js'
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

function id(value: any) {
  return String(value?._id ?? value?.id ?? value ?? '')
}

async function hydrateLich(rows: any[]) {
  const ids = [...new Set(rows.map(row => id(row.maHoSoUngTuyen)).filter(Boolean))]
  const hoSoRows = ids.length ? await prisma.hoSoUngTuyen.findMany({ where: { id: { in: ids } } }) : []
  const hoSoDayDu = await hydrateHoSoUngTuyenNoiBo(hoSoRows)
  const hoSoMap = new Map(hoSoDayDu.map(row => [row.id, row]))
  return rows.map(row => coId({ ...row, maHoSoUngTuyen: hoSoMap.get(id(row.maHoSoUngTuyen)) ?? row.maHoSoUngTuyen }))
}

function chuanHoaLich(taiLieu: any) {
  const duLieu = taiLieu ?? {}
  const ungTuyen = duLieu.maHoSoUngTuyen
  const tin = ungTuyen?.maTinTuyenDung
  const ungVien = ungTuyen?.maUngVien
  return {
    id: String(duLieu.id ?? duLieu._id),
    _id: String(duLieu.id ?? duLieu._id),
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
                  ? { id: String(tin.maNhaTuyenDung._id), tenCongTy: tin.maNhaTuyenDung.tenCongTy }
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

async function layDayDu(where: any, many = false) {
  const rows = many
    ? await LichPhongVan.findMany({ where, orderBy: { thoiGianBatDau: 'asc' }, take: 300 })
    : await LichPhongVan.findMany({ where, take: 1 })
  const hydrated = await hydrateLich(rows)
  return many ? hydrated : hydrated[0]
}

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
    maLichPhongVan: id(lich),
  })
}

export const dichVuLichPhongVan = {
  async layDanhSach() {
    const danhSach = await layDayDu({}, true)
    return (danhSach as any[]).map(chuanHoaLich)
  },
  async layTheoMa(ma: string) {
    const duLieu = await layDayDu({ id: ma })
    if (!duLieu) throw new LoiUngDung('Không tìm thấy lịch phỏng vấn', 404)
    return chuanHoaLich(duLieu)
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
          await thongBaoUngVienChapNhanLich({ maNhaTuyenDung: maNguoiDungNhaTuyenDung, tenUngVien, viTriUngTuyen, thoiGian: ketQua.thoiGianBatDau, maLichPhongVan: ma })
        }
        if (duLieu.trangThai === 'da_huy' && maNguoiDungNhaTuyenDung) {
          await thongBaoUngVienTuChoiLich({ maNhaTuyenDung: maNguoiDungNhaTuyenDung, tenUngVien, viTriUngTuyen, lyDo: duLieu.ghiChu, maLichPhongVan: ma })
        }
        if (duLieu.trangThai === 'hoan_thanh' && duLieu.ketQua && maNguoiDungUngVien) {
          await thongBaoKetQuaPhongVan({ maUngVien: maNguoiDungUngVien, tenCongTy: tin?.maNhaTuyenDung?.tenCongTy || 'Công ty', viTriUngTuyen, ketQua: duLieu.ketQua, ghiChu: duLieu.ghiChu, maLichPhongVan: ma })
        }
      } catch (error) {
        console.error('Lỗi gửi thông báo cập nhật lịch:', error)
      }
    }
    return chuanHoaLich(lichDayDu)
  },
  async xoa(ma: string) {
    const ketQua = await layDayDu({ id: ma }) as any
    if (!ketQua) throw new LoiUngDung('Không tìm thấy lịch phỏng vấn để xóa', 404)
    await LichPhongVan.delete({ where: { id: ma } })
    return chuanHoaLich(ketQua)
  },
}

export async function layLichPhongVanDayDuNoiBo(ma: string) {
  return layDayDu({ id: ma })
}
