import { Schema, model } from 'mongoose'

export const vaiTroNguoiDung = ['ung_vien', 'nha_tuyen_dung', 'admin'] as const
export const trangThaiTaiKhoan = ['hoat_dong', 'tam_khoa', 'bi_khoa'] as const

const nguoiDungSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    matKhau: { type: String, required: true },
    hoTen: { type: String, required: true, trim: true },
    soDienThoai: { type: String, trim: true },
    vaiTro: { type: String, enum: vaiTroNguoiDung, default: 'ung_vien' },
    trangThai: { type: String, enum: trangThaiTaiKhoan, default: 'hoat_dong' },
  },
  {
    collection: 'nguoi_dung',
    timestamps: { createdAt: 'ngayTao', updatedAt: 'ngayCapNhat' },
  },
)

export const NguoiDung = model('NguoiDung', nguoiDungSchema)
