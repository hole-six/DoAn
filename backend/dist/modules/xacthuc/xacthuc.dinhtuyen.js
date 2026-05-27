"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dinhTuyenXacThuc = void 0;
const express_1 = require("express");
const xacthuc_dieukhien_js_1 = require("./xacthuc.dieukhien.js");
exports.dinhTuyenXacThuc = (0, express_1.Router)();
exports.dinhTuyenXacThuc.post('/dang-nhap', xacthuc_dieukhien_js_1.dieuKhienXacThuc.dangNhap);
