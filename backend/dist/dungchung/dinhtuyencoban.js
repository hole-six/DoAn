"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.taoDinhTuyenCoBan = taoDinhTuyenCoBan;
const express_1 = require("express");
function taoDinhTuyenCoBan(dieuKhien) {
    const dinhTuyen = (0, express_1.Router)();
    dinhTuyen.get('/', dieuKhien.layDanhSach);
    dinhTuyen.get('/:ma', dieuKhien.layChiTiet);
    dinhTuyen.post('/', dieuKhien.taoMoi);
    dinhTuyen.patch('/:ma', dieuKhien.capNhat);
    dinhTuyen.delete('/:ma', dieuKhien.xoa);
    return dinhTuyen;
}
