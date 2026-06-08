import { prisma } from '../../cauhinh/prisma.js'

export const trangThaiHoSoUngTuyen = ['da_nop', 'da_xem', 'dang_xet_duyet', 'moi_phong_van', 'dat', 'tu_choi', 'da_rut'] as const

export const HoSoUngTuyen = prisma.hoSoUngTuyen
