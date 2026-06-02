"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dichVuNhaTuyenDung = void 0;
const loiungdung_js_1 = require("../../dungchung/loiungdung.js");
require("../nguoidung/nguoidung.mohinh.js");
const nhatuyendung_mohinh_js_1 = require("./nhatuyendung.mohinh.js");
function chuanHoaNhaTuyenDung(taiLieu) {
    const duLieu = typeof taiLieu.toObject === 'function' ? taiLieu.toObject() : taiLieu;
    return {
        id: String(duLieu._id),
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
exports.dichVuNhaTuyenDung = {
    async layDanhSach() {
        const danhSach = await nhatuyendung_mohinh_js_1.NhaTuyenDung
            .find()
            .populate('maNguoiDung', 'hoTen email soDienThoai')
            .sort({ ngayTao: -1 })
            .limit(200);
        return danhSach.map(chuanHoaNhaTuyenDung);
    },
    async layTheoMa(ma) {
        const duLieu = await nhatuyendung_mohinh_js_1.NhaTuyenDung.findById(ma).populate('maNguoiDung', 'hoTen email soDienThoai');
        if (!duLieu)
            throw new loiungdung_js_1.LoiUngDung('Không tìm thấy nhà tuyển dụng', 404);
        return chuanHoaNhaTuyenDung(duLieu);
    },
    async taoMoi(duLieu) {
        const ketQua = await nhatuyendung_mohinh_js_1.NhaTuyenDung.create(duLieu);
        return chuanHoaNhaTuyenDung(await nhatuyendung_mohinh_js_1.NhaTuyenDung.findById(ketQua._id).populate('maNguoiDung', 'hoTen email soDienThoai'));
    },
    async capNhat(ma, duLieuNhan) {
        const duLieu = duLieuNhan;
        const duLieuCapNhat = {
            ...duLieu,
            ...(duLieu.trangThaiDuyet === 'da_duyet' ? { ngayDuyet: new Date(), lyDoTuChoi: undefined } : {}),
        };
        const ketQua = await nhatuyendung_mohinh_js_1.NhaTuyenDung
            .findByIdAndUpdate(ma, duLieuCapNhat, { returnDocument: 'after', runValidators: true })
            .populate('maNguoiDung', 'hoTen email soDienThoai');
        if (!ketQua)
            throw new loiungdung_js_1.LoiUngDung('Không tìm thấy nhà tuyển dụng de cap nhat', 404);
        return chuanHoaNhaTuyenDung(ketQua);
    },
    async xoa(ma) {
        const ketQua = await nhatuyendung_mohinh_js_1.NhaTuyenDung.findByIdAndDelete(ma).populate('maNguoiDung', 'hoTen email soDienThoai');
        if (!ketQua)
            throw new loiungdung_js_1.LoiUngDung('Không tìm thấy nhà tuyển dụng de xoa', 404);
        return chuanHoaNhaTuyenDung(ketQua);
    },
};
