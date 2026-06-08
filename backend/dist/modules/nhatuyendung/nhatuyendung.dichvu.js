"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dichVuNhaTuyenDung = void 0;
const loiungdung_js_1 = require("../../dungchung/loiungdung.js");
const prismaHelper_js_1 = require("../../dungchung/prismaHelper.js");
const timkiem_js_1 = require("../../dungchung/timkiem.js");
const nguoidung_mohinh_js_1 = require("../nguoidung/nguoidung.mohinh.js");
const thongbao_helper_js_1 = require("../thongbao/thongbao.helper.js");
const nhatuyendung_mohinh_js_1 = require("./nhatuyendung.mohinh.js");
async function layAdminIds() {
    const admins = await nguoidung_mohinh_js_1.NguoiDung.findMany({
        where: { vaiTro: 'admin', trangThai: 'hoat_dong' },
        select: { id: true },
    });
    return admins.map(item => item.id);
}
async function guiThongBaoAdminCongTy(params) {
    const adminIds = await layAdminIds();
    await Promise.all(adminIds.map((maAdmin) => (0, thongbao_helper_js_1.thongBaoAdminCongTyCanDuyet)({ maAdmin, ...params })));
}
function chuanHoaNhaTuyenDung(taiLieu) {
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
            }
            : undefined,
        tenCongTy: duLieu.tenCongTy,
        maSoThue: duLieu.maSoThue,
        moTa: duLieu.moTa,
        diaChi: duLieu.diaChi,
        website: duLieu.website,
        logo: duLieu.logo,
        quyMo: duLieu.quyMo,
        nganh: duLieu.nganh,
        trangThaiDuyet: duLieu.trangThaiDuyet,
        lyDoTuChoi: duLieu.lyDoTuChoi,
        ngayDuyet: duLieu.ngayDuyet,
        ngayTao: duLieu.ngayTao,
        ngayCapNhat: duLieu.ngayCapNhat,
    };
}
async function layDayDu(where, many = false) {
    const rows = many
        ? await nhatuyendung_mohinh_js_1.NhaTuyenDung.findMany({ where, orderBy: { ngayTao: 'desc' }, take: 200 })
        : await nhatuyendung_mohinh_js_1.NhaTuyenDung.findMany({ where, take: 1 });
    const hydrated = await (0, prismaHelper_js_1.ganNguoiDungChoCongTy)(rows);
    return many ? hydrated : hydrated[0];
}
exports.dichVuNhaTuyenDung = {
    async layDanhSach(boLoc = {}) {
        const danhSach = await layDayDu({}, true);
        const danhSachChuanHoa = danhSach.map(chuanHoaNhaTuyenDung);
        const daLoc = (0, timkiem_js_1.locVaXepHangTheoTuKhoa)(danhSachChuanHoa, boLoc.tuKhoa, item => [
            item.tenCongTy,
            item.nganh,
            item.diaChi,
            item.moTa,
            item.website,
        ]);
        return daLoc.slice(0, (0, timkiem_js_1.layLimit)(boLoc.limit, 50, 100));
    },
    async layTheoMa(ma) {
        const duLieu = await layDayDu({ id: ma });
        if (!duLieu)
            throw new loiungdung_js_1.LoiUngDung('Không tìm thấy nhà tuyển dụng', 404);
        return chuanHoaNhaTuyenDung(duLieu);
    },
    async taoMoi(duLieu) {
        const ketQua = await nhatuyendung_mohinh_js_1.NhaTuyenDung.create({ data: (0, prismaHelper_js_1.boUndefined)(duLieu) });
        const dayDu = await layDayDu({ id: ketQua.id });
        if (dayDu?.trangThaiDuyet === 'cho_duyet') {
            await guiThongBaoAdminCongTy({
                tenCongTy: dayDu.tenCongTy,
                tenNguoiDangKy: dayDu.maNguoiDung?.hoTen ?? 'Nha tuyen dung',
                maNhaTuyenDung: String(dayDu._id),
            });
        }
        return chuanHoaNhaTuyenDung(dayDu);
    },
    async capNhat(ma, duLieuNhan) {
        const duLieu = duLieuNhan;
        const hienTai = await layDayDu({ id: ma });
        if (!hienTai)
            throw new loiungdung_js_1.LoiUngDung('Không tìm thấy nhà tuyển dụng để cập nhật', 404);
        if (hienTai.trangThaiDuyet === 'da_duyet' && duLieu.trangThaiDuyet === 'tu_choi') {
            throw new loiungdung_js_1.LoiUngDung('Không thể từ chối công ty đã được duyệt. Nếu hồ sơ có vấn đề, hãy xóa hoặc khóa công ty.', 409, 'COMPANY_ALREADY_APPROVED');
        }
        const duLieuCapNhat = (0, prismaHelper_js_1.boUndefined)({
            ...duLieu,
            ...(duLieu.trangThaiDuyet === 'da_duyet' ? { ngayDuyet: new Date(), lyDoTuChoi: null } : {}),
        });
        await nhatuyendung_mohinh_js_1.NhaTuyenDung.update({ where: { id: ma }, data: duLieuCapNhat });
        const ketQua = await layDayDu({ id: ma });
        const trangThaiCu = hienTai.trangThaiDuyet;
        const trangThaiMoi = ketQua.trangThaiDuyet;
        if (trangThaiCu !== trangThaiMoi && ['da_duyet', 'tu_choi'].includes(trangThaiMoi)) {
            await (0, thongbao_helper_js_1.thongBaoNhaTuyenDungKetQuaDuyetCongTy)({
                maNguoiDung: String(ketQua.maNguoiDung?._id ?? ketQua.maNguoiDung),
                tenCongTy: ketQua.tenCongTy,
                trangThaiDuyet: trangThaiMoi,
                lyDoTuChoi: ketQua.lyDoTuChoi,
            });
        }
        const coCapNhatNoiDung = Object.keys(duLieu).some(key => !['trangThaiDuyet', 'lyDoTuChoi', 'ngayDuyet'].includes(key));
        if (trangThaiCu === 'tu_choi' && coCapNhatNoiDung && trangThaiMoi !== 'da_duyet') {
            await guiThongBaoAdminCongTy({
                tenCongTy: ketQua.tenCongTy,
                tenNguoiDangKy: ketQua.maNguoiDung?.hoTen ?? 'Nha tuyen dung',
                maNhaTuyenDung: String(ketQua._id),
                capNhatLai: true,
            });
        }
        return chuanHoaNhaTuyenDung(ketQua);
    },
    async xoa(ma) {
        const hienTai = await layDayDu({ id: ma });
        if (!hienTai)
            throw new loiungdung_js_1.LoiUngDung('Không tìm thấy nhà tuyển dụng để xóa', 404);
        await nhatuyendung_mohinh_js_1.NhaTuyenDung.delete({ where: { id: ma } });
        return chuanHoaNhaTuyenDung((0, prismaHelper_js_1.coId)(hienTai));
    },
};
