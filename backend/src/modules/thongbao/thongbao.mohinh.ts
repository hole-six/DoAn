import { prisma } from '../../cauhinh/prisma.js'

export const loaiThongBao = [
  'he_thong',
  'ho_so_ung_tuyen',
  'lich_phong_van',
  'tin_tuyen_dung',
  'cong_ty',
  'tin_nhan',
  'ket_qua_phong_van',
] as const

export const mucDoUuTien = ['thap', 'trung_binh', 'cao', 'khan_cap'] as const

export const ThongBao = prisma.thongBao
