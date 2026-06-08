"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LichPhongVan = exports.ketQuaPhongVan = exports.trangThaiLichPhongVan = exports.hinhThucPhongVan = void 0;
const prisma_js_1 = require("../../cauhinh/prisma.js");
exports.hinhThucPhongVan = ['online', 'offline'];
exports.trangThaiLichPhongVan = ['da_len_lich', 'da_xac_nhan', 'doi_lich', 'da_huy', 'hoan_thanh'];
exports.ketQuaPhongVan = ['cho_ket_qua', 'dat', 'khong_dat'];
exports.LichPhongVan = prisma_js_1.prisma.lichPhongVan;
