"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dinhTuyenThongBao = void 0;
const dinhtuyencoban_js_1 = require("../../dungchung/dinhtuyencoban.js");
const thongbao_dieukhien_js_1 = require("./thongbao.dieukhien.js");
const dinhTuyenCoBan = (0, dinhtuyencoban_js_1.taoDinhTuyenCoBan)(thongbao_dieukhien_js_1.dieuKhienThongBao);
// Thêm routes mới
dinhTuyenCoBan.patch('/:id/danh-dau-da-doc', thongbao_dieukhien_js_1.dieuKhienThongBao.danhDauDaDoc);
dinhTuyenCoBan.post('/danh-dau-tat-ca-da-doc', thongbao_dieukhien_js_1.dieuKhienThongBao.danhDauTatCaDaDoc);
dinhTuyenCoBan.get('/dem-chua-doc', thongbao_dieukhien_js_1.dieuKhienThongBao.demChuaDoc);
exports.dinhTuyenThongBao = dinhTuyenCoBan;
