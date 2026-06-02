"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("http");
const bienmoitruong_js_1 = require("./cauhinh/bienmoitruong.js");
const ketnoidulieu_js_1 = require("./cauhinh/ketnoidulieu.js");
const socket_js_1 = require("./cauhinh/socket.js");
const ai_dichvu_js_1 = require("./modules/ai/ai.dichvu.js");
const canhbaoquantri_dichvu_js_1 = require("./modules/canhbaoquantri/canhbaoquantri.dichvu.js");
const ungdung_js_1 = require("./ungdung.js");
async function khoiDongMayChu() {
    await (0, ketnoidulieu_js_1.ketNoiDuLieu)();
    (0, canhbaoquantri_dichvu_js_1.khoiDongCronCanhBaoQuanTri)();
    (0, ai_dichvu_js_1.khoiDongCrawlerGoiYViecLam)();
    const ungDung = (0, ungdung_js_1.taoUngDung)();
    // Tạo HTTP server
    const httpServer = (0, http_1.createServer)(ungDung);
    // Khởi tạo Socket.IO
    (0, socket_js_1.khoiTaoSocket)(httpServer);
    httpServer.listen(bienmoitruong_js_1.bienMoiTruong.cong, () => {
        console.log(`May chu dang chay tai cong ${bienmoitruong_js_1.bienMoiTruong.cong}`);
    });
}
khoiDongMayChu().catch((loi) => {
    console.error('Khoi dong that bai:', loi);
    process.exit(1);
});
