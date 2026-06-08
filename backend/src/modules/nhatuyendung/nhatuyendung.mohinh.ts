import { prisma } from '../../cauhinh/prisma.js'

export const trangThaiDuyetNhaTuyenDung = ['cho_duyet', 'da_duyet', 'tu_choi'] as const

export const NhaTuyenDung = prisma.nhaTuyenDung
