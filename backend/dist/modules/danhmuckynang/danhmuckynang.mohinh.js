"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DanhMucKyNang = void 0;
const mongoose_1 = require("mongoose");
const danhMucKyNangSchema = new mongoose_1.Schema({
    tenKyNang: { type: String, required: true, unique: true, trim: true },
    loaiKyNang: { type: String, required: true, trim: true },
}, {
    collection: 'danh_muc_ky_nang',
    timestamps: { createdAt: 'ngayTao', updatedAt: 'ngayCapNhat' },
});
exports.DanhMucKyNang = (0, mongoose_1.model)('DanhMucKyNang', danhMucKyNangSchema);
