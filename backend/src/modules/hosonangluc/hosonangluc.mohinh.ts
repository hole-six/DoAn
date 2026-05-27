import { Schema, model } from 'mongoose'

const mucThongTinSchema = new Schema(
  {
    tieuDe: String,
    donVi: String,
    thoiGian: String,
    moTa: String,
  },
  { _id: false },
)

const hoSoNangLucSchema = new Schema(
  {
    maUngVien: { type: Schema.Types.ObjectId, ref: 'UngVien', required: true },
    tieuDe: { type: String, required: true, trim: true },
    hocVan: [mucThongTinSchema],
    kinhNghiemLam: [mucThongTinSchema],
    chungChi: [mucThongTinSchema],
    duAn: [mucThongTinSchema],
    cvChinh: { type: Boolean, default: false },
    congKhai: { type: Boolean, default: true },
  },
  {
    collection: 'ho_so_nang_luc',
    timestamps: { createdAt: 'ngayTao', updatedAt: 'ngayCapNhat' },
  },
)

export const HoSoNangLuc = model('HoSoNangLuc', hoSoNangLucSchema)
