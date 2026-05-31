import { z } from 'zod'
import { gioiTinhUngVien } from './ungvien.mohinh.js'

export const kiemTraTaoUngVien = z.object({
  maNguoiDung: z.string().min(1, 'Mã người dùng không được để trống'),
  ngaySinh: z.coerce.date().optional(),
  gioiTinh: z.enum(gioiTinhUngVien).optional(),
  diaChi: z.string().optional(),
  anhDaiDien: z.string().url('Ảnh đại diện phải là URL hợp lệ').optional(),
  tomTat: z.string().max(1000, 'Tóm tắt không được vượt quá 1000 ký tự').optional(),
  kinhNghiem: z.number().int('Kinh nghiệm phải là số nguyên').min(0, 'Kinh nghiệm không được âm').max(50, 'Kinh nghiệm không hợp lệ').optional(),
  viTriMongMuon: z.string().max(200, 'Vị trí mong muốn không được vượt quá 200 ký tự').optional(),
  mucLuongMongMuon: z.number().min(0, 'Mức lương không được âm').max(1000000000, 'Mức lương không hợp lệ').optional(),
  kyNang: z.array(
    z.object({
      maKyNang: z.string().min(1, 'Mã kỹ năng không được để trống'),
      mucDo: z.number().min(1, 'Mức độ kỹ năng tối thiểu là 1').max(5, 'Mức độ kỹ năng tối đa là 5').optional(),
    }),
  ).optional(),
  portfolio: z.array(
    z.object({
      tenDuAn: z.string().min(1, 'Tên dự án không được để trống').max(200, 'Tên dự án không được vượt quá 200 ký tự'),
      lienKet: z.string().url('Liên kết dự án phải là URL hợp lệ'),
      moTa: z.string().max(500, 'Mô tả không được vượt quá 500 ký tự').optional(),
      congNghe: z.array(z.string()).optional(),
    }),
  ).optional(),
})

export const kiemTraCapNhatUngVien = kiemTraTaoUngVien.partial()
