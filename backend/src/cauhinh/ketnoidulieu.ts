import { prisma } from './prisma.js'

function ngu(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export async function ketNoiDuLieu() {
  let loiCuoi: unknown
  for (let lan = 1; lan <= 8; lan += 1) {
    try {
      await prisma.$connect()
      console.log('Đã kết nối PostgreSQL')
      return
    } catch (error) {
      loiCuoi = error
      const thoiGianCho = Math.min(lan * 2000, 10000)
      console.warn(`Kết nối PostgreSQL thất bại lần ${lan}/8, thử lại sau ${thoiGianCho}ms`)
      if (lan < 8) await ngu(thoiGianCho)
    }
  }
  throw loiCuoi
}
