"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.kiemTraDangNhap = void 0;
const zod_1 = require("zod");
const nguoidung_mohinh_js_1 = require("../nguoidung/nguoidung.mohinh.js");
exports.kiemTraDangNhap = zod_1.z.object({
    email: zod_1.z.string().email(),
    matKhau: zod_1.z.string().min(1),
    vaiTro: zod_1.z.enum(nguoidung_mohinh_js_1.vaiTroNguoiDung).optional(),
});
