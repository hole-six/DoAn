"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dichVuDanhGiaCongTy = void 0;
const loiungdung_js_1 = require("../../dungchung/loiungdung.js");
require("../nguoidung/nguoidung.mohinh.js");
require("../nhatuyendung/nhatuyendung.mohinh.js");
require("../ungvien/ungvien.mohinh.js");
const hosoungtuyen_mohinh_js_1 = require("../hosoungtuyen/hosoungtuyen.mohinh.js");
const lichphongvan_mohinh_js_1 = require("../lichphongvan/lichphongvan.mohinh.js");
const lichsuhosoungtuyen_mohinh_js_1 = require("../lichsuhosoungtuyen/lichsuhosoungtuyen.mohinh.js");
const ungvien_mohinh_js_1 = require("../ungvien/ungvien.mohinh.js");
const danhgiacongty_mohinh_js_1 = require("./danhgiacongty.mohinh.js");
function id(value) {
    return String(value?._id ?? value ?? '');
}
function chuanHoaDanhGia(taiLieu) {
    const duLieu = typeof taiLieu.toObject === 'function' ? taiLieu.toObject() : taiLieu;
    return {
        id: String(duLieu._id),
        maUngVien: duLieu.maUngVien?._id ? String(duLieu.maUngVien._id) : String(duLieu.maUngVien),
        maNhaTuyenDung: duLieu.maNhaTuyenDung?._id ? String(duLieu.maNhaTuyenDung._id) : String(duLieu.maNhaTuyenDung),
        maHoSoUngTuyen: duLieu.maHoSoUngTuyen?._id
            ? String(duLieu.maHoSoUngTuyen._id)
            : duLieu.maHoSoUngTuyen
                ? String(duLieu.maHoSoUngTuyen)
                : undefined,
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
            ? {
                id: String(duLieu.maNhaTuyenDung._id),
                tenCongTy: duLieu.maNhaTuyenDung.tenCongTy,
                logo: duLieu.maNhaTuyenDung.logo,
            }
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
    if (nguoiDung.vaiTro !== 'ung_vien') {
        throw new loiungdung_js_1.LoiUngDung('Bạn cần đăng nhập bằng tài khoản ứng viên để đánh giá công ty', 403, 'FORBIDDEN');
    }
    const ungVien = await ungvien_mohinh_js_1.UngVien.findOne({ maNguoiDung: nguoiDung.id });
    if (!ungVien)
        throw new loiungdung_js_1.LoiUngDung('Bạn cần tạo hồ sơ ứng viên trước khi đánh giá công ty', 422, 'CANDIDATE_PROFILE_REQUIRED');
    return ungVien;
}
async function damBaoDaDuocMoiPhongVan(hoSo) {
    if (String(hoSo.trangThai ?? '') === 'moi_phong_van')
        return;
    const [lichPhongVan, lichSuMoiPhongVan] = await Promise.all([
        lichphongvan_mohinh_js_1.LichPhongVan.findOne({ maHoSoUngTuyen: hoSo._id }).select('_id'),
        lichsuhosoungtuyen_mohinh_js_1.LichSuHoSoUngTuyen.findOne({ maHoSoUngTuyen: hoSo._id, trangThaiMoi: 'moi_phong_van' }).select('_id'),
    ]);
    if (!lichPhongVan && !lichSuMoiPhongVan) {
        throw new loiungdung_js_1.LoiUngDung('Bạn chỉ có thể đánh giá công ty sau khi được mời phỏng vấn.', 409, 'REVIEW_REQUIRES_INTERVIEW_INVITE');
    }
}
exports.dichVuDanhGiaCongTy = {
    async layDanhSach() {
        const danhSach = await danhgiacongty_mohinh_js_1.DanhGiaCongTy
            .find()
            .populate({ path: 'maUngVien', select: 'maNguoiDung viTriMongMuon', populate: { path: 'maNguoiDung', select: 'hoTen email' } })
            .populate('maNhaTuyenDung', 'tenCongTy logo')
            .populate('maHoSoUngTuyen', 'trangThai ngayNop')
            .sort({ ngayTao: -1 })
            .limit(300);
        return danhSach.map(chuanHoaDanhGia);
    },
    async layCuaUngVien(nguoiDung) {
        const ungVien = await layUngVienCuaNguoiDung(nguoiDung);
        const danhSach = await danhgiacongty_mohinh_js_1.DanhGiaCongTy
            .find({ maUngVien: ungVien._id })
            .populate({ path: 'maUngVien', select: 'maNguoiDung viTriMongMuon', populate: { path: 'maNguoiDung', select: 'hoTen email' } })
            .populate('maNhaTuyenDung', 'tenCongTy logo')
            .populate('maHoSoUngTuyen', 'trangThai ngayNop')
            .sort({ ngayTao: -1 })
            .limit(300);
        return danhSach.map(chuanHoaDanhGia);
    },
    async layTheoMa(ma) {
        const duLieu = await danhgiacongty_mohinh_js_1.DanhGiaCongTy
            .findById(ma)
            .populate({ path: 'maUngVien', select: 'maNguoiDung viTriMongMuon', populate: { path: 'maNguoiDung', select: 'hoTen email' } })
            .populate('maNhaTuyenDung', 'tenCongTy logo')
            .populate('maHoSoUngTuyen', 'trangThai ngayNop');
        if (!duLieu)
            throw new loiungdung_js_1.LoiUngDung('Không tìm thấy đánh giá công ty', 404);
        return chuanHoaDanhGia(duLieu);
    },
    async taoMoi(duLieu) {
        const ketQua = await danhgiacongty_mohinh_js_1.DanhGiaCongTy.create(duLieu);
        return chuanHoaDanhGia(await this.layTheoMa(String(ketQua._id)));
    },
    async taoTuHoSo(nguoiDung, maHoSoUngTuyen, duLieu) {
        const ungVien = await layUngVienCuaNguoiDung(nguoiDung);
        const hoSo = await hosoungtuyen_mohinh_js_1.HoSoUngTuyen
            .findById(maHoSoUngTuyen)
            .populate({ path: 'maTinTuyenDung', select: 'maNhaTuyenDung tieuDe' });
        if (!hoSo)
            throw new loiungdung_js_1.LoiUngDung('Không tìm thấy hồ sơ ứng tuyển', 404, 'APPLICATION_NOT_FOUND');
        if (id(hoSo.maUngVien) !== id(ungVien)) {
            throw new loiungdung_js_1.LoiUngDung('Bạn không có quyền đánh giá từ hồ sơ ứng tuyển này', 403, 'FORBIDDEN');
        }
        await damBaoDaDuocMoiPhongVan(hoSo);
        const maNhaTuyenDung = id(hoSo.maTinTuyenDung?.maNhaTuyenDung);
        if (!maNhaTuyenDung)
            throw new loiungdung_js_1.LoiUngDung('Không tìm thấy công ty của hồ sơ ứng tuyển', 404, 'COMPANY_NOT_FOUND');
        const daCoDanhGia = await danhgiacongty_mohinh_js_1.DanhGiaCongTy.findOne({ maHoSoUngTuyen });
        if (daCoDanhGia) {
            throw new loiungdung_js_1.LoiUngDung('Bạn đã đánh giá công ty từ hồ sơ ứng tuyển này.', 409, 'REVIEW_ALREADY_EXISTS');
        }
        const ketQua = await danhgiacongty_mohinh_js_1.DanhGiaCongTy.create({
            maUngVien: ungVien._id,
            maNhaTuyenDung,
            maHoSoUngTuyen,
            diem: duLieu.diem,
            noiDung: duLieu.noiDung,
            anDanh: duLieu.anDanh ?? false,
            daDuyet: false,
        });
        return this.layTheoMa(id(ketQua));
    },
    async capNhat(ma, duLieu) {
        const ketQua = await danhgiacongty_mohinh_js_1.DanhGiaCongTy
            .findByIdAndUpdate(ma, duLieu, { returnDocument: 'after', runValidators: true })
            .populate({ path: 'maUngVien', select: 'maNguoiDung viTriMongMuon', populate: { path: 'maNguoiDung', select: 'hoTen email' } })
            .populate('maNhaTuyenDung', 'tenCongTy logo')
            .populate('maHoSoUngTuyen', 'trangThai ngayNop');
        if (!ketQua)
            throw new loiungdung_js_1.LoiUngDung('Không tìm thấy đánh giá công ty de cap nhat', 404);
        return chuanHoaDanhGia(ketQua);
    },
    async xoa(ma) {
        const ketQua = await danhgiacongty_mohinh_js_1.DanhGiaCongTy
            .findByIdAndDelete(ma)
            .populate({ path: 'maUngVien', select: 'maNguoiDung viTriMongMuon', populate: { path: 'maNguoiDung', select: 'hoTen email' } })
            .populate('maNhaTuyenDung', 'tenCongTy logo')
            .populate('maHoSoUngTuyen', 'trangThai ngayNop');
        if (!ketQua)
            throw new loiungdung_js_1.LoiUngDung('Không tìm thấy đánh giá công ty de xoa', 404);
        return chuanHoaDanhGia(ketQua);
    },
};
