"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.kiemTraCapNhatHoSoNangLuc = exports.kiemTraTaoHoSoNangLuc = void 0;
const zod_1 = require("zod");
const chuoiTuyChon = zod_1.z.string().nullish().transform(value => value ?? undefined);
const mangChuoiTuyChon = zod_1.z.array(zod_1.z.string()).nullish().transform(value => value ?? undefined);
const kiemTraMucThongTin = zod_1.z.object({
    tieuDe: chuoiTuyChon,
    donVi: chuoiTuyChon,
    thoiGian: chuoiTuyChon,
    moTa: chuoiTuyChon,
});
const kiemTraLienKet = zod_1.z.object({
    nhan: chuoiTuyChon,
    url: chuoiTuyChon,
});
const kiemTraKyNang = zod_1.z.object({
    nhom: chuoiTuyChon,
    muc: mangChuoiTuyChon,
});
const kiemTraDuAnChiTiet = zod_1.z.object({
    tenDuAn: chuoiTuyChon,
    thoiGian: chuoiTuyChon,
    viTri: chuoiTuyChon,
    moTa: chuoiTuyChon,
    trachNhiem: mangChuoiTuyChon,
    heDieuHanh: chuoiTuyChon,
    ngonNgu: chuoiTuyChon,
    framework: chuoiTuyChon,
    kyThuat: chuoiTuyChon,
    diaDiem: chuoiTuyChon,
    lienKet: zod_1.z.array(kiemTraLienKet).nullish().transform(value => value ?? undefined),
});
exports.kiemTraTaoHoSoNangLuc = zod_1.z.object({
    maUngVien: zod_1.z.string().min(1),
    tieuDe: zod_1.z.string().min(2),
    hocVan: zod_1.z.array(kiemTraMucThongTin).optional(),
    kinhNghiemLam: zod_1.z.array(kiemTraMucThongTin).optional(),
    chungChi: zod_1.z.array(kiemTraMucThongTin).optional(),
    duAn: zod_1.z.array(kiemTraMucThongTin).optional(),
    hoTenHienThi: chuoiTuyChon,
    chucDanh: chuoiTuyChon,
    soDienThoai: chuoiTuyChon,
    emailLienHe: chuoiTuyChon,
    facebook: chuoiTuyChon,
    github: chuoiTuyChon,
    portfolioUrl: chuoiTuyChon,
    diaDiem: chuoiTuyChon,
    tomTatKinhNghiem: mangChuoiTuyChon,
    kyNangMem: mangChuoiTuyChon,
    kyNangLapTrinh: zod_1.z.array(kiemTraKyNang).optional(),
    baiVietKyThuat: zod_1.z.array(kiemTraLienKet).optional(),
    duAnChiTiet: zod_1.z.array(kiemTraDuAnChiTiet).optional(),
    fileCvTen: chuoiTuyChon,
    fileCvLoai: chuoiTuyChon,
    fileCvData: chuoiTuyChon,
    fileCvText: chuoiTuyChon,
    fileCvPath: chuoiTuyChon,
    fileCvTextStatus: zod_1.z.enum(['ok', 'empty', 'gemini_pdf', 'failed']).optional(),
    fileCvTextError: chuoiTuyChon,
    loaiHoSo: zod_1.z.enum(['builder', 'file_upload']).optional(),
    anhDaiDien: chuoiTuyChon,
    templateCv: chuoiTuyChon,
    mauChinh: chuoiTuyChon,
    mauPhu: chuoiTuyChon,
    font: chuoiTuyChon,
    markdownGoc: chuoiTuyChon,
    ghiChuAi: chuoiTuyChon,
    cvChinh: zod_1.z.boolean().optional(),
    congKhai: zod_1.z.boolean().optional(),
});
exports.kiemTraCapNhatHoSoNangLuc = exports.kiemTraTaoHoSoNangLuc.partial();
