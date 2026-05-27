"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.kiemTraCapNhatHoSoUngTuyen = exports.kiemTraTaoHoSoUngTuyen = void 0;
const zod_1 = require("zod");
const hosoungtuyen_mohinh_js_1 = require("./hosoungtuyen.mohinh.js");
exports.kiemTraTaoHoSoUngTuyen = zod_1.z.object({
    maUngVien: zod_1.z.string().min(1),
    maTinTuyenDung: zod_1.z.string().min(1),
    maHoSoNangLuc: zod_1.z.string().optional(),
    thuXinViec: zod_1.z.string().optional(),
    diemKhopKyNang: zod_1.z.number().min(0).max(100).optional(),
    trangThai: zod_1.z.enum(hosoungtuyen_mohinh_js_1.trangThaiHoSoUngTuyen).optional(),
    ngayNop: zod_1.z.coerce.date().optional(),
});
exports.kiemTraCapNhatHoSoUngTuyen = exports.kiemTraTaoHoSoUngTuyen.partial();
