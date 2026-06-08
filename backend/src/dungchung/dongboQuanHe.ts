import { prisma } from '../cauhinh/prisma.js'

function id(value: any) {
  return String(value?._id ?? value?.id ?? value ?? '')
}

function soNguyenHoacNull(value: any) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? Math.trunc(parsed) : null
}

function soThucHoacMacDinh(value: any, macDinh: number) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : macDinh
}

export async function dongBoKyNangUngVien(maUngVien: string, kyNang: any[] | undefined) {
  if (!Array.isArray(kyNang)) return
  const rows = kyNang
    .map(item => ({
      maUngVien,
      maKyNang: id(item?.maKyNang),
      mucDo: soNguyenHoacNull(item?.mucDo),
      soNamKinhNghiem: item?.soNamKinhNghiem == null ? null : soThucHoacMacDinh(item.soNamKinhNghiem, 0),
    }))
    .filter(item => item.maUngVien && item.maKyNang)

  await prisma.$transaction([
    prisma.ungVienKyNang.deleteMany({ where: { maUngVien } }),
    ...(rows.length ? [prisma.ungVienKyNang.createMany({ data: rows, skipDuplicates: true })] : []),
  ])
}

export async function dongBoKyNangTinTuyenDung(maTinTuyenDung: string, kyNang: any[] | undefined) {
  if (!Array.isArray(kyNang)) return
  const rows = kyNang
    .map(item => ({
      maTinTuyenDung,
      maKyNang: id(item?.maKyNang),
      batBuoc: Boolean(item?.batBuoc),
      mucDo: soNguyenHoacNull(item?.mucDo),
      trongSo: soThucHoacMacDinh(item?.trongSo, item?.batBuoc ? 1 : 0.5),
    }))
    .filter(item => item.maTinTuyenDung && item.maKyNang)

  await prisma.$transaction([
    prisma.tinTuyenDungKyNang.deleteMany({ where: { maTinTuyenDung } }),
    ...(rows.length ? [prisma.tinTuyenDungKyNang.createMany({ data: rows, skipDuplicates: true })] : []),
  ])
}

export async function dongBoTatCaKyNangTuJson() {
  const [ungVienRows, tinRows] = await Promise.all([
    prisma.ungVien.findMany({ select: { id: true, kyNang: true } }),
    prisma.tinTuyenDung.findMany({ select: { id: true, kyNang: true } }),
  ])
  for (const ungVien of ungVienRows) await dongBoKyNangUngVien(ungVien.id, ungVien.kyNang as any[])
  for (const tin of tinRows) await dongBoKyNangTinTuyenDung(tin.id, tin.kyNang as any[])
}
