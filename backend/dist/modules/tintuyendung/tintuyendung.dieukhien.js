"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dieuKhienTinTuyenDung = void 0;
const dieukhiencoban_js_1 = require("../../dungchung/dieukhiencoban.js");
const tintuyendung_dichvu_js_1 = require("./tintuyendung.dichvu.js");
const tintuyendung_kiemtra_js_1 = require("./tintuyendung.kiemtra.js");
exports.dieuKhienTinTuyenDung = (0, dieukhiencoban_js_1.taoDieuKhienCoBan)(tintuyendung_dichvu_js_1.dichVuTinTuyenDung, tintuyendung_kiemtra_js_1.kiemTraTaoTinTuyenDung, tintuyendung_kiemtra_js_1.kiemTraCapNhatTinTuyenDung);
