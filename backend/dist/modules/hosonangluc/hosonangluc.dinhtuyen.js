"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dinhTuyenHoSoNangLuc = void 0;
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const multer_1 = __importDefault(require("multer"));
const dinhtuyencoban_js_1 = require("../../dungchung/dinhtuyencoban.js");
const xacthuc_js_1 = require("../../dungchung/xacthuc.js");
const hosonangluc_dieukhien_js_1 = require("./hosonangluc.dieukhien.js");
const thuMucUpload = node_path_1.default.join(process.cwd(), 'uploads');
node_fs_1.default.mkdirSync(thuMucUpload, { recursive: true });
function taoDuongDanUpload(tenTep, tienTo) {
    const duoiTep = node_path_1.default.extname(tenTep).toLowerCase();
    return `${tienTo}-${Date.now()}-${Math.round(Math.random() * 1e9)}${duoiTep}`;
}
const taiAnhCv = (0, multer_1.default)({
    storage: multer_1.default.diskStorage({
        destination: (_yeuCau, _tep, goiLai) => goiLai(null, thuMucUpload),
        filename: (_yeuCau, tep, goiLai) => goiLai(null, taoDuongDanUpload(tep.originalname, 'cv-photo')),
    }),
    limits: { fileSize: 3 * 1024 * 1024 },
    fileFilter: (_yeuCau, tep, goiLai) => {
        if (!tep.mimetype.startsWith('image/'))
            return goiLai(new Error('Chi cho phep upload file anh CV'));
        goiLai(null, true);
    },
});
const duoiTepCvHopLe = new Set(['.pdf', '.doc', '.docx', '.txt', '.md']);
const mimeCvHopLe = new Set([
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'text/markdown',
]);
const taiFileCv = (0, multer_1.default)({
    storage: multer_1.default.diskStorage({
        destination: (_yeuCau, _tep, goiLai) => goiLai(null, thuMucUpload),
        filename: (_yeuCau, tep, goiLai) => goiLai(null, taoDuongDanUpload(tep.originalname, 'cv-file')),
    }),
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (_yeuCau, tep, goiLai) => {
        const duoiTep = node_path_1.default.extname(tep.originalname).toLowerCase();
        if (!duoiTepCvHopLe.has(duoiTep) && !mimeCvHopLe.has(tep.mimetype)) {
            return goiLai(new Error('Chi cho phep upload CV dang PDF, DOC, DOCX, TXT hoac MD'));
        }
        goiLai(null, true);
    },
});
function phanHoiTepDaTaiLen(yeuCau, phanHoi, thongBaoThieuTep) {
    if (!yeuCau.file)
        return phanHoi.status(400).json({ thongBao: thongBaoThieuTep });
    const duongDan = `/uploads/${yeuCau.file.filename}`;
    const gocUrl = `${yeuCau.protocol}://${yeuCau.get('host')}`;
    return phanHoi.status(201).json({
        duLieu: {
            duongDan,
            url: `${gocUrl}${duongDan}`,
            tenTep: yeuCau.file.originalname,
            mimeLoai: yeuCau.file.mimetype,
        },
    });
}
exports.dinhTuyenHoSoNangLuc = (0, dinhtuyencoban_js_1.taoDinhTuyenCoBan)(hosonangluc_dieukhien_js_1.dieuKhienHoSoNangLuc);
exports.dinhTuyenHoSoNangLuc.post('/upload-anh', xacthuc_js_1.yeuCauDangNhap, (0, xacthuc_js_1.yeuCauVaiTro)(['ung_vien', 'admin']), taiAnhCv.single('anh'), (yeuCau, phanHoi) => {
    return phanHoiTepDaTaiLen(yeuCau, phanHoi, 'Chua co file anh CV');
});
exports.dinhTuyenHoSoNangLuc.post('/upload-file', xacthuc_js_1.yeuCauDangNhap, (0, xacthuc_js_1.yeuCauVaiTro)(['ung_vien', 'admin']), taiFileCv.single('tep'), (yeuCau, phanHoi) => {
    return phanHoiTepDaTaiLen(yeuCau, phanHoi, 'Chua co file CV goc');
});
