"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dichVuUngVien = void 0;
const loiungdung_js_1 = require("../../dungchung/loiungdung.js");
const prismaHelper_js_1 = require("../../dungchung/prismaHelper.js");
const prisma_js_1 = require("../../cauhinh/prisma.js");
const ungvien_mohinh_js_1 = require("./ungvien.mohinh.js");
function chuanHoaUngVien(taiLieu) {
    const duLieu = taiLieu ?? {};
    return {
        id: String(duLieu.id ?? duLieu._id),
        _id: String(duLieu.id ?? duLieu._id),
        maNguoiDung: duLieu.maNguoiDung?._id ? String(duLieu.maNguoiDung._id) : String(duLieu.maNguoiDung),
        nguoiDung: duLieu.maNguoiDung?._id
            ? {
                id: String(duLieu.maNguoiDung._id),
                hoTen: duLieu.maNguoiDung.hoTen,
                email: duLieu.maNguoiDung.email,
                soDienThoai: duLieu.maNguoiDung.soDienThoai,
                trangThai: duLieu.maNguoiDung.trangThai,
            }
            : undefined,
        ngaySinh: duLieu.ngaySinh,
        gioiTinh: duLieu.gioiTinh,
        diaChi: duLieu.diaChi,
        anhDaiDien: duLieu.anhDaiDien,
        tomTat: duLieu.tomTat,
        kinhNghiem: duLieu.kinhNghiem,
        viTriMongMuon: duLieu.viTriMongMuon,
        mucLuongMongMuon: duLieu.mucLuongMongMuon,
        // ✅ Lấy từ bảng quan hệ UngVienKyNang
        kyNang: (duLieu.kyNangLienKet ?? []).map((lienKet) => ({
            maKyNang: String(lienKet.kyNang?.id ?? lienKet.maKyNang),
            tenKyNang: lienKet.kyNang?.tenKyNang,
            loaiKyNang: lienKet.kyNang?.loaiKyNang,
            mucDo: lienKet.mucDo,
            soNamKinhNghiem: lienKet.soNamKinhNghiem,
        })),
        ngayTao: duLieu.ngayTao,
        ngayCapNhat: duLieu.ngayCapNhat,
    };
}
async function layDayDu(where, many = false) {
    // ✅ Query với include để lấy relations
    const rows = many
        ? await ungvien_mohinh_js_1.UngVien.findMany({
            where,
            orderBy: { ngayTao: 'desc' },
            take: 200,
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
        : await ungvien_mohinh_js_1.UngVien.findMany({
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
    // Hydrate NguoiDung
    const hydrated = await (0, prismaHelper_js_1.ganNguoiDungChoUngVien)(rows);
    return many ? hydrated : hydrated[0];
}
exports.dichVuUngVien = {
    async layDanhSach() {
        const danhSach = await layDayDu({}, true);
        return danhSach.map(chuanHoaUngVien);
    },
    async layTheoMa(ma) {
        const duLieu = await layDayDu({ id: ma });
        if (!duLieu)
            throw new loiungdung_js_1.LoiUngDung('Không tìm thấy hồ sơ ứng viên', 404);
        return chuanHoaUngVien(duLieu);
    },
    async layTheoMaNguoiDung(maNguoiDung) {
        const duLieu = await layDayDu({ maNguoiDung });
        if (!duLieu)
            throw new loiungdung_js_1.LoiUngDung('Không tìm thấy hồ sơ ứng viên', 404);
        return chuanHoaUngVien(duLieu);
    },
    async damBaoHoSoTheoNguoiDung(maNguoiDung) {
        const hienTai = await ungvien_mohinh_js_1.UngVien.findUnique({
            where: { maNguoiDung },
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
        if (hienTai) {
            const [dayDu] = await (0, prismaHelper_js_1.ganNguoiDungChoUngVien)([hienTai]);
            return chuanHoaUngVien(dayDu);
        }
        const daTao = await ungvien_mohinh_js_1.UngVien.create({ data: { maNguoiDung, kinhNghiem: 0 } });
        const [dayDu] = await (0, prismaHelper_js_1.ganNguoiDungChoUngVien)([daTao]);
        return chuanHoaUngVien(dayDu);
    },
    async taoMoi(duLieu) {
        const payload = duLieu;
        const { kyNang, ...ungVienData } = payload;
        // Tạo ứng viên
        const ketQua = await ungvien_mohinh_js_1.UngVien.create({ data: (0, prismaHelper_js_1.boUndefined)(ungVienData) });
        // Tạo kỹ năng nếu có
        if (Array.isArray(kyNang) && kyNang.length > 0) {
            const kyNangData = kyNang
                .map(item => ({
                maUngVien: ketQua.id,
                maKyNang: String(item?.maKyNang?.id ?? item?.maKyNang),
                mucDo: item?.mucDo != null ? Number(item.mucDo) : null,
                soNamKinhNghiem: item?.soNamKinhNghiem != null ? Number(item.soNamKinhNghiem) : null,
            }))
                .filter(item => item.maKyNang);
            if (kyNangData.length > 0) {
                await prisma_js_1.prisma.ungVienKyNang.createMany({
                    data: kyNangData,
                    skipDuplicates: true
                });
            }
        }
        return this.layTheoMa(String(ketQua.id));
    },
    async capNhat(ma, duLieu, maNguoiDungHienTai) {
        const hienTai = await ungvien_mohinh_js_1.UngVien.findUnique({ where: { id: ma } });
        if (!hienTai)
            throw new loiungdung_js_1.LoiUngDung('Không tìm thấy hồ sơ ứng viên', 404);
        if (maNguoiDungHienTai && String(hienTai.maNguoiDung) !== maNguoiDungHienTai) {
            throw new loiungdung_js_1.LoiUngDung('Bạn không có quyền cập nhật hồ sơ này', 403);
        }
        const payload = duLieu;
        const { kyNang, ...ungVienData } = payload;
        // Cập nhật ứng viên
        await ungvien_mohinh_js_1.UngVien.update({ where: { id: ma }, data: (0, prismaHelper_js_1.boUndefined)(ungVienData) });
        // Cập nhật kỹ năng nếu có
        if (kyNang !== undefined) {
            // Xóa kỹ năng cũ
            await prisma_js_1.prisma.ungVienKyNang.deleteMany({ where: { maUngVien: ma } });
            // Thêm kỹ năng mới
            if (Array.isArray(kyNang) && kyNang.length > 0) {
                const kyNangData = kyNang
                    .map(item => ({
                    maUngVien: ma,
                    maKyNang: String(item?.maKyNang?.id ?? item?.maKyNang),
                    mucDo: item?.mucDo != null ? Number(item.mucDo) : null,
                    soNamKinhNghiem: item?.soNamKinhNghiem != null ? Number(item.soNamKinhNghiem) : null,
                }))
                    .filter(item => item.maKyNang);
                if (kyNangData.length > 0) {
                    await prisma_js_1.prisma.ungVienKyNang.createMany({
                        data: kyNangData,
                        skipDuplicates: true
                    });
                }
            }
        }
        return this.layTheoMa(ma);
    },
    async xoa(ma, maNguoiDungHienTai) {
        const hienTai = await ungvien_mohinh_js_1.UngVien.findUnique({ where: { id: ma } });
        if (!hienTai)
            throw new loiungdung_js_1.LoiUngDung('Không tìm thấy hồ sơ ứng viên', 404);
        if (maNguoiDungHienTai && String(hienTai.maNguoiDung) !== maNguoiDungHienTai) {
            throw new loiungdung_js_1.LoiUngDung('Bạn không có quyền xóa hồ sơ này', 403);
        }
        await ungvien_mohinh_js_1.UngVien.delete({ where: { id: ma } });
        return chuanHoaUngVien((0, prismaHelper_js_1.coId)(hienTai));
    },
};
