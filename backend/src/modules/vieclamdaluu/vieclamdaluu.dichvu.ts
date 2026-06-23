import { LoiUngDung } from '../../dungchung/loiungdung.js'
import { prisma } from '../../cauhinh/prisma.js'
import { TinTuyenDung } from '../tintuyendung/tintuyendung.mohinh.js'
import { ViecLamDaLuu } from './vieclamdaluu.mohinh.js'

// ViecLamDaLuu không có Prisma relation đến TinTuyenDung trong schema,
// nên join thủ công nhưng tập trung vào 1 query rõ ràng.

function mapTinTuyenDung(tin: any) {
  if (!tin) return undefined
  return {
    id: tin.id,
    tieuDe: tin.tieuDe,
    trangThai: tin.trangThai,
    diaChi: tin.diaChi,
    luongMin: tin.luongMin,
    luongMax: tin.luongMax,
    hanNop: tin.hanNop,
    ngayDang: tin.ngayDang,
    nhaTuyenDung: tin.nhaTuyenDung
      ? {
          id: tin.nhaTuyenDung.id,
          tenCongTy: tin.nhaTuyenDung.tenCongTy,
          logo: tin.nhaTuyenDung.logo,
        }
      : undefined,
  }
}

function mapViecLamDaLuu(row: any, tinMap: Map<string, any>) {
  const tin = tinMap.get(row.maTinTuyenDung)
  return {
    id: row.id,
    _id: row.id,
    maNguoiDung: row.maNguoiDung,
    maTinTuyenDung: row.maTinTuyenDung,
    ngayLuu: row.ngayLuu,
    tinTuyenDung: mapTinTuyenDung(tin),
  }
}

async function layTinTuyenDungMap(maTinIds: string[]) {
  const uniqueIds = [...new Set(maTinIds.filter(Boolean))]
  if (!uniqueIds.length) return new Map<string, any>()

  const tinRows = await prisma.tinTuyenDung.findMany({
    where: { id: { in: uniqueIds } },
    select: {
      id: true,
      tieuDe: true,
      trangThai: true,
      diaChi: true,
      luongMin: true,
      luongMax: true,
      hanNop: true,
      ngayDang: true,
      maNhaTuyenDung: true,
    },
  })

  const congTyIds = [...new Set(tinRows.map(t => t.maNhaTuyenDung).filter(Boolean))]
  const congTyRows = congTyIds.length
    ? await prisma.nhaTuyenDung.findMany({
        where: { id: { in: congTyIds } },
        select: { id: true, tenCongTy: true, logo: true },
      })
    : []
  const congTyMap = new Map(congTyRows.map(c => [c.id, c]))

  const tinDayDu = tinRows.map(tin => ({
    ...tin,
    nhaTuyenDung: congTyMap.get(tin.maNhaTuyenDung) ?? null,
  }))
  return new Map(tinDayDu.map(t => [t.id, t]))
}

export const dichVuViecLamDaLuu = {
  async layDanhSach(maNguoiDung: string) {
    const rows = await ViecLamDaLuu.findMany({
      where: { maNguoiDung },
      orderBy: { ngayLuu: 'desc' },
      take: 200,
    })
    const tinMap = await layTinTuyenDungMap(rows.map(r => r.maTinTuyenDung))
    return rows.map(row => mapViecLamDaLuu(row, tinMap))
  },

  async luu(maNguoiDung: string, maTinTuyenDung: string) {
    const tin = await TinTuyenDung.findUnique({ where: { id: maTinTuyenDung }, select: { id: true } })
    if (!tin) throw new LoiUngDung('Không tìm thấy tin tuyển dụng để lưu', 404, 'JOB_NOT_FOUND')

    await ViecLamDaLuu.upsert({
      where: { maNguoiDung_maTinTuyenDung: { maNguoiDung, maTinTuyenDung } },
      update: {},
      create: { maNguoiDung, maTinTuyenDung, ngayLuu: new Date() },
    })
    const ketQua = await ViecLamDaLuu.findFirst({ where: { maNguoiDung, maTinTuyenDung } })
    if (!ketQua) throw new LoiUngDung('Không thể lưu việc làm', 500)

    const tinMap = await layTinTuyenDungMap([maTinTuyenDung])
    return mapViecLamDaLuu(ketQua, tinMap)
  },

  async boLuu(maNguoiDung: string, maTinTuyenDung: string) {
    await ViecLamDaLuu.deleteMany({ where: { maNguoiDung, maTinTuyenDung } })
    return { maTinTuyenDung }
  },
}
