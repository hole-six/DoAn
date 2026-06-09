import type { ErrorRequestHandler } from 'express'
import { ZodError } from 'zod'
import { LoiUngDung } from './loiungdung.js'

export const xuLyLoi: ErrorRequestHandler = (loi, _yeuCau, phanHoi, _tiepTheo) => {
  if (loi instanceof ZodError) {
    return phanHoi.status(422).json({
      code: 'VALIDATION_ERROR',
      message: 'Dữ liệu không hợp lệ',
      thongBao: 'Dữ liệu không hợp lệ',
      fieldErrors: loi.flatten().fieldErrors,
      loi: loi.flatten().fieldErrors,
      actionHint: 'Kiểm tra lại dữ liệu đã nhập và thử lại',
    })
  }

  if (typeof loi === 'object' && loi && 'code' in loi && ((loi as any).code === 11000 || (loi as any).code === 'P2002')) {
    return phanHoi.status(409).json({
      code: 'DUPLICATE_KEY',
      message: 'Dữ liệu đã tồn tại',
      thongBao: 'Dữ liệu đã tồn tại',
      actionHint: 'Kiểm tra lại giá trị trùng lặp',
    })
  }

  if (typeof loi === 'object' && loi && 'code' in loi && (loi as any).code === 'P2025') {
    return phanHoi.status(404).json({
      code: 'RECORD_NOT_FOUND',
      message: 'Không tìm thấy dữ liệu',
      thongBao: 'Không tìm thấy dữ liệu',
      actionHint: 'Tải lại trang và thử lại',
    })
  }

  if (typeof loi === 'object' && loi && 'type' in loi && (loi as any).type === 'entity.too.large') {
    return phanHoi.status(413).json({
      code: 'REQUEST_ENTITY_TOO_LARGE',
      message: 'Dữ liệu gửi lên quá lớn',
      thongBao: 'Dữ liệu gửi lên quá lớn. Hãy upload file riêng thay vì lưu trực tiếp vào form.',
      actionHint: 'Tải file bằng chức năng upload trước khi bấm lưu',
    })
  }

  if (typeof loi === 'object' && loi && 'code' in loi && (loi as any).code === 'LIMIT_FILE_SIZE') {
    return phanHoi.status(413).json({
      code: 'UPLOAD_FILE_TOO_LARGE',
      message: 'File upload qua lon',
      thongBao: 'File upload qua lon',
      actionHint: 'Chon file nho hon gioi han cho phep',
    })
  }

  if (loi instanceof Error && loi.message.startsWith('Chi cho phep upload')) {
    return phanHoi.status(400).json({
      code: 'UPLOAD_FILE_TYPE_INVALID',
      message: loi.message,
      thongBao: loi.message,
      actionHint: 'Chon dung dinh dang file duoc ho tro',
    })
  }

  if (loi instanceof LoiUngDung) {
    return phanHoi.status(loi.maTrangThai).json({
      code: loi.maLoi,
      message: loi.message,
      thongBao: loi.message,
      fieldErrors: loi.loiTruong,
      actionHint: loi.goiYHanhDong,
    })
  }

  return phanHoi.status(500).json({
    code: 'INTERNAL_SERVER_ERROR',
    message: loi.message ?? 'Loi may chu',
    thongBao: loi.message ?? 'Loi may chu',
    actionHint: 'Thu lai sau it phut hoac lien he quan tri vien',
  })
}
