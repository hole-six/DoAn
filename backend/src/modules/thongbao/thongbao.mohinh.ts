import { Schema, model } from 'mongoose'

export const loaiThongBao = ['he_thong', 'ho_so_ung_tuyen', 'lich_phong_van', 'tin_tuyen_dung', 'cong_ty'] as const

const thongBaoSchema = new Schema(
  {
    maNguoiDung: { type: Schema.Types.ObjectId, ref: 'NguoiDung', required: true },
    loai: { type: String, enum: loaiThongBao, default: 'he_thong' },
    tieuDe: { type: String, required: true },
    noiDung: { type: String, required: true },
    lienKet: String,
    maHoSoUngTuyen: { type: Schema.Types.ObjectId, ref: 'HoSoUngTuyen' },
    maLichPhongVan: { type: Schema.Types.ObjectId, ref: 'LichPhongVan' },
    daDoc: { type: Boolean, default: false },
  },
  {
    collection: 'thong_bao',
    timestamps: { createdAt: 'ngayTao', updatedAt: 'ngayCapNhat' },
  },
)

export const ThongBao = model('ThongBao', thongBaoSchema)
