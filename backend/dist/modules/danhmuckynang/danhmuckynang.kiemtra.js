"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.kiemTraCapNhatDanhMucKyNang = exports.kiemTraTaoDanhMucKyNang = void 0;
const zod_1 = require("zod");
exports.kiemTraTaoDanhMucKyNang = zod_1.z.object({
    tenKyNang: zod_1.z.string().trim().min(1),
    loaiKyNang: zod_1.z.string().trim().min(2),
});
exports.kiemTraCapNhatDanhMucKyNang = exports.kiemTraTaoDanhMucKyNang.partial();
