"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UngVien = exports.gioiTinhUngVien = void 0;
const mongoose_1 = require("mongoose");
exports.gioiTinhUngVien = ['nam', 'nu', 'khac'];
const kyNangUngVienSchema = new mongoose_1.Schema({
    maKyNang: { type: mongoose_1.Schema.Types.ObjectId, ref: 'DanhMucKyNang', required: true },
    mucDo: { type: Number, min: 1, max: 5, default: 3 },
}, { _id: false });
const portfolioUngVienSchema = new mongoose_1.Schema({
    tenDuAn: { type: String, required: true, trim: true },
    lienKet: { type: String, required: true, trim: true },
    moTa: String,
    congNghe: [String],
}, { _id: false });
const ungVienSchema = new mongoose_1.Schema({
    maNguoiDung: { type: mongoose_1.Schema.Types.ObjectId, ref: 'NguoiDung', required: true, unique: true },
    ngaySinh: Date,
    gioiTinh: { type: String, enum: exports.gioiTinhUngVien },
    diaChi: String,
    anhDaiDien: String,
    tomTat: String,
    kinhNghiem: { type: Number, default: 0 },
    viTriMongMuon: String,
    mucLuongMongMuon: Number,
    kyNang: [kyNangUngVienSchema],
    portfolio: [portfolioUngVienSchema],
}, {
    collection: 'ung_vien',
    timestamps: { createdAt: 'ngayTao', updatedAt: 'ngayCapNhat' },
});
exports.UngVien = (0, mongoose_1.model)('UngVien', ungVienSchema);
