import { Schema, model } from 'mongoose'

export const trangThaiHoSoUngTuyen = ['da_nop', 'da_xem', 'dang_xet_duyet', 'moi_phong_van', 'dat', 'tu_choi', 'da_rut'] as const

const hoSoUngTuyenSchema = new Schema(
  {
    maUngVien: { type: Schema.Types.ObjectId, ref: 'UngVien', required: true },
    maTinTuyenDung: { type: Schema.Types.ObjectId, ref: 'TinTuyenDung', required: true },
    maHoSoNangLuc: { type: Schema.Types.ObjectId, ref: 'HoSoNangLuc' },
    thuXinViec: String,
    diemKhopKyNang: { type: Number, default: 0 },
    trangThai: { type: String, enum: trangThaiHoSoUngTuyen, default: 'da_nop' },
    ngayNop: { type: Date, default: Date.now },
  },
  {
    collection: 'ho_so_ung_tuyen',
    timestamps: { createdAt: 'ngayTao', updatedAt: 'ngayCapNhat' },
  },
)

hoSoUngTuyenSchema.index({ maUngVien: 1, maTinTuyenDung: 1 }, { unique: true })

export const HoSoUngTuyen = model('HoSoUngTuyen', hoSoUngTuyenSchema)
