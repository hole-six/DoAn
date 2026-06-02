import { Schema, model } from 'mongoose'

export const gioiTinhUngVien = ['nam', 'nu', 'khac'] as const

const kyNangUngVienSchema = new Schema(
  {
    maKyNang: { type: Schema.Types.ObjectId, ref: 'DanhMucKyNang', required: true },
    mucDo: { type: Number, min: 1, max: 5, default: 3 },
  },
  { _id: false },
)

const portfolioUngVienSchema = new Schema(
  {
    tenDuAn: { type: String, required: true, trim: true },
    lienKet: { type: String, required: true, trim: true },
    moTa: String,
    congNghe: [String],
  },
  { _id: false },
)

const ungVienSchema = new Schema(
  {
    maNguoiDung: { type: Schema.Types.ObjectId, ref: 'NguoiDung', required: true, unique: true },
    ngaySinh: Date,
    gioiTinh: { type: String, enum: gioiTinhUngVien },
    diaChi: String,
    anhDaiDien: String,
    tomTat: String,
    kinhNghiem: { type: Number, default: 0 },
    viTriMongMuon: String,
    mucLuongMongMuon: Number,
    kyNang: [kyNangUngVienSchema],
    portfolio: [portfolioUngVienSchema],
  },
  {
    collection: 'ung_vien',
    timestamps: { createdAt: 'ngayTao', updatedAt: 'ngayCapNhat' },
  },
)

export const UngVien = model('UngVien', ungVienSchema)


