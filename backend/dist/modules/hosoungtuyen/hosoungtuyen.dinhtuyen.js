"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dinhTuyenHoSoUngTuyen = void 0;
const express_1 = require("express");
const batloibatdongbo_js_1 = require("../../dungchung/batloibatdongbo.js");
const dinhtuyencoban_js_1 = require("../../dungchung/dinhtuyencoban.js");
const hosoungtuyen_dieukhien_js_1 = require("./hosoungtuyen.dieukhien.js");
const xacthuc_dichvu_js_1 = require("../xacthuc/xacthuc.dichvu.js");
const loiungdung_js_1 = require("../../dungchung/loiungdung.js");
const ungvien_mohinh_js_1 = require("../ungvien/ungvien.mohinh.js");
const hosonangluc_mohinh_js_1 = require("../hosonangluc/hosonangluc.mohinh.js");
const hosoungtuyen_dichvu_js_1 = require("./hosoungtuyen.dichvu.js");
exports.dinhTuyenHoSoUngTuyen = (0, express_1.Router)();
exports.dinhTuyenHoSoUngTuyen.post('/ung-tuyen-nhanh', (0, batloibatdongbo_js_1.batLoiBatDongBo)(async (yeuCau, phanHoi) => {
    const nguoiDung = await (0, xacthuc_dichvu_js_1.layNguoiDungTuAccessToken)(yeuCau.headers.authorization);
    if (nguoiDung.vaiTro !== 'ung_vien') {
        throw new loiungdung_js_1.LoiUngDung('Chi tai khoan ung vien moi duoc ung tuyen', 403);
    }
    const maTinTuyenDung = String(yeuCau.body?.maTinTuyenDung ?? '');
    if (!maTinTuyenDung)
        throw new loiungdung_js_1.LoiUngDung('Thieu ma tin tuyen dung', 422);
    const ungVien = await ungvien_mohinh_js_1.UngVien.findOne({ maNguoiDung: nguoiDung.id });
    if (!ungVien)
        throw new loiungdung_js_1.LoiUngDung('Ban can tao ho so ung vien truoc khi ung tuyen', 422);
    const hoSoChinh = await hosonangluc_mohinh_js_1.HoSoNangLuc.findOne({ maUngVien: ungVien._id, cvChinh: true });
    if (!hoSoChinh)
        throw new loiungdung_js_1.LoiUngDung('Ban can co CV chinh truoc khi ung tuyen', 422);
    const duLieu = await hosoungtuyen_dichvu_js_1.dichVuHoSoUngTuyen.taoMoi({
        maUngVien: ungVien._id,
        maTinTuyenDung,
        maHoSoNangLuc: hoSoChinh._id,
        diemKhopKyNang: Number(yeuCau.body?.diemKhopKyNang ?? 75),
        thuXinViec: yeuCau.body?.thuXinViec,
    });
    phanHoi.status(201).json({ duLieu });
}));
exports.dinhTuyenHoSoUngTuyen.use((0, dinhtuyencoban_js_1.taoDinhTuyenCoBan)(hosoungtuyen_dieukhien_js_1.dieuKhienHoSoUngTuyen));
