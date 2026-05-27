import type { ErrorRequestHandler } from 'express'
import { ZodError } from 'zod'
import { LoiUngDung } from './loiungdung.js'

export const xuLyLoi: ErrorRequestHandler = (loi, _yeuCau, phanHoi, _tiepTheo) => {
  if (loi instanceof ZodError) {
    return phanHoi.status(422).json({
      thongBao: 'Du lieu khong hop le',
      loi: loi.flatten().fieldErrors,
    })
  }

  if (loi instanceof LoiUngDung) {
    return phanHoi.status(loi.maTrangThai).json({ thongBao: loi.message })
  }

  return phanHoi.status(500).json({
    thongBao: loi.message ?? 'Loi may chu',
  })
}
