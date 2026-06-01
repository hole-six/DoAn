import { z } from 'zod'
import { capBacTinTuyenDung, loaiHinhLamViec, trangThaiTinTuyenDung } from './tintuyendung.mohinh.js'

export const kiemTraTaoTinTuyenDung = z.object({
  maNhaTuyenDung: z.string().min(1),
  tieuDe: z.string().min(3),
  yeuCauKinhNghiem: z.string().optional(),
  diaChi: z.string().optional(),
  luongMin: z.number().min(0).optional(),
  luongMax: z.number().min(0).optional(),
  loaiHinh: z.enum(loaiHinhLamViec).optional(),
  capBac: z.enum(capBacTinTuyenDung).optional(),
  anhDaiDien: z.string().optional(),
  hanNop: z.coerce.date().optional(),
  soLuong: z.number().int().min(1).optional(),
  moTa: z.string().min(10),
  yeuCau: z.string().min(10),
  quyenLoi: z.string().optional(),
  luotXem: z.number().int().min(0).optional(),
  trangThai: z.enum(trangThaiTinTuyenDung).optional(),
  ngayDang: z.coerce.date().optional(),
  kyNang: z.array(z.object({ maKyNang: z.string().min(1), batBuoc: z.boolean().optional() })).optional(),
})

export const kiemTraCapNhatTinTuyenDung = kiemTraTaoTinTuyenDung.partial()
