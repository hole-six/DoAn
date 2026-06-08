import { LoiUngDung } from './loiungdung.js'
import { boUndefined, coId, coIdNhieu } from './prismaHelper.js'

type PrismaDelegateCoBan = any
type DuLieuCapNhat = Record<string, unknown>

export function taoDichVuCoBan(moHinh: PrismaDelegateCoBan) {
  return {
    async layDanhSach(boLoc: DuLieuCapNhat = {}) {
      const duLieu = await moHinh.findMany({
        where: boLoc,
        orderBy: { ngayTao: 'desc' },
        take: 50,
      })
      return coIdNhieu(duLieu)
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
