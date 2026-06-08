import { dongBoTatCaKyNangTuJson } from '../dungchung/dongboQuanHe.js'
import { prisma } from '../cauhinh/prisma.js'

function ngu(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function thuLai<T>(hanhDong: () => Promise<T>, soLan = 5) {
  let loiCuoi: unknown
  for (let lan = 1; lan <= soLan; lan += 1) {
    try {
      return await hanhDong()
    } catch (error) {
      loiCuoi = error
      const message = error instanceof Error ? error.message : String(error)
      if (lan === soLan) break
      const thoiGianCho = lan * 2000
      console.warn(`Ket noi database chua san sang, thu lai lan ${lan + 1}/${soLan} sau ${thoiGianCho}ms: ${message.split('\n')[0]}`)
      await ngu(thoiGianCho)
    }
  }
  throw loiCuoi
}

async function main() {
  await thuLai(() => dongBoTatCaKyNangTuJson())
  const [ungVienKyNang, tinTuyenDungKyNang] = await thuLai(() => Promise.all([
    prisma.ungVienKyNang.count(),
    prisma.tinTuyenDungKyNang.count(),
  ]))
  console.log(`Da dong bo quan he ky nang: ung_vien_ky_nang=${ungVienKyNang}, tin_tuyen_dung_ky_nang=${tinTuyenDungKyNang}`)
}

main()
  .catch((error) => {
    console.error('Dong bo quan he that bai:', error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
