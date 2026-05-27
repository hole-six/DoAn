"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DanhGiaCongTy = void 0;
const mongoose_1 = require("mongoose");
const danhGiaCongTySchema = new mongoose_1.Schema({
    maUngVien: { type: mongoose_1.Schema.Types.ObjectId, ref: 'UngVien', required: true },
    maNhaTuyenDung: { type: mongoose_1.Schema.Types.ObjectId, ref: 'NhaTuyenDung', required: true },
    diem: { type: Number, min: 1, max: 5, required: true },
    noiDung: { type: String, required: true },
    anDanh: { type: Boolean, default: false },
    daDuyet: { type: Boolean, default: false },
}, {
    collection: 'danh_gia_cong_ty',
    timestamps: { createdAt: 'ngayTao', updatedAt: 'ngayCapNhat' },
});
exports.DanhGiaCongTy = (0, mongoose_1.model)('DanhGiaCongTy', danhGiaCongTySchema);
