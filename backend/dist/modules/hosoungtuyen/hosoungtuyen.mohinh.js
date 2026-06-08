"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HoSoUngTuyen = exports.trangThaiHoSoUngTuyen = void 0;
const prisma_js_1 = require("../../cauhinh/prisma.js");
exports.trangThaiHoSoUngTuyen = ['da_nop', 'da_xem', 'dang_xet_duyet', 'moi_phong_van', 'dat', 'tu_choi', 'da_rut'];
exports.HoSoUngTuyen = prisma_js_1.prisma.hoSoUngTuyen;
