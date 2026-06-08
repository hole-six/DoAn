import { LoiUngDung } from '../../dungchung/loiungdung.js'
import { boUndefined, coId, ganNguoiDungChoCongTy } from '../../dungchung/prismaHelper.js'
import { NguoiDung } from '../nguoidung/nguoidung.mohinh.js'
import { thongBaoAdminCongTyCanDuyet, thongBaoNhaTuyenDungKetQuaDuyetCongTy } from '../thongbao/thongbao.helper.js'
import { NhaTuyenDung } from './nhatuyendung.mohinh.js'

async function layAdminIds() {
  const admins = await NguoiDung.findMany({
    where: { vaiTro: 'admin', trangThai: 'hoat_dong' },
    select: { id: true },
  })
  return admins.map(item => item.id)
}

async function guiThongBaoAdminCongTy(params: { tenCongTy: string; tenNguoiDangKy: string; maNhaTuyenDung: string; capNhatLai?: boolean }) {
  const adminIds = await layAdminIds()
  await Promise.all(adminIds.map((maAdmin: string) => thongBaoAdminCongTyCanDuyet({ maAdmin, ...params })))
}

function chuanHoaNhaTuyenDung(taiLieu: any) {
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
        }
      : undefined,
    tenCongTy: duLieu.tenCongTy,
    maSoThue: duLieu.maSoThue,
    moTa: duLieu.moTa,
    diaChi: duLieu.diaChi,
    website: duLieu.website,
    logo: duLieu.logo,
    quyMo: duLieu.quyMo,
    nganh: duLieu.nganh,
    trangThaiDuyet: duLieu.trangThaiDuyet,
    lyDoTuChoi: duLieu.lyDoTuChoi,
    ngayDuyet: duLieu.ngayDuyet,
    ngayTao: duLieu.ngayTao,
    ngayCapNhat: duLieu.ngayCapNhat,
  }
}

async function layDayDu(where: any, many = false) {
  const rows = many
    ? await NhaTuyenDung.findMany({ where, orderBy: { ngayTao: 'desc' }, take: 200 })
    : await NhaTuyenDung.findMany({ where, take: 1 })
  const hydrated = await ganNguoiDungChoCongTy(rows as any[])
  return many ? hydrated : hydrated[0]
}

export const dichVuNhaTuyenDung = {
  async layDanhSach() {
    const danhSach = await layDayDu({}, true)
    return (danhSach as any[]).map(chuanHoaNhaTuyenDung)
  },

  async layTheoMa(ma: string) {
    const duLieu = await layDayDu({ id: ma })
    if (!duLieu) throw new LoiUngDung('Không tìm thấy nhà tuyển dụng', 404)
    return chuanHoaNhaTuyenDung(duLieu)
  },

  async taoMoi(duLieu: unknown) {
    const ketQua = await NhaTuyenDung.create({ data: boUndefined(duLieu as Record<string, any>) as any })
    const dayDu = await layDayDu({ id: ketQua.id }) as any
    if (dayDu?.trangThaiDuyet === 'cho_duyet') {
      await guiThongBaoAdminCongTy({
        tenCongTy: dayDu.tenCongTy,
        tenNguoiDangKy: dayDu.maNguoiDung?.hoTen ?? 'Nha tuyen dung',
        maNhaTuyenDung: String(dayDu._id),
      })
    }
    return chuanHoaNhaTuyenDung(dayDu)
  },

  async capNhat(ma: string, duLieuNhan: unknown) {
    const duLieu = duLieuNhan as Record<string, any>
    const hienTai = await layDayDu({ id: ma }) as any
    if (!hienTai) throw new LoiUngDung('Không tìm thấy nhà tuyển dụng để cập nhật', 404)
    if (hienTai.trangThaiDuyet === 'da_duyet' && duLieu.trangThaiDuyet === 'tu_choi') {
      throw new LoiUngDung('Không thể từ chối công ty đã được duyệt. Nếu hồ sơ có vấn đề, hãy xóa hoặc khóa công ty.', 409, 'COMPANY_ALREADY_APPROVED')
    }

    const duLieuCapNhat = boUndefined({
      ...duLieu,
      ...(duLieu.trangThaiDuyet === 'da_duyet' ? { ngayDuyet: new Date(), lyDoTuChoi: null } : {}),
    })
    await NhaTuyenDung.update({ where: { id: ma }, data: duLieuCapNhat as any })
    const ketQua = await layDayDu({ id: ma }) as any

    const trangThaiCu = hienTai.trangThaiDuyet
    const trangThaiMoi = ketQua.trangThaiDuyet
    if (trangThaiCu !== trangThaiMoi && ['da_duyet', 'tu_choi'].includes(trangThaiMoi)) {
      await thongBaoNhaTuyenDungKetQuaDuyetCongTy({
        maNguoiDung: String(ketQua.maNguoiDung?._id ?? ketQua.maNguoiDung),
        tenCongTy: ketQua.tenCongTy,
        trangThaiDuyet: trangThaiMoi,
        lyDoTuChoi: ketQua.lyDoTuChoi,
      })
    }

    const coCapNhatNoiDung = Object.keys(duLieu).some(key => !['trangThaiDuyet', 'lyDoTuChoi', 'ngayDuyet'].includes(key))
    if (trangThaiCu === 'tu_choi' && coCapNhatNoiDung && trangThaiMoi !== 'da_duyet') {
      await guiThongBaoAdminCongTy({
        tenCongTy: ketQua.tenCongTy,
        tenNguoiDangKy: ketQua.maNguoiDung?.hoTen ?? 'Nha tuyen dung',
        maNhaTuyenDung: String(ketQua._id),
        capNhatLai: true,
      })
    }
    return chuanHoaNhaTuyenDung(ketQua)
  },

  async xoa(ma: string) {
    const hienTai = await layDayDu({ id: ma }) as any
    if (!hienTai) throw new LoiUngDung('Không tìm thấy nhà tuyển dụng để xóa', 404)
    await NhaTuyenDung.delete({ where: { id: ma } })
    return chuanHoaNhaTuyenDung(coId(hienTai))
  },
}
