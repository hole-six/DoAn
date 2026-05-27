"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dieuKhienThongBao = void 0;
const dieukhiencoban_js_1 = require("../../dungchung/dieukhiencoban.js");
const thongbao_dichvu_js_1 = require("./thongbao.dichvu.js");
const thongbao_kiemtra_js_1 = require("./thongbao.kiemtra.js");
exports.dieuKhienThongBao = (0, dieukhiencoban_js_1.taoDieuKhienCoBan)(thongbao_dichvu_js_1.dichVuThongBao, thongbao_kiemtra_js_1.kiemTraTaoThongBao, thongbao_kiemtra_js_1.kiemTraCapNhatThongBao);
