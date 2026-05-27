"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HoSoUngTuyen = exports.trangThaiHoSoUngTuyen = void 0;
const mongoose_1 = require("mongoose");
exports.trangThaiHoSoUngTuyen = ['da_nop', 'da_xem', 'dang_xet_duyet', 'moi_phong_van', 'dat', 'tu_choi', 'da_rut'];
const hoSoUngTuyenSchema = new mongoose_1.Schema({
    maUngVien: { type: mongoose_1.Schema.Types.ObjectId, ref: 'UngVien', required: true },
    maTinTuyenDung: { type: mongoose_1.Schema.Types.ObjectId, ref: 'TinTuyenDung', required: true },
    maHoSoNangLuc: { type: mongoose_1.Schema.Types.ObjectId, ref: 'HoSoNangLuc' },
    thuXinViec: String,
    diemKhopKyNang: { type: Number, default: 0 },
    trangThai: { type: String, enum: exports.trangThaiHoSoUngTuyen, default: 'da_nop' },
    ngayNop: { type: Date, default: Date.now },
}, {
    collection: 'ho_so_ung_tuyen',
    timestamps: { createdAt: 'ngayTao', updatedAt: 'ngayCapNhat' },
});
hoSoUngTuyenSchema.index({ maUngVien: 1, maTinTuyenDung: 1 }, { unique: true });
exports.HoSoUngTuyen = (0, mongoose_1.model)('HoSoUngTuyen', hoSoUngTuyenSchema);
