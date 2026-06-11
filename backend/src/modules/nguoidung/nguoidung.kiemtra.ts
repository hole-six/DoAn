import { z } from 'zod'
import { trangThaiTaiKhoan, vaiTroNguoiDung } from './nguoidung.mohinh.js'

export const kiemTraTaoNguoiDung = z.object({
  email: z.string().email(),
  matKhau: z.string().min(6),
  hoTen: z.string().min(2),
  soDienThoai: z.string().optional(),
  vaiTro: z.enum(vaiTroNguoiDung).optional(),
  trangThai: z.enum(trangThaiTaiKhoan).optional(),
}).strict()

export const kiemTraTaoNguoiDungCongKhai = z.object({
  email: z.string().email(),
  matKhau: z.string().min(6),
  hoTen: z.string().min(2),
  soDienThoai: z.string().optional(),
  vaiTro: z.enum(['ung_vien', 'nha_tuyen_dung']).optional(),
}).strict()

export const kiemTraCapNhatNguoiDung = kiemTraTaoNguoiDung.partial().strict()

export const kiemTraCapNhatNguoiDungCaNhan = z.object({
  hoTen: z.string().min(2).optional(),
  soDienThoai: z.string().optional(),
  matKhau: z.string().min(6).optional(),
}).strict()
