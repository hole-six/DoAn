import { LoiUngDung } from './loiungdung.js'
import { boUndefined, coId, coIdNhieu } from './prismaHelper.js'
import { layLimit, locVaXepHangTheoTuKhoa } from './timkiem.js'

type PrismaDelegateCoBan = any
type DuLieuCapNhat = Record<string, unknown>

export function taoDichVuCoBan(moHinh: PrismaDelegateCoBan) {
  return {
    async layDanhSach(boLoc: DuLieuCapNhat = {}) {
      const { tuKhoa, limit, ...where } = boLoc
      const duLieu = await moHinh.findMany({
        where,
        orderBy: { ngayTao: 'desc' },
        take: 300,
      })
      const daCoId = coIdNhieu(duLieu)
      const daLoc = locVaXepHangTheoTuKhoa(daCoId, tuKhoa, item => [
        item.tenKyNang,
        item.loaiKyNang,
        item.ten,
        item.tieuDe,
        item.hoTen,
      ])
      return daLoc.slice(0, layLimit(limit, 50, 100))
    },

    async layTheoMa(ma: string) {
      const duLieu = await moHinh.findUnique({ where: { id: ma } })
      if (!duLieu) {
        throw new LoiUngDung('Khong tim thay du lieu', 404)
      }
      return coId(duLieu)
    },

    async taoMoi(duLieu: unknown) {
      return coId(await moHinh.create({ data: boUndefined(duLieu as Record<string, any>) }))
    },

    async capNhat(ma: string, duLieu: unknown) {
      const hienTai = await moHinh.findUnique({ where: { id: ma }, select: { id: true } })
      if (!hienTai) {
        throw new LoiUngDung('Khong tim thay du lieu de cap nhat', 404)
      }
      return coId(await moHinh.update({ where: { id: ma }, data: boUndefined(duLieu as Record<string, any>) }))
    },

    async xoa(ma: string) {
      const ketQua = await moHinh.findUnique({ where: { id: ma } })
      if (!ketQua) {
        throw new LoiUngDung('Khong tim thay du lieu de xoa', 404)
      }
      await moHinh.delete({ where: { id: ma } })
      return coId(ketQua)
    },
  }
}
