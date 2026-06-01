import type { ErrorRequestHandler } from 'express'
import mongoose from 'mongoose'
import { ZodError } from 'zod'
import { LoiUngDung } from './loiungdung.js'

export const xuLyLoi: ErrorRequestHandler = (loi, _yeuCau, phanHoi, _tiepTheo) => {
  if (loi instanceof ZodError) {
    return phanHoi.status(422).json({
      code: 'VALIDATION_ERROR',
      message: 'Du lieu khong hop le',
      thongBao: 'Du lieu khong hop le',
      fieldErrors: loi.flatten().fieldErrors,
      loi: loi.flatten().fieldErrors,
      actionHint: 'Kiem tra lai du lieu da nhap va thu lai',
    })
  }

  if (loi instanceof mongoose.Error.ValidationError) {
    const fieldErrors = Object.entries(loi.errors).reduce<Record<string, string[]>>((acc, [field, error]) => {
      acc[field] = [error.message]
      return acc
    }, {})
    return phanHoi.status(422).json({
      code: 'MONGOOSE_VALIDATION_ERROR',
      message: loi.message,
      thongBao: loi.message,
      fieldErrors,
      loi: fieldErrors,
      actionHint: 'Kiem tra lai du lieu da nhap va thu lai',
    })
  }

  if (loi instanceof mongoose.Error.CastError) {
    return phanHoi.status(400).json({
      code: 'MONGOOSE_CAST_ERROR',
      message: loi.message,
      thongBao: loi.message,
      actionHint: 'Du lieu dinh danh khong hop le, hay tai lai trang va thu lai',
    })
  }

  if (typeof loi === 'object' && loi && 'code' in loi && (loi as any).code === 11000) {
    return phanHoi.status(409).json({
      code: 'DUPLICATE_KEY',
      message: 'Du lieu da ton tai',
      thongBao: 'Du lieu da ton tai',
      actionHint: 'Kiem tra lai gia tri trung lap',
    })
  }

  if (typeof loi === 'object' && loi && 'type' in loi && (loi as any).type === 'entity.too.large') {
    return phanHoi.status(413).json({
      code: 'REQUEST_ENTITY_TOO_LARGE',
      message: 'Du lieu gui len qua lon',
      thongBao: 'Du lieu gui len qua lon. Hay upload file rieng thay vi luu truc tiep vao form.',
      actionHint: 'Tai file bang chuc nang upload truoc khi bam luu',
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
