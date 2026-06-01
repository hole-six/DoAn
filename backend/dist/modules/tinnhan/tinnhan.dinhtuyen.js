"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dinhTuyenTinNhan = void 0;
const express_1 = require("express");
const tinnhan_dieukhien_js_1 = require("./tinnhan.dieukhien.js");
const xacthuc_js_1 = require("../../dungchung/xacthuc.js");
exports.dinhTuyenTinNhan = (0, express_1.Router)();
exports.dinhTuyenTinNhan.use(xacthuc_js_1.yeuCauDangNhap);
// Conversation routes
exports.dinhTuyenTinNhan.get('/cuoc-tro-chuyen', tinnhan_dieukhien_js_1.dieuKhienTinNhan.layDanhSachCuocTroChuyenModel);
exports.dinhTuyenTinNhan.post('/cuoc-tro-chuyen', tinnhan_dieukhien_js_1.dieuKhienTinNhan.layHoacTaoCuocTroChuyenModel);
exports.dinhTuyenTinNhan.get('/cuoc-tro-chuyen/:id', tinnhan_dieukhien_js_1.dieuKhienTinNhan.layCuocTroChuyenModel);
exports.dinhTuyenTinNhan.post('/cuoc-tro-chuyen/:id/danh-dau-da-doc', tinnhan_dieukhien_js_1.dieuKhienTinNhan.danhDauDaDoc);
// Group community routes
exports.dinhTuyenTinNhan.get('/nhom-cong-dong', tinnhan_dieukhien_js_1.dieuKhienTinNhan.layNhomCongDong);
exports.dinhTuyenTinNhan.post('/nhom-cong-dong/tham-gia/:id', tinnhan_dieukhien_js_1.dieuKhienTinNhan.thamGiaNhomCongDong);
// Message routes
exports.dinhTuyenTinNhan.get('/cuoc-tro-chuyen/:id/tin-nhan', tinnhan_dieukhien_js_1.dieuKhienTinNhan.layDanhSachTinNhan);
exports.dinhTuyenTinNhan.post('/cuoc-tro-chuyen/:id/tin-nhan', tinnhan_dieukhien_js_1.dieuKhienTinNhan.guiTinNhan);
exports.dinhTuyenTinNhan.delete('/tin-nhan/:maTinNhan', tinnhan_dieukhien_js_1.dieuKhienTinNhan.xoaTinNhan);
exports.dinhTuyenTinNhan.post('/tin-nhan/:maTinNhan/phan-ung', tinnhan_dieukhien_js_1.dieuKhienTinNhan.themPhanUng);
