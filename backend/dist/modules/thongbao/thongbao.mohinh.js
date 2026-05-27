"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThongBao = exports.loaiThongBao = void 0;
const mongoose_1 = require("mongoose");
exports.loaiThongBao = ['he_thong', 'ho_so_ung_tuyen', 'lich_phong_van', 'tin_tuyen_dung', 'cong_ty'];
const thongBaoSchema = new mongoose_1.Schema({
    maNguoiDung: { type: mongoose_1.Schema.Types.ObjectId, ref: 'NguoiDung', required: true },
    loai: { type: String, enum: exports.loaiThongBao, default: 'he_thong' },
    tieuDe: { type: String, required: true },
    noiDung: { type: String, required: true },
    lienKet: String,
    maHoSoUngTuyen: { type: mongoose_1.Schema.Types.ObjectId, ref: 'HoSoUngTuyen' },
    maLichPhongVan: { type: mongoose_1.Schema.Types.ObjectId, ref: 'LichPhongVan' },
    daDoc: { type: Boolean, default: false },
}, {
    collection: 'thong_bao',
    timestamps: { createdAt: 'ngayTao', updatedAt: 'ngayCapNhat' },
});
exports.ThongBao = (0, mongoose_1.model)('ThongBao', thongBaoSchema);
