"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dinhTuyenNhaTuyenDung = void 0;
const express_1 = require("express");
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const multer_1 = __importDefault(require("multer"));
const nhatuyendung_dieukhien_js_1 = require("./nhatuyendung.dieukhien.js");
const thuMucUpload = node_path_1.default.join(process.cwd(), 'uploads');
node_fs_1.default.mkdirSync(thuMucUpload, { recursive: true });
const taiLogo = (0, multer_1.default)({
    storage: multer_1.default.diskStorage({
        destination: (_yeuCau, _tep, goiLai) => goiLai(null, thuMucUpload),
        filename: (_yeuCau, tep, goiLai) => {
            const duoiTep = node_path_1.default.extname(tep.originalname).toLowerCase();
            const tenTep = `logo-${Date.now()}-${Math.round(Math.random() * 1e9)}${duoiTep}`;
            goiLai(null, tenTep);
        },
    }),
    limits: { fileSize: 3 * 1024 * 1024 },
    fileFilter: (_yeuCau, tep, goiLai) => {
        if (!tep.mimetype.startsWith('image/'))
            return goiLai(new Error('Chi cho phep upload file anh'));
        goiLai(null, true);
    },
});
exports.dinhTuyenNhaTuyenDung = (0, express_1.Router)();
exports.dinhTuyenNhaTuyenDung.post('/upload-logo', taiLogo.single('logo'), (yeuCau, phanHoi) => {
    if (!yeuCau.file)
        return phanHoi.status(400).json({ thongBao: 'Chua co file logo' });
    const duongDan = `/uploads/${yeuCau.file.filename}`;
    const gocUrl = `${yeuCau.protocol}://${yeuCau.get('host')}`;
    return phanHoi.status(201).json({ duLieu: { duongDan, url: `${gocUrl}${duongDan}` } });
});
exports.dinhTuyenNhaTuyenDung.get('/', nhatuyendung_dieukhien_js_1.dieuKhienNhaTuyenDung.layDanhSach);
exports.dinhTuyenNhaTuyenDung.get('/:ma', nhatuyendung_dieukhien_js_1.dieuKhienNhaTuyenDung.layChiTiet);
exports.dinhTuyenNhaTuyenDung.post('/', nhatuyendung_dieukhien_js_1.dieuKhienNhaTuyenDung.taoMoi);
exports.dinhTuyenNhaTuyenDung.patch('/:ma', nhatuyendung_dieukhien_js_1.dieuKhienNhaTuyenDung.capNhat);
exports.dinhTuyenNhaTuyenDung.delete('/:ma', nhatuyendung_dieukhien_js_1.dieuKhienNhaTuyenDung.xoa);
