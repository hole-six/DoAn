export type Tone = 'blue' | 'green' | 'yellow' | 'red' | 'gray'

export const jobStatusLabel: Record<string, string> = {
  nhap: 'Nháp',
  cho_duyet: 'Chờ duyệt',
  dang_mo: 'Đang mở',
  tam_dong: 'Tạm đóng',
  het_han: 'Hết hạn',
  tu_choi: 'Từ chối',
}

export const applicationStatusLabel: Record<string, string> = {
  da_nop: 'Đã nộp hồ sơ',
  da_xem: 'Nhà tuyển dụng đã xem',
  dang_xet_duyet: 'Hồ sơ đang được xem xét',
  moi_phong_van: 'Bạn đã được mời phỏng vấn',
  dat: 'Bạn đã đạt',
  tu_choi: 'Hồ sơ chưa phù hợp',
  da_rut: 'Bạn đã rút hồ sơ',
}

export const employerApplicationStatusLabel: Record<string, string> = {
  da_nop: 'Mới nộp',
  da_xem: 'Đã xem',
  dang_xet_duyet: 'Đang xét duyệt',
  moi_phong_van: 'Mời phỏng vấn',
  dat: 'Đạt',
  tu_choi: 'Từ chối',
  da_rut: 'Đã rút',
}

export const interviewStatusLabel: Record<string, string> = {
  da_len_lich: 'Cần phản hồi',
  da_xac_nhan: 'Đã xác nhận',
  doi_lich: 'Yêu cầu đổi lịch',
  hoan_thanh: 'Hoàn thành',
  da_huy: 'Đã hủy',
}

export const interviewResultLabel: Record<string, string> = {
  cho_ket_qua: 'Chờ kết quả',
  dat: 'Đạt',
  khong_dat: 'Không đạt',
}

export function toneForJobStatus(value?: string): Tone {
  if (value === 'dang_mo') return 'green'
  if (value === 'tu_choi' || value === 'het_han') return 'red'
  if (value === 'cho_duyet') return 'yellow'
  return 'gray'
}

export function toneForApplicationStatus(value?: string): Tone {
  if (value === 'dat') return 'green'
  if (value === 'tu_choi' || value === 'da_rut') return 'red'
  if (value === 'moi_phong_van') return 'yellow'
  return 'blue'
}

export function toneForInterviewStatus(value?: string): Tone {
  if (value === 'da_xac_nhan' || value === 'hoan_thanh') return 'green'
  if (value === 'doi_lich' || value === 'da_len_lich') return 'yellow'
  if (value === 'da_huy') return 'red'
  return 'blue'
}
