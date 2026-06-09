import bcrypt from 'bcryptjs'
import { LoiUngDung } from '../../dungchung/loiungdung.js'
import { boUndefined, coId } from '../../dungchung/prismaHelper.js'
import { NguoiDung } from './nguoidung.mohinh.js'

type DuLieuNguoiDung = {
  id: string
  email: string
  matKhau?: string
  hoTen: string
  soDienThoai?: string | null
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
    id: String(nguoiDung.id),
    _id: String(nguoiDung.id),
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
  return { ...duLieu, matKhau: await bcrypt.hash(duLieu.matKhau, 10) }
}

export const dichVuNguoiDung = {
  async layDanhSach() {
    const danhSach = await NguoiDung.findMany({ orderBy: { ngayTao: 'desc' }, take: 200 })
    return danhSach.map(boMatKhau as any)
  },

  async layTheoMa(ma: string) {
    const nguoiDung = await NguoiDung.findUnique({ where: { id: ma } }) as DuLieuNguoiDung | null
    if (!nguoiDung) throw new LoiUngDung('Không tìm thấy người dùng', 404)
    return boMatKhau(nguoiDung)
  },

  async taoMoi(duLieuNhan: unknown) {
    const duLieu = duLieuNhan as DuLieuCapNhatNguoiDung
    const email = duLieu.email?.toLowerCase().trim()
    if (!email || !duLieu.matKhau || !duLieu.hoTen) {
      throw new LoiUngDung('Thiếu thông tin tạo người dùng', 422)
    }

    const daTonTai = await NguoiDung.findUnique({ where: { email }, select: { id: true } })
    if (daTonTai) throw new LoiUngDung('Email da ton tai', 409)

    const nguoiDung = await NguoiDung.create({
      data: boUndefined(await bamMatKhauNeuCo({
        ...duLieu,
        email,
        trangThai: duLieu.trangThai ?? 'hoat_dong',
        vaiTro: duLieu.vaiTro ?? 'ung_vien',
      })) as any,
    }) as DuLieuNguoiDung

    return boMatKhau(nguoiDung)
  },

  async capNhat(ma: string, duLieuNhan: unknown) {
    const duLieu = duLieuNhan as DuLieuCapNhatNguoiDung
    const duLieuCapNhat = { ...duLieu }

    if (duLieuCapNhat.email) {
      duLieuCapNhat.email = duLieuCapNhat.email.toLowerCase().trim()
      const trungEmail = await NguoiDung.findFirst({
        where: { email: duLieuCapNhat.email, id: { not: ma } },
        select: { id: true },
      })
      if (trungEmail) throw new LoiUngDung('Email da duoc su dung boi tai khoan khac', 409)
    }

    if (!duLieuCapNhat.matKhau) delete duLieuCapNhat.matKhau

    const hienTai = await NguoiDung.findUnique({ where: { id: ma }, select: { id: true } })
    if (!hienTai) throw new LoiUngDung('Không tìm thấy người dùng để cập nhật', 404)

    const nguoiDung = await NguoiDung.update({
      where: { id: ma },
      data: boUndefined(await bamMatKhauNeuCo(duLieuCapNhat)) as any,
    }) as DuLieuNguoiDung

    return boMatKhau(nguoiDung)
  },

  async xoa(ma: string) {
    const nguoiDung = await NguoiDung.findUnique({ where: { id: ma } }) as DuLieuNguoiDung | null
    if (!nguoiDung) throw new LoiUngDung('Không tìm thấy người dùng để xóa', 404)

    if (nguoiDung.vaiTro === 'admin') {
      const soAdmin = await NguoiDung.count({ where: { vaiTro: 'admin' } })
      if (soAdmin <= 1) throw new LoiUngDung('Không thể xóa admin cuối cùng của hệ thống', 409)
    }

    await NguoiDung.delete({ where: { id: ma } })
    return boMatKhau(coId(nguoiDung) as any)
  },
}
