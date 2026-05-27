"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dichVuNguoiDung = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const loiungdung_js_1 = require("../../dungchung/loiungdung.js");
const nguoidung_mohinh_js_1 = require("./nguoidung.mohinh.js");
function boMatKhau(nguoiDung) {
    return {
        id: String(nguoiDung._id),
        email: nguoiDung.email,
        hoTen: nguoiDung.hoTen,
        soDienThoai: nguoiDung.soDienThoai,
        vaiTro: nguoiDung.vaiTro,
        trangThai: nguoiDung.trangThai,
        ngayTao: nguoiDung.ngayTao,
        ngayCapNhat: nguoiDung.ngayCapNhat,
    };
}
async function bamMatKhauNeuCo(duLieu) {
    if (!duLieu.matKhau)
        return duLieu;
    return {
        ...duLieu,
        matKhau: await bcryptjs_1.default.hash(duLieu.matKhau, 10),
    };
}
exports.dichVuNguoiDung = {
    async layDanhSach() {
        const danhSach = await nguoidung_mohinh_js_1.NguoiDung.find().sort({ ngayTao: -1 }).limit(200);
        return danhSach.map(boMatKhau);
    },
    async layTheoMa(ma) {
        const nguoiDung = await nguoidung_mohinh_js_1.NguoiDung.findById(ma);
        if (!nguoiDung) {
            throw new loiungdung_js_1.LoiUngDung('Khong tim thay nguoi dung', 404);
        }
        return boMatKhau(nguoiDung);
    },
    async taoMoi(duLieuNhan) {
        const duLieu = duLieuNhan;
        const email = duLieu.email?.toLowerCase().trim();
        if (!email || !duLieu.matKhau || !duLieu.hoTen) {
            throw new loiungdung_js_1.LoiUngDung('Thieu thong tin tao nguoi dung', 422);
        }
        const daTonTai = await nguoidung_mohinh_js_1.NguoiDung.exists({ email });
        if (daTonTai) {
            throw new loiungdung_js_1.LoiUngDung('Email da ton tai', 409);
        }
        const nguoiDung = await nguoidung_mohinh_js_1.NguoiDung.create(await bamMatKhauNeuCo({
            ...duLieu,
            email,
            trangThai: duLieu.trangThai ?? 'hoat_dong',
            vaiTro: duLieu.vaiTro ?? 'ung_vien',
        }));
        return boMatKhau(nguoiDung);
    },
    async capNhat(ma, duLieuNhan) {
        const duLieu = duLieuNhan;
        const duLieuCapNhat = { ...duLieu };
        if (duLieuCapNhat.email) {
            duLieuCapNhat.email = duLieuCapNhat.email.toLowerCase().trim();
            const trungEmail = await nguoidung_mohinh_js_1.NguoiDung.exists({ email: duLieuCapNhat.email, _id: { $ne: ma } });
            if (trungEmail) {
                throw new loiungdung_js_1.LoiUngDung('Email da duoc su dung boi tai khoan khac', 409);
            }
        }
        if (!duLieuCapNhat.matKhau) {
            delete duLieuCapNhat.matKhau;
        }
        const nguoiDung = await nguoidung_mohinh_js_1.NguoiDung.findByIdAndUpdate(ma, await bamMatKhauNeuCo(duLieuCapNhat), { returnDocument: 'after', runValidators: true });
        if (!nguoiDung) {
            throw new loiungdung_js_1.LoiUngDung('Khong tim thay nguoi dung de cap nhat', 404);
        }
        return boMatKhau(nguoiDung);
    },
    async xoa(ma) {
        const nguoiDung = await nguoidung_mohinh_js_1.NguoiDung.findById(ma);
        if (!nguoiDung) {
            throw new loiungdung_js_1.LoiUngDung('Khong tim thay nguoi dung de xoa', 404);
        }
        if (nguoiDung.vaiTro === 'admin') {
            const soAdmin = await nguoidung_mohinh_js_1.NguoiDung.countDocuments({ vaiTro: 'admin' });
            if (soAdmin <= 1) {
                throw new loiungdung_js_1.LoiUngDung('Khong the xoa admin cuoi cung cua he thong', 409);
            }
        }
        await nguoidung_mohinh_js_1.NguoiDung.findByIdAndDelete(ma);
        return boMatKhau(nguoiDung);
    },
};
