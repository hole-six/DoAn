import { Schema, model } from 'mongoose'

export const trangThaiDuyetNhaTuyenDung = ['cho_duyet', 'da_duyet', 'tu_choi', 'bi_khoa'] as const

const nhaTuyenDungSchema = new Schema(
  {
    maNguoiDung: { type: Schema.Types.ObjectId, ref: 'NguoiDung', required: true, unique: true },
    tenCongTy: { type: String, required: true, trim: true },
    maSoThue: String,
    moTa: String,
    diaChi: { type: String, default: 'Da Nang' },
    website: String,
    logo: String,
    quyMo: Number,
    nganh: { type: String, default: 'Cong nghe thong tin' },
    trangThaiDuyet: { type: String, enum: trangThaiDuyetNhaTuyenDung, default: 'cho_duyet' },
    lyDoTuChoi: String,
    ngayDuyet: Date,
  },
  {
    collection: 'nha_tuyen_dung',
    timestamps: { createdAt: 'ngayTao', updatedAt: 'ngayCapNhat' },
  },
)

export const NhaTuyenDung = model('NhaTuyenDung', nhaTuyenDungSchema)
