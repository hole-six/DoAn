import { z } from 'zod'
import { gioiTinhUngVien } from './ungvien.mohinh.js'

export const kiemTraTaoUngVien = z.object({
  maNguoiDung: z.string().min(1),
  ngaySinh: z.coerce.date().optional(),
  gioiTinh: z.enum(gioiTinhUngVien).optional(),
  diaChi: z.string().optional(),
  tomTat: z.string().optional(),
  kinhNghiem: z.number().int().min(0).optional(),
  viTriMongMuon: z.string().optional(),
  mucLuongMongMuon: z.number().min(0).optional(),
  kyNang: z.array(z.object({ maKyNang: z.string().min(1), mucDo: z.number().min(1).max(5).optional() })).optional(),
  portfolio: z.array(z.object({
    tenDuAn: z.string().min(1),
    lienKet: z.string().url(),
    moTa: z.string().optional(),
    congNghe: z.array(z.string()).optional(),
  })).optional(),
})

export const kiemTraCapNhatUngVien = kiemTraTaoUngVien.partial()
