"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dieuKhienDanhMucKyNang = void 0;
const dieukhiencoban_js_1 = require("../../dungchung/dieukhiencoban.js");
const danhmuckynang_dichvu_js_1 = require("./danhmuckynang.dichvu.js");
const danhmuckynang_kiemtra_js_1 = require("./danhmuckynang.kiemtra.js");
exports.dieuKhienDanhMucKyNang = (0, dieukhiencoban_js_1.taoDieuKhienCoBan)(danhmuckynang_dichvu_js_1.dichVuDanhMucKyNang, danhmuckynang_kiemtra_js_1.kiemTraTaoDanhMucKyNang, danhmuckynang_kiemtra_js_1.kiemTraCapNhatDanhMucKyNang);
