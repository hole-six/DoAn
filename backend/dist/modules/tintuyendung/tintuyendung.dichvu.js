"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dichVuTinTuyenDung = void 0;
const loiungdung_js_1 = require("../../dungchung/loiungdung.js");
const prismaHelper_js_1 = require("../../dungchung/prismaHelper.js");
const timkiem_js_1 = require("../../dungchung/timkiem.js");
const nguoidung_mohinh_js_1 = require("../nguoidung/nguoidung.mohinh.js");
const thongbao_helper_js_1 = require("../thongbao/thongbao.helper.js");
const tintuyendung_mohinh_js_1 = require("./tintuyendung.mohinh.js");
async function layAdminIds() {
    const admins = await nguoidung_mohinh_js_1.NguoiDung.findMany({
        where: { vaiTro: 'admin', trangThai: 'hoat_dong' },
        select: { id: true },
    });
    return admins.map(item => item.id);
}
async function guiThongBaoAdminTinCanDuyet(tin) {
    const adminIds = await layAdminIds();
    await Promise.all(adminIds.map((maAdmin) => (0, thongbao_helper_js_1.thongBaoAdminTinTuyenDungCanDuyet)({
        maAdmin,
        tenCongTy: tin.maNhaTuyenDung?.tenCongTy ?? 'Nha tuyen dung',
        tieuDeTin: tin.tieuDe,
        maTinTuyenDung: String(tin._id),
    })));
}
function chuanHoaTin(taiLieu) {
    const duLieu = taiLieu ?? {};
    return {
        id: String(duLieu.id ?? duLieu._id),
        _id: String(duLieu.id ?? duLieu._id),
        maNhaTuyenDung: duLieu.maNhaTuyenDung?._id ? String(duLieu.maNhaTuyenDung._id) : String(duLieu.maNhaTuyenDung),
        nhaTuyenDung: duLieu.maNhaTuyenDung?._id
            ? {
                id: String(duLieu.maNhaTuyenDung._id),
                tenCongTy: duLieu.maNhaTuyenDung.tenCongTy,
                logo: duLieu.maNhaTuyenDung.logo,
                trangThaiDuyet: duLieu.maNhaTuyenDung.trangThaiDuyet,
            }
            : undefined,
        tieuDe: duLieu.tieuDe,
        yeuCauKinhNghiem: duLieu.yeuCauKinhNghiem,
        diaChi: duLieu.diaChi,
        luongMin: duLieu.luongMin,
        luongMax: duLieu.luongMax,
        loaiHinh: duLieu.loaiHinh,
        capBac: duLieu.capBac,
        anhDaiDien: duLieu.anhDaiDien,
        hanNop: duLieu.hanNop,
        soLuong: duLieu.soLuong,
        moTa: duLieu.moTa,
        yeuCau: duLieu.yeuCau,
        quyenLoi: duLieu.quyenLoi,
        luotXem: duLieu.luotXem,
        trangThai: duLieu.trangThai,
        ngayDang: duLieu.ngayDang,
        kyNang: (duLieu.kyNang ?? []).map((muc) => ({
            maKyNang: muc.maKyNang?._id ? String(muc.maKyNang._id) : String(muc.maKyNang),
            tenKyNang: muc.maKyNang?.tenKyNang,
            loaiKyNang: muc.maKyNang?.loaiKyNang,
            batBuoc: muc.batBuoc,
        })),
        ngayTao: duLieu.ngayTao,
        ngayCapNhat: duLieu.ngayCapNhat,
    };
}
async function layDayDu(where, many = false) {
    const rows = many
        ? await tintuyendung_mohinh_js_1.TinTuyenDung.findMany({ where, orderBy: { ngayTao: 'desc' }, take: 300 })
        : await tintuyendung_mohinh_js_1.TinTuyenDung.findMany({ where, take: 1 });
    const hydrated = await (0, prismaHelper_js_1.ganKyNangVaCongTyChoTin)(rows);
    return many ? hydrated : hydrated[0];
}
exports.dichVuTinTuyenDung = {
    async layDanhSach(boLoc = {}) {
        const danhSach = await layDayDu({}, true);
        const danhSachChuanHoa = danhSach.map(chuanHoaTin);
        const daLoc = (0, timkiem_js_1.locVaXepHangTheoTuKhoa)(danhSachChuanHoa, boLoc.tuKhoa, item => [
            item.tieuDe,
            item.nhaTuyenDung?.tenCongTy,
            item.diaChi,
            item.capBac,
            item.loaiHinh,
            ...(item.kyNang ?? []).flatMap((kyNang) => [kyNang.tenKyNang, kyNang.loaiKyNang]),
        ]);
        return daLoc.slice(0, (0, timkiem_js_1.layLimit)(boLoc.limit, 50, 100));
    },
    async layTheoMa(ma) {
        const duLieu = await layDayDu({ id: ma });
        if (!duLieu)
            throw new loiungdung_js_1.LoiUngDung('Không tìm thấy tin tuyển dụng', 404);
        return chuanHoaTin(duLieu);
    },
    async taoMoi(duLieu) {
        const ketQua = await tintuyendung_mohinh_js_1.TinTuyenDung.create({ data: (0, prismaHelper_js_1.boUndefined)(duLieu) });
        const dayDu = await layDayDu({ id: ketQua.id });
        if (dayDu?.trangThai === 'cho_duyet')
            await guiThongBaoAdminTinCanDuyet(dayDu);
        return chuanHoaTin(dayDu);
    },
    async capNhat(ma, duLieuNhan) {
        const duLieu = duLieuNhan;
        const hienTai = await layDayDu({ id: ma });
        if (!hienTai)
            throw new loiungdung_js_1.LoiUngDung('Không tìm thấy tin tuyển dụng de cap nhat', 404);
        const duLieuCapNhat = {
            ...duLieu,
            ...(duLieu.trangThai === 'dang_mo' ? { ngayDang: new Date() } : {}),
        };
        await tintuyendung_mohinh_js_1.TinTuyenDung.update({ where: { id: ma }, data: (0, prismaHelper_js_1.boUndefined)(duLieuCapNhat) });
        const ketQua = await layDayDu({ id: ma });
        if (hienTai.trangThai !== ketQua.trangThai && ['dang_mo', 'tu_choi'].includes(String(ketQua.trangThai))) {
            await (0, thongbao_helper_js_1.thongBaoNhaTuyenDungKetQuaDuyetTin)({
                maNguoiDung: String(ketQua.maNhaTuyenDung?.maNguoiDung ?? hienTai.maNhaTuyenDung?.maNguoiDung),
                tieuDeTin: ketQua.tieuDe,
                maTinTuyenDung: String(ketQua._id),
                trangThai: ketQua.trangThai,
            });
        }
        return chuanHoaTin(ketQua);
    },
    async xoa(ma) {
        const hienTai = await layDayDu({ id: ma });
        if (!hienTai)
            throw new loiungdung_js_1.LoiUngDung('Không tìm thấy tin tuyển dụng de xoa', 404);
        await tintuyendung_mohinh_js_1.TinTuyenDung.delete({ where: { id: ma } });
        return chuanHoaTin((0, prismaHelper_js_1.coId)(hienTai));
    },
};
