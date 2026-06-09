"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dichVuHoSoUngTuyen = void 0;
exports.hydrateHoSoUngTuyenNoiBo = hydrateHoSoUngTuyenNoiBo;
exports.layHoSoUngTuyenDayDuNoiBo = layHoSoUngTuyenDayDuNoiBo;
const loiungdung_js_1 = require("../../dungchung/loiungdung.js");
const prismaHelper_js_1 = require("../../dungchung/prismaHelper.js");
const prisma_js_1 = require("../../cauhinh/prisma.js");
const thongbao_helper_js_1 = require("../thongbao/thongbao.helper.js");
const hosoungtuyen_mohinh_js_1 = require("./hosoungtuyen.mohinh.js");
async function hydrateUngTuyen(rows) {
    const ungVienIds = [...new Set(rows.map(row => row.maUngVien).filter(Boolean))];
    const tinIds = [...new Set(rows.map(row => row.maTinTuyenDung).filter(Boolean))];
    const hoSoIds = [...new Set(rows.map(row => row.maHoSoNangLuc).filter(Boolean))];
    const [ungVienRows, tinRows, hoSoRows] = await Promise.all([
        prisma_js_1.prisma.ungVien.findMany({ where: { id: { in: ungVienIds } } }),
        prisma_js_1.prisma.tinTuyenDung.findMany({ where: { id: { in: tinIds } } }),
        hoSoIds.length ? prisma_js_1.prisma.hoSoNangLuc.findMany({ where: { id: { in: hoSoIds } } }) : Promise.resolve([]),
    ]);
    const [ungVienDayDu, tinDayDu] = await Promise.all([
        (0, prismaHelper_js_1.ganNguoiDungChoUngVien)(ungVienRows),
        (0, prismaHelper_js_1.ganCongTyChoTin)(tinRows),
    ]);
    const ungVienMap = new Map(ungVienDayDu.map(row => [row.id, (0, prismaHelper_js_1.coId)(row)]));
    const tinMap = new Map(tinDayDu.map(row => [row.id, (0, prismaHelper_js_1.coId)(row)]));
    const hoSoMap = new Map(hoSoRows.map(row => [row.id, (0, prismaHelper_js_1.coId)(row)]));
    return rows.map(row => (0, prismaHelper_js_1.coId)({
        ...row,
        maUngVien: ungVienMap.get(row.maUngVien) ?? row.maUngVien,
        maTinTuyenDung: tinMap.get(row.maTinTuyenDung) ?? row.maTinTuyenDung,
        maHoSoNangLuc: row.maHoSoNangLuc ? (hoSoMap.get(row.maHoSoNangLuc) ?? row.maHoSoNangLuc) : null,
    }));
}
async function hydrateHoSoUngTuyenNoiBo(rows) {
    return hydrateUngTuyen(rows);
}
function chuanHoaUngTuyen(taiLieu) {
    const duLieu = taiLieu ?? {};
    const tin = duLieu.maTinTuyenDung;
    return {
        id: String(duLieu.id ?? duLieu._id),
        _id: String(duLieu.id ?? duLieu._id),
        maUngVien: duLieu.maUngVien?._id ? String(duLieu.maUngVien._id) : String(duLieu.maUngVien),
        maTinTuyenDung: tin?._id ? String(tin._id) : String(tin),
        maHoSoNangLuc: duLieu.maHoSoNangLuc?._id ? String(duLieu.maHoSoNangLuc._id) : duLieu.maHoSoNangLuc ? String(duLieu.maHoSoNangLuc) : undefined,
        tinTuyenDung: tin?._id
            ? {
                id: String(tin._id),
                tieuDe: tin.tieuDe,
                diaChi: tin.diaChi,
                luongMin: tin.luongMin,
                luongMax: tin.luongMax,
                capBac: tin.capBac,
                loaiHinh: tin.loaiHinh,
                trangThai: tin.trangThai,
                nhaTuyenDung: tin.maNhaTuyenDung?._id
                    ? {
                        id: String(tin.maNhaTuyenDung._id),
                        maNguoiDung: tin.maNhaTuyenDung.maNguoiDung ? String(tin.maNhaTuyenDung.maNguoiDung) : undefined,
                        tenCongTy: tin.maNhaTuyenDung.tenCongTy,
                        logo: tin.maNhaTuyenDung.logo,
                    }
                    : undefined,
            }
            : undefined,
        ungVien: duLieu.maUngVien?._id
            ? {
                id: String(duLieu.maUngVien._id),
                viTriMongMuon: duLieu.maUngVien.viTriMongMuon,
                kinhNghiem: duLieu.maUngVien.kinhNghiem,
                diaChi: duLieu.maUngVien.diaChi,
                mucLuongMongMuon: duLieu.maUngVien.mucLuongMongMuon,
                tomTat: duLieu.maUngVien.tomTat,
                nguoiDung: duLieu.maUngVien.maNguoiDung?._id
                    ? {
                        id: String(duLieu.maUngVien.maNguoiDung._id),
                        hoTen: duLieu.maUngVien.maNguoiDung.hoTen,
                        email: duLieu.maUngVien.maNguoiDung.email,
                        soDienThoai: duLieu.maUngVien.maNguoiDung.soDienThoai,
                    }
                    : undefined,
            }
            : undefined,
        hoSoNangLuc: duLieu.maHoSoNangLuc?._id
            ? {
                id: String(duLieu.maHoSoNangLuc._id),
                tieuDe: duLieu.maHoSoNangLuc.tieuDe,
                loaiHoSo: duLieu.maHoSoNangLuc.loaiHoSo,
                cvChinh: duLieu.maHoSoNangLuc.cvChinh,
                congKhai: duLieu.maHoSoNangLuc.congKhai,
                hoTenHienThi: duLieu.maHoSoNangLuc.hoTenHienThi,
                chucDanh: duLieu.maHoSoNangLuc.chucDanh,
                soDienThoai: duLieu.maHoSoNangLuc.soDienThoai,
                emailLienHe: duLieu.maHoSoNangLuc.emailLienHe,
                facebook: duLieu.maHoSoNangLuc.facebook,
                github: duLieu.maHoSoNangLuc.github,
                portfolioUrl: duLieu.maHoSoNangLuc.portfolioUrl,
                diaDiem: duLieu.maHoSoNangLuc.diaDiem,
                tomTatKinhNghiem: duLieu.maHoSoNangLuc.tomTatKinhNghiem,
                kyNangMem: duLieu.maHoSoNangLuc.kyNangMem,
                kyNangLapTrinh: duLieu.maHoSoNangLuc.kyNangLapTrinh,
                hocVan: duLieu.maHoSoNangLuc.hocVan,
                kinhNghiemLam: duLieu.maHoSoNangLuc.kinhNghiemLam,
                chungChi: duLieu.maHoSoNangLuc.chungChi,
                duAn: duLieu.maHoSoNangLuc.duAn,
                baiVietKyThuat: duLieu.maHoSoNangLuc.baiVietKyThuat,
                duAnChiTiet: duLieu.maHoSoNangLuc.duAnChiTiet,
                fileCvTen: duLieu.maHoSoNangLuc.fileCvTen,
                fileCvLoai: duLieu.maHoSoNangLuc.fileCvLoai,
                fileCvData: duLieu.maHoSoNangLuc.fileCvData,
                fileCvText: duLieu.maHoSoNangLuc.fileCvText,
                anhDaiDien: duLieu.maHoSoNangLuc.anhDaiDien,
                templateCv: duLieu.maHoSoNangLuc.templateCv,
                mauChinh: duLieu.maHoSoNangLuc.mauChinh,
                mauPhu: duLieu.maHoSoNangLuc.mauPhu,
                font: duLieu.maHoSoNangLuc.font,
                ngayCapNhat: duLieu.maHoSoNangLuc.ngayCapNhat,
            }
            : undefined,
        thuXinViec: duLieu.thuXinViec,
        diemKhopKyNang: duLieu.diemKhopKyNang,
        trangThai: duLieu.trangThai,
        ngayNop: duLieu.ngayNop,
        ngayTao: duLieu.ngayTao,
        ngayCapNhat: duLieu.ngayCapNhat,
    };
}
async function layDayDu(where, many = false) {
    const rows = many
        ? await hosoungtuyen_mohinh_js_1.HoSoUngTuyen.findMany({ where, orderBy: { ngayNop: 'desc' }, take: 300 })
        : await hosoungtuyen_mohinh_js_1.HoSoUngTuyen.findMany({ where, take: 1 });
    const hydrated = await hydrateUngTuyen(rows);
    return many ? hydrated : hydrated[0];
}
exports.dichVuHoSoUngTuyen = {
    async layDanhSach() {
        const danhSach = await layDayDu({}, true);
        return danhSach.map(chuanHoaUngTuyen);
    },
    async layTheoMa(ma) {
        const duLieu = await layDayDu({ id: ma });
        if (!duLieu)
            throw new loiungdung_js_1.LoiUngDung('Không tìm thấy hồ sơ ứng tuyển', 404);
        return chuanHoaUngTuyen(duLieu);
    },
    async taoMoi(duLieu) {
        try {
            const ketQua = await hosoungtuyen_mohinh_js_1.HoSoUngTuyen.create({ data: (0, prismaHelper_js_1.boUndefined)(duLieu) });
            const hoSoMoi = await this.layTheoMa(String(ketQua.id));
            try {
                const maNguoiDungNhaTuyenDung = String(hoSoMoi.tinTuyenDung?.nhaTuyenDung?.maNguoiDung ?? '');
                if (maNguoiDungNhaTuyenDung) {
                    await (0, thongbao_helper_js_1.thongBaoHoSoMoiUngTuyen)({
                        maNhaTuyenDung: maNguoiDungNhaTuyenDung,
                        tenUngVien: hoSoMoi.ungVien?.nguoiDung?.hoTen ?? 'Ứng viên',
                        viTriUngTuyen: hoSoMoi.tinTuyenDung?.tieuDe ?? 'Vị trí ứng tuyển',
                        maHoSoUngTuyen: hoSoMoi.id,
                        kinhNghiem: `${hoSoMoi.ungVien?.kinhNghiem ?? 0} nam kinh nghiem`,
                    });
                }
            }
            catch (error) {
                console.error('Lỗi gửi thông báo hồ sơ mới:', error);
            }
            return hoSoMoi;
        }
        catch (loi) {
            if (loi?.code === 'P2002')
                throw new loiungdung_js_1.LoiUngDung('Bạn đã ứng tuyển tin này', 409);
            throw loi;
        }
    },
    async capNhat(ma, duLieu) {
        const truocKhiCapNhat = await layDayDu({ id: ma });
        if (!truocKhiCapNhat)
            throw new loiungdung_js_1.LoiUngDung('Không tìm thấy hồ sơ ứng tuyển để cập nhật', 404);
        await hosoungtuyen_mohinh_js_1.HoSoUngTuyen.update({ where: { id: ma }, data: (0, prismaHelper_js_1.boUndefined)(duLieu) });
        const ketQuaChuanHoa = await this.layTheoMa(ma);
        try {
            const trangThaiCu = String(truocKhiCapNhat?.trangThai ?? '');
            const trangThaiMoi = String(ketQuaChuanHoa.trangThai ?? '');
            const maNguoiDungUngVien = ketQuaChuanHoa.ungVien?.nguoiDung?.id;
            const tenCongTy = ketQuaChuanHoa.tinTuyenDung?.nhaTuyenDung?.tenCongTy ?? 'Cong ty';
            const viTriUngTuyen = ketQuaChuanHoa.tinTuyenDung?.tieuDe ?? 'Vị trí ứng tuyển';
            if (trangThaiCu !== 'da_xem' && trangThaiMoi === 'da_xem' && maNguoiDungUngVien) {
                await (0, thongbao_helper_js_1.thongBaoHoSoDuocXem)({ maUngVien: maNguoiDungUngVien, tenCongTy, viTriUngTuyen, maHoSoUngTuyen: ketQuaChuanHoa.id });
            }
            if (trangThaiCu !== trangThaiMoi && ['dat', 'tu_choi'].includes(trangThaiMoi) && maNguoiDungUngVien) {
                await (0, thongbao_helper_js_1.thongBaoHeThong)({
                    maNguoiDung: maNguoiDungUngVien,
                    tieuDe: trangThaiMoi === 'dat' ? 'Hồ sơ ứng tuyển đã đạt' : 'Hồ sơ ứng tuyển bị từ chối',
                    noiDung: `${tenCongTy} đã cập nhật kết quả hồ sơ ứng tuyển vị trí ${viTriUngTuyen}: ${trangThaiMoi === 'dat' ? 'Đạt' : 'Từ chối'}.`,
                    lienKet: '/ung-vien/ung-tuyen',
                    mucDoUuTien: 'cao',
                });
            }
        }
        catch (error) {
            console.error('Lỗi gửi thông báo cập nhật hồ sơ ứng tuyển:', error);
        }
        return ketQuaChuanHoa;
    },
    async xoa(ma) {
        const hienTai = await layDayDu({ id: ma });
        if (!hienTai)
            throw new loiungdung_js_1.LoiUngDung('Không tìm thấy hồ sơ ứng tuyển để xóa', 404);
        await hosoungtuyen_mohinh_js_1.HoSoUngTuyen.delete({ where: { id: ma } });
        return chuanHoaUngTuyen(hienTai);
    },
};
async function layHoSoUngTuyenDayDuNoiBo(ma) {
    return layDayDu({ id: ma });
}
