"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dichVuTinTuyenDung = void 0;
const loiungdung_js_1 = require("../../dungchung/loiungdung.js");
const prismaHelper_js_1 = require("../../dungchung/prismaHelper.js");
const prisma_js_1 = require("../../cauhinh/prisma.js");
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
        // ✅ Lấy từ bảng quan hệ TinTuyenDungKyNang
        kyNang: (duLieu.kyNangLienKet ?? []).map((lienKet) => ({
            maKyNang: String(lienKet.kyNang?.id ?? lienKet.maKyNang),
            tenKyNang: lienKet.kyNang?.tenKyNang,
            loaiKyNang: lienKet.kyNang?.loaiKyNang,
            batBuoc: lienKet.batBuoc,
            mucDo: lienKet.mucDo,
            trongSo: lienKet.trongSo,
        })),
        ngayTao: duLieu.ngayTao,
        ngayCapNhat: duLieu.ngayCapNhat,
    };
}
async function layDayDu(where, many = false) {
    const rows = many
        ? await tintuyendung_mohinh_js_1.TinTuyenDung.findMany({
            where,
            orderBy: { ngayTao: 'desc' },
            take: 300,
            include: {
                kyNangLienKet: {
                    include: {
                        kyNang: {
                            select: { id: true, tenKyNang: true, loaiKyNang: true }
                        }
                    }
                }
            }
        })
        : await tintuyendung_mohinh_js_1.TinTuyenDung.findMany({
            where,
            take: 1,
            include: {
                kyNangLienKet: {
                    include: {
                        kyNang: {
                            select: { id: true, tenKyNang: true, loaiKyNang: true }
                        }
                    }
                }
            }
        });
    const hydrated = await (0, prismaHelper_js_1.ganCongTyChoTin)(rows);
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
        const payload = duLieu;
        const { kyNang, ...tinData } = payload;
        // Tạo tin tuyển dụng
        const ketQua = await tintuyendung_mohinh_js_1.TinTuyenDung.create({ data: (0, prismaHelper_js_1.boUndefined)(tinData) });
        // Tạo kỹ năng nếu có
        if (Array.isArray(kyNang) && kyNang.length > 0) {
            const kyNangData = kyNang
                .map(item => ({
                maTinTuyenDung: ketQua.id,
                maKyNang: String(item?.maKyNang?.id ?? item?.maKyNang),
                batBuoc: Boolean(item?.batBuoc),
                mucDo: item?.mucDo != null ? Number(item.mucDo) : null,
                trongSo: item?.trongSo != null ? Number(item.trongSo) : (item?.batBuoc ? 1 : 0.5),
            }))
                .filter(item => item.maKyNang);
            if (kyNangData.length > 0) {
                await prisma_js_1.prisma.tinTuyenDungKyNang.createMany({
                    data: kyNangData,
                    skipDuplicates: true
                });
            }
        }
        const dayDu = await layDayDu({ id: ketQua.id });
        if (dayDu?.trangThai === 'cho_duyet')
            await guiThongBaoAdminTinCanDuyet(dayDu);
        return chuanHoaTin(dayDu);
    },
    async capNhat(ma, duLieuNhan) {
        const duLieu = duLieuNhan;
        const hienTai = await layDayDu({ id: ma });
        if (!hienTai)
            throw new loiungdung_js_1.LoiUngDung('Không tìm thấy tin tuyển dụng để cập nhật', 404);
        const { kyNang, ...tinData } = duLieu;
        const duLieuCapNhat = {
            ...tinData,
            ...(tinData.trangThai === 'dang_mo' ? { ngayDang: new Date() } : {}),
        };
        // Cập nhật tin tuyển dụng
        await tintuyendung_mohinh_js_1.TinTuyenDung.update({ where: { id: ma }, data: (0, prismaHelper_js_1.boUndefined)(duLieuCapNhat) });
        // Cập nhật kỹ năng nếu có
        if (kyNang !== undefined) {
            // Xóa kỹ năng cũ
            await prisma_js_1.prisma.tinTuyenDungKyNang.deleteMany({ where: { maTinTuyenDung: ma } });
            // Thêm kỹ năng mới
            if (Array.isArray(kyNang) && kyNang.length > 0) {
                const kyNangData = kyNang
                    .map(item => ({
                    maTinTuyenDung: ma,
                    maKyNang: String(item?.maKyNang?.id ?? item?.maKyNang),
                    batBuoc: Boolean(item?.batBuoc),
                    mucDo: item?.mucDo != null ? Number(item.mucDo) : null,
                    trongSo: item?.trongSo != null ? Number(item.trongSo) : (item?.batBuoc ? 1 : 0.5),
                }))
                    .filter(item => item.maKyNang);
                if (kyNangData.length > 0) {
                    await prisma_js_1.prisma.tinTuyenDungKyNang.createMany({
                        data: kyNangData,
                        skipDuplicates: true
                    });
                }
            }
        }
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
            throw new loiungdung_js_1.LoiUngDung('Không tìm thấy tin tuyển dụng để xóa', 404);
        await tintuyendung_mohinh_js_1.TinTuyenDung.delete({ where: { id: ma } });
        return chuanHoaTin((0, prismaHelper_js_1.coId)(hienTai));
    },
};
