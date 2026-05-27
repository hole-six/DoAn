"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dangNhap = dangNhap;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bienmoitruong_js_1 = require("../../cauhinh/bienmoitruong.js");
const loiungdung_js_1 = require("../../dungchung/loiungdung.js");
const nguoidung_mohinh_js_1 = require("../nguoidung/nguoidung.mohinh.js");
function taoNguoiDungCongKhai(nguoiDung) {
    return {
        id: String(nguoiDung._id),
        email: nguoiDung.email,
        hoTen: nguoiDung.hoTen,
        soDienThoai: nguoiDung.soDienThoai,
        vaiTro: nguoiDung.vaiTro,
        trangThai: nguoiDung.trangThai,
    };
}
async function dangNhap(duLieu) {
    const nguoiDung = await nguoidung_mohinh_js_1.NguoiDung.findOne({ email: duLieu.email.toLowerCase().trim() });
    if (!nguoiDung) {
        throw new loiungdung_js_1.LoiUngDung('Email hoac mat khau khong dung', 401);
    }
    if (nguoiDung.trangThai !== 'hoat_dong') {
        throw new loiungdung_js_1.LoiUngDung('Tai khoan khong o trang thai hoat dong', 403);
    }
    if (duLieu.vaiTro && nguoiDung.vaiTro !== duLieu.vaiTro) {
        throw new loiungdung_js_1.LoiUngDung('Tai khoan khong thuoc vai tro da chon', 403);
    }
    const matKhauDung = await bcryptjs_1.default.compare(duLieu.matKhau, nguoiDung.matKhau);
    if (!matKhauDung) {
        throw new loiungdung_js_1.LoiUngDung('Email hoac mat khau khong dung', 401);
    }
    const nguoiDungCongKhai = taoNguoiDungCongKhai(nguoiDung);
    const token = jsonwebtoken_1.default.sign({
        sub: nguoiDungCongKhai.id,
        vaiTro: nguoiDungCongKhai.vaiTro,
        email: nguoiDungCongKhai.email,
    }, bienmoitruong_js_1.bienMoiTruong.khoaJwt, { expiresIn: '7d' });
    return {
        token,
        nguoiDung: nguoiDungCongKhai,
    };
}
