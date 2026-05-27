"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dichVuUngVien = void 0;
const loiungdung_js_1 = require("../../dungchung/loiungdung.js");
require("../danhmuckynang/danhmuckynang.mohinh.js");
require("../nguoidung/nguoidung.mohinh.js");
const ungvien_mohinh_js_1 = require("./ungvien.mohinh.js");
function chuanHoaUngVien(taiLieu) {
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
exports.dichVuUngVien = {
    async layDanhSach() {
        const danhSach = await ungvien_mohinh_js_1.UngVien
            .find()
            .populate('maNguoiDung', 'hoTen email soDienThoai trangThai')
            .populate('kyNang.maKyNang', 'tenKyNang loaiKyNang')
            .sort({ ngayTao: -1 })
            .limit(200);
        return danhSach.map(chuanHoaUngVien);
    },
    async layTheoMa(ma) {
        const duLieu = await ungvien_mohinh_js_1.UngVien
            .findById(ma)
            .populate('maNguoiDung', 'hoTen email soDienThoai trangThai')
            .populate('kyNang.maKyNang', 'tenKyNang loaiKyNang');
        if (!duLieu)
            throw new loiungdung_js_1.LoiUngDung('Khong tim thay ung vien', 404);
        return chuanHoaUngVien(duLieu);
    },
    async taoMoi(duLieu) {
        const ketQua = await ungvien_mohinh_js_1.UngVien.create(duLieu);
        return this.layTheoMa(String(ketQua._id));
    },
    async capNhat(ma, duLieu) {
        const ketQua = await ungvien_mohinh_js_1.UngVien
            .findByIdAndUpdate(ma, duLieu, { returnDocument: 'after', runValidators: true })
            .populate('maNguoiDung', 'hoTen email soDienThoai trangThai')
            .populate('kyNang.maKyNang', 'tenKyNang loaiKyNang');
        if (!ketQua)
            throw new loiungdung_js_1.LoiUngDung('Khong tim thay ung vien de cap nhat', 404);
        return chuanHoaUngVien(ketQua);
    },
    async xoa(ma) {
        const ketQua = await ungvien_mohinh_js_1.UngVien.findByIdAndDelete(ma);
        if (!ketQua)
            throw new loiungdung_js_1.LoiUngDung('Khong tim thay ung vien de xoa', 404);
        return chuanHoaUngVien(ketQua);
    },
};
