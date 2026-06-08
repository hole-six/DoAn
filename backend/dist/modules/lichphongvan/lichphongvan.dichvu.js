"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dichVuLichPhongVan = void 0;
exports.layLichPhongVanDayDuNoiBo = layLichPhongVanDayDuNoiBo;
const loiungdung_js_1 = require("../../dungchung/loiungdung.js");
const prismaHelper_js_1 = require("../../dungchung/prismaHelper.js");
const hosoungtuyen_dichvu_js_1 = require("../hosoungtuyen/hosoungtuyen.dichvu.js");
const prisma_js_1 = require("../../cauhinh/prisma.js");
const thongbao_helper_js_1 = require("../thongbao/thongbao.helper.js");
const lichphongvan_mohinh_js_1 = require("./lichphongvan.mohinh.js");
function id(value) {
    return String(value?._id ?? value?.id ?? value ?? '');
}
async function hydrateLich(rows) {
    const ids = [...new Set(rows.map(row => id(row.maHoSoUngTuyen)).filter(Boolean))];
    const hoSoRows = ids.length ? await prisma_js_1.prisma.hoSoUngTuyen.findMany({ where: { id: { in: ids } } }) : [];
    const hoSoDayDu = await (0, hosoungtuyen_dichvu_js_1.hydrateHoSoUngTuyenNoiBo)(hoSoRows);
    const hoSoMap = new Map(hoSoDayDu.map(row => [row.id, row]));
    return rows.map(row => (0, prismaHelper_js_1.coId)({ ...row, maHoSoUngTuyen: hoSoMap.get(id(row.maHoSoUngTuyen)) ?? row.maHoSoUngTuyen }));
}
function chuanHoaLich(taiLieu) {
    const duLieu = taiLieu ?? {};
    const ungTuyen = duLieu.maHoSoUngTuyen;
    const tin = ungTuyen?.maTinTuyenDung;
    const ungVien = ungTuyen?.maUngVien;
    return {
        id: String(duLieu.id ?? duLieu._id),
        _id: String(duLieu.id ?? duLieu._id),
        maHoSoUngTuyen: ungTuyen?._id ? String(ungTuyen._id) : String(ungTuyen),
        hoSoUngTuyen: ungTuyen?._id
            ? {
                id: String(ungTuyen._id),
                maUngVien: ungVien?._id ? String(ungVien._id) : ungVien ? String(ungVien) : undefined,
                maTinTuyenDung: tin?._id ? String(tin._id) : tin ? String(tin) : undefined,
                trangThai: ungTuyen.trangThai,
                ungVien: ungVien?._id
                    ? {
                        id: String(ungVien._id),
                        viTriMongMuon: ungVien.viTriMongMuon,
                        kinhNghiem: ungVien.kinhNghiem,
                        nguoiDung: ungVien.maNguoiDung?._id
                            ? {
                                id: String(ungVien.maNguoiDung._id),
                                hoTen: ungVien.maNguoiDung.hoTen,
                                email: ungVien.maNguoiDung.email,
                                soDienThoai: ungVien.maNguoiDung.soDienThoai,
                            }
                            : undefined,
                    }
                    : undefined,
                tinTuyenDung: tin?._id
                    ? {
                        id: String(tin._id),
                        tieuDe: tin.tieuDe,
                        nhaTuyenDung: tin.maNhaTuyenDung?._id
                            ? { id: String(tin.maNhaTuyenDung._id), tenCongTy: tin.maNhaTuyenDung.tenCongTy }
                            : undefined,
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
async function layDayDu(where, many = false) {
    const rows = many
        ? await lichphongvan_mohinh_js_1.LichPhongVan.findMany({ where, orderBy: { thoiGianBatDau: 'asc' }, take: 300 })
        : await lichphongvan_mohinh_js_1.LichPhongVan.findMany({ where, take: 1 });
    const hydrated = await hydrateLich(rows);
    return many ? hydrated : hydrated[0];
}
async function guiThongBaoMoiPhongVanTuHoSo(hoSo, lich, duLieu) {
    const ungVien = hoSo?.maUngVien;
    const tin = hoSo?.maTinTuyenDung;
    if (!ungVien || !tin)
        return;
    await (0, thongbao_helper_js_1.thongBaoMoiPhongVan)({
        maUngVien: String(ungVien.maNguoiDung?._id ?? ungVien.maNguoiDung ?? ungVien._id),
        tenCongTy: tin.maNhaTuyenDung?.tenCongTy || 'Công ty',
        viTriUngTuyen: tin.tieuDe || 'Vị trí tuyển dụng',
        thoiGian: duLieu.thoiGianBatDau,
        diaChi: duLieu.diaChi || 'Chưa xác định',
        maLichPhongVan: id(lich),
    });
}
exports.dichVuLichPhongVan = {
    async layDanhSach() {
        const danhSach = await layDayDu({}, true);
        return danhSach.map(chuanHoaLich);
    },
    async layTheoMa(ma) {
        const duLieu = await layDayDu({ id: ma });
        if (!duLieu)
            throw new loiungdung_js_1.LoiUngDung('Không tìm thấy lịch phỏng vấn', 404);
        return chuanHoaLich(duLieu);
    },
    async taoMoi(duLieu) {
        const ketQua = await lichphongvan_mohinh_js_1.LichPhongVan.create({ data: (0, prismaHelper_js_1.boUndefined)(duLieu) });
        const lichMoi = await this.layTheoMa(String(ketQua.id));
        try {
            const hoSo = await (0, hosoungtuyen_dichvu_js_1.layHoSoUngTuyenDayDuNoiBo)(duLieu.maHoSoUngTuyen);
            await guiThongBaoMoiPhongVanTuHoSo(hoSo, ketQua, duLieu);
        }
        catch (error) {
            console.error('Lỗi gửi thông báo mời phỏng vấn:', error);
        }
        return lichMoi;
    },
    async capNhat(ma, duLieu) {
        const lichCu = await lichphongvan_mohinh_js_1.LichPhongVan.findUnique({ where: { id: ma } });
        if (!lichCu)
            throw new loiungdung_js_1.LoiUngDung('Không tìm thấy lịch phỏng vấn để cập nhật', 404);
        const ketQua = await lichphongvan_mohinh_js_1.LichPhongVan.update({ where: { id: ma }, data: (0, prismaHelper_js_1.boUndefined)(duLieu) });
        const lichDayDu = await layDayDu({ id: ma });
        if (duLieu.thoiGianBatDau && lichCu.thoiGianBatDau.getTime() !== new Date(duLieu.thoiGianBatDau).getTime()) {
            try {
                const hoSo = await (0, hosoungtuyen_dichvu_js_1.layHoSoUngTuyenDayDuNoiBo)(lichCu.maHoSoUngTuyen);
                const tin = hoSo?.maTinTuyenDung;
                const ungVien = hoSo?.maUngVien;
                if (ungVien && tin) {
                    await (0, thongbao_helper_js_1.thongBaoLichPhongVanThayDoi)({
                        maUngVien: String(ungVien.maNguoiDung?._id ?? ungVien.maNguoiDung ?? ungVien._id),
                        tenCongTy: tin.maNhaTuyenDung?.tenCongTy || 'Công ty',
                        viTriUngTuyen: tin.tieuDe || 'Vị trí tuyển dụng',
                        thoiGianMoi: duLieu.thoiGianBatDau,
                        lyDo: duLieu.ghiChu,
                        maLichPhongVan: ma,
                    });
                }
            }
            catch (error) {
                console.error('Lỗi gửi thông báo thay đổi lịch:', error);
            }
        }
        if (String(duLieu.trangThai ?? '') && String(duLieu.trangThai) !== String(lichCu.trangThai ?? '')) {
            try {
                const hoSo = await (0, hosoungtuyen_dichvu_js_1.layHoSoUngTuyenDayDuNoiBo)(lichCu.maHoSoUngTuyen);
                const tin = hoSo?.maTinTuyenDung;
                const ungVien = hoSo?.maUngVien;
                const maNguoiDungUngVien = String(ungVien?.maNguoiDung?._id ?? ungVien?.maNguoiDung ?? '');
                const maNguoiDungNhaTuyenDung = String(tin?.maNhaTuyenDung?.maNguoiDung ?? '');
                const tenUngVien = ungVien?.maNguoiDung?.hoTen ?? 'Ứng viên';
                const viTriUngTuyen = tin?.tieuDe || 'Vị trí tuyển dụng';
                if (duLieu.trangThai === 'da_xac_nhan' && maNguoiDungNhaTuyenDung) {
                    await (0, thongbao_helper_js_1.thongBaoUngVienChapNhanLich)({ maNhaTuyenDung: maNguoiDungNhaTuyenDung, tenUngVien, viTriUngTuyen, thoiGian: ketQua.thoiGianBatDau, maLichPhongVan: ma });
                }
                if (duLieu.trangThai === 'da_huy' && maNguoiDungNhaTuyenDung) {
                    await (0, thongbao_helper_js_1.thongBaoUngVienTuChoiLich)({ maNhaTuyenDung: maNguoiDungNhaTuyenDung, tenUngVien, viTriUngTuyen, lyDo: duLieu.ghiChu, maLichPhongVan: ma });
                }
                if (duLieu.trangThai === 'hoan_thanh' && duLieu.ketQua && maNguoiDungUngVien) {
                    await (0, thongbao_helper_js_1.thongBaoKetQuaPhongVan)({ maUngVien: maNguoiDungUngVien, tenCongTy: tin?.maNhaTuyenDung?.tenCongTy || 'Công ty', viTriUngTuyen, ketQua: duLieu.ketQua, ghiChu: duLieu.ghiChu, maLichPhongVan: ma });
                }
            }
            catch (error) {
                console.error('Lỗi gửi thông báo cập nhật lịch:', error);
            }
        }
        return chuanHoaLich(lichDayDu);
    },
    async xoa(ma) {
        const ketQua = await layDayDu({ id: ma });
        if (!ketQua)
            throw new loiungdung_js_1.LoiUngDung('Không tìm thấy lịch phỏng vấn để xóa', 404);
        await lichphongvan_mohinh_js_1.LichPhongVan.delete({ where: { id: ma } });
        return chuanHoaLich(ketQua);
    },
};
async function layLichPhongVanDayDuNoiBo(ma) {
    return layDayDu({ id: ma });
}
