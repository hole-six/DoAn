"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dieuKhienHoSoUngTuyen = void 0;
const dieukhiencoban_js_1 = require("../../dungchung/dieukhiencoban.js");
const hosoungtuyen_dichvu_js_1 = require("./hosoungtuyen.dichvu.js");
const hosoungtuyen_kiemtra_js_1 = require("./hosoungtuyen.kiemtra.js");
exports.dieuKhienHoSoUngTuyen = (0, dieukhiencoban_js_1.taoDieuKhienCoBan)(hosoungtuyen_dichvu_js_1.dichVuHoSoUngTuyen, hosoungtuyen_kiemtra_js_1.kiemTraTaoHoSoUngTuyen, hosoungtuyen_kiemtra_js_1.kiemTraCapNhatHoSoUngTuyen);
