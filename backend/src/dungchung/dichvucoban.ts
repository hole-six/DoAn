import type { Model } from 'mongoose'
import { LoiUngDung } from './loiungdung.js'

type MoHinhMongoose = Model<any>
type DuLieuCapNhat = Record<string, unknown>

export function taoDichVuCoBan(moHinh: MoHinhMongoose) {
  return {
    async layDanhSach(boLoc: DuLieuCapNhat = {}) {
      return moHinh.find(boLoc).sort({ ngayTao: -1 }).limit(50)
    },

    async layTheoMa(ma: string) {
      const duLieu = await moHinh.findById(ma)
      if (!duLieu) {
        throw new LoiUngDung('Không tìm thấy dữ liệu', 404)
      }
      return duLieu
    },

    async taoMoi(duLieu: unknown) {
      return moHinh.create(duLieu as Record<string, any>)
    },

    async capNhat(ma: string, duLieu: unknown) {
      const ketQua = await moHinh.findByIdAndUpdate(ma, duLieu as Record<string, any>, { new: true, runValidators: true })
      if (!ketQua) {
        throw new LoiUngDung('Không tìm thấy dữ liệu de cap nhat', 404)
      }
      return ketQua
    },

    async xoa(ma: string) {
      const ketQua = await moHinh.findByIdAndDelete(ma)
      if (!ketQua) {
        throw new LoiUngDung('Không tìm thấy dữ liệu de xoa', 404)
      }
      return ketQua
    },
  }
}

