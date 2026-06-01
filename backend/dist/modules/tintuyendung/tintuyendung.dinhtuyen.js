"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dinhTuyenTinTuyenDung = void 0;
const express_1 = require("express");
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const multer_1 = __importDefault(require("multer"));
const batloibatdongbo_js_1 = require("../../dungchung/batloibatdongbo.js");
const loiungdung_js_1 = require("../../dungchung/loiungdung.js");
const xacthuc_js_1 = require("../../dungchung/xacthuc.js");
const nhatuyendung_mohinh_js_1 = require("../nhatuyendung/nhatuyendung.mohinh.js");
const xacthuc_dichvu_js_1 = require("../xacthuc/xacthuc.dichvu.js");
const trangthai_dichvu_js_1 = require("../workflow/trangthai.dichvu.js");
const tintuyendung_dieukhien_js_1 = require("./tintuyendung.dieukhien.js");
const tintuyendung_mohinh_js_1 = require("./tintuyendung.mohinh.js");
const TRANG_THAI_KHOA_SUA = new Set(['dang_mo', 'tam_dong', 'het_han']);
const thuMucUpload = node_path_1.default.join(process.cwd(), 'uploads');
node_fs_1.default.mkdirSync(thuMucUpload, { recursive: true });
const taiAnhTin = (0, multer_1.default)({
    storage: multer_1.default.diskStorage({
        destination: (_yeuCau, _tep, goiLai) => goiLai(null, thuMucUpload),
        filename: (_yeuCau, tep, goiLai) => {
            const duoiTep = node_path_1.default.extname(tep.originalname).toLowerCase();
            goiLai(null, `tin-${Date.now()}-${Math.round(Math.random() * 1e9)}${duoiTep}`);
        },
    }),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (_yeuCau, tep, goiLai) => {
        if (!tep.mimetype.startsWith('image/'))
            return goiLai(new Error('Chi cho phep upload file anh'));
        goiLai(null, true);
    },
});
async function layCongTyTheoNguoiDung(maNguoiDung) {
    return nhatuyendung_mohinh_js_1.NhaTuyenDung.findOne({ maNguoiDung }).select('_id');
}
const damBaoQuyenTaoTin = (0, batloibatdongbo_js_1.batLoiBatDongBo)(async (yeuCau, _phanHoi, tiepTheo) => {
    const nguoiDung = await (0, xacthuc_dichvu_js_1.layNguoiDungTuAccessToken)(yeuCau.headers.authorization);
    if (!['nha_tuyen_dung', 'admin'].includes(nguoiDung.vaiTro)) {
        throw new loiungdung_js_1.LoiUngDung('Ban khong co quyen tao tin tuyen dung', 403);
    }
    if (nguoiDung.vaiTro === 'nha_tuyen_dung') {
        const congTy = await layCongTyTheoNguoiDung(nguoiDung.id);
        if (!congTy)
            throw new loiungdung_js_1.LoiUngDung('Tai khoan nay chua co ho so nha tuyen dung', 422);
        yeuCau.body = {
            ...yeuCau.body,
            maNhaTuyenDung: String(congTy._id),
            trangThai: 'cho_duyet',
        };
    }
    tiepTheo();
});
const damBaoQuyenSuaXoaTin = (0, batloibatdongbo_js_1.batLoiBatDongBo)(async (yeuCau, _phanHoi, tiepTheo) => {
    const nguoiDung = await (0, xacthuc_dichvu_js_1.layNguoiDungTuAccessToken)(yeuCau.headers.authorization);
    if (!['nha_tuyen_dung', 'admin'].includes(nguoiDung.vaiTro)) {
        throw new loiungdung_js_1.LoiUngDung('Ban khong co quyen sua tin tuyen dung', 403);
    }
    const ma = String(yeuCau.params.ma ?? '');
    const tin = await tintuyendung_mohinh_js_1.TinTuyenDung.findById(ma);
    if (!tin)
        throw new loiungdung_js_1.LoiUngDung('Khong tim thay tin tuyen dung', 404);
    if (nguoiDung.vaiTro === 'admin') {
        if (yeuCau.body?.trangThai) {
            (0, trangthai_dichvu_js_1.damBaoTrangThaiTinTuyenDung)('admin', String(tin.trangThai ?? ''), String(yeuCau.body.trangThai));
        }
        tiepTheo();
        return;
    }
    const congTy = await layCongTyTheoNguoiDung(nguoiDung.id);
    if (!congTy)
        throw new loiungdung_js_1.LoiUngDung('Tai khoan nay chua co ho so nha tuyen dung', 422);
    if (String(tin.maNhaTuyenDung) !== String(congTy._id)) {
        throw new loiungdung_js_1.LoiUngDung('Ban khong co quyen sua tin tuyen dung nay', 403);
    }
    if (yeuCau.body?.trangThai) {
        const trangThaiMoi = String(yeuCau.body.trangThai);
        (0, trangthai_dichvu_js_1.damBaoTrangThaiTinTuyenDung)(nguoiDung.vaiTro, String(tin.trangThai ?? ''), trangThaiMoi);
    }
    if (String(yeuCau.method).toUpperCase() === 'PATCH') {
        if (TRANG_THAI_KHOA_SUA.has(String(tin.trangThai ?? ''))) {
            throw new loiungdung_js_1.LoiUngDung('Tin da duyet chi cho phep doi trang thai dong/mo, khong the chinh sua noi dung', 409, 'JOB_POST_LOCKED', undefined, 'Su dung thao tac tam dong/mo lai cho tin da duyet');
        }
        yeuCau.body = {
            ...yeuCau.body,
            maNhaTuyenDung: String(congTy._id),
        };
    }
    tiepTheo();
});
exports.dinhTuyenTinTuyenDung = (0, express_1.Router)();
exports.dinhTuyenTinTuyenDung.get('/', tintuyendung_dieukhien_js_1.dieuKhienTinTuyenDung.layDanhSach);
exports.dinhTuyenTinTuyenDung.get('/:ma', tintuyendung_dieukhien_js_1.dieuKhienTinTuyenDung.layChiTiet);
exports.dinhTuyenTinTuyenDung.use(xacthuc_js_1.yeuCauDangNhap);
exports.dinhTuyenTinTuyenDung.post('/upload-anh', (0, xacthuc_js_1.yeuCauVaiTro)(['nha_tuyen_dung', 'admin']), taiAnhTin.single('anh'), (yeuCau, phanHoi) => {
    if (!yeuCau.file)
        return phanHoi.status(400).json({ thongBao: 'Chua co file anh tin tuyen dung' });
    const duongDan = `/uploads/${yeuCau.file.filename}`;
    const gocUrl = `${yeuCau.protocol}://${yeuCau.get('host')}`;
    return phanHoi.status(201).json({ duLieu: { duongDan, url: `${gocUrl}${duongDan}` } });
});
exports.dinhTuyenTinTuyenDung.post('/', damBaoQuyenTaoTin, tintuyendung_dieukhien_js_1.dieuKhienTinTuyenDung.taoMoi);
exports.dinhTuyenTinTuyenDung.patch('/:ma', damBaoQuyenSuaXoaTin, tintuyendung_dieukhien_js_1.dieuKhienTinTuyenDung.capNhat);
exports.dinhTuyenTinTuyenDung.delete('/:ma', damBaoQuyenSuaXoaTin, tintuyendung_dieukhien_js_1.dieuKhienTinTuyenDung.xoa);
exports.dinhTuyenTinTuyenDung.post('/:ma/duyet', (0, xacthuc_js_1.yeuCauVaiTro)(['admin']), (0, batloibatdongbo_js_1.batLoiBatDongBo)(async (yeuCau, _phanHoi, tiepTheo) => {
    yeuCau.body = { trangThai: 'dang_mo' };
    tiepTheo();
}), tintuyendung_dieukhien_js_1.dieuKhienTinTuyenDung.capNhat);
exports.dinhTuyenTinTuyenDung.post('/:ma/tu-choi', (0, xacthuc_js_1.yeuCauVaiTro)(['admin']), (0, batloibatdongbo_js_1.batLoiBatDongBo)(async (yeuCau, _phanHoi, tiepTheo) => {
    yeuCau.body = { trangThai: 'tu_choi' };
    tiepTheo();
}), tintuyendung_dieukhien_js_1.dieuKhienTinTuyenDung.capNhat);
exports.dinhTuyenTinTuyenDung.post('/:ma/mo-lai', (0, xacthuc_js_1.yeuCauVaiTro)(['admin', 'nha_tuyen_dung']), (0, batloibatdongbo_js_1.batLoiBatDongBo)(async (yeuCau, _phanHoi, tiepTheo) => {
    yeuCau.body = { trangThai: 'dang_mo' };
    tiepTheo();
}), damBaoQuyenSuaXoaTin, tintuyendung_dieukhien_js_1.dieuKhienTinTuyenDung.capNhat);
exports.dinhTuyenTinTuyenDung.post('/:ma/tam-dong', (0, xacthuc_js_1.yeuCauVaiTro)(['admin', 'nha_tuyen_dung']), (0, batloibatdongbo_js_1.batLoiBatDongBo)(async (yeuCau, _phanHoi, tiepTheo) => {
    yeuCau.body = { trangThai: 'tam_dong' };
    tiepTheo();
}), damBaoQuyenSuaXoaTin, tintuyendung_dieukhien_js_1.dieuKhienTinTuyenDung.capNhat);
