import { prisma } from '../../cauhinh/prisma.js'

export const vaiTroNguoiDung = ['ung_vien', 'nha_tuyen_dung', 'admin'] as const
export const trangThaiTaiKhoan = ['hoat_dong', 'tam_khoa', 'bi_khoa'] as const

export const NguoiDung = prisma.nguoiDung
