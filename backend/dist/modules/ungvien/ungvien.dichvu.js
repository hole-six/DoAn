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
        try {
            const danhSach = await ungvien_mohinh_js_1.UngVien
                .find()
                .populate('maNguoiDung', 'hoTen email soDienThoai trangThai')
                .populate('kyNang.maKyNang', 'tenKyNang loaiKyNang')
                .sort({ ngayTao: -1 })
                .limit(200);
            return danhSach.map(chuanHoaUngVien);
        }
        catch (error) {
            console.error('❌ Lỗi khi lấy danh sách ứng viên:', error);
            throw error;
        }
    },
    async layTheoMa(ma) {
        try {
            const duLieu = await ungvien_mohinh_js_1.UngVien
                .findById(ma)
                .populate('maNguoiDung', 'hoTen email soDienThoai trangThai')
                .populate('kyNang.maKyNang', 'tenKyNang loaiKyNang');
            if (!duLieu) {
                throw new loiungdung_js_1.LoiUngDung('Không tìm thấy hồ sơ ứng viên', 404);
            }
            return chuanHoaUngVien(duLieu);
        }
        catch (error) {
            console.error('❌ Lỗi khi lấy hồ sơ ứng viên:', error);
            throw error;
        }
    },
    async layTheoMaNguoiDung(maNguoiDung) {
        try {
            const duLieu = await ungvien_mohinh_js_1.UngVien
                .findOne({ maNguoiDung })
                .populate('maNguoiDung', 'hoTen email soDienThoai trangThai')
                .populate('kyNang.maKyNang', 'tenKyNang loaiKyNang');
            if (!duLieu) {
                throw new loiungdung_js_1.LoiUngDung('Không tìm thấy hồ sơ ứng viên', 404);
            }
            return chuanHoaUngVien(duLieu);
        }
        catch (error) {
            console.error('❌ Lỗi khi lấy hồ sơ theo mã người dùng:', error);
            throw error;
        }
    },
    async damBaoHoSoTheoNguoiDung(maNguoiDung) {
        try {
            const duLieu = await ungvien_mohinh_js_1.UngVien
                .findOneAndUpdate({ maNguoiDung }, { $setOnInsert: { maNguoiDung, kinhNghiem: 0, kyNang: [], portfolio: [] } }, { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true })
                .populate('maNguoiDung', 'hoTen email soDienThoai trangThai')
                .populate('kyNang.maKyNang', 'tenKyNang loaiKyNang');
            return chuanHoaUngVien(duLieu);
        }
        catch (error) {
            console.error('Loi dam bao ho so ung vien:', error);
            throw error;
        }
    },
    async taoMoi(duLieu) {
        try {
            const ketQua = await ungvien_mohinh_js_1.UngVien.create(duLieu);
            console.log('✅ Tạo hồ sơ ứng viên thành công:', ketQua._id);
            return this.layTheoMa(String(ketQua._id));
        }
        catch (error) {
            console.error('❌ Lỗi khi tạo hồ sơ ứng viên:', error);
            throw error;
        }
    },
    async capNhat(ma, duLieu, maNguoiDungHienTai) {
        try {
            // Kiểm tra quyền nếu có maNguoiDungHienTai
            if (maNguoiDungHienTai) {
                const ungVien = await ungvien_mohinh_js_1.UngVien.findById(ma);
                if (!ungVien) {
                    throw new loiungdung_js_1.LoiUngDung('Không tìm thấy hồ sơ ứng viên', 404);
                }
                if (String(ungVien.maNguoiDung) !== maNguoiDungHienTai) {
                    throw new loiungdung_js_1.LoiUngDung('Bạn không có quyền cập nhật hồ sơ này', 403);
                }
            }
            const ketQua = await ungvien_mohinh_js_1.UngVien
                .findByIdAndUpdate(ma, duLieu, { returnDocument: 'after', runValidators: true })
                .populate('maNguoiDung', 'hoTen email soDienThoai trangThai')
                .populate('kyNang.maKyNang', 'tenKyNang loaiKyNang');
            if (!ketQua) {
                throw new loiungdung_js_1.LoiUngDung('Không tìm thấy hồ sơ ứng viên để cập nhật', 404);
            }
            console.log('✅ Cập nhật hồ sơ ứng viên thành công:', ma);
            return chuanHoaUngVien(ketQua);
        }
        catch (error) {
            console.error('❌ Lỗi khi cập nhật hồ sơ ứng viên:', error);
            throw error;
        }
    },
    async xoa(ma, maNguoiDungHienTai) {
        try {
            // Kiểm tra quyền nếu có maNguoiDungHienTai
            if (maNguoiDungHienTai) {
                const ungVien = await ungvien_mohinh_js_1.UngVien.findById(ma);
                if (!ungVien) {
                    throw new loiungdung_js_1.LoiUngDung('Không tìm thấy hồ sơ ứng viên', 404);
                }
                if (String(ungVien.maNguoiDung) !== maNguoiDungHienTai) {
                    throw new loiungdung_js_1.LoiUngDung('Bạn không có quyền xóa hồ sơ này', 403);
                }
            }
            const ketQua = await ungvien_mohinh_js_1.UngVien.findByIdAndDelete(ma);
            if (!ketQua) {
                throw new loiungdung_js_1.LoiUngDung('Không tìm thấy hồ sơ ứng viên để xóa', 404);
            }
            console.log('✅ Xóa hồ sơ ứng viên thành công:', ma);
            return chuanHoaUngVien(ketQua);
        }
        catch (error) {
            console.error('❌ Lỗi khi xóa hồ sơ ứng viên:', error);
            throw error;
        }
    },
};
