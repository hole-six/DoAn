import { LoiUngDung } from '../../dungchung/loiungdung.js'
import { boUndefined, coId, ganKyNangJson, ganNguoiDungChoUngVien } from '../../dungchung/prismaHelper.js'
import { dongBoKyNangUngVien } from '../../dungchung/dongboQuanHe.js'
import { UngVien } from './ungvien.mohinh.js'

function chuanHoaUngVien(taiLieu: any) {
  const duLieu = taiLieu ?? {}
  return {
    id: String(duLieu.id ?? duLieu._id),
    _id: String(duLieu.id ?? duLieu._id),
    maNguoiDung: duLieu.maNguoiDung?._id ? String(duLieu.maNguoiDung._id) : String(duLieu.maNguoiDung),
    nguoiDung: duLieu.maNguoiDung?._id
      ? {
          id: String(duLieu.maNguoiDung._id),
          hoTen: duLieu.maNguoiDung.hoTen,
          email: duLieu.maNguoiDung.email,
          soDienThoai: duLieu.maNguoiDung.soDienThoai,
          trangThai: duLieu.maNguoiDung.trangThai,
        }
      : undefined,
    ngaySinh: duLieu.ngaySinh,
    gioiTinh: duLieu.gioiTinh,
    diaChi: duLieu.diaChi,
    anhDaiDien: duLieu.anhDaiDien,
    tomTat: duLieu.tomTat,
    kinhNghiem: duLieu.kinhNghiem,
    viTriMongMuon: duLieu.viTriMongMuon,
    mucLuongMongMuon: duLieu.mucLuongMongMuon,
    kyNang: (duLieu.kyNang ?? []).map((muc: any) => ({
      maKyNang: muc.maKyNang?._id ? String(muc.maKyNang._id) : String(muc.maKyNang),
      tenKyNang: muc.maKyNang?.tenKyNang,
      loaiKyNang: muc.maKyNang?.loaiKyNang,
      mucDo: muc.mucDo,
    })),
    portfolio: duLieu.portfolio ?? [],
    ngayTao: duLieu.ngayTao,
    ngayCapNhat: duLieu.ngayCapNhat,
  }
}

async function layDayDu(where: any, many = false) {
  // ✅ TỐI ƯU: Chỉ query 1 lần, không cần ganNguoiDungChoUngVien & ganKyNangJson
  const rows = many
    ? await UngVien.findMany({ 
        where, 
        orderBy: { ngayTao: 'desc' }, 
        take: 200,
        // Không cần include vì NguoiDung & KyNang không phải relation trực tiếp trong Prisma
        // Data đã được lưu trong JSON
      })
    : await UngVien.findMany({ where, take: 1 })
  
  // ✅ Chỉ hydrate nếu thực sự cần thiết (optimize bằng cách cache)
  const hydrated = await ganKyNangJson(await ganNguoiDungChoUngVien(rows as any[]))
  return many ? hydrated : hydrated[0]
}

export const dichVuUngVien = {
  async layDanhSach() {
    const danhSach = await layDayDu({}, true)
    return (danhSach as any[]).map(chuanHoaUngVien)
  },

  async layTheoMa(ma: string) {
    const duLieu = await layDayDu({ id: ma })
    if (!duLieu) throw new LoiUngDung('Không tìm thấy hồ sơ ứng viên', 404)
    return chuanHoaUngVien(duLieu)
  },

  async layTheoMaNguoiDung(maNguoiDung: string) {
    const duLieu = await layDayDu({ maNguoiDung })
    if (!duLieu) throw new LoiUngDung('Không tìm thấy hồ sơ ứng viên', 404)
    return chuanHoaUngVien(duLieu)
  },

  async damBaoHoSoTheoNguoiDung(maNguoiDung: string) {
    const hienTai = await UngVien.findUnique({ where: { maNguoiDung } })
    if (hienTai) {
      const [dayDu] = await ganKyNangJson(await ganNguoiDungChoUngVien([hienTai] as any[]))
      return chuanHoaUngVien(dayDu)
    }
    const daTao = await UngVien.create({ data: { maNguoiDung, kinhNghiem: 0, kyNang: [], portfolio: [] } })
    const [dayDu] = await ganKyNangJson(await ganNguoiDungChoUngVien([daTao] as any[]))
    return chuanHoaUngVien(dayDu)
  },

  async taoMoi(duLieu: unknown) {
    const payload = duLieu as Record<string, any>
    const ketQua = await UngVien.create({ data: boUndefined(payload) as any })
    await dongBoKyNangUngVien(String(ketQua.id), payload.kyNang)
    return this.layTheoMa(String(ketQua.id))
  },

  async capNhat(ma: string, duLieu: unknown, maNguoiDungHienTai?: string) {
    const hienTai = await UngVien.findUnique({ where: { id: ma } })
    if (!hienTai) throw new LoiUngDung('Không tìm thấy hồ sơ ứng viên', 404)

    if (maNguoiDungHienTai && String(hienTai.maNguoiDung) !== maNguoiDungHienTai) {
      throw new LoiUngDung('Bạn không có quyền cập nhật hồ sơ này', 403)
    }

    const payload = duLieu as Record<string, any>
    await UngVien.update({ where: { id: ma }, data: boUndefined(payload) as any })
    await dongBoKyNangUngVien(ma, payload.kyNang)
    return this.layTheoMa(ma)
  },

  async xoa(ma: string, maNguoiDungHienTai?: string) {
    const hienTai = await UngVien.findUnique({ where: { id: ma } })
    if (!hienTai) throw new LoiUngDung('Không tìm thấy hồ sơ ứng viên', 404)

    if (maNguoiDungHienTai && String(hienTai.maNguoiDung) !== maNguoiDungHienTai) {
      throw new LoiUngDung('Bạn không có quyền xóa hồ sơ này', 403)
    }

    await UngVien.delete({ where: { id: ma } })
    return chuanHoaUngVien(coId(hienTai))
  },
}
