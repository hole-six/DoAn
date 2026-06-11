"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.kiemTraCapNhatNguoiDungCaNhan = exports.kiemTraCapNhatNguoiDung = exports.kiemTraTaoNguoiDungCongKhai = exports.kiemTraTaoNguoiDung = void 0;
const zod_1 = require("zod");
const nguoidung_mohinh_js_1 = require("./nguoidung.mohinh.js");
exports.kiemTraTaoNguoiDung = zod_1.z.object({
    email: zod_1.z.string().email(),
    matKhau: zod_1.z.string().min(6),
    hoTen: zod_1.z.string().min(2),
    soDienThoai: zod_1.z.string().optional(),
    vaiTro: zod_1.z.enum(nguoidung_mohinh_js_1.vaiTroNguoiDung).optional(),
    trangThai: zod_1.z.enum(nguoidung_mohinh_js_1.trangThaiTaiKhoan).optional(),
}).strict();
exports.kiemTraTaoNguoiDungCongKhai = zod_1.z.object({
    email: zod_1.z.string().email(),
    matKhau: zod_1.z.string().min(6),
    hoTen: zod_1.z.string().min(2),
    soDienThoai: zod_1.z.string().optional(),
    vaiTro: zod_1.z.enum(['ung_vien', 'nha_tuyen_dung']).optional(),
}).strict();
exports.kiemTraCapNhatNguoiDung = exports.kiemTraTaoNguoiDung.partial().strict();
exports.kiemTraCapNhatNguoiDungCaNhan = zod_1.z.object({
    hoTen: zod_1.z.string().min(2).optional(),
    soDienThoai: zod_1.z.string().optional(),
    matKhau: zod_1.z.string().min(6).optional(),
}).strict();
