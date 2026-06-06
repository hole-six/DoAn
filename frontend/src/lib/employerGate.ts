import type { NhaTuyenDung } from '../types/recruitment'

export type EmployerGateStatus =
  | 'missing_profile'
  | 'incomplete'
  | 'pending'
  | 'rejected'
  | 'unapproved'
  | 'approved'

export type EmployerGateResult = {
  status: EmployerGateStatus
  allowed: boolean
  message: string
  cta: string
}

function text(value?: string) {
  return String(value ?? '').trim()
}

export function refId(value: unknown) {
  if (!value) return ''
  if (typeof value === 'string') return value
  const item = value as { id?: string; _id?: string }
  return String(item.id ?? item._id ?? '')
}

export function getEmployerGate(company?: NhaTuyenDung | null): EmployerGateResult {
  if (!company || !text(company.tenCongTy)) {
    return {
      status: 'missing_profile',
      allowed: false,
      message: 'Bạn cần tạo và hoàn thiện hồ sơ công ty trước khi bắt đầu tuyển dụng.',
      cta: 'Hoàn thiện công ty',
    }
  }

  const hasRequiredProfile = Boolean(
    text(company.maSoThue)
      && text(company.diaChi)
      && text(company.logo)
      && text(company.moTa).length >= 20,
  )

  if (!hasRequiredProfile) {
    return {
      status: 'incomplete',
      allowed: false,
      message: 'Cần bổ sung mã số thuế, địa chỉ, logo và mô tả công ty trước khi gửi duyệt tuyển dụng.',
      cta: 'Bổ sung hồ sơ',
    }
  }

  if (company.trangThaiDuyet === 'da_duyet') {
    return {
      status: 'approved',
      allowed: true,
      message: 'Công ty đã được duyệt.',
      cta: 'Đăng tin',
    }
  }

  if (company.trangThaiDuyet === 'tu_choi') {
    return {
      status: 'rejected',
      allowed: false,
      message: company.lyDoTuChoi
        ? `Hồ sơ công ty bị từ chối: ${company.lyDoTuChoi}`
        : 'Hồ sơ công ty bị từ chối. Vui lòng cập nhật lại thông tin để được duyệt.',
      cta: 'Cập nhật lại',
    }
  }

  if (company.trangThaiDuyet === 'cho_duyet') {
    return {
      status: 'pending',
      allowed: false,
      message: 'Hồ sơ công ty đang chờ admin duyệt. Bạn sẽ dùng được tuyển dụng sau khi được duyệt.',
      cta: 'Chờ duyệt',
    }
  }

  return {
    status: 'unapproved',
    allowed: false,
    message: 'Cần hoàn thiện và được duyệt công ty trước khi tuyển dụng.',
    cta: 'Hoàn thiện công ty',
  }
}

export const EMPLOYER_RECRUITMENT_PATHS = [
  '/nha-tuyen-dung/quan-ly-tin',
  '/nha-tuyen-dung/ung-vien',
  '/nha-tuyen-dung/lich-phong-van',
  '/nha-tuyen-dung/tao-tin',
]
