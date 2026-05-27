"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HoSoNangLuc = void 0;
const mongoose_1 = require("mongoose");
const mucThongTinSchema = new mongoose_1.Schema({
    tieuDe: String,
    donVi: String,
    thoiGian: String,
    moTa: String,
}, { _id: false });
const hoSoNangLucSchema = new mongoose_1.Schema({
    maUngVien: { type: mongoose_1.Schema.Types.ObjectId, ref: 'UngVien', required: true },
    tieuDe: { type: String, required: true, trim: true },
    hocVan: [mucThongTinSchema],
    kinhNghiemLam: [mucThongTinSchema],
    chungChi: [mucThongTinSchema],
    duAn: [mucThongTinSchema],
    cvChinh: { type: Boolean, default: false },
    congKhai: { type: Boolean, default: true },
}, {
    collection: 'ho_so_nang_luc',
    timestamps: { createdAt: 'ngayTao', updatedAt: 'ngayCapNhat' },
});
exports.HoSoNangLuc = (0, mongoose_1.model)('HoSoNangLuc', hoSoNangLucSchema);
