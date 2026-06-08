import { prisma } from '../../cauhinh/prisma.js'

export const gioiTinhUngVien = ['nam', 'nu', 'khac'] as const

export const UngVien = prisma.ungVien
