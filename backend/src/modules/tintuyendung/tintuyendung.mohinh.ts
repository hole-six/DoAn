import { Schema, model } from 'mongoose'

export const loaiHinhLamViec = ['toan_thoi_gian', 'ban_thoi_gian', 'thuc_tap', 'tu_xa', 'hybrid'] as const
export const capBacTinTuyenDung = ['intern', 'fresher', 'junior', 'middle', 'senior', 'lead'] as const
export const trangThaiTinTuyenDung = ['nhap', 'cho_duyet', 'dang_mo', 'tam_dong', 'het_han', 'tu_choi'] as const

const kyNangTinTuyenDungSchema = new Schema(
  {
    maKyNang: { type: Schema.Types.ObjectId, ref: 'DanhMucKyNang', required: true },
    batBuoc: { type: Boolean, default: true },
  },
  { _id: false },
)

const tinTuyenDungSchema = new Schema(
  {
    maNhaTuyenDung: { type: Schema.Types.ObjectId, ref: 'NhaTuyenDung', required: true },
    tieuDe: { type: String, required: true, trim: true },
    yeuCauKinhNghiem: String,
    diaChi: { type: String, default: 'Da Nang' },
    luongMin: Number,
    luongMax: Number,
    loaiHinh: { type: String, enum: loaiHinhLamViec, default: 'toan_thoi_gian' },
    capBac: { type: String, enum: capBacTinTuyenDung, default: 'junior' },
    anhDaiDien: String,
    hanNop: Date,
    soLuong: { type: Number, default: 1 },
    moTa: { type: String, required: true },
    yeuCau: { type: String, required: true },
    quyenLoi: String,
    luotXem: { type: Number, default: 0 },
    trangThai: { type: String, enum: trangThaiTinTuyenDung, default: 'cho_duyet' },
    ngayDang: Date,
    kyNang: [kyNangTinTuyenDungSchema],
  },
  {
    collection: 'tin_tuyen_dung',
    timestamps: { createdAt: 'ngayTao', updatedAt: 'ngayCapNhat' },
  },
)

tinTuyenDungSchema.index({ tieuDe: 'text', moTa: 'text', yeuCau: 'text' })

export const TinTuyenDung = model('TinTuyenDung', tinTuyenDungSchema)
