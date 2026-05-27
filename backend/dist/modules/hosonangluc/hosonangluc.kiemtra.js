"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.kiemTraCapNhatHoSoNangLuc = exports.kiemTraTaoHoSoNangLuc = void 0;
const zod_1 = require("zod");
const kiemTraMucThongTin = zod_1.z.object({
    tieuDe: zod_1.z.string().optional(),
    donVi: zod_1.z.string().optional(),
    thoiGian: zod_1.z.string().optional(),
    moTa: zod_1.z.string().optional(),
});
exports.kiemTraTaoHoSoNangLuc = zod_1.z.object({
    maUngVien: zod_1.z.string().min(1),
    tieuDe: zod_1.z.string().min(2),
    hocVan: zod_1.z.array(kiemTraMucThongTin).optional(),
    kinhNghiemLam: zod_1.z.array(kiemTraMucThongTin).optional(),
    chungChi: zod_1.z.array(kiemTraMucThongTin).optional(),
    duAn: zod_1.z.array(kiemTraMucThongTin).optional(),
    cvChinh: zod_1.z.boolean().optional(),
    congKhai: zod_1.z.boolean().optional(),
});
exports.kiemTraCapNhatHoSoNangLuc = exports.kiemTraTaoHoSoNangLuc.partial();
