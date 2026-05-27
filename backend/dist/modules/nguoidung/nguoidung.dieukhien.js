"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dieuKhienNguoiDung = void 0;
const dieukhiencoban_js_1 = require("../../dungchung/dieukhiencoban.js");
const nguoidung_dichvu_js_1 = require("./nguoidung.dichvu.js");
const nguoidung_kiemtra_js_1 = require("./nguoidung.kiemtra.js");
exports.dieuKhienNguoiDung = (0, dieukhiencoban_js_1.taoDieuKhienCoBan)(nguoidung_dichvu_js_1.dichVuNguoiDung, nguoidung_kiemtra_js_1.kiemTraTaoNguoiDung, nguoidung_kiemtra_js_1.kiemTraCapNhatNguoiDung);
