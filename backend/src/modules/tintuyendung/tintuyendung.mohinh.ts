import { prisma } from '../../cauhinh/prisma.js'

export const loaiHinhLamViec = ['toan_thoi_gian', 'ban_thoi_gian', 'thuc_tap', 'tu_xa', 'hybrid'] as const
export const capBacTinTuyenDung = ['intern', 'fresher', 'junior', 'middle', 'senior', 'lead'] as const
export const trangThaiTinTuyenDung = ['nhap', 'cho_duyet', 'dang_mo', 'tam_dong', 'het_han', 'tu_choi'] as const

export const TinTuyenDung = prisma.tinTuyenDung
