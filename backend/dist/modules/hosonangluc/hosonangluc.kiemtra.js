"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.kiemTraCapNhatHoSoNangLuc = exports.kiemTraTaoHoSoNangLuc = void 0;
const zod_1 = require("zod");
const kiemTraMucThongTin = zod_1.z.object({
    tieuDe: zod_1.z.string().optional(),
    donVi: zod_1.z.string().optional(),
    thoiGian: zod_1.z.string().optional(),
    moTa: zod_1.z.string().optional(),
});
const kiemTraLienKet = zod_1.z.object({
    nhan: zod_1.z.string().optional(),
    url: zod_1.z.string().optional(),
});
const kiemTraKyNang = zod_1.z.object({
    nhom: zod_1.z.string().optional(),
    muc: zod_1.z.array(zod_1.z.string()).optional(),
});
const kiemTraDuAnChiTiet = zod_1.z.object({
    tenDuAn: zod_1.z.string().optional(),
    thoiGian: zod_1.z.string().optional(),
    viTri: zod_1.z.string().optional(),
    moTa: zod_1.z.string().optional(),
    trachNhiem: zod_1.z.array(zod_1.z.string()).optional(),
    heDieuHanh: zod_1.z.string().optional(),
    ngonNgu: zod_1.z.string().optional(),
    framework: zod_1.z.string().optional(),
    kyThuat: zod_1.z.string().optional(),
    diaDiem: zod_1.z.string().optional(),
    lienKet: zod_1.z.array(kiemTraLienKet).optional(),
});
exports.kiemTraTaoHoSoNangLuc = zod_1.z.object({
    maUngVien: zod_1.z.string().min(1),
    tieuDe: zod_1.z.string().min(2),
    hocVan: zod_1.z.array(kiemTraMucThongTin).optional(),
    kinhNghiemLam: zod_1.z.array(kiemTraMucThongTin).optional(),
    chungChi: zod_1.z.array(kiemTraMucThongTin).optional(),
    duAn: zod_1.z.array(kiemTraMucThongTin).optional(),
    hoTenHienThi: zod_1.z.string().optional(),
    chucDanh: zod_1.z.string().optional(),
    soDienThoai: zod_1.z.string().optional(),
    emailLienHe: zod_1.z.string().optional(),
    facebook: zod_1.z.string().optional(),
    github: zod_1.z.string().optional(),
    portfolioUrl: zod_1.z.string().optional(),
    diaDiem: zod_1.z.string().optional(),
    tomTatKinhNghiem: zod_1.z.array(zod_1.z.string()).optional(),
    kyNangMem: zod_1.z.array(zod_1.z.string()).optional(),
    kyNangLapTrinh: zod_1.z.array(kiemTraKyNang).optional(),
    baiVietKyThuat: zod_1.z.array(kiemTraLienKet).optional(),
    duAnChiTiet: zod_1.z.array(kiemTraDuAnChiTiet).optional(),
    fileCvTen: zod_1.z.string().optional(),
    fileCvLoai: zod_1.z.string().optional(),
    fileCvData: zod_1.z.string().optional(),
    loaiHoSo: zod_1.z.enum(['builder', 'file_upload']).optional(),
    anhDaiDien: zod_1.z.string().optional(),
    templateCv: zod_1.z.string().optional(),
    mauChinh: zod_1.z.string().optional(),
    mauPhu: zod_1.z.string().optional(),
    font: zod_1.z.string().optional(),
    markdownGoc: zod_1.z.string().optional(),
    ghiChuAi: zod_1.z.string().optional(),
    cvChinh: zod_1.z.boolean().optional(),
    congKhai: zod_1.z.boolean().optional(),
});
exports.kiemTraCapNhatHoSoNangLuc = exports.kiemTraTaoHoSoNangLuc.partial();
