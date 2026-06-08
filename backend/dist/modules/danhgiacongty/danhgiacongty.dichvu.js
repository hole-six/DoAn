"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dichVuDanhGiaCongTy = void 0;
const loiungdung_js_1 = require("../../dungchung/loiungdung.js");
const prismaHelper_js_1 = require("../../dungchung/prismaHelper.js");
const prisma_js_1 = require("../../cauhinh/prisma.js");
const hosoungtuyen_dichvu_js_1 = require("../hosoungtuyen/hosoungtuyen.dichvu.js");
const danhgiacongty_mohinh_js_1 = require("./danhgiacongty.mohinh.js");
function id(value) {
    return String(value?._id ?? value?.id ?? value ?? '');
}
async function hydrate(rows) {
    const [ungVienRows, congTyRows, hoSoRows] = await Promise.all([
        prisma_js_1.prisma.ungVien.findMany({ where: { id: { in: [...new Set(rows.map(row => row.maUngVien).filter(Boolean))] } } }),
        prisma_js_1.prisma.nhaTuyenDung.findMany({ where: { id: { in: [...new Set(rows.map(row => row.maNhaTuyenDung).filter(Boolean))] } } }),
        prisma_js_1.prisma.hoSoUngTuyen.findMany({ where: { id: { in: [...new Set(rows.map(row => row.maHoSoUngTuyen).filter(Boolean))] } } }),
    ]);
    const ungVienDayDu = await (0, prismaHelper_js_1.ganNguoiDungChoUngVien)(ungVienRows);
    const ungVienMap = new Map(ungVienDayDu.map(row => [row.id, (0, prismaHelper_js_1.coId)(row)]));
    const congTyMap = new Map(congTyRows.map(row => [row.id, (0, prismaHelper_js_1.coId)(row)]));
    const hoSoMap = new Map(hoSoRows.map(row => [row.id, (0, prismaHelper_js_1.coId)(row)]));
    return rows.map(row => (0, prismaHelper_js_1.coId)({
        ...row,
        maUngVien: ungVienMap.get(row.maUngVien) ?? row.maUngVien,
        maNhaTuyenDung: congTyMap.get(row.maNhaTuyenDung) ?? row.maNhaTuyenDung,
        maHoSoUngTuyen: row.maHoSoUngTuyen ? (hoSoMap.get(row.maHoSoUngTuyen) ?? row.maHoSoUngTuyen) : null,
    }));
}
function chuanHoaDanhGia(taiLieu) {
    const duLieu = taiLieu ?? {};
    return {
        id: String(duLieu.id ?? duLieu._id),
        _id: String(duLieu.id ?? duLieu._id),
        maUngVien: duLieu.maUngVien?._id ? String(duLieu.maUngVien._id) : String(duLieu.maUngVien),
        maNhaTuyenDung: duLieu.maNhaTuyenDung?._id ? String(duLieu.maNhaTuyenDung._id) : String(duLieu.maNhaTuyenDung),
        maHoSoUngTuyen: duLieu.maHoSoUngTuyen?._id ? String(duLieu.maHoSoUngTuyen._id) : duLieu.maHoSoUngTuyen ? String(duLieu.maHoSoUngTuyen) : undefined,
        ungVien: duLieu.maUngVien?._id
            ? {
                id: String(duLieu.maUngVien._id),
                maNguoiDung: duLieu.maUngVien.maNguoiDung?._id ? String(duLieu.maUngVien.maNguoiDung._id) : String(duLieu.maUngVien.maNguoiDung),
                hoTen: duLieu.maUngVien.maNguoiDung?.hoTen,
                email: duLieu.maUngVien.maNguoiDung?.email,
                viTriMongMuon: duLieu.maUngVien.viTriMongMuon,
            }
            : undefined,
        nhaTuyenDung: duLieu.maNhaTuyenDung?._id
            ? { id: String(duLieu.maNhaTuyenDung._id), tenCongTy: duLieu.maNhaTuyenDung.tenCongTy, logo: duLieu.maNhaTuyenDung.logo }
            : undefined,
        diem: duLieu.diem,
        noiDung: duLieu.noiDung,
        anDanh: duLieu.anDanh,
        daDuyet: duLieu.daDuyet,
        ngayTao: duLieu.ngayTao,
        ngayCapNhat: duLieu.ngayCapNhat,
    };
}
async function layUngVienCuaNguoiDung(nguoiDung) {
    if (nguoiDung.vaiTro !== 'ung_vien')
        throw new loiungdung_js_1.LoiUngDung('Bạn cần đăng nhập bằng tài khoản ứng viên để đánh giá công ty', 403, 'FORBIDDEN');
    const ungVien = await prisma_js_1.prisma.ungVien.findUnique({ where: { maNguoiDung: nguoiDung.id } });
    if (!ungVien)
        throw new loiungdung_js_1.LoiUngDung('Bạn cần tạo hồ sơ ứng viên trước khi đánh giá công ty', 422, 'CANDIDATE_PROFILE_REQUIRED');
    return (0, prismaHelper_js_1.coId)(ungVien);
}
async function damBaoDaDuocMoiPhongVan(hoSo) {
    if (String(hoSo.trangThai ?? '') === 'moi_phong_van')
        return;
    const [lichPhongVan, lichSuMoiPhongVan] = await Promise.all([
        prisma_js_1.prisma.lichPhongVan.findFirst({ where: { maHoSoUngTuyen: id(hoSo) }, select: { id: true } }),
        prisma_js_1.prisma.lichSuHoSoUngTuyen.findFirst({ where: { maHoSoUngTuyen: id(hoSo), trangThaiMoi: 'moi_phong_van' }, select: { id: true } }),
    ]);
    if (!lichPhongVan && !lichSuMoiPhongVan) {
        throw new loiungdung_js_1.LoiUngDung('Bạn chỉ có thể đánh giá công ty sau khi được mời phỏng vấn.', 409, 'REVIEW_REQUIRES_INTERVIEW_INVITE');
    }
}
async function layDanhGiaDayDu(where, many = false) {
    const rows = many
        ? await danhgiacongty_mohinh_js_1.DanhGiaCongTy.findMany({ where, orderBy: { ngayTao: 'desc' }, take: 300 })
        : await danhgiacongty_mohinh_js_1.DanhGiaCongTy.findMany({ where, take: 1 });
    const hydrated = await hydrate(rows);
    return many ? hydrated : hydrated[0];
}
exports.dichVuDanhGiaCongTy = {
    async layDanhSach() {
        const danhSach = await layDanhGiaDayDu({}, true);
        return danhSach.map(chuanHoaDanhGia);
    },
    async layCuaUngVien(nguoiDung) {
        const ungVien = await layUngVienCuaNguoiDung(nguoiDung);
        const danhSach = await layDanhGiaDayDu({ maUngVien: id(ungVien) }, true);
        return danhSach.map(chuanHoaDanhGia);
    },
    async layTheoMa(ma) {
        const duLieu = await layDanhGiaDayDu({ id: ma });
        if (!duLieu)
            throw new loiungdung_js_1.LoiUngDung('Không tìm thấy đánh giá công ty', 404);
        return chuanHoaDanhGia(duLieu);
    },
    async taoMoi(duLieu) {
        const ketQua = await danhgiacongty_mohinh_js_1.DanhGiaCongTy.create({ data: duLieu });
        return this.layTheoMa(String(ketQua.id));
    },
    async taoTuHoSo(nguoiDung, maHoSoUngTuyen, duLieu) {
        const ungVien = await layUngVienCuaNguoiDung(nguoiDung);
        const hoSo = await (0, hosoungtuyen_dichvu_js_1.layHoSoUngTuyenDayDuNoiBo)(maHoSoUngTuyen);
        if (!hoSo)
            throw new loiungdung_js_1.LoiUngDung('Không tìm thấy hồ sơ ứng tuyển', 404, 'APPLICATION_NOT_FOUND');
        if (id(hoSo.maUngVien) !== id(ungVien))
            throw new loiungdung_js_1.LoiUngDung('Bạn không có quyền đánh giá từ hồ sơ ứng tuyển này', 403, 'FORBIDDEN');
        await damBaoDaDuocMoiPhongVan(hoSo);
        const maNhaTuyenDung = id(hoSo.maTinTuyenDung?.maNhaTuyenDung);
        if (!maNhaTuyenDung)
            throw new loiungdung_js_1.LoiUngDung('Không tìm thấy công ty của hồ sơ ứng tuyển', 404, 'COMPANY_NOT_FOUND');
        const daCoDanhGia = await danhgiacongty_mohinh_js_1.DanhGiaCongTy.findFirst({ where: { maHoSoUngTuyen }, select: { id: true } });
        if (daCoDanhGia)
            throw new loiungdung_js_1.LoiUngDung('Bạn đã đánh giá công ty từ hồ sơ ứng tuyển này.', 409, 'REVIEW_ALREADY_EXISTS');
        const ketQua = await danhgiacongty_mohinh_js_1.DanhGiaCongTy.create({
            data: { maUngVien: id(ungVien), maNhaTuyenDung, maHoSoUngTuyen, diem: duLieu.diem, noiDung: duLieu.noiDung, anDanh: duLieu.anDanh ?? false, daDuyet: false },
        });
        return this.layTheoMa(id(ketQua));
    },
    async capNhat(ma, duLieu) {
        const hienTai = await danhgiacongty_mohinh_js_1.DanhGiaCongTy.findUnique({ where: { id: ma }, select: { id: true } });
        if (!hienTai)
            throw new loiungdung_js_1.LoiUngDung('Không tìm thấy đánh giá công ty de cap nhat', 404);
        await danhgiacongty_mohinh_js_1.DanhGiaCongTy.update({ where: { id: ma }, data: duLieu });
        return this.layTheoMa(ma);
    },
    async xoa(ma) {
        const ketQua = await layDanhGiaDayDu({ id: ma });
        if (!ketQua)
            throw new loiungdung_js_1.LoiUngDung('Không tìm thấy đánh giá công ty de xoa', 404);
        await danhgiacongty_mohinh_js_1.DanhGiaCongTy.delete({ where: { id: ma } });
        return chuanHoaDanhGia(ketQua);
    },
};
