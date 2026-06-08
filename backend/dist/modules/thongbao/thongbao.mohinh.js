"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThongBao = exports.mucDoUuTien = exports.loaiThongBao = void 0;
const prisma_js_1 = require("../../cauhinh/prisma.js");
exports.loaiThongBao = [
    'he_thong',
    'ho_so_ung_tuyen',
    'lich_phong_van',
    'tin_tuyen_dung',
    'cong_ty',
    'tin_nhan',
    'ket_qua_phong_van',
];
exports.mucDoUuTien = ['thap', 'trung_binh', 'cao', 'khan_cap'];
exports.ThongBao = prisma_js_1.prisma.thongBao;
