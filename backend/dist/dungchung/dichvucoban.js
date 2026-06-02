"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.taoDichVuCoBan = taoDichVuCoBan;
const loiungdung_js_1 = require("./loiungdung.js");
function taoDichVuCoBan(moHinh) {
    return {
        async layDanhSach(boLoc = {}) {
            return moHinh.find(boLoc).sort({ ngayTao: -1 }).limit(50);
        },
        async layTheoMa(ma) {
            const duLieu = await moHinh.findById(ma);
            if (!duLieu) {
                throw new loiungdung_js_1.LoiUngDung('Không tìm thấy dữ liệu', 404);
            }
            return duLieu;
        },
        async taoMoi(duLieu) {
            return moHinh.create(duLieu);
        },
        async capNhat(ma, duLieu) {
            const ketQua = await moHinh.findByIdAndUpdate(ma, duLieu, { new: true, runValidators: true });
            if (!ketQua) {
                throw new loiungdung_js_1.LoiUngDung('Không tìm thấy dữ liệu de cap nhat', 404);
            }
            return ketQua;
        },
        async xoa(ma) {
            const ketQua = await moHinh.findByIdAndDelete(ma);
            if (!ketQua) {
                throw new loiungdung_js_1.LoiUngDung('Không tìm thấy dữ liệu de xoa', 404);
            }
            return ketQua;
        },
    };
}
