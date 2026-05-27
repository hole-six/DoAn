"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dieuKhienPortfolio = void 0;
const portfolio_dichvu_js_1 = require("./portfolio.dichvu.js");
const portfolio_kiemtra_js_1 = require("./portfolio.kiemtra.js");
exports.dieuKhienPortfolio = {
    async layDanhSach(yeuCau, phanHoi) {
        const duLieu = await portfolio_dichvu_js_1.dichVuPortfolio.layDanhSach(yeuCau.headers.authorization);
        phanHoi.json({ duLieu });
    },
    async layTheoMa(yeuCau, phanHoi) {
        const duLieu = await portfolio_dichvu_js_1.dichVuPortfolio.layTheoMa(yeuCau.headers.authorization, String(yeuCau.params.ma));
        phanHoi.json({ duLieu });
    },
    async taoMoi(yeuCau, phanHoi) {
        const payload = portfolio_kiemtra_js_1.kiemTraTaoPortfolio.parse(yeuCau.body);
        const duLieu = await portfolio_dichvu_js_1.dichVuPortfolio.taoMoi(yeuCau.headers.authorization, payload);
        phanHoi.status(201).json({ duLieu });
    },
    async capNhat(yeuCau, phanHoi) {
        const payload = portfolio_kiemtra_js_1.kiemTraCapNhatPortfolio.parse(yeuCau.body);
        const duLieu = await portfolio_dichvu_js_1.dichVuPortfolio.capNhat(yeuCau.headers.authorization, String(yeuCau.params.ma), payload);
        phanHoi.json({ duLieu });
    },
    async preview(yeuCau, phanHoi) {
        const payload = portfolio_kiemtra_js_1.kiemTraPreviewPortfolio.parse(yeuCau.body);
        const html = await portfolio_dichvu_js_1.dichVuPortfolio.preview(yeuCau.headers.authorization, String(yeuCau.params.ma), payload);
        phanHoi.json({ duLieu: { html } });
    },
    async exportHtml(yeuCau, phanHoi) {
        const html = await portfolio_dichvu_js_1.dichVuPortfolio.exportHtml(yeuCau.headers.authorization, String(yeuCau.params.ma));
        phanHoi.setHeader('Content-Type', 'text/html; charset=utf-8');
        phanHoi.setHeader('Content-Disposition', 'attachment; filename="index.html"');
        phanHoi.send(html);
    },
};
