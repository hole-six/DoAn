"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dichVuHoSoNangLuc = void 0;
const loiungdung_js_1 = require("../../dungchung/loiungdung.js");
const prismaHelper_js_1 = require("../../dungchung/prismaHelper.js");
const hosonangluc_mohinh_js_1 = require("./hosonangluc.mohinh.js");
function chuanHoaHoSo(row) {
    if (!row)
        return row;
    return {
        ...row,
        _id: row.id,
        // Đảm bảo Json array fields không null
        hocVan: row.hocVan ?? [],
        kinhNghiemLam: row.kinhNghiemLam ?? [],
        chungChi: row.chungChi ?? [],
        duAn: row.duAn ?? [],
        tomTatKinhNghiem: row.tomTatKinhNghiem ?? [],
        kyNangMem: row.kyNangMem ?? [],
        kyNangLapTrinh: row.kyNangLapTrinh ?? [],
        baiVietKyThuat: row.baiVietKyThuat ?? [],
        duAnChiTiet: row.duAnChiTiet ?? [],
        // Đảm bảo string fields không null -> default
        loaiHoSo: row.loaiHoSo ?? 'builder',
        templateCv: row.templateCv ?? 'classic-blue',
        mauChinh: row.mauChinh ?? '#2563eb',
        mauPhu: row.mauPhu ?? '#0f172a',
        font: row.font ?? 'Inter',
        markdownGoc: row.markdownGoc ?? '',
        ghiChuAi: row.ghiChuAi ?? '',
    };
}
exports.dichVuHoSoNangLuc = {
    async layDanhSach() {
        const danhSach = await hosonangluc_mohinh_js_1.HoSoNangLuc.findMany({
            orderBy: [{ cvChinh: 'desc' }, { ngayCapNhat: 'desc' }],
            take: 300,
        });
        return danhSach.map(chuanHoaHoSo);
    },
    async layTheoMa(ma) {
        const duLieu = await hosonangluc_mohinh_js_1.HoSoNangLuc.findUnique({ where: { id: ma } });
        if (!duLieu)
            throw new loiungdung_js_1.LoiUngDung('Không tìm thấy hồ sơ năng lực', 404);
        return chuanHoaHoSo(duLieu);
    },
    async taoMoi(duLieu) {
        const payload = duLieu;
        if (payload.cvChinh)
            await hosonangluc_mohinh_js_1.HoSoNangLuc.updateMany({ where: { maUngVien: payload.maUngVien }, data: { cvChinh: false } });
        const ketQua = await hosonangluc_mohinh_js_1.HoSoNangLuc.create({ data: (0, prismaHelper_js_1.boUndefined)(payload) });
        return chuanHoaHoSo(ketQua);
    },
    async capNhat(ma, duLieu) {
        const payload = duLieu;
        const hienTai = await hosonangluc_mohinh_js_1.HoSoNangLuc.findUnique({ where: { id: ma } });
        if (!hienTai)
            throw new loiungdung_js_1.LoiUngDung('Không tìm thấy hồ sơ năng lực để cập nhật', 404);
        if (payload.cvChinh && (payload.maUngVien || hienTai.maUngVien)) {
            await hosonangluc_mohinh_js_1.HoSoNangLuc.updateMany({
                where: { maUngVien: String(payload.maUngVien ?? hienTai.maUngVien), id: { not: ma } },
                data: { cvChinh: false },
            });
        }
        const ketQua = await hosonangluc_mohinh_js_1.HoSoNangLuc.update({ where: { id: ma }, data: (0, prismaHelper_js_1.boUndefined)(payload) });
        return chuanHoaHoSo(ketQua);
    },
    async xoa(ma) {
        const hienTai = await hosonangluc_mohinh_js_1.HoSoNangLuc.findUnique({ where: { id: ma } });
        if (!hienTai)
            throw new loiungdung_js_1.LoiUngDung('Không tìm thấy hồ sơ năng lực để xóa', 404);
        await hosonangluc_mohinh_js_1.HoSoNangLuc.delete({ where: { id: ma } });
        return chuanHoaHoSo(hienTai);
    },
};
