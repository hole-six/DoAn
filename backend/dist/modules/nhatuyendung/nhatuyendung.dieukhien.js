"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dieuKhienNhaTuyenDung = void 0;
const dieukhiencoban_js_1 = require("../../dungchung/dieukhiencoban.js");
const nhatuyendung_dichvu_js_1 = require("./nhatuyendung.dichvu.js");
const nhatuyendung_kiemtra_js_1 = require("./nhatuyendung.kiemtra.js");
exports.dieuKhienNhaTuyenDung = (0, dieukhiencoban_js_1.taoDieuKhienCoBan)(nhatuyendung_dichvu_js_1.dichVuNhaTuyenDung, nhatuyendung_kiemtra_js_1.kiemTraTaoNhaTuyenDung, nhatuyendung_kiemtra_js_1.kiemTraCapNhatNhaTuyenDung);
