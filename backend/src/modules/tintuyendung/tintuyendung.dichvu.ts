import { LoiUngDung } from '../../dungchung/loiungdung.js'
import '../nhatuyendung/nhatuyendung.mohinh.js'
import { TinTuyenDung } from './tintuyendung.mohinh.js'

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
      .populate('kyNang.maKyNang', 'tenKyNang')
      .sort({ ngayTao: -1 })
      .limit(300)

    return danhSach.map(chuanHoaTin)
  },

  async layTheoMa(ma: string) {
    const duLieu = await (TinTuyenDung as any)
      .findById(ma)
      .populate('maNhaTuyenDung', 'tenCongTy logo trangThaiDuyet')
      .populate('kyNang.maKyNang', 'tenKyNang')
    if (!duLieu) throw new LoiUngDung('Khong tim thay tin tuyen dung', 404)
    return chuanHoaTin(duLieu)
  },

  async taoMoi(duLieu: unknown) {
    const ketQua = await (TinTuyenDung as any).create(duLieu)
    return chuanHoaTin(await (TinTuyenDung as any)
      .findById(ketQua._id)
      .populate('maNhaTuyenDung', 'tenCongTy logo trangThaiDuyet')
      .populate('kyNang.maKyNang', 'tenKyNang'))
  },

  async capNhat(ma: string, duLieuNhan: unknown) {
    const duLieu = duLieuNhan as Record<string, unknown>
    const duLieuCapNhat = {
      ...duLieu,
      ...(duLieu.trangThai === 'dang_mo' ? { ngayDang: new Date() } : {}),
    }
    const ketQua = await (TinTuyenDung as any)
      .findByIdAndUpdate(ma, duLieuCapNhat, { returnDocument: 'after', runValidators: true })
      .populate('maNhaTuyenDung', 'tenCongTy logo trangThaiDuyet')
      .populate('kyNang.maKyNang', 'tenKyNang')

    if (!ketQua) throw new LoiUngDung('Khong tim thay tin tuyen dung de cap nhat', 404)
    return chuanHoaTin(ketQua)
  },

  async xoa(ma: string) {
    const ketQua = await (TinTuyenDung as any)
      .findByIdAndDelete(ma)
      .populate('maNhaTuyenDung', 'tenCongTy logo trangThaiDuyet')
      .populate('kyNang.maKyNang', 'tenKyNang')
    if (!ketQua) throw new LoiUngDung('Khong tim thay tin tuyen dung de xoa', 404)
    return chuanHoaTin(ketQua)
  },
}
