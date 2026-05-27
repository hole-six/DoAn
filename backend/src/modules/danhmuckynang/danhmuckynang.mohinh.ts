import { Schema, model } from 'mongoose'

export const loaiKyNang = ['ngon_ngu', 'frontend', 'backend', 'database', 'devops', 'testing', 'thiet_ke', 'ky_nang_mem'] as const

const danhMucKyNangSchema = new Schema(
  {
    tenKyNang: { type: String, required: true, unique: true, trim: true },
    loaiKyNang: { type: String, enum: loaiKyNang, required: true },
  },
  {
    collection: 'danh_muc_ky_nang',
    timestamps: { createdAt: 'ngayTao', updatedAt: 'ngayCapNhat' },
  },
)

export const DanhMucKyNang = model('DanhMucKyNang', danhMucKyNangSchema)
