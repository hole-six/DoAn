"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.taoDichVuCoBan = taoDichVuCoBan;
const loiungdung_js_1 = require("./loiungdung.js");
const prismaHelper_js_1 = require("./prismaHelper.js");
const timkiem_js_1 = require("./timkiem.js");
function taoDichVuCoBan(moHinh) {
    return {
        async layDanhSach(boLoc = {}) {
            const { tuKhoa, limit, ...where } = boLoc;
            const duLieu = await moHinh.findMany({
                where,
                orderBy: { ngayTao: 'desc' },
                take: 300,
            });
            const daCoId = (0, prismaHelper_js_1.coIdNhieu)(duLieu);
            const daLoc = (0, timkiem_js_1.locVaXepHangTheoTuKhoa)(daCoId, tuKhoa, item => [
                item.tenKyNang,
                item.loaiKyNang,
                item.ten,
                item.tieuDe,
                item.hoTen,
            ]);
            return daLoc.slice(0, (0, timkiem_js_1.layLimit)(limit, 50, 100));
        },
        async layTheoMa(ma) {
            const duLieu = await moHinh.findUnique({ where: { id: ma } });
            if (!duLieu) {
                throw new loiungdung_js_1.LoiUngDung('Khong tim thay du lieu', 404);
            }
            return (0, prismaHelper_js_1.coId)(duLieu);
        },
        async taoMoi(duLieu) {
            return (0, prismaHelper_js_1.coId)(await moHinh.create({ data: (0, prismaHelper_js_1.boUndefined)(duLieu) }));
        },
        async capNhat(ma, duLieu) {
            const hienTai = await moHinh.findUnique({ where: { id: ma }, select: { id: true } });
            if (!hienTai) {
                throw new loiungdung_js_1.LoiUngDung('Khong tim thay du lieu de cap nhat', 404);
            }
            return (0, prismaHelper_js_1.coId)(await moHinh.update({ where: { id: ma }, data: (0, prismaHelper_js_1.boUndefined)(duLieu) }));
        },
        async xoa(ma) {
            const ketQua = await moHinh.findUnique({ where: { id: ma } });
            if (!ketQua) {
                throw new loiungdung_js_1.LoiUngDung('Khong tim thay du lieu de xoa', 404);
            }
            await moHinh.delete({ where: { id: ma } });
            return (0, prismaHelper_js_1.coId)(ketQua);
        },
    };
}
