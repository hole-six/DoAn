"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dangNhap = dangNhap;
exports.lamMoiToken = lamMoiToken;
exports.layNguoiDungTuAccessToken = layNguoiDungTuAccessToken;
exports.dangNhapGoogle = dangNhapGoogle;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bienmoitruong_js_1 = require("../../cauhinh/bienmoitruong.js");
const loiungdung_js_1 = require("../../dungchung/loiungdung.js");
const nguoidung_mohinh_js_1 = require("../nguoidung/nguoidung.mohinh.js");
const ungvien_dichvu_js_1 = require("../ungvien/ungvien.dichvu.js");
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
function taoToken(nguoiDungCongKhai) {
    const payload = {
        sub: nguoiDungCongKhai.id,
        vaiTro: nguoiDungCongKhai.vaiTro,
        email: nguoiDungCongKhai.email,
    };
    const accessToken = jsonwebtoken_1.default.sign({ ...payload, loai: 'access' }, bienmoitruong_js_1.bienMoiTruong.khoaJwt, { expiresIn: '15m' });
    const refreshToken = jsonwebtoken_1.default.sign({ ...payload, loai: 'refresh' }, bienmoitruong_js_1.bienMoiTruong.khoaJwtLamMoi, { expiresIn: '30d' });
    return {
        accessToken,
        refreshToken,
        token: accessToken,
        expiresIn: 15 * 60,
        tokenType: 'Bearer',
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
    return {
        ...taoToken(nguoiDungCongKhai),
        nguoiDung: nguoiDungCongKhai,
    };
}
async function lamMoiToken(duLieu) {
    let payload;
    try {
        payload = jsonwebtoken_1.default.verify(duLieu.refreshToken, bienmoitruong_js_1.bienMoiTruong.khoaJwtLamMoi);
    }
    catch {
        throw new loiungdung_js_1.LoiUngDung('Refresh token khong hop le hoac da het han', 401);
    }
    if (payload.loai !== 'refresh') {
        throw new loiungdung_js_1.LoiUngDung('Refresh token khong hop le', 401);
    }
    const nguoiDung = await nguoidung_mohinh_js_1.NguoiDung.findById(payload.sub);
    if (!nguoiDung || nguoiDung.trangThai !== 'hoat_dong') {
        throw new loiungdung_js_1.LoiUngDung('Tai khoan khong con hieu luc', 401);
    }
    const nguoiDungCongKhai = taoNguoiDungCongKhai(nguoiDung);
    return {
        ...taoToken(nguoiDungCongKhai),
        nguoiDung: nguoiDungCongKhai,
    };
}
async function layNguoiDungTuAccessToken(authorization) {
    const token = authorization?.startsWith('Bearer ') ? authorization.slice(7) : '';
    if (!token)
        throw new loiungdung_js_1.LoiUngDung('Thiếu access token', 401);
    let payload;
    try {
        payload = jsonwebtoken_1.default.verify(token, bienmoitruong_js_1.bienMoiTruong.khoaJwt);
    }
    catch {
        throw new loiungdung_js_1.LoiUngDung('Access token khong hop le hoac da het han', 401);
    }
    if (payload.loai && payload.loai !== 'access') {
        throw new loiungdung_js_1.LoiUngDung('Access token khong hop le', 401);
    }
    const nguoiDung = await nguoidung_mohinh_js_1.NguoiDung.findById(payload.sub);
    if (!nguoiDung || nguoiDung.trangThai !== 'hoat_dong') {
        throw new loiungdung_js_1.LoiUngDung('Tai khoan khong con hieu luc', 401);
    }
    return taoNguoiDungCongKhai(nguoiDung);
}
async function xacThucGoogleCredential(credential) {
    if (!bienmoitruong_js_1.bienMoiTruong.googleClientId) {
        throw new loiungdung_js_1.LoiUngDung('Chua cau hinh GOOGLE_CLIENT_ID tren backend', 503);
    }
    const phanHoi = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`);
    const googleUser = await phanHoi.json();
    if (!phanHoi.ok || googleUser.aud !== bienmoitruong_js_1.bienMoiTruong.googleClientId || googleUser.email_verified !== 'true') {
        throw new loiungdung_js_1.LoiUngDung('Google credential khong hop le', 401);
    }
    return googleUser;
}
async function dangNhapGoogle(duLieu) {
    const googleUser = await xacThucGoogleCredential(duLieu.credential);
    const email = googleUser.email.toLowerCase().trim();
    const matKhauHeThong = await bcryptjs_1.default.hash(`google:${googleUser.sub}:${bienmoitruong_js_1.bienMoiTruong.khoaJwt}`, 10);
    const nguoiDung = await nguoidung_mohinh_js_1.NguoiDung.findOneAndUpdate({ email }, {
        $setOnInsert: {
            email,
            matKhau: matKhauHeThong,
            hoTen: googleUser.name || email,
            soDienThoai: '',
            vaiTro: duLieu.vaiTro ?? 'ung_vien',
            trangThai: 'hoat_dong',
        },
    }, { upsert: true, returnDocument: 'after' });
    if (nguoiDung.trangThai !== 'hoat_dong') {
        throw new loiungdung_js_1.LoiUngDung('Tai khoan khong o trang thai hoat dong', 403);
    }
    if (duLieu.vaiTro && nguoiDung.vaiTro !== duLieu.vaiTro) {
        throw new loiungdung_js_1.LoiUngDung('Tai khoan Google nay da duoc gan vai tro khac', 403);
    }
    const nguoiDungCongKhai = taoNguoiDungCongKhai(nguoiDung);
    if (nguoiDungCongKhai.vaiTro === 'ung_vien') {
        await ungvien_dichvu_js_1.dichVuUngVien.damBaoHoSoTheoNguoiDung(nguoiDungCongKhai.id);
    }
    return {
        ...taoToken(nguoiDungCongKhai),
        nguoiDung: nguoiDungCongKhai,
    };
}
