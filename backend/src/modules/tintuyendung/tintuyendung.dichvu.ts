import { LoiUngDung } from '../../dungchung/loiungdung.js'
import { NguoiDung } from '../nguoidung/nguoidung.mohinh.js'
import '../nhatuyendung/nhatuyendung.mohinh.js'
import { thongBaoAdminTinTuyenDungCanDuyet, thongBaoNhaTuyenDungKetQuaDuyetTin } from '../thongbao/thongbao.helper.js'
import { TinTuyenDung } from './tintuyendung.mohinh.js'

async function layAdminIds() {
  const admins = await (NguoiDung as any).find({ vaiTro: 'admin', trangThai: 'hoat_dong' }).select('_id')
  return admins.map((item: any) => String(item._id))
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
  const duLieu = typeof taiLieu.toObject === 'function' ? taiLieu.toObject() : taiLieu

  return {
    id: String(duLieu._id),
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

export const dichVuTinTuyenDung = {
  async layDanhSach() {
    const danhSach = await (TinTuyenDung as any)
      .find()
      .populate('maNhaTuyenDung', 'tenCongTy logo trangThaiDuyet')
      .populate('kyNang.maKyNang', 'tenKyNang loaiKyNang')
      .sort({ ngayTao: -1 })
      .limit(300)

    return danhSach.map(chuanHoaTin)
  },

  async layTheoMa(ma: string) {
    const duLieu = await (TinTuyenDung as any)
      .findById(ma)
      .populate('maNhaTuyenDung', 'tenCongTy logo trangThaiDuyet')
      .populate('kyNang.maKyNang', 'tenKyNang loaiKyNang')
    if (!duLieu) throw new LoiUngDung('Không tìm thấy tin tuyển dụng', 404)
    return chuanHoaTin(duLieu)
  },

  async taoMoi(duLieu: unknown) {
    const ketQua = await (TinTuyenDung as any).create(duLieu)
    const dayDu = await (TinTuyenDung as any)
      .findById(ketQua._id)
      .populate('maNhaTuyenDung', 'tenCongTy logo trangThaiDuyet')
      .populate('kyNang.maKyNang', 'tenKyNang loaiKyNang')
    if (dayDu?.trangThai === 'cho_duyet') {
      await guiThongBaoAdminTinCanDuyet(dayDu)
    }
    return chuanHoaTin(dayDu)
  },

  async capNhat(ma: string, duLieuNhan: unknown) {
    const duLieu = duLieuNhan as Record<string, unknown>
    const hienTai = await (TinTuyenDung as any).findById(ma).populate('maNhaTuyenDung', 'tenCongTy maNguoiDung')
    const duLieuCapNhat = {
      ...duLieu,
      ...(duLieu.trangThai === 'dang_mo' ? { ngayDang: new Date() } : {}),
    }
    const ketQua = await (TinTuyenDung as any)
      .findByIdAndUpdate(ma, duLieuCapNhat, { returnDocument: 'after', runValidators: true })
      .populate('maNhaTuyenDung', 'tenCongTy logo trangThaiDuyet')
      .populate('kyNang.maKyNang', 'tenKyNang loaiKyNang')

    if (!ketQua) throw new LoiUngDung('Không tìm thấy tin tuyển dụng de cap nhat', 404)
    if (hienTai && hienTai.trangThai !== ketQua.trangThai && ['dang_mo', 'tu_choi'].includes(String(ketQua.trangThai))) {
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
    const ketQua = await (TinTuyenDung as any)
      .findByIdAndDelete(ma)
      .populate('maNhaTuyenDung', 'tenCongTy logo trangThaiDuyet')
      .populate('kyNang.maKyNang', 'tenKyNang loaiKyNang')
    if (!ketQua) throw new LoiUngDung('Không tìm thấy tin tuyển dụng de xoa', 404)
    return chuanHoaTin(ketQua)
  },
}



