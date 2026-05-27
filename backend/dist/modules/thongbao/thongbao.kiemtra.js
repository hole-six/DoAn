"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.kiemTraCapNhatThongBao = exports.kiemTraTaoThongBao = void 0;
const zod_1 = require("zod");
const thongbao_mohinh_js_1 = require("./thongbao.mohinh.js");
exports.kiemTraTaoThongBao = zod_1.z.object({
    maNguoiDung: zod_1.z.string().min(1),
    loai: zod_1.z.enum(thongbao_mohinh_js_1.loaiThongBao).optional(),
    tieuDe: zod_1.z.string().min(2),
    noiDung: zod_1.z.string().min(2),
    lienKet: zod_1.z.string().optional(),
    maHoSoUngTuyen: zod_1.z.string().optional(),
    maLichPhongVan: zod_1.z.string().optional(),
    daDoc: zod_1.z.boolean().optional(),
});
exports.kiemTraCapNhatThongBao = exports.kiemTraTaoThongBao.partial();
