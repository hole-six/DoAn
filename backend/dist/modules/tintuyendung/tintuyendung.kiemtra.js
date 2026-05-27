"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.kiemTraCapNhatTinTuyenDung = exports.kiemTraTaoTinTuyenDung = void 0;
const zod_1 = require("zod");
const tintuyendung_mohinh_js_1 = require("./tintuyendung.mohinh.js");
exports.kiemTraTaoTinTuyenDung = zod_1.z.object({
    maNhaTuyenDung: zod_1.z.string().min(1),
    tieuDe: zod_1.z.string().min(3),
    yeuCauKinhNghiem: zod_1.z.string().optional(),
    diaChi: zod_1.z.string().optional(),
    luongMin: zod_1.z.number().min(0).optional(),
    luongMax: zod_1.z.number().min(0).optional(),
    loaiHinh: zod_1.z.enum(tintuyendung_mohinh_js_1.loaiHinhLamViec).optional(),
    capBac: zod_1.z.enum(tintuyendung_mohinh_js_1.capBacTinTuyenDung).optional(),
    hanNop: zod_1.z.coerce.date().optional(),
    soLuong: zod_1.z.number().int().min(1).optional(),
    moTa: zod_1.z.string().min(10),
    yeuCau: zod_1.z.string().min(10),
    quyenLoi: zod_1.z.string().optional(),
    luotXem: zod_1.z.number().int().min(0).optional(),
    trangThai: zod_1.z.enum(tintuyendung_mohinh_js_1.trangThaiTinTuyenDung).optional(),
    ngayDang: zod_1.z.coerce.date().optional(),
    kyNang: zod_1.z.array(zod_1.z.object({ maKyNang: zod_1.z.string().min(1), batBuoc: zod_1.z.boolean().optional() })).optional(),
});
exports.kiemTraCapNhatTinTuyenDung = exports.kiemTraTaoTinTuyenDung.partial();
