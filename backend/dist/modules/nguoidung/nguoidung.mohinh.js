"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NguoiDung = exports.trangThaiTaiKhoan = exports.vaiTroNguoiDung = void 0;
const prisma_js_1 = require("../../cauhinh/prisma.js");
exports.vaiTroNguoiDung = ['ung_vien', 'nha_tuyen_dung', 'admin'];
exports.trangThaiTaiKhoan = ['hoat_dong', 'tam_khoa', 'bi_khoa'];
exports.NguoiDung = prisma_js_1.prisma.nguoiDung;
