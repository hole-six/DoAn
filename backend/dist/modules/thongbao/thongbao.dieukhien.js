"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dieuKhienThongBao = void 0;
const batloibatdongbo_js_1 = require("../../dungchung/batloibatdongbo.js");
const dieukhiencoban_js_1 = require("../../dungchung/dieukhiencoban.js");
const thongbao_dichvu_js_1 = require("./thongbao.dichvu.js");
const thongbao_kiemtra_js_1 = require("./thongbao.kiemtra.js");
const dieuKhienCoBan = (0, dieukhiencoban_js_1.taoDieuKhienCoBan)(thongbao_dichvu_js_1.dichVuThongBao, thongbao_kiemtra_js_1.kiemTraTaoThongBao, thongbao_kiemtra_js_1.kiemTraCapNhatThongBao);
exports.dieuKhienThongBao = {
    ...dieuKhienCoBan,
    // Đánh dấu đã đọc
    danhDauDaDoc: (0, batloibatdongbo_js_1.batLoiBatDongBo)(async (yeuCau, phanHoi) => {
        const { id } = yeuCau.params;
        const maNguoiDung = yeuCau.nguoiDung._id;
        const thongBao = await (0, thongbao_dichvu_js_1.danhDauDaDoc)(String(id), maNguoiDung);
        phanHoi.json({
            thongBao: 'Danh dau da doc thanh cong',
            duLieu: thongBao,
        });
    }),
    // Đánh dấu tất cả đã đọc
    danhDauTatCaDaDoc: (0, batloibatdongbo_js_1.batLoiBatDongBo)(async (yeuCau, phanHoi) => {
        const maNguoiDung = yeuCau.nguoiDung._id;
        await (0, thongbao_dichvu_js_1.danhDauTatCaDaDoc)(maNguoiDung);
        phanHoi.json({
            thongBao: 'Danh dau tat ca da doc thanh cong',
        });
    }),
    // Đếm thông báo chưa đọc
    demChuaDoc: (0, batloibatdongbo_js_1.batLoiBatDongBo)(async (yeuCau, phanHoi) => {
        const maNguoiDung = yeuCau.nguoiDung._id;
        const soLuong = await (0, thongbao_dichvu_js_1.demThongBaoChuaDoc)(maNguoiDung);
        phanHoi.json({
            duLieu: { soLuong },
        });
    }),
};
