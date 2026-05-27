"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TinTuyenDung = exports.trangThaiTinTuyenDung = exports.capBacTinTuyenDung = exports.loaiHinhLamViec = void 0;
const mongoose_1 = require("mongoose");
exports.loaiHinhLamViec = ['toan_thoi_gian', 'ban_thoi_gian', 'thuc_tap', 'tu_xa', 'hybrid'];
exports.capBacTinTuyenDung = ['intern', 'fresher', 'junior', 'middle', 'senior', 'lead'];
exports.trangThaiTinTuyenDung = ['nhap', 'cho_duyet', 'dang_mo', 'tam_dong', 'het_han', 'tu_choi'];
const kyNangTinTuyenDungSchema = new mongoose_1.Schema({
    maKyNang: { type: mongoose_1.Schema.Types.ObjectId, ref: 'DanhMucKyNang', required: true },
    batBuoc: { type: Boolean, default: true },
}, { _id: false });
const tinTuyenDungSchema = new mongoose_1.Schema({
    maNhaTuyenDung: { type: mongoose_1.Schema.Types.ObjectId, ref: 'NhaTuyenDung', required: true },
    tieuDe: { type: String, required: true, trim: true },
    yeuCauKinhNghiem: String,
    diaChi: { type: String, default: 'Da Nang' },
    luongMin: Number,
    luongMax: Number,
    loaiHinh: { type: String, enum: exports.loaiHinhLamViec, default: 'toan_thoi_gian' },
    capBac: { type: String, enum: exports.capBacTinTuyenDung, default: 'junior' },
    hanNop: Date,
    soLuong: { type: Number, default: 1 },
    moTa: { type: String, required: true },
    yeuCau: { type: String, required: true },
    quyenLoi: String,
    luotXem: { type: Number, default: 0 },
    trangThai: { type: String, enum: exports.trangThaiTinTuyenDung, default: 'cho_duyet' },
    ngayDang: Date,
    kyNang: [kyNangTinTuyenDungSchema],
}, {
    collection: 'tin_tuyen_dung',
    timestamps: { createdAt: 'ngayTao', updatedAt: 'ngayCapNhat' },
});
tinTuyenDungSchema.index({ tieuDe: 'text', moTa: 'text', yeuCau: 'text' });
exports.TinTuyenDung = (0, mongoose_1.model)('TinTuyenDung', tinTuyenDungSchema);
