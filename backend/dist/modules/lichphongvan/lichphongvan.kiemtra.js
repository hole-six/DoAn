"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.kiemTraCapNhatLichPhongVan = exports.kiemTraTaoLichPhongVan = void 0;
const zod_1 = require("zod");
const lichphongvan_mohinh_js_1 = require("./lichphongvan.mohinh.js");
exports.kiemTraTaoLichPhongVan = zod_1.z.object({
    maHoSoUngTuyen: zod_1.z.string().min(1),
    thoiGianBatDau: zod_1.z.coerce.date(),
    thoiGianKetThuc: zod_1.z.coerce.date().optional(),
    diaChi: zod_1.z.string().optional(),
    hinhThuc: zod_1.z.enum(lichphongvan_mohinh_js_1.hinhThucPhongVan).optional(),
    linkHop: zod_1.z.string().optional(),
    ghiChu: zod_1.z.string().optional(),
    trangThai: zod_1.z.enum(lichphongvan_mohinh_js_1.trangThaiLichPhongVan).optional(),
    ketQua: zod_1.z.enum(lichphongvan_mohinh_js_1.ketQuaPhongVan).optional(),
});
exports.kiemTraCapNhatLichPhongVan = exports.kiemTraTaoLichPhongVan.partial();
