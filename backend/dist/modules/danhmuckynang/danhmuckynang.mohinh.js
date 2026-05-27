"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DanhMucKyNang = exports.loaiKyNang = void 0;
const mongoose_1 = require("mongoose");
exports.loaiKyNang = ['ngon_ngu', 'frontend', 'backend', 'database', 'devops', 'testing', 'thiet_ke', 'ky_nang_mem'];
const danhMucKyNangSchema = new mongoose_1.Schema({
    tenKyNang: { type: String, required: true, unique: true, trim: true },
    loaiKyNang: { type: String, enum: exports.loaiKyNang, required: true },
}, {
    collection: 'danh_muc_ky_nang',
    timestamps: { createdAt: 'ngayTao', updatedAt: 'ngayCapNhat' },
});
exports.DanhMucKyNang = (0, mongoose_1.model)('DanhMucKyNang', danhMucKyNangSchema);
