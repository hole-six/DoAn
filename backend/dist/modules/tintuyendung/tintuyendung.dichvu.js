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
function daHetHan(hanNop) {
    if (!hanNop)
        return false;
    return new Date(hanNop).getTime() < Date.now();
}
async function dongBoTinHetHan(where = {}) {
    await tintuyendung_mohinh_js_1.TinTuyenDung.updateMany({
        where: {
            ...where,
            trangThai: { in: ['dang_mo', 'tam_dong'] },
            hanNop: { not: null, lt: new Date() },
        },
        data: { trangThai: 'het_han' },
    });
}
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
    const congTy = duLieu.nhaTuyenDung ?? (duLieu.maNhaTuyenDung?._id ? duLieu.maNhaTuyenDung : null);
    return {
        id: String(duLieu.id ?? duLieu._id),
        _id: String(duLieu.id ?? duLieu._id),
        maNhaTuyenDung: String(congTy?._id ?? congTy?.id ?? duLieu.maNhaTuyenDung),
        nhaTuyenDung: congTy
            ? {
                id: String(congTy._id ?? congTy.id),
                tenCongTy: congTy.tenCongTy,
                logo: congTy.logo,
                trangThaiDuyet: congTy.trangThaiDuyet,
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
const INCLUDE_KY_NANG = {
    kyNangLienKet: {
        include: {
            kyNang: { select: { id: true, tenKyNang: true, loaiKyNang: true } },
        },
    },
};
const INCLUDE_TIN_DAY_DU = {
    ...INCLUDE_KY_NANG,
    nhaTuyenDung: {
        select: {
            id: true,
            maNguoiDung: true,
            tenCongTy: true,
            logo: true,
            trangThaiDuyet: true,
        },
    },
};
function ganCongTyTuRelation(row) {
    if (!row?.nhaTuyenDung)
        return row;
    return {
        ...row,
        _id: row.id,
        maNhaTuyenDung: { ...row.nhaTuyenDung, _id: row.nhaTuyenDung.id },
    };
}
async function layDayDu(where, many = false, options = {}) {
    const rows = many
        ? await tintuyendung_mohinh_js_1.TinTuyenDung.findMany({
            where,
            orderBy: { ngayTao: 'desc' },
            skip: options.skip ?? 0,
            take: options.take ?? 500,
            include: INCLUDE_TIN_DAY_DU,
        })
        : await tintuyendung_mohinh_js_1.TinTuyenDung.findMany({ where, take: 1, include: INCLUDE_TIN_DAY_DU });
    const hydrated = rows.map(ganCongTyTuRelation);
    return many ? hydrated : hydrated[0];
}
async function demTong(where) {
    return tintuyendung_mohinh_js_1.TinTuyenDung.count({ where });
}
function tachDanhSach(value) {
    if (Array.isArray(value))
        return value.flatMap(tachDanhSach);
    return String(value ?? '')
        .split(',')
        .map(item => item.trim())
        .filter(Boolean);
}
function taoDieuKienTimKiem(tuKhoa) {
    if (!tuKhoa)
        return undefined;
    const chua = { contains: tuKhoa, mode: 'insensitive' };
    return [
        { tieuDe: chua },
        { diaChi: chua },
        { capBac: chua },
        { loaiHinh: chua },
        { yeuCauKinhNghiem: chua },
        { moTa: chua },
        { yeuCau: chua },
        { quyenLoi: chua },
        { nhaTuyenDung: { tenCongTy: chua } },
        { kyNangLienKet: { some: { kyNang: { tenKyNang: chua } } } },
        { kyNangLienKet: { some: { kyNang: { loaiKyNang: chua } } } },
    ];
}
exports.dichVuTinTuyenDung = {
    async layDanhSach(boLoc = {}) {
        await dongBoTinHetHan();
        const cheDo = String(boLoc.cheDo ?? 'admin');
        const maNhaTuyenDungSoHuu = String(boLoc.maNhaTuyenDungSoHuu ?? '');
        const trang = (0, timkiem_js_1.layLimit)(boLoc.trang, 1, 1_000_000);
        const kichThuocTrang = (0, timkiem_js_1.layLimit)(boLoc.kichThuocTrang ?? boLoc.limit, 12, 50);
        const tuKhoa = String(boLoc.tuKhoa ?? '').trim();
        const capBac = tachDanhSach(boLoc.capBac);
        const loaiHinh = tachDanhSach(boLoc.loaiHinh);
        const kyNang = tachDanhSach(boLoc.kyNang);
        const loaiKyNang = tachDanhSach(boLoc.loaiKyNang ?? boLoc.loai);
        // Xây dựng where clause theo vai trò
        const where = {};
        if (cheDo === 'cong_khai') {
            where.trangThai = 'dang_mo';
            where.hanNop = { gte: new Date() };
            where.nhaTuyenDung = { trangThaiDuyet: 'da_duyet' };
        }
        else if (cheDo === 'nha_tuyen_dung') {
            if (!maNhaTuyenDungSoHuu)
                return { duLieu: [], tongSo: 0, trang: 1, kichThuocTrang, tongTrang: 0 };
            where.maNhaTuyenDung = maNhaTuyenDungSoHuu;
        }
        // admin: không filter gì thêm
        // Lấy toàn bộ để search + filter công ty đã duyệt (cần join)
        // Với search text phức tạp (tên kỹ năng, tên công ty), vẫn cần app-layer search
        // nhưng giới hạn pool tối đa 500 thay vì load không giới hạn
        if (capBac.length)
            where.capBac = { in: capBac };
        if (loaiHinh.length)
            where.loaiHinh = { in: loaiHinh };
        if (kyNang.length)
            where.kyNangLienKet = { some: { maKyNang: { in: kyNang } } };
        if (loaiKyNang.length) {
            where.kyNangLienKet = {
                some: {
                    ...(where.kyNangLienKet?.some ?? {}),
                    kyNang: { loaiKyNang: { in: loaiKyNang } },
                },
            };
        }
        const dieuKienTimKiem = taoDieuKienTimKiem(tuKhoa);
        if (dieuKienTimKiem)
            where.OR = dieuKienTimKiem;
        const skip = (trang - 1) * kichThuocTrang;
        const [tongSo, rows] = await Promise.all([
            demTong(where),
            tintuyendung_mohinh_js_1.TinTuyenDung.findMany({
                where,
                orderBy: { ngayTao: 'desc' },
                skip,
                take: kichThuocTrang,
                include: INCLUDE_TIN_DAY_DU,
            }),
        ]);
        const tongTrang = Math.max(1, Math.ceil(tongSo / kichThuocTrang));
        const duLieu = rows.map(ganCongTyTuRelation).map(chuanHoaTin);
        return { duLieu, tongSo, trang, kichThuocTrang, tongTrang };
        /* const tatCa = await layDayDu(where, true)
        const danhSachChuanHoa = (tatCa as any[]).map(chuanHoaTin).filter((item) => {
          if (cheDo === 'cong_khai') return item.nhaTuyenDung?.trangThaiDuyet === 'da_duyet'
          return true
        })
    
        // Search với ranking
        const daLoc = tuKhoa
          ? locVaXepHangTheoTuKhoa(danhSachChuanHoa, tuKhoa, item => [
              item.tieuDe,
              item.nhaTuyenDung?.tenCongTy,
              item.diaChi,
              item.capBac,
              item.loaiHinh,
              ...(item.kyNang ?? []).flatMap((ky: any) => [ky.tenKyNang, ky.loaiKyNang]),
            ])
          : danhSachChuanHoa
    
        const tongSo = daLoc.length
        const tongTrang = Math.max(1, Math.ceil(tongSo / kichThuocTrang))
        const duLieu = daLoc.slice((trang - 1) * kichThuocTrang, trang * kichThuocTrang)
    
        return { duLieu, tongSo, trang, kichThuocTrang, tongTrang } */
    },
    async layTheoMa(ma) {
        await dongBoTinHetHan({ id: ma });
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
        await dongBoTinHetHan({ id: ketQua.id });
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
        await dongBoTinHetHan({ id: ma });
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
