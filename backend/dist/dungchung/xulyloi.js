"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.xuLyLoi = void 0;
const zod_1 = require("zod");
const loiungdung_js_1 = require("./loiungdung.js");
const xuLyLoi = (loi, _yeuCau, phanHoi, _tiepTheo) => {
    if (loi instanceof zod_1.ZodError) {
        return phanHoi.status(422).json({
            thongBao: 'Du lieu khong hop le',
            loi: loi.flatten().fieldErrors,
        });
    }
    if (loi instanceof loiungdung_js_1.LoiUngDung) {
        return phanHoi.status(loi.maTrangThai).json({ thongBao: loi.message });
    }
    return phanHoi.status(500).json({
        thongBao: loi.message ?? 'Loi may chu',
    });
};
exports.xuLyLoi = xuLyLoi;
