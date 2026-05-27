"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bienmoitruong_js_1 = require("./cauhinh/bienmoitruong.js");
const ketnoidulieu_js_1 = require("./cauhinh/ketnoidulieu.js");
const ungdung_js_1 = require("./ungdung.js");
async function khoiDongMayChu() {
    await (0, ketnoidulieu_js_1.ketNoiDuLieu)();
    const ungDung = (0, ungdung_js_1.taoUngDung)();
    ungDung.listen(bienmoitruong_js_1.bienMoiTruong.cong, () => {
        console.log(`May chu dang chay tai cong ${bienmoitruong_js_1.bienMoiTruong.cong}`);
    });
}
khoiDongMayChu().catch((loi) => {
    console.error('Khoi dong that bai:', loi);
    process.exit(1);
});
