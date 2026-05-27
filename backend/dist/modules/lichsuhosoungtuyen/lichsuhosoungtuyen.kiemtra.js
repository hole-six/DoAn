"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.kiemTraCapNhatLichSuHoSoUngTuyen = exports.kiemTraTaoLichSuHoSoUngTuyen = void 0;
const zod_1 = require("zod");
const hosoungtuyen_mohinh_js_1 = require("../hosoungtuyen/hosoungtuyen.mohinh.js");
exports.kiemTraTaoLichSuHoSoUngTuyen = zod_1.z.object({
    maHoSoUngTuyen: zod_1.z.string().min(1),
    trangThaiCu: zod_1.z.enum(hosoungtuyen_mohinh_js_1.trangThaiHoSoUngTuyen).optional(),
    trangThaiMoi: zod_1.z.enum(hosoungtuyen_mohinh_js_1.trangThaiHoSoUngTuyen),
    ghiChu: zod_1.z.string().optional(),
    maNguoiDung: zod_1.z.string().optional(),
    thoiGian: zod_1.z.coerce.date().optional(),
});
exports.kiemTraCapNhatLichSuHoSoUngTuyen = exports.kiemTraTaoLichSuHoSoUngTuyen.partial();
