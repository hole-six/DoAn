"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ketNoiDuLieu = ketNoiDuLieu;
const prisma_js_1 = require("./prisma.js");
function ngu(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
async function ketNoiDuLieu() {
    let loiCuoi;
    for (let lan = 1; lan <= 8; lan += 1) {
        try {
            await prisma_js_1.prisma.$connect();
            console.log('Da ket noi PostgreSQL');
            return;
        }
        catch (error) {
            loiCuoi = error;
            const thoiGianCho = Math.min(lan * 2000, 10000);
            console.warn(`Ket noi PostgreSQL that bai lan ${lan}/8, thu lai sau ${thoiGianCho}ms`);
            if (lan < 8)
                await ngu(thoiGianCho);
        }
    }
    throw loiCuoi;
}
