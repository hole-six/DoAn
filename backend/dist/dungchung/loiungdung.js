"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoiUngDung = void 0;
class LoiUngDung extends Error {
    maTrangThai;
    constructor(thongBao, maTrangThai = 400) {
        super(thongBao);
        this.maTrangThai = maTrangThai;
    }
}
exports.LoiUngDung = LoiUngDung;
