import { prisma } from '../cauhinh/prisma.js'

type LegacyUngVienRow = {
  id: string
  kyNang: unknown
}

type LegacyTinRow = {
  id: string
  kyNang: unknown
}

function id(value: any) {
  return String(value?._id ?? value?.id ?? value ?? '')
}

async function cotTonTai(bang: string, cot: string) {
  const rows = await prisma.$queryRawUnsafe<Array<{ exists: boolean }>>(
    `
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = $1 AND column_name = $2
      ) AS "exists"
    `,
    bang,
    cot,
  )
  return Boolean(rows[0]?.exists)
}

async function layUngVienLegacy() {
  if (!(await cotTonTai('ung_vien', 'kyNang'))) return []
  return prisma.$queryRawUnsafe<LegacyUngVienRow[]>(`SELECT "_id" AS id, "kyNang" FROM ung_vien`)
}

async function layTinLegacy() {
  if (!(await cotTonTai('tin_tuyen_dung', 'kyNang'))) return []
  return prisma.$queryRawUnsafe<LegacyTinRow[]>(`SELECT "_id" AS id, "kyNang" FROM tin_tuyen_dung`)
}

async function syncUngVienKyNang() {
  console.log('Syncing UngVien skills to relational table...')
  const ungViens = await layUngVienLegacy()

  let synced = 0
  let skipped = 0

  for (const uv of ungViens) {
    const kyNangArray = Array.isArray(uv.kyNang) ? uv.kyNang : []
    if (!kyNangArray.length) {
      skipped += 1
      continue
    }

    const rows = kyNangArray
      .map(item => ({
        maUngVien: uv.id,
        maKyNang: id((item as any)?.maKyNang),
        mucDo: (item as any)?.mucDo != null ? Number((item as any).mucDo) : null,
        soNamKinhNghiem: (item as any)?.soNamKinhNghiem != null ? Number((item as any).soNamKinhNghiem) : null,
      }))
      .filter(item => item.maKyNang)

    if (!rows.length) {
      skipped += 1
      continue
    }

    await prisma.ungVienKyNang.deleteMany({ where: { maUngVien: uv.id } })
    await prisma.ungVienKyNang.createMany({ data: rows, skipDuplicates: true })
    synced += 1
  }

  console.log(`Synced ${synced} ung vien, skipped ${skipped}`)
}

async function syncTinTuyenDungKyNang() {
  console.log('Syncing TinTuyenDung skills to relational table...')
  const tins = await layTinLegacy()

  let synced = 0
  let skipped = 0

  for (const tin of tins) {
    const kyNangArray = Array.isArray(tin.kyNang) ? tin.kyNang : []
    if (!kyNangArray.length) {
      skipped += 1
      continue
    }

    const rows = kyNangArray
      .map(item => ({
        maTinTuyenDung: tin.id,
        maKyNang: id((item as any)?.maKyNang),
        batBuoc: Boolean((item as any)?.batBuoc),
        mucDo: (item as any)?.mucDo != null ? Number((item as any).mucDo) : null,
        trongSo: (item as any)?.trongSo != null ? Number((item as any).trongSo) : (Boolean((item as any)?.batBuoc) ? 1 : 0.5),
      }))
      .filter(item => item.maKyNang)

    if (!rows.length) {
      skipped += 1
      continue
    }

    await prisma.tinTuyenDungKyNang.deleteMany({ where: { maTinTuyenDung: tin.id } })
    await prisma.tinTuyenDungKyNang.createMany({ data: rows, skipDuplicates: true })
    synced += 1
  }

  console.log(`✅ Synced ${synced} tin tuyển dụng, skipped ${skipped} empty`)
}

async function verifyDataIntegrity() {
  const [uvCount, uvKyNangCount, tinCount, tinKyNangCount] = await Promise.all([
    prisma.ungVien.count(),
    prisma.ungVienKyNang.count(),
    prisma.tinTuyenDung.count(),
    prisma.tinTuyenDungKyNang.count(),
  ])

  console.log('Verification stats:')
  console.log(`- ung_vien: ${uvCount}`)
  console.log(`- ung_vien_ky_nang: ${uvKyNangCount}`)
  console.log(`- tin_tuyen_dung: ${tinCount}`)
  console.log(`- tin_tuyen_dung_ky_nang: ${tinKyNangCount}`)
}

async function dropJsonColumns() {
  if (await cotTonTai('ung_vien', 'kyNang')) {
    await prisma.$executeRaw`ALTER TABLE ung_vien DROP COLUMN IF EXISTS "kyNang"`
    console.log('Dropped ung_vien.kyNang')
  } else {
    console.log('ung_vien.kyNang already removed')
  }

  if (await cotTonTai('ung_vien', 'portfolio')) {
    await prisma.$executeRaw`ALTER TABLE ung_vien DROP COLUMN IF EXISTS "portfolio"`
    console.log('Dropped ung_vien.portfolio')
  } else {
    console.log('ung_vien.portfolio already removed')
  }

  if (await cotTonTai('tin_tuyen_dung', 'kyNang')) {
    await prisma.$executeRaw`ALTER TABLE tin_tuyen_dung DROP COLUMN IF EXISTS "kyNang"`
    console.log('Dropped tin_tuyen_dung.kyNang')
  } else {
    console.log('tin_tuyen_dung.kyNang already removed')
  }
}

async function main() {
  console.log('Starting migration: remove legacy JSON fields')

  try {
    await syncUngVienKyNang()
    await syncTinTuyenDungKyNang()
    await verifyDataIntegrity()
    await dropJsonColumns()
    console.log('Migration completed successfully')
  } catch (error) {
    console.error('Migration failed:', error)
    process.exitCode = 1
  } finally {
    await prisma.$disconnect()
  }
}

main()
