"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dieuKhienDanhGiaCongTy = void 0;
const dieukhiencoban_js_1 = require("../../dungchung/dieukhiencoban.js");
const danhgiacongty_dichvu_js_1 = require("./danhgiacongty.dichvu.js");
const danhgiacongty_kiemtra_js_1 = require("./danhgiacongty.kiemtra.js");
exports.dieuKhienDanhGiaCongTy = (0, dieukhiencoban_js_1.taoDieuKhienCoBan)(danhgiacongty_dichvu_js_1.dichVuDanhGiaCongTy, danhgiacongty_kiemtra_js_1.kiemTraTaoDanhGiaCongTy, danhgiacongty_kiemtra_js_1.kiemTraCapNhatDanhGiaCongTy);
