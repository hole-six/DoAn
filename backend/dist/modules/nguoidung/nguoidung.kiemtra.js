"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.kiemTraCapNhatNguoiDung = exports.kiemTraTaoNguoiDung = void 0;
const zod_1 = require("zod");
const nguoidung_mohinh_js_1 = require("./nguoidung.mohinh.js");
exports.kiemTraTaoNguoiDung = zod_1.z.object({
    email: zod_1.z.string().email(),
    matKhau: zod_1.z.string().min(6),
    hoTen: zod_1.z.string().min(2),
    soDienThoai: zod_1.z.string().optional(),
    vaiTro: zod_1.z.enum(nguoidung_mohinh_js_1.vaiTroNguoiDung).optional(),
    trangThai: zod_1.z.enum(nguoidung_mohinh_js_1.trangThaiTaiKhoan).optional(),
});
exports.kiemTraCapNhatNguoiDung = exports.kiemTraTaoNguoiDung.partial();
