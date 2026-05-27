"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dieuKhienHoSoNangLuc = void 0;
const dieukhiencoban_js_1 = require("../../dungchung/dieukhiencoban.js");
const hosonangluc_dichvu_js_1 = require("./hosonangluc.dichvu.js");
const hosonangluc_kiemtra_js_1 = require("./hosonangluc.kiemtra.js");
exports.dieuKhienHoSoNangLuc = (0, dieukhiencoban_js_1.taoDieuKhienCoBan)(hosonangluc_dichvu_js_1.dichVuHoSoNangLuc, hosonangluc_kiemtra_js_1.kiemTraTaoHoSoNangLuc, hosonangluc_kiemtra_js_1.kiemTraCapNhatHoSoNangLuc);
