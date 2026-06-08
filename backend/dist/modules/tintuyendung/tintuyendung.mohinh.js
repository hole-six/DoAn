"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TinTuyenDung = exports.trangThaiTinTuyenDung = exports.capBacTinTuyenDung = exports.loaiHinhLamViec = void 0;
const prisma_js_1 = require("../../cauhinh/prisma.js");
exports.loaiHinhLamViec = ['toan_thoi_gian', 'ban_thoi_gian', 'thuc_tap', 'tu_xa', 'hybrid'];
exports.capBacTinTuyenDung = ['intern', 'fresher', 'junior', 'middle', 'senior', 'lead'];
exports.trangThaiTinTuyenDung = ['nhap', 'cho_duyet', 'dang_mo', 'tam_dong', 'het_han', 'tu_choi'];
exports.TinTuyenDung = prisma_js_1.prisma.tinTuyenDung;
