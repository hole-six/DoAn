import type { Request, Response } from 'express'
import { batLoiBatDongBo } from './batloibatdongbo.js'

type BoKiemTra = {
  parse: (duLieu: unknown) => unknown
}

type DichVuCoBan = {
  layDanhSach: (boLoc?: Record<string, unknown>) => Promise<unknown>
  layTheoMa: (ma: string) => Promise<unknown>
  taoMoi: (duLieu: unknown) => Promise<unknown>
  capNhat: (ma: string, duLieu: unknown) => Promise<unknown>
  xoa: (ma: string) => Promise<unknown>
}

export function taoDieuKhienCoBan(dichVu: DichVuCoBan, kiemTraTao: BoKiemTra, kiemTraCapNhat: BoKiemTra) {
  return {
    layDanhSach: batLoiBatDongBo(async (yeuCau: Request, phanHoi: Response) => {
      const duLieu = await dichVu.layDanhSach(yeuCau.query as Record<string, unknown>)
      return phanHoi.json({ duLieu })
    }),

    layChiTiet: batLoiBatDongBo(async (yeuCau: Request, phanHoi: Response) => {
      const ma = String(yeuCau.params.ma ?? '')
      const duLieu = await dichVu.layTheoMa(ma)
      return phanHoi.json({ duLieu })
    }),

    taoMoi: batLoiBatDongBo(async (yeuCau: Request, phanHoi: Response) => {
      const duLieuHopLe = kiemTraTao.parse(yeuCau.body)
      const duLieu = await dichVu.taoMoi(duLieuHopLe)
      return phanHoi.status(201).json({ duLieu })
    }),

    capNhat: batLoiBatDongBo(async (yeuCau: Request, phanHoi: Response) => {
      const duLieuHopLe = kiemTraCapNhat.parse(yeuCau.body)
      const ma = String(yeuCau.params.ma ?? '')
      const duLieu = await dichVu.capNhat(ma, duLieuHopLe)
      return phanHoi.json({ duLieu })
    }),

    xoa: batLoiBatDongBo(async (yeuCau: Request, phanHoi: Response) => {
      const ma = String(yeuCau.params.ma ?? '')
      await dichVu.xoa(ma)
      return phanHoi.status(204).send()
    }),
  }
}
