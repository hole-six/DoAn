import { prisma } from '../../cauhinh/prisma.js'

export const vaiTroNguoiDanhGiaPhongVan = ['ung_vien', 'nha_tuyen_dung', 'admin'] as const
export const ketQuaDeXuatPhongVan = ['dat', 'khong_dat', 'can_xem_them'] as const

export const DanhGiaPhongVan = prisma.danhGiaPhongVan
