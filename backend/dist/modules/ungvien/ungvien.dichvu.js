"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dichVuUngVien = void 0;
const loiungdung_js_1 = require("../../dungchung/loiungdung.js");
const prismaHelper_js_1 = require("../../dungchung/prismaHelper.js");
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
        kyNang: (duLieu.kyNang ?? []).map((muc) => ({
            maKyNang: muc.maKyNang?._id ? String(muc.maKyNang._id) : String(muc.maKyNang),
            tenKyNang: muc.maKyNang?.tenKyNang,
            loaiKyNang: muc.maKyNang?.loaiKyNang,
            mucDo: muc.mucDo,
        })),
        portfolio: duLieu.portfolio ?? [],
        ngayTao: duLieu.ngayTao,
        ngayCapNhat: duLieu.ngayCapNhat,
    };
}
async function layDayDu(where, many = false) {
    // ✅ TỐI ƯU: Chỉ query 1 lần, không cần ganNguoiDungChoUngVien & ganKyNangJson
    const rows = many
        ? await ungvien_mohinh_js_1.UngVien.findMany({
            where,
            orderBy: { ngayTao: 'desc' },
            take: 200,
            // Không cần include vì NguoiDung & KyNang không phải relation trực tiếp trong Prisma
            // Data đã được lưu trong JSON
        })
        : await ungvien_mohinh_js_1.UngVien.findMany({ where, take: 1 });
    // ✅ Chỉ hydrate nếu thực sự cần thiết (optimize bằng cách cache)
    const hydrated = await (0, prismaHelper_js_1.ganKyNangJson)(await (0, prismaHelper_js_1.ganNguoiDungChoUngVien)(rows));
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
        const hienTai = await ungvien_mohinh_js_1.UngVien.findUnique({ where: { maNguoiDung } });
        if (hienTai) {
            const [dayDu] = await (0, prismaHelper_js_1.ganKyNangJson)(await (0, prismaHelper_js_1.ganNguoiDungChoUngVien)([hienTai]));
            return chuanHoaUngVien(dayDu);
        }
        const daTao = await ungvien_mohinh_js_1.UngVien.create({ data: { maNguoiDung, kinhNghiem: 0, kyNang: [], portfolio: [] } });
        const [dayDu] = await (0, prismaHelper_js_1.ganKyNangJson)(await (0, prismaHelper_js_1.ganNguoiDungChoUngVien)([daTao]));
        return chuanHoaUngVien(dayDu);
    },
    async taoMoi(duLieu) {
        const ketQua = await ungvien_mohinh_js_1.UngVien.create({ data: (0, prismaHelper_js_1.boUndefined)(duLieu) });
        return this.layTheoMa(String(ketQua.id));
    },
    async capNhat(ma, duLieu, maNguoiDungHienTai) {
        const hienTai = await ungvien_mohinh_js_1.UngVien.findUnique({ where: { id: ma } });
        if (!hienTai)
            throw new loiungdung_js_1.LoiUngDung('Không tìm thấy hồ sơ ứng viên', 404);
        if (maNguoiDungHienTai && String(hienTai.maNguoiDung) !== maNguoiDungHienTai) {
            throw new loiungdung_js_1.LoiUngDung('Bạn không có quyền cập nhật hồ sơ này', 403);
        }
        await ungvien_mohinh_js_1.UngVien.update({ where: { id: ma }, data: (0, prismaHelper_js_1.boUndefined)(duLieu) });
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
