"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.kiemTraCapNhatDanhMucKyNang = exports.kiemTraTaoDanhMucKyNang = void 0;
const zod_1 = require("zod");
const danhmuckynang_mohinh_js_1 = require("./danhmuckynang.mohinh.js");
exports.kiemTraTaoDanhMucKyNang = zod_1.z.object({
    tenKyNang: zod_1.z.string().min(1),
    loaiKyNang: zod_1.z.enum(danhmuckynang_mohinh_js_1.loaiKyNang),
});
exports.kiemTraCapNhatDanhMucKyNang = exports.kiemTraTaoDanhMucKyNang.partial();
