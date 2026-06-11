"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ketNoiDuLieu = ketNoiDuLieu;
const prisma_js_1 = require("./prisma.js");
function ngu(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
function moTaLoi(error) {
    const anyError = error;
    const code = anyError?.code ? ` [${String(anyError.code)}]` : '';
    const message = String(anyError?.message ?? 'Không có thông điệp lỗi');
    return `${code} ${message}`.trim();
}
function laLoiChungChiKhongTheThuLai(error) {
    const message = String(error?.message ?? '');
    return (message.includes('UNABLE_TO_VERIFY_LEAF_SIGNATURE') ||
        message.includes('unable to verify the first certificate') ||
        message.includes('certificate') && message.includes('verify'));
}
async function ketNoiDuLieu() {
    let loiCuoi;
    for (let lan = 1; lan <= 8; lan += 1) {
        try {
            await prisma_js_1.prisma.$connect();
            console.log('Đã kết nối PostgreSQL');
            return;
        }
        catch (error) {
            loiCuoi = error;
            console.warn(`Chi tiết lỗi PostgreSQL: ${moTaLoi(error)}`);
            if (laLoiChungChiKhongTheThuLai(error))
                break;
            const thoiGianCho = Math.min(lan * 2000, 10000);
            console.warn(`Kết nối PostgreSQL thất bại lần ${lan}/8, thử lại sau ${thoiGianCho}ms`);
            if (lan < 8)
                await ngu(thoiGianCho);
        }
    }
    throw loiCuoi;
}
