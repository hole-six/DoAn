"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dieuKhienUngVien = void 0;
const batloibatdongbo_js_1 = require("../../dungchung/batloibatdongbo.js");
const dieukhiencoban_js_1 = require("../../dungchung/dieukhiencoban.js");
const ungvien_dichvu_js_1 = require("./ungvien.dichvu.js");
const ungvien_kiemtra_js_1 = require("./ungvien.kiemtra.js");
const dieuKhienCoBan = (0, dieukhiencoban_js_1.taoDieuKhienCoBan)(ungvien_dichvu_js_1.dichVuUngVien, ungvien_kiemtra_js_1.kiemTraTaoUngVien, ungvien_kiemtra_js_1.kiemTraCapNhatUngVien);
exports.dieuKhienUngVien = {
    ...dieuKhienCoBan,
    // Lấy hồ sơ của người dùng hiện tại
    layHoSoCuaToi: (0, batloibatdongbo_js_1.batLoiBatDongBo)(async (yeuCau, phanHoi) => {
        const maNguoiDung = yeuCau.user?.id || yeuCau.nguoiDung?.id;
        if (!maNguoiDung) {
            return phanHoi.status(401).json({
                thanhCong: false,
                thongBao: 'Vui lòng đăng nhập để xem hồ sơ'
            });
        }
        const duLieu = await ungvien_dichvu_js_1.dichVuUngVien.layTheoMaNguoiDung(maNguoiDung);
        return phanHoi.json({ duLieu });
    }),
    // Cập nhật với kiểm tra quyền
    capNhatCoQuyen: (0, batloibatdongbo_js_1.batLoiBatDongBo)(async (yeuCau, phanHoi) => {
        const duLieuHopLe = ungvien_kiemtra_js_1.kiemTraCapNhatUngVien.parse(yeuCau.body);
        const ma = String(yeuCau.params.ma ?? '');
        const maNguoiDung = yeuCau.user?.id || yeuCau.nguoiDung?.id;
        const duLieu = await ungvien_dichvu_js_1.dichVuUngVien.capNhat(ma, duLieuHopLe, maNguoiDung);
        return phanHoi.json({
            duLieu,
            thanhCong: true,
            thongBao: 'Cập nhật hồ sơ thành công'
        });
    }),
    // Xóa với kiểm tra quyền
    xoaCoQuyen: (0, batloibatdongbo_js_1.batLoiBatDongBo)(async (yeuCau, phanHoi) => {
        const ma = String(yeuCau.params.ma ?? '');
        const maNguoiDung = yeuCau.user?.id || yeuCau.nguoiDung?.id;
        await ungvien_dichvu_js_1.dichVuUngVien.xoa(ma, maNguoiDung);
        return phanHoi.json({
            thanhCong: true,
            thongBao: 'Xóa hồ sơ thành công'
        });
    }),
};
