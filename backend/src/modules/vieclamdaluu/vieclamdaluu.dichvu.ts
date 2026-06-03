import { LoiUngDung } from '../../dungchung/loiungdung.js'
import { TinTuyenDung } from '../tintuyendung/tintuyendung.mohinh.js'
import { ViecLamDaLuu } from './vieclamdaluu.mohinh.js'

function chuanHoa(taiLieu: any) {
  const obj = typeof taiLieu.toObject === 'function' ? taiLieu.toObject() : taiLieu
  const tin = obj.maTinTuyenDung
  return {
    id: String(obj._id),
    maNguoiDung: String(obj.maNguoiDung?._id ?? obj.maNguoiDung),
    maTinTuyenDung: String(tin?._id ?? tin),
    ngayLuu: obj.ngayLuu,
    tinTuyenDung: tin?._id
      ? {
          id: String(tin._id),
          tieuDe: tin.tieuDe,
          trangThai: tin.trangThai,
          diaChi: tin.diaChi,
          luongMin: tin.luongMin,
          luongMax: tin.luongMax,
          hanNop: tin.hanNop,
          ngayDang: tin.ngayDang,
          nhaTuyenDung: tin.maNhaTuyenDung?._id
            ? {
                id: String(tin.maNhaTuyenDung._id),
                tenCongTy: tin.maNhaTuyenDung.tenCongTy,
                logo: tin.maNhaTuyenDung.logo,
              }
            : undefined,
        }
      : undefined,
  }
}

export const dichVuViecLamDaLuu = {
  async layDanhSach(maNguoiDung: string) {
    const danhSach = await (ViecLamDaLuu as any)
      .find({ maNguoiDung })
      .populate({
        path: 'maTinTuyenDung',
        populate: { path: 'maNhaTuyenDung', select: 'tenCongTy logo' },
      })
      .sort({ ngayLuu: -1 })
      .limit(200)
    return danhSach.map(chuanHoa)
  },

  async luu(maNguoiDung: string, maTinTuyenDung: string) {
    const tin = await (TinTuyenDung as any).findById(maTinTuyenDung).select('_id')
    if (!tin) throw new LoiUngDung('Không tìm thấy tin tuyển dụng để lưu', 404, 'JOB_NOT_FOUND')

    await (ViecLamDaLuu as any).findOneAndUpdate(
      { maNguoiDung, maTinTuyenDung },
      { $setOnInsert: { maNguoiDung, maTinTuyenDung, ngayLuu: new Date() } },
      { upsert: true, new: true },
    )
    const ketQua = await (ViecLamDaLuu as any)
      .findOne({ maNguoiDung, maTinTuyenDung })
      .populate({
        path: 'maTinTuyenDung',
        populate: { path: 'maNhaTuyenDung', select: 'tenCongTy logo' },
      })
    return chuanHoa(ketQua)
  },

  async boLuu(maNguoiDung: string, maTinTuyenDung: string) {
    await (ViecLamDaLuu as any).deleteOne({ maNguoiDung, maTinTuyenDung })
    return { maTinTuyenDung }
  },
}
