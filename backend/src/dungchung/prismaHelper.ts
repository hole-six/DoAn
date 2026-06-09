import { prisma } from '../cauhinh/prisma.js'

type AnyRecord = Record<string, any>

export function id(value: any) {
  return String(value?._id ?? value?.id ?? value ?? '')
}

export function coId<T extends AnyRecord | null | undefined>(row: T): T {
  if (!row || typeof row !== 'object') return row
  return { ...row, _id: row.id } as T
}

export function coIdNhieu<T extends AnyRecord>(rows: T[]) {
  return rows.map(row => coId(row))
}

export function boUndefined<T extends AnyRecord>(data: T): Partial<T> {
  return Object.fromEntries(Object.entries(data).filter(([, value]) => value !== undefined)) as Partial<T>
}

export function loiTrungDuLieu(error: any) {
  return error?.code === 'P2002'
}

export function jsonArray(value: any): any[] {
  return Array.isArray(value) ? value : []
}

export function jsonObject(value: any): AnyRecord {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {}
}

export async function layNguoiDungTheoIds(ids: string[], select?: AnyRecord) {
  const uniqueIds = [...new Set(ids.map(id).filter(Boolean))]
  if (!uniqueIds.length) return new Map<string, AnyRecord>()
  const rows = await prisma.nguoiDung.findMany({
    where: { id: { in: uniqueIds } },
    ...(select ? { select } : {}),
  })
  return new Map(rows.map(row => [row.id, coId(row) as AnyRecord]))
}

export async function layKyNangTheoIds(ids: string[]) {
  const uniqueIds = [...new Set(ids.map(id).filter(Boolean))]
  if (!uniqueIds.length) return new Map<string, AnyRecord>()
  const rows = await prisma.danhMucKyNang.findMany({
    where: { id: { in: uniqueIds } },
    select: { id: true, tenKyNang: true, loaiKyNang: true },
  })
  return new Map(rows.map(row => [row.id, coId(row) as AnyRecord]))
}

export async function ganCongTyChoTin<T extends AnyRecord>(rows: T[]) {
  const ids = rows.map(row => id(row.maNhaTuyenDung)).filter(Boolean)
  const congTy = await prisma.nhaTuyenDung.findMany({
    where: { id: { in: [...new Set(ids)] } },
    select: {
      id: true,
      maNguoiDung: true,
      tenCongTy: true,
      logo: true,
      trangThaiDuyet: true,
    },
  })
  const congTyTheoId = new Map(congTy.map(row => [row.id, coId(row) as AnyRecord]))
  return rows.map(row => ({
    ...row,
    _id: row.id,
    maNhaTuyenDung: congTyTheoId.get(id(row.maNhaTuyenDung)) ?? row.maNhaTuyenDung,
  }))
}

export async function ganKyNangVaCongTyChoTin<T extends AnyRecord>(rows: T[]) {
  const tinIds = [...new Set(rows.map(row => id(row.id ?? row._id)).filter(Boolean))]
  const [tinDaGanCongTy, lienKetKyNang] = await Promise.all([
    ganCongTyChoTin(rows),
    tinIds.length
      ? prisma.tinTuyenDungKyNang.findMany({
          where: { maTinTuyenDung: { in: tinIds } },
          include: {
            kyNang: {
              select: { id: true, tenKyNang: true, loaiKyNang: true },
            },
          },
        })
      : Promise.resolve([]),
  ])

  const kyNangTheoTin = new Map<string, AnyRecord[]>()
  for (const lienKet of lienKetKyNang) {
    const danhSach = kyNangTheoTin.get(lienKet.maTinTuyenDung) ?? []
    danhSach.push({
      maKyNang: coId(lienKet.kyNang),
      tenKyNang: lienKet.kyNang.tenKyNang,
      loaiKyNang: lienKet.kyNang.loaiKyNang,
      batBuoc: lienKet.batBuoc,
      mucDo: lienKet.mucDo,
      trongSo: lienKet.trongSo,
    })
    kyNangTheoTin.set(lienKet.maTinTuyenDung, danhSach)
  }

  return tinDaGanCongTy.map(row => ({
    ...row,
    kyNang: kyNangTheoTin.get(id(row.id ?? row._id)) ?? [],
  }))
}

export async function ganNguoiDungChoUngVien<T extends AnyRecord>(rows: T[]) {
  const nguoiDungTheoId = await layNguoiDungTheoIds(rows.map(row => row.maNguoiDung), {
    id: true,
    hoTen: true,
    email: true,
    soDienThoai: true,
    trangThai: true,
  })
  return rows.map(row => ({
    ...row,
    _id: row.id,
    maNguoiDung: nguoiDungTheoId.get(id(row.maNguoiDung)) ?? row.maNguoiDung,
  }))
}

export async function ganNguoiDungChoCongTy<T extends AnyRecord>(rows: T[]) {
  const nguoiDungTheoId = await layNguoiDungTheoIds(rows.map(row => row.maNguoiDung), {
    id: true,
    hoTen: true,
    email: true,
    soDienThoai: true,
  })
  return rows.map(row => ({
    ...row,
    _id: row.id,
    maNguoiDung: nguoiDungTheoId.get(id(row.maNguoiDung)) ?? row.maNguoiDung,
  }))
}

export function sapXepTheoNgayGiamDan(a: AnyRecord, b: AnyRecord, field = 'ngayTao') {
  return new Date(b[field] ?? 0).getTime() - new Date(a[field] ?? 0).getTime()
}
