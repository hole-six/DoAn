"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Portfolio = exports.trangThaiPortfolio = exports.themePortfolio = void 0;
const mongoose_1 = require("mongoose");
exports.themePortfolio = ['professional', 'modern', 'creative'];
exports.trangThaiPortfolio = ['nhap', 'da_tao'];
const portfolioSchema = new mongoose_1.Schema({
    maUngVien: { type: mongoose_1.Schema.Types.ObjectId, ref: 'UngVien', required: true },
    maHoSoNangLuc: { type: mongoose_1.Schema.Types.ObjectId, ref: 'HoSoNangLuc', required: true },
    tieuDe: { type: String, required: true, trim: true },
    markdown: { type: String, default: '' },
    theme: { type: String, enum: exports.themePortfolio, default: 'professional' },
    mauChinh: { type: String, default: '#2563eb' },
    mauPhu: { type: String, default: '#0f172a' },
    font: { type: String, default: 'Inter' },
    trangThai: { type: String, enum: exports.trangThaiPortfolio, default: 'nhap' },
    htmlLanCuoi: String,
}, {
    collection: 'portfolio',
    timestamps: { createdAt: 'ngayTao', updatedAt: 'ngayCapNhat' },
});
portfolioSchema.index({ maUngVien: 1, ngayCapNhat: -1 });
exports.Portfolio = (0, mongoose_1.model)('Portfolio', portfolioSchema);
