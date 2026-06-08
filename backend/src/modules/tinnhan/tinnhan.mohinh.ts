import { prisma } from '../../cauhinh/prisma.js'

export const loaiCuocTroChuyenEnum = ['ung_vien_nha_tuyen_dung', 'admin_support', 'nhom_cong_dong'] as const
export const loaiTinNhanEnum = ['text', 'file', 'image', 'system'] as const

export const CuocTroChuyenModel = prisma.cuocTroChuyen
export const TinNhanModel = prisma.tinNhan
