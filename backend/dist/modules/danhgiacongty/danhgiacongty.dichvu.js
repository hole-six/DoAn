"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dichVuDanhGiaCongTy = void 0;
const loiungdung_js_1 = require("../../dungchung/loiungdung.js");
require("../nguoidung/nguoidung.mohinh.js");
require("../nhatuyendung/nhatuyendung.mohinh.js");
require("../ungvien/ungvien.mohinh.js");
const danhgiacongty_mohinh_js_1 = require("./danhgiacongty.mohinh.js");
function chuanHoaDanhGia(taiLieu) {
    const duLieu = typeof taiLieu.toObject === 'function' ? taiLieu.toObject() : taiLieu;
    return {
        id: String(duLieu._id),
        maUngVien: duLieu.maUngVien?._id ? String(duLieu.maUngVien._id) : String(duLieu.maUngVien),
        maNhaTuyenDung: duLieu.maNhaTuyenDung?._id ? String(duLieu.maNhaTuyenDung._id) : String(duLieu.maNhaTuyenDung),
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
exports.dichVuDanhGiaCongTy = {
    async layDanhSach() {
        const danhSach = await danhgiacongty_mohinh_js_1.DanhGiaCongTy
            .find()
            .populate({ path: 'maUngVien', select: 'maNguoiDung viTriMongMuon', populate: { path: 'maNguoiDung', select: 'hoTen email' } })
            .populate('maNhaTuyenDung', 'tenCongTy logo')
            .sort({ ngayTao: -1 })
            .limit(300);
        return danhSach.map(chuanHoaDanhGia);
    },
    async layTheoMa(ma) {
        const duLieu = await danhgiacongty_mohinh_js_1.DanhGiaCongTy
            .findById(ma)
            .populate({ path: 'maUngVien', select: 'maNguoiDung viTriMongMuon', populate: { path: 'maNguoiDung', select: 'hoTen email' } })
            .populate('maNhaTuyenDung', 'tenCongTy logo');
        if (!duLieu)
            throw new loiungdung_js_1.LoiUngDung('Khong tim thay danh gia cong ty', 404);
        return chuanHoaDanhGia(duLieu);
    },
    async taoMoi(duLieu) {
        const ketQua = await danhgiacongty_mohinh_js_1.DanhGiaCongTy.create(duLieu);
        return chuanHoaDanhGia(await this.layTheoMa(String(ketQua._id)));
    },
    async capNhat(ma, duLieu) {
        const ketQua = await danhgiacongty_mohinh_js_1.DanhGiaCongTy
            .findByIdAndUpdate(ma, duLieu, { returnDocument: 'after', runValidators: true })
            .populate({ path: 'maUngVien', select: 'maNguoiDung viTriMongMuon', populate: { path: 'maNguoiDung', select: 'hoTen email' } })
            .populate('maNhaTuyenDung', 'tenCongTy logo');
        if (!ketQua)
            throw new loiungdung_js_1.LoiUngDung('Khong tim thay danh gia cong ty de cap nhat', 404);
        return chuanHoaDanhGia(ketQua);
    },
    async xoa(ma) {
        const ketQua = await danhgiacongty_mohinh_js_1.DanhGiaCongTy
            .findByIdAndDelete(ma)
            .populate({ path: 'maUngVien', select: 'maNguoiDung viTriMongMuon', populate: { path: 'maNguoiDung', select: 'hoTen email' } })
            .populate('maNhaTuyenDung', 'tenCongTy logo');
        if (!ketQua)
            throw new loiungdung_js_1.LoiUngDung('Khong tim thay danh gia cong ty de xoa', 404);
        return chuanHoaDanhGia(ketQua);
    },
};
