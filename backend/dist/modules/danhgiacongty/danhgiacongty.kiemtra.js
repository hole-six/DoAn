"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.kiemTraCapNhatDanhGiaCongTy = exports.kiemTraTaoDanhGiaCongTy = void 0;
const zod_1 = require("zod");
exports.kiemTraTaoDanhGiaCongTy = zod_1.z.object({
    maUngVien: zod_1.z.string().min(1),
    maNhaTuyenDung: zod_1.z.string().min(1),
    diem: zod_1.z.number().int().min(1).max(5),
    noiDung: zod_1.z.string().min(3),
    anDanh: zod_1.z.boolean().optional(),
    daDuyet: zod_1.z.boolean().optional(),
});
exports.kiemTraCapNhatDanhGiaCongTy = exports.kiemTraTaoDanhGiaCongTy.partial();
