import { PrismaClient } from '@prisma/client'
import { bienMoiTruong } from './bienmoitruong.js'

process.env.DATABASE_URL ??= bienMoiTruong.chuoiKetNoiPostgres
export const prisma = new PrismaClient()
