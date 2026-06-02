"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dinhTuyenLichPhongVan = void 0;
const express_1 = require("express");
const batloibatdongbo_js_1 = require("../../dungchung/batloibatdongbo.js");
const loiungdung_js_1 = require("../../dungchung/loiungdung.js");
const xacthuc_js_1 = require("../../dungchung/xacthuc.js");
const hosoungtuyen_mohinh_js_1 = require("../hosoungtuyen/hosoungtuyen.mohinh.js");
const nhatuyendung_mohinh_js_1 = require("../nhatuyendung/nhatuyendung.mohinh.js");
const tintuyendung_mohinh_js_1 = require("../tintuyendung/tintuyendung.mohinh.js");
const ungvien_mohinh_js_1 = require("../ungvien/ungvien.mohinh.js");
const trangthai_dichvu_js_1 = require("../workflow/trangthai.dichvu.js");
const ungtuyen_dichvu_js_1 = require("../workflow/ungtuyen.dichvu.js");
const lichphongvan_dieukhien_js_1 = require("./lichphongvan.dieukhien.js");
const lichphongvan_dichvu_js_1 = require("./lichphongvan.dichvu.js");
const lichphongvan_mohinh_js_1 = require("./lichphongvan.mohinh.js");
async function kiemTraQuyenLichPhongVan(yeuCau, _phanHoi, tiepTheo) {
    const nguoiDung = yeuCau.nguoiDung;
    const ma = String(yeuCau.params.ma ?? '');
    const lich = await lichphongvan_mohinh_js_1.LichPhongVan.findById(ma).populate('maHoSoUngTuyen');
    if (!lich)
        throw new loiungdung_js_1.LoiUngDung('Không tìm thấy lịch phỏng vấn', 404, 'NOT_FOUND');
    const hoSo = await hosoungtuyen_mohinh_js_1.HoSoUngTuyen.findById(lich.maHoSoUngTuyen?._id ?? lich.maHoSoUngTuyen).select('maUngVien maTinTuyenDung');
    if (!hoSo)
        throw new loiungdung_js_1.LoiUngDung('Không tìm thấy hồ sơ ứng tuyển', 404, 'NOT_FOUND');
    const vaiTro = String(nguoiDung.vaiTro ?? '');
    if (vaiTro === 'ung_vien') {
        const ungVien = await ungvien_mohinh_js_1.UngVien.findOne({ maNguoiDung: nguoiDung.id }).select('_id');
        if (!ungVien || String(ungVien._id) !== String(hoSo.maUngVien)) {
            throw new loiungdung_js_1.LoiUngDung('Bạn không có quyền cập nhật lịch phỏng vấn này', 403, 'FORBIDDEN');
        }
    }
    if (vaiTro === 'nha_tuyen_dung') {
        const congTy = await nhatuyendung_mohinh_js_1.NhaTuyenDung.findOne({ maNguoiDung: nguoiDung.id }).select('_id');
        const tin = await tintuyendung_mohinh_js_1.TinTuyenDung.findById(hoSo.maTinTuyenDung).select('maNhaTuyenDung');
        if (!congTy || !tin || String(tin.maNhaTuyenDung) !== String(congTy._id)) {
            throw new loiungdung_js_1.LoiUngDung('Bạn không có quyền cập nhật lịch phỏng vấn này', 403, 'FORBIDDEN');
        }
    }
    const trangThaiMoi = String(yeuCau.body?.trangThai ?? '');
    if (trangThaiMoi) {
        (0, trangthai_dichvu_js_1.damBaoTrangThaiLichPhongVan)(vaiTro, String(lich.trangThai ?? ''), trangThaiMoi);
    }
    tiepTheo();
}
exports.dinhTuyenLichPhongVan = (0, express_1.Router)();
exports.dinhTuyenLichPhongVan.use(xacthuc_js_1.yeuCauDangNhap);
exports.dinhTuyenLichPhongVan.get('/', lichphongvan_dieukhien_js_1.dieuKhienLichPhongVan.layDanhSach);
exports.dinhTuyenLichPhongVan.get('/:ma', lichphongvan_dieukhien_js_1.dieuKhienLichPhongVan.layChiTiet);
exports.dinhTuyenLichPhongVan.post('/', (0, xacthuc_js_1.yeuCauVaiTro)(['nha_tuyen_dung', 'admin']), (0, batloibatdongbo_js_1.batLoiBatDongBo)(async () => {
    throw new loiungdung_js_1.LoiUngDung('Hãy tạo lịch phỏng vấn qua endpoint /hosoungtuyen/:ma/moi-phong-van để đồng bộ trạng thái hồ sơ', 409, 'BUSINESS_ENDPOINT_REQUIRED');
}));
exports.dinhTuyenLichPhongVan.patch('/:ma', (0, xacthuc_js_1.yeuCauVaiTro)(['ung_vien', 'nha_tuyen_dung', 'admin']), (0, batloibatdongbo_js_1.batLoiBatDongBo)(async (yeuCau, _phanHoi, tiepTheo) => {
    if ('trangThai' in (yeuCau.body ?? {}) || 'ketQua' in (yeuCau.body ?? {})) {
        throw new loiungdung_js_1.LoiUngDung('Không cập nhật trực tiếp trạng thái hoặc kết quả phỏng vấn; hãy dùng endpoint nghiệp vụ', 409, 'BUSINESS_ENDPOINT_REQUIRED');
    }
    tiepTheo();
}), (0, batloibatdongbo_js_1.batLoiBatDongBo)(kiemTraQuyenLichPhongVan), lichphongvan_dieukhien_js_1.dieuKhienLichPhongVan.capNhat);
exports.dinhTuyenLichPhongVan.delete('/:ma', (0, xacthuc_js_1.yeuCauVaiTro)(['nha_tuyen_dung', 'admin']), (0, batloibatdongbo_js_1.batLoiBatDongBo)(kiemTraQuyenLichPhongVan), lichphongvan_dieukhien_js_1.dieuKhienLichPhongVan.xoa);
async function thucThiHanhDongLichPhongVan(yeuCau, phanHoi, duLieuCapNhat) {
    const ma = String(yeuCau.params.ma ?? '');
    yeuCau.body = duLieuCapNhat;
    await kiemTraQuyenLichPhongVan(yeuCau, phanHoi, () => undefined);
    const duLieu = await lichphongvan_dichvu_js_1.dichVuLichPhongVan.capNhat(ma, duLieuCapNhat);
    phanHoi.json({ duLieu });
}
exports.dinhTuyenLichPhongVan.post('/:ma/xac-nhan', (0, xacthuc_js_1.yeuCauVaiTro)(['ung_vien']), (0, batloibatdongbo_js_1.batLoiBatDongBo)(async (yeuCau, phanHoi) => {
    const duLieu = await ungtuyen_dichvu_js_1.dichVuWorkflowUngTuyen.xacNhanLichPhongVan(yeuCau.nguoiDung, String(yeuCau.params.ma ?? ''));
    phanHoi.json({ duLieu });
}));
exports.dinhTuyenLichPhongVan.post('/:ma/doi-lich', (0, xacthuc_js_1.yeuCauVaiTro)(['ung_vien']), (0, batloibatdongbo_js_1.batLoiBatDongBo)(async (yeuCau, phanHoi) => {
    const duLieu = await ungtuyen_dichvu_js_1.dichVuWorkflowUngTuyen.yeuCauDoiLich(yeuCau.nguoiDung, String(yeuCau.params.ma ?? ''), yeuCau.body?.ghiChu);
    phanHoi.json({ duLieu });
}));
exports.dinhTuyenLichPhongVan.patch('/:ma/cap-nhat', (0, xacthuc_js_1.yeuCauVaiTro)(['nha_tuyen_dung']), (0, batloibatdongbo_js_1.batLoiBatDongBo)(async (yeuCau, phanHoi) => {
    const duLieu = await ungtuyen_dichvu_js_1.dichVuWorkflowUngTuyen.capNhatLichPhongVan(yeuCau.nguoiDung, String(yeuCau.params.ma ?? ''), yeuCau.body);
    phanHoi.json({ duLieu });
}));
exports.dinhTuyenLichPhongVan.post('/:ma/hoan-thanh', (0, xacthuc_js_1.yeuCauVaiTro)(['nha_tuyen_dung']), (0, batloibatdongbo_js_1.batLoiBatDongBo)(async (yeuCau, phanHoi) => {
    const duLieu = await ungtuyen_dichvu_js_1.dichVuWorkflowUngTuyen.capNhatKetQuaPhongVan(yeuCau.nguoiDung, String(yeuCau.params.ma ?? ''), {
        ketQua: String(yeuCau.body?.ketQua ?? ''),
        ghiChu: yeuCau.body?.ghiChu,
    });
    phanHoi.json({ duLieu });
}));
exports.dinhTuyenLichPhongVan.post('/:ma/huy', (0, xacthuc_js_1.yeuCauVaiTro)(['ung_vien', 'nha_tuyen_dung', 'admin']), (0, batloibatdongbo_js_1.batLoiBatDongBo)(async (yeuCau, phanHoi) => {
    const ghiChu = yeuCau.body?.ghiChu;
    await thucThiHanhDongLichPhongVan(yeuCau, phanHoi, { trangThai: 'da_huy', ghiChu });
}));
