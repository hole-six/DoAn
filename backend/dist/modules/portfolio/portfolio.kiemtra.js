"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.kiemTraPreviewPortfolio = exports.kiemTraCapNhatPortfolio = exports.kiemTraTaoPortfolio = void 0;
const zod_1 = require("zod");
const portfolio_mohinh_js_1 = require("./portfolio.mohinh.js");
exports.kiemTraTaoPortfolio = zod_1.z.object({
    maHoSoNangLuc: zod_1.z.string().min(1),
    tieuDe: zod_1.z.string().min(2).optional(),
    markdown: zod_1.z.string().max(50000).optional(),
    theme: zod_1.z.enum(portfolio_mohinh_js_1.themePortfolio).optional(),
    mauChinh: zod_1.z.string().optional(),
    mauPhu: zod_1.z.string().optional(),
    font: zod_1.z.string().optional(),
});
exports.kiemTraCapNhatPortfolio = exports.kiemTraTaoPortfolio.partial();
exports.kiemTraPreviewPortfolio = exports.kiemTraCapNhatPortfolio;
