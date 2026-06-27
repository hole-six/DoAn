"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dichVuNhaTuyenDung = void 0;
const prisma_js_1 = require("../../cauhinh/prisma.js");
const loiungdung_js_1 = require("../../dungchung/loiungdung.js");
const prismaHelper_js_1 = require("../../dungchung/prismaHelper.js");
const timkiem_js_1 = require("../../dungchung/timkiem.js");
const nguoidung_mohinh_js_1 = require("../nguoidung/nguoidung.mohinh.js");
const thongbao_helper_js_1 = require("../thongbao/thongbao.helper.js");
const nhatuyendung_mohinh_js_1 = require("./nhatuyendung.mohinh.js");
// ─── helpers nội bộ ───────────────────────────────────────────────────────────
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
/** Fetch NguoiDung cho danh sách công ty và trả về Map<maNguoiDung, nguoiDung> */
async function ganNguoiDung(rows) {
    const ids = [...new Set(rows.map(r => r.maNguoiDung).filter(Boolean))];
    if (!ids.length)
        return new Map();
    const nguoiDungs = await prisma_js_1.prisma.nguoiDung.findMany({
        where: { id: { in: ids } },
        select: { id: true, hoTen: true, email: true, soDienThoai: true },
    });
    return new Map(nguoiDungs.map(nd => [nd.id, nd]));
}
function dinhDangCongTy(row, nguoiDungMap) {
    const nd = nguoiDungMap.get(row.maNguoiDung);
    return {
        id: String(row.id),
        _id: String(row.id),
        maNguoiDung: String(row.maNguoiDung),
        nguoiDung: nd
            ? { id: String(nd.id), hoTen: nd.hoTen, email: nd.email, soDienThoai: nd.soDienThoai }
            : undefined,
        tenCongTy: row.tenCongTy,
        maSoThue: row.maSoThue,
        moTa: row.moTa,
        diaChi: row.diaChi,
        website: row.website,
        logo: row.logo,
        quyMo: row.quyMo,
        nganh: row.nganh,
        trangThaiDuyet: row.trangThaiDuyet,
        lyDoTuChoi: row.lyDoTuChoi,
        ngayDuyet: row.ngayDuyet,
        ngayTao: row.ngayTao,
        ngayCapNhat: row.ngayCapNhat,
    };
}
// ─── service ─────────────────────────────────────────────────────────────────
exports.dichVuNhaTuyenDung = {
    async layDanhSach(boLoc = {}) {
        const rows = await nhatuyendung_mohinh_js_1.NhaTuyenDung.findMany({ orderBy: { ngayTao: 'desc' }, take: 200 });
        const nguoiDungMap = await ganNguoiDung(rows);
        const danhSach = rows.map(r => dinhDangCongTy(r, nguoiDungMap));
        const daLoc = (0, timkiem_js_1.locVaXepHangTheoTuKhoa)(danhSach, boLoc.tuKhoa, item => [
            item.tenCongTy,
            item.nganh,
            item.diaChi,
            item.moTa,
            item.website,
        ]);
        return daLoc.slice(0, (0, timkiem_js_1.layLimit)(boLoc.limit, 50, 100));
    },
    async layTheoMa(ma) {
        const row = await nhatuyendung_mohinh_js_1.NhaTuyenDung.findUnique({ where: { id: ma } });
        if (!row)
            throw new loiungdung_js_1.LoiUngDung('Không tìm thấy nhà tuyển dụng', 404);
        const nguoiDungMap = await ganNguoiDung([row]);
        return dinhDangCongTy(row, nguoiDungMap);
    },
    async taoMoi(duLieu) {
        const ketQua = await nhatuyendung_mohinh_js_1.NhaTuyenDung.create({ data: (0, prismaHelper_js_1.boUndefined)(duLieu) });
        const nguoiDungMap = await ganNguoiDung([ketQua]);
        const chuanHoa = dinhDangCongTy(ketQua, nguoiDungMap);
        if (ketQua.trangThaiDuyet === 'cho_duyet') {
            await guiThongBaoAdminCongTy({
                tenCongTy: ketQua.tenCongTy,
                tenNguoiDangKy: nguoiDungMap.get(ketQua.maNguoiDung)?.hoTen ?? 'Nha tuyen dung',
                maNhaTuyenDung: String(ketQua.id),
            });
        }
        return chuanHoa;
    },
    async capNhat(ma, duLieuNhan) {
        const duLieu = duLieuNhan;
        const hienTai = await nhatuyendung_mohinh_js_1.NhaTuyenDung.findUnique({ where: { id: ma } });
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
        const ketQua = await nhatuyendung_mohinh_js_1.NhaTuyenDung.findUnique({ where: { id: ma } });
        const nguoiDungMap = await ganNguoiDung([ketQua]);
        const trangThaiCu = hienTai.trangThaiDuyet;
        const trangThaiMoi = ketQua.trangThaiDuyet;
        if (trangThaiCu !== trangThaiMoi && ['da_duyet', 'tu_choi'].includes(trangThaiMoi)) {
            await (0, thongbao_helper_js_1.thongBaoNhaTuyenDungKetQuaDuyetCongTy)({
                maNguoiDung: String(ketQua.maNguoiDung),
                tenCongTy: ketQua.tenCongTy,
                trangThaiDuyet: trangThaiMoi,
                lyDoTuChoi: ketQua.lyDoTuChoi,
            });
        }
        const coCapNhatNoiDung = Object.keys(duLieu).some(key => !['trangThaiDuyet', 'lyDoTuChoi', 'ngayDuyet'].includes(key));
        if (trangThaiCu === 'tu_choi' && coCapNhatNoiDung && trangThaiMoi !== 'da_duyet') {
            await guiThongBaoAdminCongTy({
                tenCongTy: ketQua.tenCongTy,
                tenNguoiDangKy: nguoiDungMap.get(ketQua.maNguoiDung)?.hoTen ?? 'Nha tuyen dung',
                maNhaTuyenDung: String(ketQua.id),
                capNhatLai: true,
            });
        }
        return dinhDangCongTy(ketQua, nguoiDungMap);
    },
    async xoa(ma) {
        const hienTai = await nhatuyendung_mohinh_js_1.NhaTuyenDung.findUnique({ where: { id: ma } });
        if (!hienTai)
            throw new loiungdung_js_1.LoiUngDung('Không tìm thấy nhà tuyển dụng để xóa', 404);
        await nhatuyendung_mohinh_js_1.NhaTuyenDung.delete({ where: { id: ma } });
        // Trả về bản ghi đã xóa với cấu trúc chuẩn (không có nguoiDung vì đã xóa)
        const emptyMap = new Map();
        return dinhDangCongTy(hienTai, emptyMap);
    },
};
