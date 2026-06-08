import { LoiUngDung } from '../../dungchung/loiungdung.js'
import { boUndefined, coId, ganKyNangVaCongTyChoTin } from '../../dungchung/prismaHelper.js'
import { NguoiDung } from '../nguoidung/nguoidung.mohinh.js'
import { thongBaoAdminTinTuyenDungCanDuyet, thongBaoNhaTuyenDungKetQuaDuyetTin } from '../thongbao/thongbao.helper.js'
import { TinTuyenDung } from './tintuyendung.mohinh.js'

async function layAdminIds() {
  const admins = await NguoiDung.findMany({
    where: { vaiTro: 'admin', trangThai: 'hoat_dong' },
    select: { id: true },
  })
  return admins.map(item => item.id)
}

async function guiThongBaoAdminTinCanDuyet(tin: any) {
  const adminIds = await layAdminIds()
  await Promise.all(adminIds.map((maAdmin: string) => thongBaoAdminTinTuyenDungCanDuyet({
    maAdmin,
    tenCongTy: tin.maNhaTuyenDung?.tenCongTy ?? 'Nha tuyen dung',
    tieuDeTin: tin.tieuDe,
    maTinTuyenDung: String(tin._id),
  })))
}

function chuanHoaTin(taiLieu: any) {
  const duLieu = taiLieu ?? {}
  return {
    id: String(duLieu.id ?? duLieu._id),
    _id: String(duLieu.id ?? duLieu._id),
    maNhaTuyenDung: duLieu.maNhaTuyenDung?._id ? String(duLieu.maNhaTuyenDung._id) : String(duLieu.maNhaTuyenDung),
    nhaTuyenDung: duLieu.maNhaTuyenDung?._id
      ? {
          id: String(duLieu.maNhaTuyenDung._id),
          tenCongTy: duLieu.maNhaTuyenDung.tenCongTy,
          logo: duLieu.maNhaTuyenDung.logo,
          trangThaiDuyet: duLieu.maNhaTuyenDung.trangThaiDuyet,
        }
      : undefined,
    tieuDe: duLieu.tieuDe,
    yeuCauKinhNghiem: duLieu.yeuCauKinhNghiem,
    diaChi: duLieu.diaChi,
    luongMin: duLieu.luongMin,
    luongMax: duLieu.luongMax,
    loaiHinh: duLieu.loaiHinh,
    capBac: duLieu.capBac,
    anhDaiDien: duLieu.anhDaiDien,
    hanNop: duLieu.hanNop,
    soLuong: duLieu.soLuong,
    moTa: duLieu.moTa,
    yeuCau: duLieu.yeuCau,
    quyenLoi: duLieu.quyenLoi,
    luotXem: duLieu.luotXem,
    trangThai: duLieu.trangThai,
    ngayDang: duLieu.ngayDang,
    kyNang: (duLieu.kyNang ?? []).map((muc: any) => ({
      maKyNang: muc.maKyNang?._id ? String(muc.maKyNang._id) : String(muc.maKyNang),
      tenKyNang: muc.maKyNang?.tenKyNang,
      loaiKyNang: muc.maKyNang?.loaiKyNang,
      batBuoc: muc.batBuoc,
    })),
    ngayTao: duLieu.ngayTao,
    ngayCapNhat: duLieu.ngayCapNhat,
  }
}

async function layDayDu(where: any, many = false) {
  const rows = many
    ? await TinTuyenDung.findMany({ where, orderBy: { ngayTao: 'desc' }, take: 300 })
    : await TinTuyenDung.findMany({ where, take: 1 })
  const hydrated = await ganKyNangVaCongTyChoTin(rows as any[])
  return many ? hydrated : hydrated[0]
}

export const dichVuTinTuyenDung = {
  async layDanhSach() {
    const danhSach = await layDayDu({}, true)
    return (danhSach as any[]).map(chuanHoaTin)
  },

  async layTheoMa(ma: string) {
    const duLieu = await layDayDu({ id: ma })
    if (!duLieu) throw new LoiUngDung('Không tìm thấy tin tuyển dụng', 404)
    return chuanHoaTin(duLieu)
  },

  async taoMoi(duLieu: unknown) {
    const ketQua = await TinTuyenDung.create({ data: boUndefined(duLieu as Record<string, any>) as any })
    const dayDu = await layDayDu({ id: ketQua.id }) as any
    if (dayDu?.trangThai === 'cho_duyet') await guiThongBaoAdminTinCanDuyet(dayDu)
    return chuanHoaTin(dayDu)
  },

  async capNhat(ma: string, duLieuNhan: unknown) {
    const duLieu = duLieuNhan as Record<string, any>
    const hienTai = await layDayDu({ id: ma }) as any
    if (!hienTai) throw new LoiUngDung('Không tìm thấy tin tuyển dụng de cap nhat', 404)

    const duLieuCapNhat = {
      ...duLieu,
      ...(duLieu.trangThai === 'dang_mo' ? { ngayDang: new Date() } : {}),
    }
    await TinTuyenDung.update({ where: { id: ma }, data: boUndefined(duLieuCapNhat) as any })
    const ketQua = await layDayDu({ id: ma }) as any

    if (hienTai.trangThai !== ketQua.trangThai && ['dang_mo', 'tu_choi'].includes(String(ketQua.trangThai))) {
      await thongBaoNhaTuyenDungKetQuaDuyetTin({
        maNguoiDung: String(ketQua.maNhaTuyenDung?.maNguoiDung ?? hienTai.maNhaTuyenDung?.maNguoiDung),
        tieuDeTin: ketQua.tieuDe,
        maTinTuyenDung: String(ketQua._id),
        trangThai: ketQua.trangThai,
      })
    }
    return chuanHoaTin(ketQua)
  },

  async xoa(ma: string) {
    const hienTai = await layDayDu({ id: ma }) as any
    if (!hienTai) throw new LoiUngDung('Không tìm thấy tin tuyển dụng de xoa', 404)
    await TinTuyenDung.delete({ where: { id: ma } })
    return chuanHoaTin(coId(hienTai))
  },
}
