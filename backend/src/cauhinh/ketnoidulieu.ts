import { prisma } from './prisma.js'

export async function ketNoiDuLieu() {
  await prisma.$connect()
  console.log('Da ket noi PostgreSQL')
}
