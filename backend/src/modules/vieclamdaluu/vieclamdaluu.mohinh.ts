import { Schema, model } from 'mongoose'

const viecLamDaLuuSchema = new Schema(
  {
    maNguoiDung: { type: Schema.Types.ObjectId, ref: 'NguoiDung', required: true, index: true },
    maTinTuyenDung: { type: Schema.Types.ObjectId, ref: 'TinTuyenDung', required: true, index: true },
    ngayLuu: { type: Date, default: Date.now },
  },
  {
    collection: 'viec_lam_da_luu',
    timestamps: { createdAt: 'ngayTao', updatedAt: 'ngayCapNhat' },
  },
)

viecLamDaLuuSchema.index({ maNguoiDung: 1, maTinTuyenDung: 1 }, { unique: true })

export const ViecLamDaLuu = model('ViecLamDaLuu', viecLamDaLuuSchema)
