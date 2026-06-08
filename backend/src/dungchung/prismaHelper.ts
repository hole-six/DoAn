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

export async function ganKyNangJson<T extends AnyRecord>(rows: T[], field = 'kyNang') {
  const ids = rows.flatMap(row => jsonArray(row[field]).map(item => id(item?.maKyNang)).filter(Boolean))
  const kyNangTheoId = await layKyNangTheoIds(ids)
  return rows.map(row => ({
    ...row,
    [field]: jsonArray(row[field]).map(item => ({
      ...item,
      maKyNang: kyNangTheoId.get(id(item?.maKyNang)) ?? item?.maKyNang,
    })),
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
  const idsCongTy = [...new Set(rows.map(row => id(row.maNhaTuyenDung)).filter(Boolean))]
  const idsKyNang = [...new Set(rows.flatMap(row => jsonArray(row.kyNang).map(item => id(item?.maKyNang)).filter(Boolean)))]
  const [congTyRows, kyNangTheoId] = await Promise.all([
    idsCongTy.length
      ? prisma.nhaTuyenDung.findMany({
          where: { id: { in: idsCongTy } },
          select: {
            id: true,
            maNguoiDung: true,
            tenCongTy: true,
            logo: true,
            trangThaiDuyet: true,
          },
        })
      : Promise.resolve([]),
    layKyNangTheoIds(idsKyNang),
  ])
  const congTyTheoId = new Map(congTyRows.map(row => [row.id, coId(row) as AnyRecord]))
  return rows.map(row => ({
    ...row,
    _id: row.id,
    maNhaTuyenDung: congTyTheoId.get(id(row.maNhaTuyenDung)) ?? row.maNhaTuyenDung,
    kyNang: jsonArray(row.kyNang).map(item => ({
      ...item,
      maKyNang: kyNangTheoId.get(id(item?.maKyNang)) ?? item?.maKyNang,
    })),
  }))
}

export function sapXepTheoNgayGiamDan(a: AnyRecord, b: AnyRecord, field = 'ngayTao') {
  return new Date(b[field] ?? 0).getTime() - new Date(a[field] ?? 0).getTime()
}
