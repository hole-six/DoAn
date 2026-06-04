"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NguoiDung = exports.trangThaiTaiKhoan = exports.vaiTroNguoiDung = void 0;
const mongoose_1 = require("mongoose");
exports.vaiTroNguoiDung = ['ung_vien', 'nha_tuyen_dung', 'admin'];
exports.trangThaiTaiKhoan = ['hoat_dong', 'tam_khoa', 'bi_khoa'];
const nguoiDungSchema = new mongoose_1.Schema({
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    matKhau: { type: String, required: true },
    hoTen: { type: String, required: true, trim: true },
    soDienThoai: { type: String, trim: true },
    vaiTro: { type: String, enum: exports.vaiTroNguoiDung, default: 'ung_vien' },
    trangThai: { type: String, enum: exports.trangThaiTaiKhoan, default: 'hoat_dong' },
    maDatLaiMatKhauHash: String,
    maDatLaiMatKhauHetHan: Date,
}, {
    collection: 'nguoi_dung',
    timestamps: { createdAt: 'ngayTao', updatedAt: 'ngayCapNhat' },
});
exports.NguoiDung = (0, mongoose_1.model)('NguoiDung', nguoiDungSchema);
