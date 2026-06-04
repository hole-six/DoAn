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
            thongBao: 'Đăng nhập thành công',
            duLieu: ketQua,
        });
    }),
    dangNhapGoogle: (0, batloibatdongbo_js_1.batLoiBatDongBo)(async (yeuCau, phanHoi) => {
        const duLieu = xacthuc_kiemtra_js_1.kiemTraDangNhapGoogle.parse(yeuCau.body);
        const ketQua = await (0, xacthuc_dichvu_js_1.dangNhapGoogle)(duLieu);
        phanHoi.json({
            thongBao: 'Đăng nhập Google thành công',
            duLieu: ketQua,
        });
    }),
    lamMoiToken: (0, batloibatdongbo_js_1.batLoiBatDongBo)(async (yeuCau, phanHoi) => {
        const duLieu = xacthuc_kiemtra_js_1.kiemTraLamMoiToken.parse(yeuCau.body);
        const ketQua = await (0, xacthuc_dichvu_js_1.lamMoiToken)(duLieu);
        phanHoi.json({
            thongBao: 'Làm mới token thành công',
            duLieu: ketQua,
        });
    }),
    quenMatKhau: (0, batloibatdongbo_js_1.batLoiBatDongBo)(async (yeuCau, phanHoi) => {
        const duLieu = xacthuc_kiemtra_js_1.kiemTraQuenMatKhau.parse(yeuCau.body);
        const ketQua = await (0, xacthuc_dichvu_js_1.quenMatKhau)(duLieu);
        phanHoi.json({
            thongBao: 'Nếu email tồn tại, hệ thống đã gửi hướng dẫn đặt lại mật khẩu',
            duLieu: ketQua,
        });
    }),
    kiemTraTokenDatLaiMatKhau: (0, batloibatdongbo_js_1.batLoiBatDongBo)(async (yeuCau, phanHoi) => {
        const token = String(yeuCau.params.token ?? '');
        const ketQua = await (0, xacthuc_dichvu_js_1.kiemTraTokenDatLaiMatKhau)(token);
        phanHoi.json({ duLieu: ketQua });
    }),
    datLaiMatKhau: (0, batloibatdongbo_js_1.batLoiBatDongBo)(async (yeuCau, phanHoi) => {
        const duLieu = xacthuc_kiemtra_js_1.kiemTraDatLaiMatKhau.parse(yeuCau.body);
        const ketQua = await (0, xacthuc_dichvu_js_1.datLaiMatKhau)(duLieu);
        phanHoi.json({
            thongBao: 'Đặt lại mật khẩu thành công',
            duLieu: ketQua,
        });
    }),
    toi: (0, batloibatdongbo_js_1.batLoiBatDongBo)(async (yeuCau, phanHoi) => {
        const nguoiDung = await (0, xacthuc_dichvu_js_1.layNguoiDungTuAccessToken)(yeuCau.headers.authorization);
        phanHoi.json({ duLieu: nguoiDung });
    }),
    dangXuat: (0, batloibatdongbo_js_1.batLoiBatDongBo)(async (_yeuCau, phanHoi) => {
        phanHoi.status(204).send();
    }),
};
