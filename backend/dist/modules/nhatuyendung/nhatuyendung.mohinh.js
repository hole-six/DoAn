"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NhaTuyenDung = exports.trangThaiDuyetNhaTuyenDung = void 0;
const prisma_js_1 = require("../../cauhinh/prisma.js");
exports.trangThaiDuyetNhaTuyenDung = ['cho_duyet', 'da_duyet', 'tu_choi'];
exports.NhaTuyenDung = prisma_js_1.prisma.nhaTuyenDung;
