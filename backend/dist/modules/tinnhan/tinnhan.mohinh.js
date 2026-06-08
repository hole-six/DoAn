"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TinNhanModel = exports.CuocTroChuyenModel = exports.loaiTinNhanEnum = exports.loaiCuocTroChuyenEnum = void 0;
const prisma_js_1 = require("../../cauhinh/prisma.js");
exports.loaiCuocTroChuyenEnum = ['ung_vien_nha_tuyen_dung', 'admin_support', 'nhom_cong_dong'];
exports.loaiTinNhanEnum = ['text', 'file', 'image', 'system'];
exports.CuocTroChuyenModel = prisma_js_1.prisma.cuocTroChuyen;
exports.TinNhanModel = prisma_js_1.prisma.tinNhan;
