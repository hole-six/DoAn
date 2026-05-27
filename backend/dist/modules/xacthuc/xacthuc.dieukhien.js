"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dieuKhienXacThuc = void 0;
const batloibatdongbo_js_1 = require("../../dungchung/batloibatdongbo.js");
const xacthuc_dichvu_js_1 = require("./xacthuc.dichvu.js");
const xacthuc_kiemtra_js_1 = require("./xacthuc.kiemtra.js");
exports.dieuKhienXacThuc = {
    dangNhap: (0, batloibatdongbo_js_1.batLoiBatDongBo)(async (yeuCau, phanHoi) => {
        const duLieu = xacthuc_kiemtra_js_1.kiemTraDangNhap.parse(yeuCau.body);
        const ketQua = await (0, xacthuc_dichvu_js_1.dangNhap)(duLieu);
        phanHoi.json({
            thongBao: 'Dang nhap thanh cong',
            duLieu: ketQua,
        });
    }),
};
