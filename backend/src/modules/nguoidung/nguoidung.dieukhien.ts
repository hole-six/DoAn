import type { Request, Response } from 'express'
import { batLoiBatDongBo } from '../../dungchung/batloibatdongbo.js'
import { LoiUngDung } from '../../dungchung/loiungdung.js'
import { dichVuNguoiDung } from './nguoidung.dichvu.js'
import {
  kiemTraCapNhatNguoiDung,
  kiemTraCapNhatNguoiDungCaNhan,
  kiemTraTaoNguoiDung,
  kiemTraTaoNguoiDungCongKhai,
} from './nguoidung.kiemtra.js'

function layNguoiDungTuYeuCau(yeuCau: Request) {
  return (yeuCau as any).nguoiDung as { id: string; vaiTro: string } | undefined
}

function laQuanTriVien(yeuCau: Request) {
  return layNguoiDungTuYeuCau(yeuCau)?.vaiTro === 'admin'
}

function laChinhChuTaiKhoan(yeuCau: Request, maNguoiDung: string) {
  return String(layNguoiDungTuYeuCau(yeuCau)?.id ?? '') === String(maNguoiDung)
}

function batBuocDangNhap(yeuCau: Request) {
  if (!layNguoiDungTuYeuCau(yeuCau)) {
    throw new LoiUngDung('Bạn cần đăng nhập để thực hiện thao tác này', 401, 'UNAUTHORIZED')
  }
}

function batBuocQuanTriVien(yeuCau: Request) {
  if (!laQuanTriVien(yeuCau)) {
    throw new LoiUngDung('Chỉ quản trị viên mới được thực hiện thao tác này', 403, 'FORBIDDEN')
  }
}

function khongChoPhepNguoiDungThuongTaoThemTaiKhoan(yeuCau: Request) {
  const nguoiDung = layNguoiDungTuYeuCau(yeuCau)
  if (nguoiDung && nguoiDung.vaiTro !== 'admin') {
    throw new LoiUngDung('Tài khoản hiện tại không được phép tạo thêm người dùng', 403, 'FORBIDDEN')
  }
}

export const dieuKhienNguoiDung = {
  layDanhSach: batLoiBatDongBo(async (yeuCau: Request, phanHoi: Response) => {
    batBuocDangNhap(yeuCau)
    batBuocQuanTriVien(yeuCau)
    const duLieu = await dichVuNguoiDung.layDanhSach()
    return phanHoi.json({ duLieu })
  }),

  layChiTiet: batLoiBatDongBo(async (yeuCau: Request, phanHoi: Response) => {
    batBuocDangNhap(yeuCau)
    const ma = String(yeuCau.params.ma ?? '')
    if (!laQuanTriVien(yeuCau) && !laChinhChuTaiKhoan(yeuCau, ma)) {
      throw new LoiUngDung('Bạn không thể xem thông tin của tài khoản khác', 403, 'FORBIDDEN')
    }
    const duLieu = await dichVuNguoiDung.layTheoMa(ma)
    return phanHoi.json({ duLieu })
  }),

  taoMoi: batLoiBatDongBo(async (yeuCau: Request, phanHoi: Response) => {
    const nguoiDung = layNguoiDungTuYeuCau(yeuCau)
    if (nguoiDung) {
      batBuocQuanTriVien(yeuCau)
      const duLieuHopLe = kiemTraTaoNguoiDung.parse(yeuCau.body)
      const duLieu = await dichVuNguoiDung.taoMoi(duLieuHopLe)
      return phanHoi.status(201).json({ duLieu })
    }

    khongChoPhepNguoiDungThuongTaoThemTaiKhoan(yeuCau)
    const duLieuHopLe = kiemTraTaoNguoiDungCongKhai.parse(yeuCau.body)
    const duLieu = await dichVuNguoiDung.taoMoi(duLieuHopLe)
    return phanHoi.status(201).json({ duLieu })
  }),

  capNhat: batLoiBatDongBo(async (yeuCau: Request, phanHoi: Response) => {
    batBuocDangNhap(yeuCau)
    const ma = String(yeuCau.params.ma ?? '')

    if (!laQuanTriVien(yeuCau) && !laChinhChuTaiKhoan(yeuCau, ma)) {
      throw new LoiUngDung('Bạn không thể cập nhật tài khoản của người khác', 403, 'FORBIDDEN')
    }

    const duLieuHopLe = laQuanTriVien(yeuCau)
      ? kiemTraCapNhatNguoiDung.parse(yeuCau.body)
      : kiemTraCapNhatNguoiDungCaNhan.parse(yeuCau.body)

    const duLieu = await dichVuNguoiDung.capNhat(ma, duLieuHopLe)
    return phanHoi.json({ duLieu })
  }),

  xoa: batLoiBatDongBo(async (yeuCau: Request, phanHoi: Response) => {
    batBuocDangNhap(yeuCau)
    batBuocQuanTriVien(yeuCau)
    const ma = String(yeuCau.params.ma ?? '')
    await dichVuNguoiDung.xoa(ma)
    return phanHoi.status(204).send()
  }),
}
