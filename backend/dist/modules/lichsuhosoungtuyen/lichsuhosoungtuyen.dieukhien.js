"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dieuKhienLichSuHoSoUngTuyen = void 0;
const dieukhiencoban_js_1 = require("../../dungchung/dieukhiencoban.js");
const lichsuhosoungtuyen_dichvu_js_1 = require("./lichsuhosoungtuyen.dichvu.js");
const lichsuhosoungtuyen_kiemtra_js_1 = require("./lichsuhosoungtuyen.kiemtra.js");
exports.dieuKhienLichSuHoSoUngTuyen = (0, dieukhiencoban_js_1.taoDieuKhienCoBan)(lichsuhosoungtuyen_dichvu_js_1.dichVuLichSuHoSoUngTuyen, lichsuhosoungtuyen_kiemtra_js_1.kiemTraTaoLichSuHoSoUngTuyen, lichsuhosoungtuyen_kiemtra_js_1.kiemTraCapNhatLichSuHoSoUngTuyen);
