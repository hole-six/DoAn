"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThongBao = exports.mucDoUuTien = exports.loaiThongBao = void 0;
const mongoose_1 = require("mongoose");
exports.loaiThongBao = [
    'he_thong',
    'ho_so_ung_tuyen',
    'lich_phong_van',
    'tin_tuyen_dung',
    'cong_ty',
    'tin_nhan',
    'ket_qua_phong_van',
];
exports.mucDoUuTien = ['thap', 'trung_binh', 'cao', 'khan_cap'];
const thongBaoSchema = new mongoose_1.Schema({
    maNguoiDung: { type: mongoose_1.Schema.Types.ObjectId, ref: 'NguoiDung', required: true, index: true },
    loai: { type: String, enum: exports.loaiThongBao, default: 'he_thong', index: true },
    tieuDe: { type: String, required: true },
    noiDung: { type: String, required: true },
    lienKet: String,
    // References
    maHoSoUngTuyen: { type: mongoose_1.Schema.Types.ObjectId, ref: 'HoSoUngTuyen' },
    maLichPhongVan: { type: mongoose_1.Schema.Types.ObjectId, ref: 'LichPhongVan' },
    maTinTuyenDung: { type: mongoose_1.Schema.Types.ObjectId, ref: 'TinTuyenDung' },
    // Status
    daDoc: { type: Boolean, default: false, index: true },
    daGui: { type: Boolean, default: false },
    // Priority & Actions
    mucDoUuTien: { type: String, enum: exports.mucDoUuTien, default: 'trung_binh' },
    hanhDong: [{
            nhan: String,
            url: String,
            loai: { type: String, enum: ['primary', 'secondary', 'danger'] },
        }],
    // Metadata
    icon: String,
    mauSac: String,
    // Expiry
    hetHan: Date,
}, {
    collection: 'thong_bao',
    timestamps: { createdAt: 'ngayTao', updatedAt: 'ngayCapNhat' },
});
// Indexes
thongBaoSchema.index({ maNguoiDung: 1, daDoc: 1, ngayTao: -1 });
thongBaoSchema.index({ hetHan: 1 }, { expireAfterSeconds: 0 });
exports.ThongBao = (0, mongoose_1.model)('ThongBao', thongBaoSchema);
