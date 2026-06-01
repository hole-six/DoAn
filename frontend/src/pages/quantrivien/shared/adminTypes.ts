import type { KyNang, NhaTuyenDung, TinTuyenDung } from '../../../types/recruitment'

export type AdminCompany = NhaTuyenDung
export type AdminJob = TinTuyenDung
export type AdminSkill = KyNang & { moTa?: string }
export type AdminReview = {
  id: string
  _id?: string
  maNhaTuyenDung?: string
  diem?: number
  noiDung?: string
  daDuyet?: boolean
  ngayTao?: string
}
