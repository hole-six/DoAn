import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { bienMoiTruong } from '../../cauhinh/bienmoitruong.js'
import { LoiUngDung } from '../../dungchung/loiungdung.js'
import { NguoiDung } from '../nguoidung/nguoidung.mohinh.js'
import type { kiemTraDangNhap } from './xacthuc.kiemtra.js'
import type { z } from 'zod'

type DuLieuDangNhap = z.infer<typeof kiemTraDangNhap>
type NguoiDungDangNhap = {
  _id: unknown
  email: string
  matKhau: string
  hoTen: string
  soDienThoai?: string
  vaiTro: string
  trangThai: string
}

function taoNguoiDungCongKhai(nguoiDung: {
  _id: unknown
  email: string
  hoTen: string
  soDienThoai?: string
  vaiTro: string
  trangThai: string
}) {
  return {
    id: String(nguoiDung._id),
    email: nguoiDung.email,
    hoTen: nguoiDung.hoTen,
    soDienThoai: nguoiDung.soDienThoai,
    vaiTro: nguoiDung.vaiTro,
    trangThai: nguoiDung.trangThai,
  }
}

export async function dangNhap(duLieu: DuLieuDangNhap) {
  const nguoiDung = await (NguoiDung as any).findOne({ email: duLieu.email.toLowerCase().trim() }) as NguoiDungDangNhap | null

  if (!nguoiDung) {
    throw new LoiUngDung('Email hoac mat khau khong dung', 401)
  }

  if (nguoiDung.trangThai !== 'hoat_dong') {
    throw new LoiUngDung('Tai khoan khong o trang thai hoat dong', 403)
  }

  if (duLieu.vaiTro && nguoiDung.vaiTro !== duLieu.vaiTro) {
    throw new LoiUngDung('Tai khoan khong thuoc vai tro da chon', 403)
  }

  const matKhauDung = await bcrypt.compare(duLieu.matKhau, nguoiDung.matKhau)

  if (!matKhauDung) {
    throw new LoiUngDung('Email hoac mat khau khong dung', 401)
  }

  const nguoiDungCongKhai = taoNguoiDungCongKhai(nguoiDung)
  const token = jwt.sign(
    {
      sub: nguoiDungCongKhai.id,
      vaiTro: nguoiDungCongKhai.vaiTro,
      email: nguoiDungCongKhai.email,
    },
    bienMoiTruong.khoaJwt,
    { expiresIn: '7d' },
  )

  return {
    token,
    nguoiDung: nguoiDungCongKhai,
  }
}
