import { Schema, model } from 'mongoose'

const danhGiaCongTySchema = new Schema(
  {
    maUngVien: { type: Schema.Types.ObjectId, ref: 'UngVien', required: true },
    maNhaTuyenDung: { type: Schema.Types.ObjectId, ref: 'NhaTuyenDung', required: true },
    diem: { type: Number, min: 1, max: 5, required: true },
    noiDung: { type: String, required: true },
    anDanh: { type: Boolean, default: false },
    daDuyet: { type: Boolean, default: false },
  },
  {
    collection: 'danh_gia_cong_ty',
    timestamps: { createdAt: 'ngayTao', updatedAt: 'ngayCapNhat' },
  },
)

export const DanhGiaCongTy = model('DanhGiaCongTy', danhGiaCongTySchema)
