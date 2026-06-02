import { Schema, model } from 'mongoose'

const ketQuaGoiYSchema = new Schema(
  {
    maTinTuyenDung: { type: Schema.Types.ObjectId, ref: 'TinTuyenDung', required: true },
    diem: { type: Number, default: 0 },
    lyDo: String,
    kyNangKhop: [String],
    kyNangThieu: [String],
  },
  { _id: false },
)

const goiYViecLamSchema = new Schema(
  {
    maUngVien: { type: Schema.Types.ObjectId, ref: 'UngVien', required: true, index: true },
    maHoSoNangLuc: { type: Schema.Types.ObjectId, ref: 'HoSoNangLuc' },
    ketQua: [ketQuaGoiYSchema],
    trangThai: { type: String, enum: ['dang_chay', 'hoan_thanh', 'loi'], default: 'hoan_thanh' },
    loi: String,
    nguon: { type: String, default: 'gemini' },
    lanQuet: { type: Date, default: Date.now },
  },
  {
    collection: 'goi_y_viec_lam',
    timestamps: { createdAt: 'ngayTao', updatedAt: 'ngayCapNhat' },
  },
)

goiYViecLamSchema.index({ maUngVien: 1, lanQuet: -1 })

export const GoiYViecLam = model('GoiYViecLam', goiYViecLamSchema)


