import bcrypt from 'bcryptjs'
import { LoiUngDung } from '../../dungchung/loiungdung.js'
import { NguoiDung } from './nguoidung.mohinh.js'

type DuLieuNguoiDung = {
  _id: unknown
  email: string
  matKhau?: string
  hoTen: string
  soDienThoai?: string
  vaiTro: 'ung_vien' | 'nha_tuyen_dung' | 'admin'
  trangThai: 'hoat_dong' | 'tam_khoa' | 'bi_khoa'
  ngayTao?: Date
  ngayCapNhat?: Date
}

type DuLieuCapNhatNguoiDung = Partial<{
  email: string
  matKhau: string
  hoTen: string
  soDienThoai: string
  vaiTro: 'ung_vien' | 'nha_tuyen_dung' | 'admin'
  trangThai: 'hoat_dong' | 'tam_khoa' | 'bi_khoa'
}>

function boMatKhau(nguoiDung: DuLieuNguoiDung) {
  return {
    id: String(nguoiDung._id),
    email: nguoiDung.email,
    hoTen: nguoiDung.hoTen,
    soDienThoai: nguoiDung.soDienThoai,
    vaiTro: nguoiDung.vaiTro,
    trangThai: nguoiDung.trangThai,
    ngayTao: nguoiDung.ngayTao,
    ngayCapNhat: nguoiDung.ngayCapNhat,
  }
}

async function bamMatKhauNeuCo(duLieu: DuLieuCapNhatNguoiDung) {
  if (!duLieu.matKhau) return duLieu

  return {
    ...duLieu,
    matKhau: await bcrypt.hash(duLieu.matKhau, 10),
  }
}

export const dichVuNguoiDung = {
  async layDanhSach() {
    const danhSach = await (NguoiDung as any).find().sort({ ngayTao: -1 }).limit(200) as DuLieuNguoiDung[]
    return danhSach.map(boMatKhau)
  },

  async layTheoMa(ma: string) {
    const nguoiDung = await (NguoiDung as any).findById(ma) as DuLieuNguoiDung | null

    if (!nguoiDung) {
      throw new LoiUngDung('Không tìm thấy người dùng', 404)
    }

    return boMatKhau(nguoiDung)
  },

  async taoMoi(duLieuNhan: unknown) {
    const duLieu = duLieuNhan as DuLieuCapNhatNguoiDung
    const email = duLieu.email?.toLowerCase().trim()

    if (!email || !duLieu.matKhau || !duLieu.hoTen) {
      throw new LoiUngDung('Thieu thong tin tao nguoi dung', 422)
    }

    const daTonTai = await (NguoiDung as any).exists({ email })
    if (daTonTai) {
      throw new LoiUngDung('Email da ton tai', 409)
    }

    const nguoiDung = await (NguoiDung as any).create(await bamMatKhauNeuCo({
      ...duLieu,
      email,
      trangThai: duLieu.trangThai ?? 'hoat_dong',
      vaiTro: duLieu.vaiTro ?? 'ung_vien',
    })) as DuLieuNguoiDung

    return boMatKhau(nguoiDung)
  },

  async capNhat(ma: string, duLieuNhan: unknown) {
    const duLieu = duLieuNhan as DuLieuCapNhatNguoiDung
    const duLieuCapNhat = { ...duLieu }

    if (duLieuCapNhat.email) {
      duLieuCapNhat.email = duLieuCapNhat.email.toLowerCase().trim()
      const trungEmail = await (NguoiDung as any).exists({ email: duLieuCapNhat.email, _id: { $ne: ma } })
      if (trungEmail) {
        throw new LoiUngDung('Email da duoc su dung boi tai khoan khac', 409)
      }
    }

    if (!duLieuCapNhat.matKhau) {
      delete duLieuCapNhat.matKhau
    }

    const nguoiDung = await (NguoiDung as any).findByIdAndUpdate(
      ma,
      await bamMatKhauNeuCo(duLieuCapNhat),
      { returnDocument: 'after', runValidators: true },
    ) as DuLieuNguoiDung | null

    if (!nguoiDung) {
      throw new LoiUngDung('Không tìm thấy người dùng de cap nhat', 404)
    }

    return boMatKhau(nguoiDung)
  },

  async xoa(ma: string) {
    const nguoiDung = await (NguoiDung as any).findById(ma) as DuLieuNguoiDung | null

    if (!nguoiDung) {
      throw new LoiUngDung('Không tìm thấy người dùng de xoa', 404)
    }

    if (nguoiDung.vaiTro === 'admin') {
      const soAdmin = await (NguoiDung as any).countDocuments({ vaiTro: 'admin' })
      if (soAdmin <= 1) {
        throw new LoiUngDung('Không thể xóa admin cuối cùng của hệ thống', 409)
      }
    }

    await (NguoiDung as any).findByIdAndDelete(ma)
    return boMatKhau(nguoiDung)
  },
}



