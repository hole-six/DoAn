import type { NextFunction, Request, Response } from 'express'

type HamBatDongBo = (yeuCau: Request, phanHoi: Response, tiepTheo: NextFunction) => Promise<unknown>

export function batLoiBatDongBo(hamXuLy: HamBatDongBo) {
  return (yeuCau: Request, phanHoi: Response, tiepTheo: NextFunction) => {
    Promise.resolve(hamXuLy(yeuCau, phanHoi, tiepTheo)).catch(tiepTheo)
  }
}
