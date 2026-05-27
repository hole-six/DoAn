import { Schema, model } from 'mongoose'
import { trangThaiHoSoUngTuyen } from '../hosoungtuyen/hosoungtuyen.mohinh.js'

const lichSuHoSoUngTuyenSchema = new Schema(
  {
    maHoSoUngTuyen: { type: Schema.Types.ObjectId, ref: 'HoSoUngTuyen', required: true },
    trangThaiCu: { type: String, enum: trangThaiHoSoUngTuyen },
    trangThaiMoi: { type: String, enum: trangThaiHoSoUngTuyen, required: true },
    ghiChu: String,
    maNguoiDung: { type: Schema.Types.ObjectId, ref: 'NguoiDung' },
    thoiGian: { type: Date, default: Date.now },
  },
  {
    collection: 'lich_su_ho_so_ung_tuyen',
    timestamps: { createdAt: 'ngayTao', updatedAt: 'ngayCapNhat' },
  },
)

export const LichSuHoSoUngTuyen = model('LichSuHoSoUngTuyen', lichSuHoSoUngTuyenSchema)
