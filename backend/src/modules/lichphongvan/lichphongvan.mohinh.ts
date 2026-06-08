import { prisma } from '../../cauhinh/prisma.js'

export const hinhThucPhongVan = ['online', 'offline'] as const
export const trangThaiLichPhongVan = ['da_len_lich', 'da_xac_nhan', 'doi_lich', 'da_huy', 'hoan_thanh'] as const
export const ketQuaPhongVan = ['cho_ket_qua', 'dat', 'khong_dat'] as const

export const LichPhongVan = prisma.lichPhongVan
