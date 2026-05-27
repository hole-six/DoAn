import { Schema, model } from 'mongoose'

export const loaiThongBao = [
  'he_thong',
  'ho_so_ung_tuyen',
  'lich_phong_van',
  'tin_tuyen_dung',
  'cong_ty',
  'tin_nhan',
  'ket_qua_phong_van',
] as const

export const mucDoUuTien = ['thap', 'trung_binh', 'cao', 'khan_cap'] as const

const thongBaoSchema = new Schema(
  {
    maNguoiDung: { type: Schema.Types.ObjectId, ref: 'NguoiDung', required: true, index: true },
    loai: { type: String, enum: loaiThongBao, default: 'he_thong', index: true },
    tieuDe: { type: String, required: true },
    noiDung: { type: String, required: true },
    lienKet: String,
    
    // References
    maHoSoUngTuyen: { type: Schema.Types.ObjectId, ref: 'HoSoUngTuyen' },
    maLichPhongVan: { type: Schema.Types.ObjectId, ref: 'LichPhongVan' },
    maTinTuyenDung: { type: Schema.Types.ObjectId, ref: 'TinTuyenDung' },
    
    // Status
    daDoc: { type: Boolean, default: false, index: true },
    daGui: { type: Boolean, default: false },
    
    // Priority & Actions
    mucDoUuTien: { type: String, enum: mucDoUuTien, default: 'trung_binh' },
    hanhDong: [{
      nhan: String,
      url: String,
      loai: { type: String, enum: ['primary', 'secondary', 'danger'] },
    }],
    
    // Metadata
    icon: String,
    mauSac: String,
    
    // Expiry
    hetHan: Date,
  },
  {
    collection: 'thong_bao',
    timestamps: { createdAt: 'ngayTao', updatedAt: 'ngayCapNhat' },
  },
)

// Indexes
thongBaoSchema.index({ maNguoiDung: 1, daDoc: 1, ngayTao: -1 })
thongBaoSchema.index({ hetHan: 1 }, { expireAfterSeconds: 0 })

export const ThongBao = model<any>('ThongBao', thongBaoSchema)
