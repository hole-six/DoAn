"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dichVuHoSoNangLuc = void 0;
const loiungdung_js_1 = require("../../dungchung/loiungdung.js");
const prismaHelper_js_1 = require("../../dungchung/prismaHelper.js");
const hosonangluc_mohinh_js_1 = require("./hosonangluc.mohinh.js");
function chuanHoaHoSo(taiLieu) {
    const duLieu = taiLieu ?? {};
    return {
        id: String(duLieu.id ?? duLieu._id),
        _id: String(duLieu.id ?? duLieu._id),
        maUngVien: duLieu.maUngVien?._id ? String(duLieu.maUngVien._id) : String(duLieu.maUngVien),
        tieuDe: duLieu.tieuDe,
        hocVan: duLieu.hocVan ?? [],
        kinhNghiemLam: duLieu.kinhNghiemLam ?? [],
        chungChi: duLieu.chungChi ?? [],
        duAn: duLieu.duAn ?? [],
        hoTenHienThi: duLieu.hoTenHienThi,
        chucDanh: duLieu.chucDanh,
        soDienThoai: duLieu.soDienThoai,
        emailLienHe: duLieu.emailLienHe,
        facebook: duLieu.facebook,
        github: duLieu.github,
        portfolioUrl: duLieu.portfolioUrl,
        diaDiem: duLieu.diaDiem,
        tomTatKinhNghiem: duLieu.tomTatKinhNghiem ?? [],
        kyNangMem: duLieu.kyNangMem ?? [],
        kyNangLapTrinh: duLieu.kyNangLapTrinh ?? [],
        baiVietKyThuat: duLieu.baiVietKyThuat ?? [],
        duAnChiTiet: duLieu.duAnChiTiet ?? [],
        fileCvTen: duLieu.fileCvTen,
        fileCvLoai: duLieu.fileCvLoai,
        fileCvData: duLieu.fileCvData,
        fileCvText: duLieu.fileCvText,
        fileCvPath: duLieu.fileCvPath,
        fileCvTextStatus: duLieu.fileCvTextStatus,
        fileCvTextError: duLieu.fileCvTextError,
        loaiHoSo: duLieu.loaiHoSo ?? 'builder',
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
        const danhSach = await hosonangluc_mohinh_js_1.HoSoNangLuc.findMany({
            orderBy: [{ cvChinh: 'desc' }, { ngayCapNhat: 'desc' }],
            take: 300,
        });
        return danhSach.map(row => chuanHoaHoSo((0, prismaHelper_js_1.coId)(row)));
    },
    async layTheoMa(ma) {
        const duLieu = await hosonangluc_mohinh_js_1.HoSoNangLuc.findUnique({ where: { id: ma } });
        if (!duLieu)
            throw new loiungdung_js_1.LoiUngDung('Không tìm thấy hồ sơ năng lực', 404);
        return chuanHoaHoSo((0, prismaHelper_js_1.coId)(duLieu));
    },
    async taoMoi(duLieu) {
        const payload = duLieu;
        if (payload.cvChinh)
            await hosonangluc_mohinh_js_1.HoSoNangLuc.updateMany({ where: { maUngVien: payload.maUngVien }, data: { cvChinh: false } });
        const ketQua = await hosonangluc_mohinh_js_1.HoSoNangLuc.create({ data: (0, prismaHelper_js_1.boUndefined)(payload) });
        return chuanHoaHoSo((0, prismaHelper_js_1.coId)(ketQua));
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
        return chuanHoaHoSo((0, prismaHelper_js_1.coId)(ketQua));
    },
    async xoa(ma) {
        const hienTai = await hosonangluc_mohinh_js_1.HoSoNangLuc.findUnique({ where: { id: ma } });
        if (!hienTai)
            throw new loiungdung_js_1.LoiUngDung('Không tìm thấy hồ sơ năng lực để xóa', 404);
        await hosonangluc_mohinh_js_1.HoSoNangLuc.delete({ where: { id: ma } });
        return chuanHoaHoSo((0, prismaHelper_js_1.coId)(hienTai));
    },
};
