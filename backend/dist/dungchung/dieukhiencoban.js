"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.taoDieuKhienCoBan = taoDieuKhienCoBan;
const batloibatdongbo_js_1 = require("./batloibatdongbo.js");
function taoDieuKhienCoBan(dichVu, kiemTraTao, kiemTraCapNhat) {
    return {
        layDanhSach: (0, batloibatdongbo_js_1.batLoiBatDongBo)(async (yeuCau, phanHoi) => {
            const duLieu = await dichVu.layDanhSach(yeuCau.query);
            return phanHoi.json({ duLieu });
        }),
        layChiTiet: (0, batloibatdongbo_js_1.batLoiBatDongBo)(async (yeuCau, phanHoi) => {
            const ma = String(yeuCau.params.ma ?? '');
            const duLieu = await dichVu.layTheoMa(ma);
            return phanHoi.json({ duLieu });
        }),
        taoMoi: (0, batloibatdongbo_js_1.batLoiBatDongBo)(async (yeuCau, phanHoi) => {
            const duLieuHopLe = kiemTraTao.parse(yeuCau.body);
            const duLieu = await dichVu.taoMoi(duLieuHopLe);
            return phanHoi.status(201).json({ duLieu });
        }),
        capNhat: (0, batloibatdongbo_js_1.batLoiBatDongBo)(async (yeuCau, phanHoi) => {
            const duLieuHopLe = kiemTraCapNhat.parse(yeuCau.body);
            const ma = String(yeuCau.params.ma ?? '');
            const duLieu = await dichVu.capNhat(ma, duLieuHopLe);
            return phanHoi.json({ duLieu });
        }),
        xoa: (0, batloibatdongbo_js_1.batLoiBatDongBo)(async (yeuCau, phanHoi) => {
            const ma = String(yeuCau.params.ma ?? '');
            await dichVu.xoa(ma);
            return phanHoi.status(204).send();
        }),
    };
}
