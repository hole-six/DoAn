"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.kiemTraCapNhatNhaTuyenDung = exports.kiemTraTaoNhaTuyenDung = void 0;
const zod_1 = require("zod");
const nhatuyendung_mohinh_js_1 = require("./nhatuyendung.mohinh.js");
exports.kiemTraTaoNhaTuyenDung = zod_1.z.object({
    maNguoiDung: zod_1.z.string().min(1),
    tenCongTy: zod_1.z.string().min(2),
    maSoThue: zod_1.z.string().optional(),
    moTa: zod_1.z.string().optional(),
    diaChi: zod_1.z.string().optional(),
    website: zod_1.z.string().optional(),
    logo: zod_1.z.string().optional(),
    quyMo: zod_1.z.number().int().min(1).optional(),
    nganh: zod_1.z.string().optional(),
    trangThaiDuyet: zod_1.z.enum(nhatuyendung_mohinh_js_1.trangThaiDuyetNhaTuyenDung).optional(),
    lyDoTuChoi: zod_1.z.string().optional(),
    ngayDuyet: zod_1.z.coerce.date().optional(),
});
exports.kiemTraCapNhatNhaTuyenDung = exports.kiemTraTaoNhaTuyenDung.partial();
