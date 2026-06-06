"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.kiemTraCapNhatDanhGiaCongTy = exports.kiemTraUngVienTaoDanhGiaCongTy = exports.kiemTraTaoDanhGiaCongTy = void 0;
const zod_1 = require("zod");
exports.kiemTraTaoDanhGiaCongTy = zod_1.z.object({
    maUngVien: zod_1.z.string().min(1),
    maNhaTuyenDung: zod_1.z.string().min(1),
    maHoSoUngTuyen: zod_1.z.string().min(1).optional(),
    diem: zod_1.z.number().int().min(1).max(5),
    noiDung: zod_1.z.string().min(3),
    anDanh: zod_1.z.boolean().optional(),
    daDuyet: zod_1.z.boolean().optional(),
});
exports.kiemTraUngVienTaoDanhGiaCongTy = zod_1.z.object({
    diem: zod_1.z.number().int().min(1).max(5),
    noiDung: zod_1.z.string().trim().min(10, 'Nội dung đánh giá cần ít nhất 10 ký tự'),
    anDanh: zod_1.z.boolean().optional(),
});
exports.kiemTraCapNhatDanhGiaCongTy = exports.kiemTraTaoDanhGiaCongTy.partial();
