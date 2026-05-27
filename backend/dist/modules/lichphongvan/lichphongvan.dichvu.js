"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dichVuLichPhongVan = void 0;
const loiungdung_js_1 = require("../../dungchung/loiungdung.js");
require("../hosoungtuyen/hosoungtuyen.mohinh.js");
require("../nhatuyendung/nhatuyendung.mohinh.js");
require("../tintuyendung/tintuyendung.mohinh.js");
const lichphongvan_mohinh_js_1 = require("./lichphongvan.mohinh.js");
function chuanHoaLich(taiLieu) {
    const duLieu = typeof taiLieu.toObject === 'function' ? taiLieu.toObject() : taiLieu;
    const ungTuyen = duLieu.maHoSoUngTuyen;
    const tin = ungTuyen?.maTinTuyenDung;
    return {
        id: String(duLieu._id),
        maHoSoUngTuyen: ungTuyen?._id ? String(ungTuyen._id) : String(ungTuyen),
        hoSoUngTuyen: ungTuyen?._id
            ? {
                id: String(ungTuyen._id),
                trangThai: ungTuyen.trangThai,
                tinTuyenDung: tin?._id
                    ? {
                        id: String(tin._id),
                        tieuDe: tin.tieuDe,
                        nhaTuyenDung: tin.maNhaTuyenDung?._id ? { id: String(tin.maNhaTuyenDung._id), tenCongTy: tin.maNhaTuyenDung.tenCongTy } : undefined,
                    }
                    : undefined,
            }
            : undefined,
        thoiGianBatDau: duLieu.thoiGianBatDau,
        thoiGianKetThuc: duLieu.thoiGianKetThuc,
        diaChi: duLieu.diaChi,
        hinhThuc: duLieu.hinhThuc,
        linkHop: duLieu.linkHop,
        ghiChu: duLieu.ghiChu,
        trangThai: duLieu.trangThai,
        ketQua: duLieu.ketQua,
        ngayTao: duLieu.ngayTao,
        ngayCapNhat: duLieu.ngayCapNhat,
    };
}
function populate(q) {
    return q.populate({ path: 'maHoSoUngTuyen', populate: { path: 'maTinTuyenDung', populate: { path: 'maNhaTuyenDung', select: 'tenCongTy' } } });
}
exports.dichVuLichPhongVan = {
    async layDanhSach() {
        const danhSach = await populate(lichphongvan_mohinh_js_1.LichPhongVan.find()).sort({ thoiGianBatDau: 1 }).limit(300);
        return danhSach.map(chuanHoaLich);
    },
    async layTheoMa(ma) {
        const duLieu = await populate(lichphongvan_mohinh_js_1.LichPhongVan.findById(ma));
        if (!duLieu)
            throw new loiungdung_js_1.LoiUngDung('Khong tim thay lich phong van', 404);
        return chuanHoaLich(duLieu);
    },
    async taoMoi(duLieu) {
        const ketQua = await lichphongvan_mohinh_js_1.LichPhongVan.create(duLieu);
        return this.layTheoMa(String(ketQua._id));
    },
    async capNhat(ma, duLieu) {
        const ketQua = await populate(lichphongvan_mohinh_js_1.LichPhongVan.findByIdAndUpdate(ma, duLieu, { returnDocument: 'after', runValidators: true }));
        if (!ketQua)
            throw new loiungdung_js_1.LoiUngDung('Khong tim thay lich phong van de cap nhat', 404);
        return chuanHoaLich(ketQua);
    },
    async xoa(ma) {
        const ketQua = await lichphongvan_mohinh_js_1.LichPhongVan.findByIdAndDelete(ma);
        if (!ketQua)
            throw new loiungdung_js_1.LoiUngDung('Khong tim thay lich phong van de xoa', 404);
        return chuanHoaLich(ketQua);
    },
};
