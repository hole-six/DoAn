"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LichSuHoSoUngTuyen = void 0;
const mongoose_1 = require("mongoose");
const hosoungtuyen_mohinh_js_1 = require("../hosoungtuyen/hosoungtuyen.mohinh.js");
const lichSuHoSoUngTuyenSchema = new mongoose_1.Schema({
    maHoSoUngTuyen: { type: mongoose_1.Schema.Types.ObjectId, ref: 'HoSoUngTuyen', required: true },
    trangThaiCu: { type: String, enum: hosoungtuyen_mohinh_js_1.trangThaiHoSoUngTuyen },
    trangThaiMoi: { type: String, enum: hosoungtuyen_mohinh_js_1.trangThaiHoSoUngTuyen, required: true },
    ghiChu: String,
    maNguoiDung: { type: mongoose_1.Schema.Types.ObjectId, ref: 'NguoiDung' },
    thoiGian: { type: Date, default: Date.now },
}, {
    collection: 'lich_su_ho_so_ung_tuyen',
    timestamps: { createdAt: 'ngayTao', updatedAt: 'ngayCapNhat' },
});
exports.LichSuHoSoUngTuyen = (0, mongoose_1.model)('LichSuHoSoUngTuyen', lichSuHoSoUngTuyenSchema);
