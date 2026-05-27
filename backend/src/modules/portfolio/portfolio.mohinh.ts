import { Schema, model } from 'mongoose'

export const themePortfolio = ['professional', 'modern', 'creative'] as const
export const trangThaiPortfolio = ['nhap', 'da_tao'] as const

const portfolioSchema = new Schema(
  {
    maUngVien: { type: Schema.Types.ObjectId, ref: 'UngVien', required: true },
    maHoSoNangLuc: { type: Schema.Types.ObjectId, ref: 'HoSoNangLuc', required: true },
    tieuDe: { type: String, required: true, trim: true },
    markdown: { type: String, default: '' },
    theme: { type: String, enum: themePortfolio, default: 'professional' },
    mauChinh: { type: String, default: '#2563eb' },
    mauPhu: { type: String, default: '#0f172a' },
    font: { type: String, default: 'Inter' },
    trangThai: { type: String, enum: trangThaiPortfolio, default: 'nhap' },
    htmlLanCuoi: String,
  },
  {
    collection: 'portfolio',
    timestamps: { createdAt: 'ngayTao', updatedAt: 'ngayCapNhat' },
  },
)

portfolioSchema.index({ maUngVien: 1, ngayCapNhat: -1 })

export const Portfolio = model('Portfolio', portfolioSchema)
