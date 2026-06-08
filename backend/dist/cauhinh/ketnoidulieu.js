"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ketNoiDuLieu = ketNoiDuLieu;
const prisma_js_1 = require("./prisma.js");
async function ketNoiDuLieu() {
    await prisma_js_1.prisma.$connect();
    console.log('Da ket noi PostgreSQL');
}
