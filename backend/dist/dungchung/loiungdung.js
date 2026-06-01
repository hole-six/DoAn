"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoiUngDung = void 0;
class LoiUngDung extends Error {
    maTrangThai;
    maLoi;
    loiTruong;
    goiYHanhDong;
    constructor(thongBao, maTrangThai = 400, maLoi = 'APP_ERROR', loiTruong, goiYHanhDong) {
        super(thongBao);
        this.maTrangThai = maTrangThai;
        this.maLoi = maLoi;
        this.loiTruong = loiTruong;
        this.goiYHanhDong = goiYHanhDong;
    }
}
exports.LoiUngDung = LoiUngDung;
