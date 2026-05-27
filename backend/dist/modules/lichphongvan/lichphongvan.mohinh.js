"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LichPhongVan = exports.ketQuaPhongVan = exports.trangThaiLichPhongVan = exports.hinhThucPhongVan = void 0;
const mongoose_1 = require("mongoose");
exports.hinhThucPhongVan = ['online', 'offline'];
exports.trangThaiLichPhongVan = ['da_len_lich', 'da_xac_nhan', 'doi_lich', 'hoan_thanh', 'da_huy'];
exports.ketQuaPhongVan = ['cho_ket_qua', 'dat', 'khong_dat'];
const lichPhongVanSchema = new mongoose_1.Schema({
    maHoSoUngTuyen: { type: mongoose_1.Schema.Types.ObjectId, ref: 'HoSoUngTuyen', required: true },
    thoiGianBatDau: { type: Date, required: true },
    thoiGianKetThuc: Date,
    diaChi: String,
    hinhThuc: { type: String, enum: exports.hinhThucPhongVan, default: 'online' },
    linkHop: String,
    ghiChu: String,
    trangThai: { type: String, enum: exports.trangThaiLichPhongVan, default: 'da_len_lich' },
    ketQua: { type: String, enum: exports.ketQuaPhongVan, default: 'cho_ket_qua' },
}, {
    collection: 'lich_phong_van',
    timestamps: { createdAt: 'ngayTao', updatedAt: 'ngayCapNhat' },
});
exports.LichPhongVan = (0, mongoose_1.model)('LichPhongVan', lichPhongVanSchema);
