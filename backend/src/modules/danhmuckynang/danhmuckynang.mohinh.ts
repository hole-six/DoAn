import { Schema, model } from 'mongoose'

const danhMucKyNangSchema = new Schema(
  {
    tenKyNang: { type: String, required: true, unique: true, trim: true },
    loaiKyNang: { type: String, required: true, trim: true },
  },
  {
    collection: 'danh_muc_ky_nang',
    timestamps: { createdAt: 'ngayTao', updatedAt: 'ngayCapNhat' },
  },
)

export const DanhMucKyNang = model('DanhMucKyNang', danhMucKyNangSchema)
