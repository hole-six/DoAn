"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dinhTuyenHoSoUngTuyen = void 0;
const express_1 = require("express");
const batloibatdongbo_js_1 = require("../../dungchung/batloibatdongbo.js");
const loiungdung_js_1 = require("../../dungchung/loiungdung.js");
const xacthuc_js_1 = require("../../dungchung/xacthuc.js");
const trangthai_dichvu_js_1 = require("../workflow/trangthai.dichvu.js");
const nhatuyendung_mohinh_js_1 = require("../nhatuyendung/nhatuyendung.mohinh.js");
const tintuyendung_mohinh_js_1 = require("../tintuyendung/tintuyendung.mohinh.js");
const ungvien_mohinh_js_1 = require("../ungvien/ungvien.mohinh.js");
const hosoungtuyen_dieukhien_js_1 = require("./hosoungtuyen.dieukhien.js");
const hosoungtuyen_mohinh_js_1 = require("./hosoungtuyen.mohinh.js");
const ungtuyen_dichvu_js_1 = require("../workflow/ungtuyen.dichvu.js");
async function kiemTraQuyenCapNhatHoSoUngTuyen(yeuCau, _phanHoi, tiepTheo) {
    const nguoiDung = yeuCau.nguoiDung;
    const ma = String(yeuCau.params.ma ?? '');
    const hoSo = await hosoungtuyen_mohinh_js_1.HoSoUngTuyen.findById(ma).populate('maTinTuyenDung maUngVien');
    if (!hoSo)
        throw new loiungdung_js_1.LoiUngDung('Khong tim thay ho so ung tuyen', 404, 'NOT_FOUND');
    const trangThaiMoi = String(yeuCau.body?.trangThai ?? '');
    if (!trangThaiMoi) {
        tiepTheo();
        return;
    }
    const trangThaiHienTai = String(hoSo.trangThai ?? '');
    const vaiTro = String(nguoiDung.vaiTro ?? '');
    if (vaiTro === 'ung_vien') {
        const ungVien = await ungvien_mohinh_js_1.UngVien.findOne({ maNguoiDung: nguoiDung.id }).select('_id');
        if (!ungVien || String(ungVien._id) !== String(hoSo.maUngVien?._id ?? hoSo.maUngVien)) {
            throw new loiungdung_js_1.LoiUngDung('Ban khong co quyen cap nhat ho so ung tuyen nay', 403, 'FORBIDDEN');
        }
    }
    if (vaiTro === 'nha_tuyen_dung') {
        const congTy = await nhatuyendung_mohinh_js_1.NhaTuyenDung.findOne({ maNguoiDung: nguoiDung.id }).select('_id');
        const tin = await tintuyendung_mohinh_js_1.TinTuyenDung.findById(hoSo.maTinTuyenDung?._id ?? hoSo.maTinTuyenDung).select('maNhaTuyenDung');
        if (!congTy || !tin || String(tin.maNhaTuyenDung) !== String(congTy._id)) {
            throw new loiungdung_js_1.LoiUngDung('Ban khong co quyen cap nhat ho so ung tuyen nay', 403, 'FORBIDDEN');
        }
    }
    (0, trangthai_dichvu_js_1.damBaoTrangThaiHoSoUngTuyen)(vaiTro, trangThaiHienTai, trangThaiMoi);
    tiepTheo();
}
exports.dinhTuyenHoSoUngTuyen = (0, express_1.Router)();
exports.dinhTuyenHoSoUngTuyen.use(xacthuc_js_1.yeuCauDangNhap);
exports.dinhTuyenHoSoUngTuyen.post('/ung-tuyen', (0, xacthuc_js_1.yeuCauVaiTro)(['ung_vien']), (0, batloibatdongbo_js_1.batLoiBatDongBo)(async (yeuCau, phanHoi) => {
    const duLieu = await ungtuyen_dichvu_js_1.dichVuWorkflowUngTuyen.ungTuyen(yeuCau.nguoiDung, {
        maTinTuyenDung: String(yeuCau.body?.maTinTuyenDung ?? ''),
        maHoSoNangLuc: yeuCau.body?.maHoSoNangLuc,
        thuXinViec: yeuCau.body?.thuXinViec,
    });
    phanHoi.status(201).json({ duLieu });
}));
exports.dinhTuyenHoSoUngTuyen.post('/ung-tuyen-nhanh', (0, xacthuc_js_1.yeuCauVaiTro)(['ung_vien']), (0, batloibatdongbo_js_1.batLoiBatDongBo)(async (yeuCau, phanHoi) => {
    const maTinTuyenDung = String(yeuCau.body?.maTinTuyenDung ?? '');
    if (!maTinTuyenDung)
        throw new loiungdung_js_1.LoiUngDung('Thieu ma tin tuyen dung', 422, 'MISSING_JOB_ID');
    const duLieu = await ungtuyen_dichvu_js_1.dichVuWorkflowUngTuyen.ungTuyen(yeuCau.nguoiDung, {
        maTinTuyenDung,
        thuXinViec: yeuCau.body?.thuXinViec,
    });
    phanHoi.status(201).json({ duLieu });
}));
exports.dinhTuyenHoSoUngTuyen.get('/', hosoungtuyen_dieukhien_js_1.dieuKhienHoSoUngTuyen.layDanhSach);
exports.dinhTuyenHoSoUngTuyen.get('/:ma', hosoungtuyen_dieukhien_js_1.dieuKhienHoSoUngTuyen.layChiTiet);
exports.dinhTuyenHoSoUngTuyen.post('/', (0, xacthuc_js_1.yeuCauVaiTro)(['ung_vien', 'admin']), hosoungtuyen_dieukhien_js_1.dieuKhienHoSoUngTuyen.taoMoi);
exports.dinhTuyenHoSoUngTuyen.patch('/:ma', (0, xacthuc_js_1.yeuCauVaiTro)(['ung_vien', 'nha_tuyen_dung', 'admin']), (0, batloibatdongbo_js_1.batLoiBatDongBo)(async (yeuCau, _phanHoi, tiepTheo) => {
    if ('trangThai' in (yeuCau.body ?? {}) || 'diemKhopKyNang' in (yeuCau.body ?? {})) {
        throw new loiungdung_js_1.LoiUngDung('Khong cap nhat truc tiep trang thai hoac diem khop ky nang; hay dung endpoint nghiep vu', 409, 'BUSINESS_ENDPOINT_REQUIRED');
    }
    tiepTheo();
}), (0, batloibatdongbo_js_1.batLoiBatDongBo)(kiemTraQuyenCapNhatHoSoUngTuyen), hosoungtuyen_dieukhien_js_1.dieuKhienHoSoUngTuyen.capNhat);
exports.dinhTuyenHoSoUngTuyen.delete('/:ma', (0, xacthuc_js_1.yeuCauVaiTro)(['ung_vien', 'nha_tuyen_dung', 'admin']), (0, batloibatdongbo_js_1.batLoiBatDongBo)(kiemTraQuyenCapNhatHoSoUngTuyen), hosoungtuyen_dieukhien_js_1.dieuKhienHoSoUngTuyen.xoa);
exports.dinhTuyenHoSoUngTuyen.post('/:ma/rut', (0, xacthuc_js_1.yeuCauVaiTro)(['ung_vien']), (0, batloibatdongbo_js_1.batLoiBatDongBo)(async (yeuCau, phanHoi) => {
    const ma = String(yeuCau.params.ma ?? '');
    const duLieu = await ungtuyen_dichvu_js_1.dichVuWorkflowUngTuyen.rutHoSo(yeuCau.nguoiDung, ma, yeuCau.body?.ghiChu);
    phanHoi.json({ duLieu });
}));
exports.dinhTuyenHoSoUngTuyen.post('/:ma/xem', (0, xacthuc_js_1.yeuCauVaiTro)(['nha_tuyen_dung']), (0, batloibatdongbo_js_1.batLoiBatDongBo)(async (yeuCau, phanHoi) => {
    const duLieu = await ungtuyen_dichvu_js_1.dichVuWorkflowUngTuyen.xemHoSo(yeuCau.nguoiDung, String(yeuCau.params.ma ?? ''));
    phanHoi.json({ duLieu });
}));
exports.dinhTuyenHoSoUngTuyen.post('/:ma/danh-gia', (0, xacthuc_js_1.yeuCauVaiTro)(['nha_tuyen_dung']), (0, batloibatdongbo_js_1.batLoiBatDongBo)(async (yeuCau, phanHoi) => {
    const duLieu = await ungtuyen_dichvu_js_1.dichVuWorkflowUngTuyen.danhGiaHoSo(yeuCau.nguoiDung, String(yeuCau.params.ma ?? ''), {
        trangThai: String(yeuCau.body?.trangThai ?? 'dang_xet_duyet'),
        ghiChu: yeuCau.body?.ghiChu,
    });
    phanHoi.json({ duLieu });
}));
exports.dinhTuyenHoSoUngTuyen.post('/:ma/moi-phong-van', (0, xacthuc_js_1.yeuCauVaiTro)(['nha_tuyen_dung']), (0, batloibatdongbo_js_1.batLoiBatDongBo)(async (yeuCau, phanHoi) => {
    const duLieu = await ungtuyen_dichvu_js_1.dichVuWorkflowUngTuyen.moiPhongVan(yeuCau.nguoiDung, String(yeuCau.params.ma ?? ''), yeuCau.body);
    phanHoi.status(201).json({ duLieu });
}));
exports.dinhTuyenHoSoUngTuyen.post('/:ma/chuyen-trang-thai', (0, xacthuc_js_1.yeuCauVaiTro)(['nha_tuyen_dung', 'admin']), (0, batloibatdongbo_js_1.batLoiBatDongBo)(async () => {
    throw new loiungdung_js_1.LoiUngDung('Khong chuyen trang thai truc tiep; hay dung endpoint nghiep vu phu hop', 409, 'BUSINESS_ENDPOINT_REQUIRED');
}));
