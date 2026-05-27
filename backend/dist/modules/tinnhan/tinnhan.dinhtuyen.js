"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dinhTuyenTinNhan = void 0;
const express_1 = require("express");
const tinnhan_dieukhien_js_1 = require("./tinnhan.dieukhien.js");
exports.dinhTuyenTinNhan = (0, express_1.Router)();
// Conversation routes
exports.dinhTuyenTinNhan.get('/cuoc-tro-chuyen', tinnhan_dieukhien_js_1.dieuKhienTinNhan.layDanhSachCuocTroChuyenModel);
exports.dinhTuyenTinNhan.post('/cuoc-tro-chuyen', tinnhan_dieukhien_js_1.dieuKhienTinNhan.layHoacTaoCuocTroChuyenModel);
exports.dinhTuyenTinNhan.get('/cuoc-tro-chuyen/:id', tinnhan_dieukhien_js_1.dieuKhienTinNhan.layCuocTroChuyenModel);
exports.dinhTuyenTinNhan.post('/cuoc-tro-chuyen/:id/danh-dau-da-doc', tinnhan_dieukhien_js_1.dieuKhienTinNhan.danhDauDaDoc);
// Message routes
exports.dinhTuyenTinNhan.get('/cuoc-tro-chuyen/:id/tin-nhan', tinnhan_dieukhien_js_1.dieuKhienTinNhan.layDanhSachTinNhan);
exports.dinhTuyenTinNhan.post('/cuoc-tro-chuyen/:id/tin-nhan', tinnhan_dieukhien_js_1.dieuKhienTinNhan.guiTinNhan);
exports.dinhTuyenTinNhan.delete('/tin-nhan/:maTinNhan', tinnhan_dieukhien_js_1.dieuKhienTinNhan.xoaTinNhan);
exports.dinhTuyenTinNhan.post('/tin-nhan/:maTinNhan/phan-ung', tinnhan_dieukhien_js_1.dieuKhienTinNhan.themPhanUng);
