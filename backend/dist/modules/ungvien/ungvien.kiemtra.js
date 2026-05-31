"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.kiemTraCapNhatUngVien = exports.kiemTraTaoUngVien = void 0;
const zod_1 = require("zod");
const ungvien_mohinh_js_1 = require("./ungvien.mohinh.js");
exports.kiemTraTaoUngVien = zod_1.z.object({
    maNguoiDung: zod_1.z.string().min(1, 'Mã người dùng không được để trống'),
    ngaySinh: zod_1.z.coerce.date().optional(),
    gioiTinh: zod_1.z.enum(ungvien_mohinh_js_1.gioiTinhUngVien).optional(),
    diaChi: zod_1.z.string().optional(),
    anhDaiDien: zod_1.z.string().url('Ảnh đại diện phải là URL hợp lệ').optional(),
    tomTat: zod_1.z.string().max(1000, 'Tóm tắt không được vượt quá 1000 ký tự').optional(),
    kinhNghiem: zod_1.z.number().int('Kinh nghiệm phải là số nguyên').min(0, 'Kinh nghiệm không được âm').max(50, 'Kinh nghiệm không hợp lệ').optional(),
    viTriMongMuon: zod_1.z.string().max(200, 'Vị trí mong muốn không được vượt quá 200 ký tự').optional(),
    mucLuongMongMuon: zod_1.z.number().min(0, 'Mức lương không được âm').max(1000000000, 'Mức lương không hợp lệ').optional(),
    kyNang: zod_1.z.array(zod_1.z.object({
        maKyNang: zod_1.z.string().min(1, 'Mã kỹ năng không được để trống'),
        mucDo: zod_1.z.number().min(1, 'Mức độ kỹ năng tối thiểu là 1').max(5, 'Mức độ kỹ năng tối đa là 5').optional(),
    })).optional(),
    portfolio: zod_1.z.array(zod_1.z.object({
        tenDuAn: zod_1.z.string().min(1, 'Tên dự án không được để trống').max(200, 'Tên dự án không được vượt quá 200 ký tự'),
        lienKet: zod_1.z.string().url('Liên kết dự án phải là URL hợp lệ'),
        moTa: zod_1.z.string().max(500, 'Mô tả không được vượt quá 500 ký tự').optional(),
        congNghe: zod_1.z.array(zod_1.z.string()).optional(),
    })).optional(),
});
exports.kiemTraCapNhatUngVien = exports.kiemTraTaoUngVien.partial();
