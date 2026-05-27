"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dieuKhienUngVien = void 0;
const dieukhiencoban_js_1 = require("../../dungchung/dieukhiencoban.js");
const ungvien_dichvu_js_1 = require("./ungvien.dichvu.js");
const ungvien_kiemtra_js_1 = require("./ungvien.kiemtra.js");
exports.dieuKhienUngVien = (0, dieukhiencoban_js_1.taoDieuKhienCoBan)(ungvien_dichvu_js_1.dichVuUngVien, ungvien_kiemtra_js_1.kiemTraTaoUngVien, ungvien_kiemtra_js_1.kiemTraCapNhatUngVien);
