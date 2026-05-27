"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dieuKhienLichPhongVan = void 0;
const dieukhiencoban_js_1 = require("../../dungchung/dieukhiencoban.js");
const lichphongvan_dichvu_js_1 = require("./lichphongvan.dichvu.js");
const lichphongvan_kiemtra_js_1 = require("./lichphongvan.kiemtra.js");
exports.dieuKhienLichPhongVan = (0, dieukhiencoban_js_1.taoDieuKhienCoBan)(lichphongvan_dichvu_js_1.dichVuLichPhongVan, lichphongvan_kiemtra_js_1.kiemTraTaoLichPhongVan, lichphongvan_kiemtra_js_1.kiemTraCapNhatLichPhongVan);
