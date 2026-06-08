import dns from 'node:dns'
import { PrismaClient } from '@prisma/client'
import { bienMoiTruong } from './bienmoitruong.js'

dns.setDefaultResultOrder('ipv4first')
process.env.DATABASE_URL ??= bienMoiTruong.chuoiKetNoiPostgres

function ngu(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function laLoiKetNoiTamThoi(error: unknown) {
  const anyError = error as { code?: string; message?: string }
  const message = String(anyError?.message ?? '')
  return (
    ['P1001', 'P1002', 'P1017'].includes(String(anyError?.code ?? '')) ||
    message.includes("Can't reach database server") ||
    message.includes('Please make sure your database server is running') ||
    message.includes('Timed out fetching a new connection') ||
    message.includes('Server has closed the connection') ||
    message.includes('Connection terminated unexpectedly')
  )
}

async function thuLaiKetNoi<T>(hanhDong: () => Promise<T>) {
  let loiCuoi: unknown
  for (let lan = 1; lan <= 3; lan += 1) {
    try {
      return await hanhDong()
    } catch (error) {
      loiCuoi = error
      if (!laLoiKetNoiTamThoi(error) || lan === 3) break
      await ngu(lan * 350)
    }
  }
  throw loiCuoi
}

export const prisma = new PrismaClient().$extends({
  query: {
    $allModels: {
      async $allOperations({ args, query }) {
        return thuLaiKetNoi(() => query(args))
      },
    },
  },
})
