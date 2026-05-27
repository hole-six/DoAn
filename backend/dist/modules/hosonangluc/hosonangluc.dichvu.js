"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dichVuHoSoNangLuc = void 0;
const loiungdung_js_1 = require("../../dungchung/loiungdung.js");
require("../ungvien/ungvien.mohinh.js");
const hosonangluc_mohinh_js_1 = require("./hosonangluc.mohinh.js");
function chuanHoaHoSo(taiLieu) {
    const duLieu = typeof taiLieu.toObject === 'function' ? taiLieu.toObject() : taiLieu;
    return {
        id: String(duLieu._id),
        maUngVien: duLieu.maUngVien?._id ? String(duLieu.maUngVien._id) : String(duLieu.maUngVien),
        tieuDe: duLieu.tieuDe,
        hocVan: duLieu.hocVan ?? [],
        kinhNghiemLam: duLieu.kinhNghiemLam ?? [],
        chungChi: duLieu.chungChi ?? [],
        duAn: duLieu.duAn ?? [],
        anhDaiDien: duLieu.anhDaiDien,
        templateCv: duLieu.templateCv ?? 'classic-blue',
        mauChinh: duLieu.mauChinh ?? '#2563eb',
        mauPhu: duLieu.mauPhu ?? '#0f172a',
        font: duLieu.font ?? 'Inter',
        markdownGoc: duLieu.markdownGoc ?? '',
        ghiChuAi: duLieu.ghiChuAi ?? '',
        cvChinh: duLieu.cvChinh,
        congKhai: duLieu.congKhai,
        ngayTao: duLieu.ngayTao,
        ngayCapNhat: duLieu.ngayCapNhat,
    };
}
exports.dichVuHoSoNangLuc = {
    async layDanhSach() {
        const danhSach = await hosonangluc_mohinh_js_1.HoSoNangLuc.find().sort({ cvChinh: -1, ngayCapNhat: -1 }).limit(300);
        return danhSach.map(chuanHoaHoSo);
    },
    async layTheoMa(ma) {
        const duLieu = await hosonangluc_mohinh_js_1.HoSoNangLuc.findById(ma);
        if (!duLieu)
            throw new loiungdung_js_1.LoiUngDung('Khong tim thay ho so nang luc', 404);
        return chuanHoaHoSo(duLieu);
    },
    async taoMoi(duLieu) {
        const payload = duLieu;
        if (payload.cvChinh)
            await hosonangluc_mohinh_js_1.HoSoNangLuc.updateMany({ maUngVien: payload.maUngVien }, { $set: { cvChinh: false } });
        const ketQua = await hosonangluc_mohinh_js_1.HoSoNangLuc.create(payload);
        return chuanHoaHoSo(ketQua);
    },
    async capNhat(ma, duLieu) {
        const payload = duLieu;
        if (payload.cvChinh && payload.maUngVien)
            await hosonangluc_mohinh_js_1.HoSoNangLuc.updateMany({ maUngVien: payload.maUngVien, _id: { $ne: ma } }, { $set: { cvChinh: false } });
        const ketQua = await hosonangluc_mohinh_js_1.HoSoNangLuc.findByIdAndUpdate(ma, payload, { returnDocument: 'after', runValidators: true });
        if (!ketQua)
            throw new loiungdung_js_1.LoiUngDung('Khong tim thay ho so nang luc de cap nhat', 404);
        return chuanHoaHoSo(ketQua);
    },
    async xoa(ma) {
        const ketQua = await hosonangluc_mohinh_js_1.HoSoNangLuc.findByIdAndDelete(ma);
        if (!ketQua)
            throw new loiungdung_js_1.LoiUngDung('Khong tim thay ho so nang luc de xoa', 404);
        return chuanHoaHoSo(ketQua);
    },
};
