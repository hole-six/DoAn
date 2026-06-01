import type { RequestHandler } from 'express'
import { LoiUngDung } from './loiungdung.js'
import { layNguoiDungTuAccessToken } from '../modules/xacthuc/xacthuc.dichvu.js'

export const ganNguoiDungNeuCo: RequestHandler = async (yeuCau, _phanHoi, tiepTheo) => {
  const authorization = yeuCau.headers.authorization
  if (!authorization) {
    tiepTheo()
    return
  }

  try {
    const nguoiDung = await layNguoiDungTuAccessToken(authorization)
    ;(yeuCau as any).nguoiDung = { ...nguoiDung, _id: nguoiDung.id }
    ;(yeuCau as any).user = { ...nguoiDung, id: nguoiDung.id }
  } catch {
    // Token sai/het han trong mode optional se bo qua.
  }

  tiepTheo()
}

export const yeuCauDangNhap: RequestHandler = async (yeuCau, _phanHoi, tiepTheo) => {
  try {
    const nguoiDung = await layNguoiDungTuAccessToken(yeuCau.headers.authorization)
    ;(yeuCau as any).nguoiDung = { ...nguoiDung, _id: nguoiDung.id }
    ;(yeuCau as any).user = { ...nguoiDung, id: nguoiDung.id }
    tiepTheo()
  } catch {
    tiepTheo(new LoiUngDung('Ban can dang nhap de thuc hien thao tac nay', 401, 'UNAUTHORIZED', undefined, 'Dang nhap lai va thu lai'))
  }
}

export function yeuCauVaiTro(vaiTroChoPhep: string[]): RequestHandler {
  return (yeuCau, _phanHoi, tiepTheo) => {
    const nguoiDung = (yeuCau as any).nguoiDung
    if (!nguoiDung) {
      tiepTheo(new LoiUngDung('Ban can dang nhap de thuc hien thao tac nay', 401, 'UNAUTHORIZED'))
      return
    }
    if (!vaiTroChoPhep.includes(String(nguoiDung.vaiTro))) {
      tiepTheo(new LoiUngDung('Ban khong co quyen thuc hien thao tac nay', 403, 'FORBIDDEN'))
      return
    }
    tiepTheo()
  }
}
