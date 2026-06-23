import { LoiUngDung } from '../../dungchung/loiungdung.js'
import { boUndefined, coId } from '../../dungchung/prismaHelper.js'
import { prisma } from '../../cauhinh/prisma.js'
import { thongBaoHeThong, thongBaoHoSoDuocXem, thongBaoHoSoMoiUngTuyen } from '../thongbao/thongbao.helper.js'
import { HoSoUngTuyen } from './hosoungtuyen.mohinh.js'

// ─── Hydrate: gắn dữ liệu UngVien+NguoiDung, TinTuyenDung+NhaTuyenDung, HoSoNangLuc ───

async function hydrateUngTuyen(rows: any[]) {
  const ungVienIds = [...new Set(rows.map(r => r.maUngVien).filter(Boolean))]
  const tinIds = [...new Set(rows.map(r => r.maTinTuyenDung).filter(Boolean))]
  const hoSoIds = [...new Set(rows.map(r => r.maHoSoNangLuc).filter(Boolean))]

  const [ungVienRows, tinRows, hoSoRows] = await Promise.all([
    ungVienIds.length ? prisma.ungVien.findMany({ where: { id: { in: ungVienIds } } }) : Promise.resolve([]),
    tinIds.length ? prisma.tinTuyenDung.findMany({ where: { id: { in: tinIds } } }) : Promise.resolve([]),
    hoSoIds.length ? prisma.hoSoNangLuc.findMany({ where: { id: { in: hoSoIds } } }) : Promise.resolve([]),
  ])

  // Lấy NguoiDung cho UngVien
  const nguoiDungUngVienIds = [...new Set(ungVienRows.map(r => r.maNguoiDung).filter(Boolean))]
  // Lấy NhaTuyenDung cho TinTuyenDung
  const nhaTuyenDungIds = [...new Set(tinRows.map(r => r.maNhaTuyenDung).filter(Boolean))]

  const [nguoiDungRows, nhaTuyenDungRows] = await Promise.all([
    nguoiDungUngVienIds.length
      ? prisma.nguoiDung.findMany({
          where: { id: { in: nguoiDungUngVienIds } },
          select: { id: true, hoTen: true, email: true, soDienThoai: true, trangThai: true },
        })
      : Promise.resolve([]),
    nhaTuyenDungIds.length
      ? prisma.nhaTuyenDung.findMany({
          where: { id: { in: nhaTuyenDungIds } },
          select: { id: true, maNguoiDung: true, tenCongTy: true, logo: true, trangThaiDuyet: true },
        })
      : Promise.resolve([]),
  ])

  const nguoiDungMap = new Map(nguoiDungRows.map(r => [r.id, coId(r as any)]))
  const nhaTuyenDungMap = new Map(nhaTuyenDungRows.map(r => [r.id, coId(r as any)]))

  const ungVienDayDu = ungVienRows.map(r => coId({ ...r, maNguoiDung: nguoiDungMap.get(r.maNguoiDung) ?? r.maNguoiDung } as any))
  const tinDayDu = tinRows.map(r => coId({ ...r, maNhaTuyenDung: nhaTuyenDungMap.get(r.maNhaTuyenDung) ?? r.maNhaTuyenDung } as any))

  const ungVienMap = new Map(ungVienDayDu.map(r => [r.id, r]))
  const tinMap = new Map(tinDayDu.map(r => [r.id, r]))
  const hoSoMap = new Map(hoSoRows.map(r => [r.id, coId(r as any)]))

  return rows.map(row => coId({
    ...row,
    maUngVien: ungVienMap.get(row.maUngVien) ?? row.maUngVien,
    maTinTuyenDung: tinMap.get(row.maTinTuyenDung) ?? row.maTinTuyenDung,
    maHoSoNangLuc: row.maHoSoNangLuc ? (hoSoMap.get(row.maHoSoNangLuc) ?? row.maHoSoNangLuc) : null,
  }))
}

export async function hydrateHoSoUngTuyenNoiBo(rows: any[]) {
  return hydrateUngTuyen(rows)
}

// ─── Map: chuẩn hóa output giữ nguyên field names cho frontend ───

function chuanHoaUngTuyen(taiLieu: any) {
  const duLieu = taiLieu ?? {}
  const tin = duLieu.maTinTuyenDung
  const ungVien = duLieu.maUngVien
  const hoSo = duLieu.maHoSoNangLuc

  return {
    id: String(duLieu.id ?? duLieu._id),
    _id: String(duLieu.id ?? duLieu._id),
    maUngVien: ungVien?._id ? String(ungVien._id) : String(ungVien ?? ''),
    maTinTuyenDung: tin?._id ? String(tin._id) : String(tin ?? ''),
    maHoSoNangLuc: hoSo?._id ? String(hoSo._id) : hoSo ? String(hoSo) : undefined,
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
                maNguoiDung: tin.maNhaTuyenDung.maNguoiDung ? String(tin.maNhaTuyenDung.maNguoiDung) : undefined,
                tenCongTy: tin.maNhaTuyenDung.tenCongTy,
                logo: tin.maNhaTuyenDung.logo,
              }
            : undefined,
        }
      : undefined,
    ungVien: ungVien?._id
      ? {
          id: String(ungVien._id),
          viTriMongMuon: ungVien.viTriMongMuon,
          kinhNghiem: ungVien.kinhNghiem,
          diaChi: ungVien.diaChi,
          mucLuongMongMuon: ungVien.mucLuongMongMuon,
          tomTat: ungVien.tomTat,
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
    hoSoNangLuc: hoSo?._id
      ? {
          id: String(hoSo._id),
          tieuDe: hoSo.tieuDe,
          loaiHoSo: hoSo.loaiHoSo,
          cvChinh: hoSo.cvChinh,
          congKhai: hoSo.congKhai,
          hoTenHienThi: hoSo.hoTenHienThi,
          chucDanh: hoSo.chucDanh,
          soDienThoai: hoSo.soDienThoai,
          emailLienHe: hoSo.emailLienHe,
          facebook: hoSo.facebook,
          github: hoSo.github,
          portfolioUrl: hoSo.portfolioUrl,
          diaDiem: hoSo.diaDiem,
          tomTatKinhNghiem: hoSo.tomTatKinhNghiem,
          kyNangMem: hoSo.kyNangMem,
          kyNangLapTrinh: hoSo.kyNangLapTrinh,
          hocVan: hoSo.hocVan,
          kinhNghiemLam: hoSo.kinhNghiemLam,
          chungChi: hoSo.chungChi,
          duAn: hoSo.duAn,
          baiVietKyThuat: hoSo.baiVietKyThuat,
          duAnChiTiet: hoSo.duAnChiTiet,
          fileCvTen: hoSo.fileCvTen,
          fileCvLoai: hoSo.fileCvLoai,
          fileCvData: hoSo.fileCvData,
          fileCvText: hoSo.fileCvText,
          anhDaiDien: hoSo.anhDaiDien,
          templateCv: hoSo.templateCv,
          mauChinh: hoSo.mauChinh,
          mauPhu: hoSo.mauPhu,
          font: hoSo.font,
          ngayCapNhat: hoSo.ngayCapNhat,
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

// ─── Query helper ───

async function layDayDu(where: any, many = false) {
  const rows = many
    ? await HoSoUngTuyen.findMany({ where, orderBy: { ngayNop: 'desc' }, take: 300 })
    : await HoSoUngTuyen.findMany({ where, take: 1 })
  const hydrated = await hydrateUngTuyen(rows)
  return many ? hydrated : hydrated[0]
}

// ─── Service ───

export const dichVuHoSoUngTuyen = {
  async layDanhSach() {
    const danhSach = await layDayDu({}, true)
    return (danhSach as any[]).map(chuanHoaUngTuyen)
  },

  async layTheoMa(ma: string) {
    const duLieu = await layDayDu({ id: ma })
    if (!duLieu) throw new LoiUngDung('Không tìm thấy hồ sơ ứng tuyển', 404)
    return chuanHoaUngTuyen(duLieu)
  },

  async taoMoi(duLieu: unknown) {
    try {
      const ketQua = await HoSoUngTuyen.create({ data: boUndefined(duLieu as Record<string, any>) as any })
      const hoSoMoi = await this.layTheoMa(String(ketQua.id))
      try {
        const maNguoiDungNhaTuyenDung = String(hoSoMoi.tinTuyenDung?.nhaTuyenDung?.maNguoiDung ?? '')
        if (maNguoiDungNhaTuyenDung) {
          await thongBaoHoSoMoiUngTuyen({
            maNhaTuyenDung: maNguoiDungNhaTuyenDung,
            tenUngVien: hoSoMoi.ungVien?.nguoiDung?.hoTen ?? 'Ứng viên',
            viTriUngTuyen: hoSoMoi.tinTuyenDung?.tieuDe ?? 'Vị trí ứng tuyển',
            maHoSoUngTuyen: hoSoMoi.id,
            kinhNghiem: `${hoSoMoi.ungVien?.kinhNghiem ?? 0} nam kinh nghiem`,
          })
        }
      } catch (error) {
        console.error('Lỗi gửi thông báo hồ sơ mới:', error)
      }
      return hoSoMoi
    } catch (loi: any) {
      if (loi?.code === 'P2002') throw new LoiUngDung('Bạn đã ứng tuyển tin này', 409)
      throw loi
    }
  },

  async capNhat(ma: string, duLieu: unknown) {
    const truocKhiCapNhat = await layDayDu({ id: ma }) as any
    if (!truocKhiCapNhat) throw new LoiUngDung('Không tìm thấy hồ sơ ứng tuyển để cập nhật', 404)
    await HoSoUngTuyen.update({ where: { id: ma }, data: boUndefined(duLieu as Record<string, any>) as any })
    const ketQuaChuanHoa = await this.layTheoMa(ma)

    try {
      const trangThaiCu = String(truocKhiCapNhat?.trangThai ?? '')
      const trangThaiMoi = String(ketQuaChuanHoa.trangThai ?? '')
      const maNguoiDungUngVien = ketQuaChuanHoa.ungVien?.nguoiDung?.id
      const tenCongTy = ketQuaChuanHoa.tinTuyenDung?.nhaTuyenDung?.tenCongTy ?? 'Cong ty'
      const viTriUngTuyen = ketQuaChuanHoa.tinTuyenDung?.tieuDe ?? 'Vị trí ứng tuyển'

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
          tieuDe: trangThaiMoi === 'dat' ? 'Hồ sơ ứng tuyển đã đạt' : 'Hồ sơ ứng tuyển bị từ chối',
          noiDung: `${tenCongTy} đã cập nhật kết quả hồ sơ ứng tuyển vị trí ${viTriUngTuyen}: ${trangThaiMoi === 'dat' ? 'Đạt' : 'Từ chối'}.`,
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
    const hienTai = await layDayDu({ id: ma }) as any
    if (!hienTai) throw new LoiUngDung('Không tìm thấy hồ sơ ứng tuyển để xóa', 404)
    await HoSoUngTuyen.delete({ where: { id: ma } })
    return chuanHoaUngTuyen(hienTai)
  },
}

export async function layHoSoUngTuyenDayDuNoiBo(ma: string) {
  return layDayDu({ id: ma })
}
