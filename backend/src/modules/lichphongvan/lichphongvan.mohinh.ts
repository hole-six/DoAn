import { Schema, model } from 'mongoose'

export const hinhThucPhongVan = ['online', 'offline'] as const
export const trangThaiLichPhongVan = ['da_len_lich', 'da_xac_nhan', 'doi_lich', 'hoan_thanh', 'da_huy'] as const
export const ketQuaPhongVan = ['cho_ket_qua', 'dat', 'khong_dat'] as const

const lichPhongVanSchema = new Schema(
  {
    maHoSoUngTuyen: { type: Schema.Types.ObjectId, ref: 'HoSoUngTuyen', required: true },
    thoiGianBatDau: { type: Date, required: true },
    thoiGianKetThuc: Date,
    diaChi: String,
    hinhThuc: { type: String, enum: hinhThucPhongVan, default: 'online' },
    linkHop: String,
    ghiChu: String,
    trangThai: { type: String, enum: trangThaiLichPhongVan, default: 'da_len_lich' },
    ketQua: { type: String, enum: ketQuaPhongVan, default: 'cho_ket_qua' },
  },
  {
    collection: 'lich_phong_van',
    timestamps: { createdAt: 'ngayTao', updatedAt: 'ngayCapNhat' },
  },
)

lichPhongVanSchema.index({ maHoSoUngTuyen: 1 }, { unique: true })

export const LichPhongVan = model('LichPhongVan', lichPhongVanSchema)
