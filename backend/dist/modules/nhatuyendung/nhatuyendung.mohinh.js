"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NhaTuyenDung = exports.trangThaiDuyetNhaTuyenDung = void 0;
const mongoose_1 = require("mongoose");
exports.trangThaiDuyetNhaTuyenDung = ['cho_duyet', 'da_duyet', 'tu_choi', 'bi_khoa'];
const nhaTuyenDungSchema = new mongoose_1.Schema({
    maNguoiDung: { type: mongoose_1.Schema.Types.ObjectId, ref: 'NguoiDung', required: true, unique: true },
    tenCongTy: { type: String, required: true, trim: true },
    maSoThue: String,
    moTa: String,
    diaChi: { type: String, default: 'Da Nang' },
    website: String,
    logo: String,
    quyMo: Number,
    nganh: { type: String, default: 'Cong nghe thong tin' },
    trangThaiDuyet: { type: String, enum: exports.trangThaiDuyetNhaTuyenDung, default: 'cho_duyet' },
    lyDoTuChoi: String,
    ngayDuyet: Date,
}, {
    collection: 'nha_tuyen_dung',
    timestamps: { createdAt: 'ngayTao', updatedAt: 'ngayCapNhat' },
});
exports.NhaTuyenDung = (0, mongoose_1.model)('NhaTuyenDung', nhaTuyenDungSchema);
