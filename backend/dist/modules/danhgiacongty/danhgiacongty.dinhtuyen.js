"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dinhTuyenDanhGiaCongTy = void 0;
const express_1 = require("express");
const batloibatdongbo_js_1 = require("../../dungchung/batloibatdongbo.js");
const xacthuc_js_1 = require("../../dungchung/xacthuc.js");
const danhgiacongty_dichvu_js_1 = require("./danhgiacongty.dichvu.js");
const danhgiacongty_dieukhien_js_1 = require("./danhgiacongty.dieukhien.js");
const danhgiacongty_kiemtra_js_1 = require("./danhgiacongty.kiemtra.js");
exports.dinhTuyenDanhGiaCongTy = (0, express_1.Router)();
exports.dinhTuyenDanhGiaCongTy.get('/', danhgiacongty_dieukhien_js_1.dieuKhienDanhGiaCongTy.layDanhSach);
exports.dinhTuyenDanhGiaCongTy.get('/toi', xacthuc_js_1.yeuCauDangNhap, (0, xacthuc_js_1.yeuCauVaiTro)(['ung_vien']), (0, batloibatdongbo_js_1.batLoiBatDongBo)(async (yeuCau, phanHoi) => {
    const duLieu = await danhgiacongty_dichvu_js_1.dichVuDanhGiaCongTy.layCuaUngVien(yeuCau.nguoiDung);
    phanHoi.json({ duLieu });
}));
exports.dinhTuyenDanhGiaCongTy.post('/tu-ho-so/:maHoSoUngTuyen', xacthuc_js_1.yeuCauDangNhap, (0, xacthuc_js_1.yeuCauVaiTro)(['ung_vien']), (0, batloibatdongbo_js_1.batLoiBatDongBo)(async (yeuCau, phanHoi) => {
    const duLieuHopLe = danhgiacongty_kiemtra_js_1.kiemTraUngVienTaoDanhGiaCongTy.parse(yeuCau.body);
    const duLieu = await danhgiacongty_dichvu_js_1.dichVuDanhGiaCongTy.taoTuHoSo(yeuCau.nguoiDung, String(yeuCau.params.maHoSoUngTuyen ?? ''), duLieuHopLe);
    phanHoi.status(201).json({ duLieu });
}));
exports.dinhTuyenDanhGiaCongTy.get('/:ma', danhgiacongty_dieukhien_js_1.dieuKhienDanhGiaCongTy.layChiTiet);
exports.dinhTuyenDanhGiaCongTy.post('/', xacthuc_js_1.yeuCauDangNhap, (0, xacthuc_js_1.yeuCauVaiTro)(['admin']), danhgiacongty_dieukhien_js_1.dieuKhienDanhGiaCongTy.taoMoi);
exports.dinhTuyenDanhGiaCongTy.patch('/:ma', xacthuc_js_1.yeuCauDangNhap, (0, xacthuc_js_1.yeuCauVaiTro)(['admin']), danhgiacongty_dieukhien_js_1.dieuKhienDanhGiaCongTy.capNhat);
exports.dinhTuyenDanhGiaCongTy.delete('/:ma', xacthuc_js_1.yeuCauDangNhap, (0, xacthuc_js_1.yeuCauVaiTro)(['admin']), danhgiacongty_dieukhien_js_1.dieuKhienDanhGiaCongTy.xoa);
