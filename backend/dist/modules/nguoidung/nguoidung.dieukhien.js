"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dieuKhienNguoiDung = void 0;
const batloibatdongbo_js_1 = require("../../dungchung/batloibatdongbo.js");
const loiungdung_js_1 = require("../../dungchung/loiungdung.js");
const nguoidung_dichvu_js_1 = require("./nguoidung.dichvu.js");
const nguoidung_kiemtra_js_1 = require("./nguoidung.kiemtra.js");
function layNguoiDungTuYeuCau(yeuCau) {
    return yeuCau.nguoiDung;
}
function laQuanTriVien(yeuCau) {
    return layNguoiDungTuYeuCau(yeuCau)?.vaiTro === 'admin';
}
function laChinhChuTaiKhoan(yeuCau, maNguoiDung) {
    return String(layNguoiDungTuYeuCau(yeuCau)?.id ?? '') === String(maNguoiDung);
}
function batBuocDangNhap(yeuCau) {
    if (!layNguoiDungTuYeuCau(yeuCau)) {
        throw new loiungdung_js_1.LoiUngDung('Bạn cần đăng nhập để thực hiện thao tác này', 401, 'UNAUTHORIZED');
    }
}
function batBuocQuanTriVien(yeuCau) {
    if (!laQuanTriVien(yeuCau)) {
        throw new loiungdung_js_1.LoiUngDung('Chỉ quản trị viên mới được thực hiện thao tác này', 403, 'FORBIDDEN');
    }
}
function khongChoPhepNguoiDungThuongTaoThemTaiKhoan(yeuCau) {
    const nguoiDung = layNguoiDungTuYeuCau(yeuCau);
    if (nguoiDung && nguoiDung.vaiTro !== 'admin') {
        throw new loiungdung_js_1.LoiUngDung('Tài khoản hiện tại không được phép tạo thêm người dùng', 403, 'FORBIDDEN');
    }
}
exports.dieuKhienNguoiDung = {
    layDanhSach: (0, batloibatdongbo_js_1.batLoiBatDongBo)(async (yeuCau, phanHoi) => {
        batBuocDangNhap(yeuCau);
        batBuocQuanTriVien(yeuCau);
        const duLieu = await nguoidung_dichvu_js_1.dichVuNguoiDung.layDanhSach();
        return phanHoi.json({ duLieu });
    }),
    layChiTiet: (0, batloibatdongbo_js_1.batLoiBatDongBo)(async (yeuCau, phanHoi) => {
        batBuocDangNhap(yeuCau);
        const ma = String(yeuCau.params.ma ?? '');
        if (!laQuanTriVien(yeuCau) && !laChinhChuTaiKhoan(yeuCau, ma)) {
            throw new loiungdung_js_1.LoiUngDung('Bạn không thể xem thông tin của tài khoản khác', 403, 'FORBIDDEN');
        }
        const duLieu = await nguoidung_dichvu_js_1.dichVuNguoiDung.layTheoMa(ma);
        return phanHoi.json({ duLieu });
    }),
    taoMoi: (0, batloibatdongbo_js_1.batLoiBatDongBo)(async (yeuCau, phanHoi) => {
        const nguoiDung = layNguoiDungTuYeuCau(yeuCau);
        if (nguoiDung) {
            batBuocQuanTriVien(yeuCau);
            const duLieuHopLe = nguoidung_kiemtra_js_1.kiemTraTaoNguoiDung.parse(yeuCau.body);
            const duLieu = await nguoidung_dichvu_js_1.dichVuNguoiDung.taoMoi(duLieuHopLe);
            return phanHoi.status(201).json({ duLieu });
        }
        khongChoPhepNguoiDungThuongTaoThemTaiKhoan(yeuCau);
        const duLieuHopLe = nguoidung_kiemtra_js_1.kiemTraTaoNguoiDungCongKhai.parse(yeuCau.body);
        const duLieu = await nguoidung_dichvu_js_1.dichVuNguoiDung.taoMoi(duLieuHopLe);
        return phanHoi.status(201).json({ duLieu });
    }),
    capNhat: (0, batloibatdongbo_js_1.batLoiBatDongBo)(async (yeuCau, phanHoi) => {
        batBuocDangNhap(yeuCau);
        const ma = String(yeuCau.params.ma ?? '');
        if (!laQuanTriVien(yeuCau) && !laChinhChuTaiKhoan(yeuCau, ma)) {
            throw new loiungdung_js_1.LoiUngDung('Bạn không thể cập nhật tài khoản của người khác', 403, 'FORBIDDEN');
        }
        const duLieuHopLe = laQuanTriVien(yeuCau)
            ? nguoidung_kiemtra_js_1.kiemTraCapNhatNguoiDung.parse(yeuCau.body)
            : nguoidung_kiemtra_js_1.kiemTraCapNhatNguoiDungCaNhan.parse(yeuCau.body);
        const duLieu = await nguoidung_dichvu_js_1.dichVuNguoiDung.capNhat(ma, duLieuHopLe);
        return phanHoi.json({ duLieu });
    }),
    xoa: (0, batloibatdongbo_js_1.batLoiBatDongBo)(async (yeuCau, phanHoi) => {
        batBuocDangNhap(yeuCau);
        batBuocQuanTriVien(yeuCau);
        const ma = String(yeuCau.params.ma ?? '');
        await nguoidung_dichvu_js_1.dichVuNguoiDung.xoa(ma);
        return phanHoi.status(204).send();
    }),
};
