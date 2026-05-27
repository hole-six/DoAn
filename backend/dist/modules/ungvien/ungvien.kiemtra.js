"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.kiemTraCapNhatUngVien = exports.kiemTraTaoUngVien = void 0;
const zod_1 = require("zod");
const ungvien_mohinh_js_1 = require("./ungvien.mohinh.js");
exports.kiemTraTaoUngVien = zod_1.z.object({
    maNguoiDung: zod_1.z.string().min(1),
    ngaySinh: zod_1.z.coerce.date().optional(),
    gioiTinh: zod_1.z.enum(ungvien_mohinh_js_1.gioiTinhUngVien).optional(),
    diaChi: zod_1.z.string().optional(),
    tomTat: zod_1.z.string().optional(),
    kinhNghiem: zod_1.z.number().int().min(0).optional(),
    viTriMongMuon: zod_1.z.string().optional(),
    mucLuongMongMuon: zod_1.z.number().min(0).optional(),
    kyNang: zod_1.z.array(zod_1.z.object({ maKyNang: zod_1.z.string().min(1), mucDo: zod_1.z.number().min(1).max(5).optional() })).optional(),
    portfolio: zod_1.z.array(zod_1.z.object({
        tenDuAn: zod_1.z.string().min(1),
        lienKet: zod_1.z.string().url(),
        moTa: zod_1.z.string().optional(),
        congNghe: zod_1.z.array(zod_1.z.string()).optional(),
    })).optional(),
});
exports.kiemTraCapNhatUngVien = exports.kiemTraTaoUngVien.partial();
