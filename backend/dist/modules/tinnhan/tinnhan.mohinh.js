"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TinNhanModel = exports.loaiTinNhanEnum = exports.CuocTroChuyenModel = exports.loaiCuocTroChuyenEnum = void 0;
const mongoose_1 = require("mongoose");
// ============================================
// CONVERSATION MODEL (Cuộc hội thoại)
// ============================================
exports.loaiCuocTroChuyenEnum = ['ung_vien_nha_tuyen_dung', 'admin_support', 'nhom_cong_dong'];
const cuocTroChuyenSchema = new mongoose_1.Schema({
    // Participants
    nguoiThamGia: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'NguoiDung', required: true }],
    // Type
    loai: { type: String, enum: exports.loaiCuocTroChuyenEnum, default: 'ung_vien_nha_tuyen_dung' },
    // Tên nhóm (dùng cho nhom_cong_dong)
    tenNhom: { type: String },
    moTaNhom: { type: String },
    anhNhom: { type: String },
    // Chỉ dùng cho nhom_cong_dong — ai là admin nhóm
    quanTriNhom: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'NguoiDung' }],
    // Ngữ cảnh gần nhất của cuộc trò chuyện tuyển dụng.
    // Một cặp ứng viên - nhà tuyển dụng chỉ có một phòng chat; hồ sơ/tin chỉ là ngữ cảnh hiển thị.
    maHoSoUngTuyen: { type: mongoose_1.Schema.Types.ObjectId, ref: 'HoSoUngTuyen' },
    maTinTuyenDung: { type: mongoose_1.Schema.Types.ObjectId, ref: 'TinTuyenDung' },
    maHoSoUngTuyenGanNhat: { type: mongoose_1.Schema.Types.ObjectId, ref: 'HoSoUngTuyen' },
    maTinTuyenDungGanNhat: { type: mongoose_1.Schema.Types.ObjectId, ref: 'TinTuyenDung' },
    contextSummary: {
        tieuDeTin: String,
        tenCongTy: String,
        maHoSoUngTuyen: String,
        maTinTuyenDung: String,
        capNhatLuc: Date,
    },
    // Last message info (để hiển thị preview)
    tinNhanCuoiCung: {
        noiDung: String,
        nguoiGui: { type: mongoose_1.Schema.Types.ObjectId, ref: 'NguoiDung' },
        thoiGian: Date,
    },
    // Unread counts per user
    soChuaDoc: {
        type: Map,
        of: Number,
        default: {},
    },
    // Status
    daLuuTru: { type: Boolean, default: false },
    thoiGianLuuTru: Date,
}, {
    collection: 'cuoc_tro_chuyen',
    timestamps: { createdAt: 'ngayTao', updatedAt: 'ngayCapNhat' },
});
// Indexes
cuocTroChuyenSchema.index({ nguoiThamGia: 1, ngayCapNhat: -1 });
cuocTroChuyenSchema.index({ nguoiThamGia: 1, loai: 1, daLuuTru: 1 });
cuocTroChuyenSchema.index({ maHoSoUngTuyen: 1 });
cuocTroChuyenSchema.index({ daLuuTru: 1 });
exports.CuocTroChuyenModel = (0, mongoose_1.model)('CuocTroChuyenModel', cuocTroChuyenSchema);
// ============================================
// MESSAGE MODEL (Tin nhắn)
// ============================================
exports.loaiTinNhanEnum = ['text', 'file', 'image', 'system'];
const tinNhanSchema = new mongoose_1.Schema({
    // Conversation reference
    maCuocTroChuyenId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'CuocTroChuyenModel', required: true, index: true },
    // Sender
    nguoiGui: { type: mongoose_1.Schema.Types.ObjectId, ref: 'NguoiDung', required: true },
    // Content
    loai: { type: String, enum: exports.loaiTinNhanEnum, default: 'text' },
    noiDung: { type: String, required: true },
    // File attachments
    tepDinhKem: [{
            tenFile: String,
            duongDan: String,
            kichThuoc: Number,
            loaiFile: String,
        }],
    // Reply to another message
    traloiTinNhan: { type: mongoose_1.Schema.Types.ObjectId, ref: 'TinNhanModel' },
    // Read receipts
    daDuocDocBoi: [{
            nguoiDung: { type: mongoose_1.Schema.Types.ObjectId, ref: 'NguoiDung' },
            thoiGian: { type: Date, default: Date.now },
        }],
    // Reactions
    phanUng: [{
            nguoiDung: { type: mongoose_1.Schema.Types.ObjectId, ref: 'NguoiDung' },
            emoji: String,
        }],
    // Status
    daXoa: { type: Boolean, default: false },
    daChinhSua: { type: Boolean, default: false },
    thoiGianChinhSua: Date,
}, {
    collection: 'tin_nhan',
    timestamps: { createdAt: 'ngayTao', updatedAt: 'ngayCapNhat' },
});
// Indexes
tinNhanSchema.index({ maCuocTroChuyenId: 1, ngayTao: -1 });
tinNhanSchema.index({ nguoiGui: 1 });
tinNhanSchema.index({ daXoa: 1 });
exports.TinNhanModel = (0, mongoose_1.model)('TinNhanModel', tinNhanSchema);
