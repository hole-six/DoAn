import type { Request, Response } from 'express'
import { dichVuPortfolio } from './portfolio.dichvu.js'
import { kiemTraCapNhatPortfolio, kiemTraPreviewPortfolio, kiemTraTaoPortfolio } from './portfolio.kiemtra.js'

export const dieuKhienPortfolio = {
  async layDanhSach(yeuCau: Request, phanHoi: Response) {
    const duLieu = await dichVuPortfolio.layDanhSach(yeuCau.headers.authorization)
    phanHoi.json({ duLieu })
  },

  async layTheoMa(yeuCau: Request, phanHoi: Response) {
    const duLieu = await dichVuPortfolio.layTheoMa(yeuCau.headers.authorization, String(yeuCau.params.ma))
    phanHoi.json({ duLieu })
  },

  async taoMoi(yeuCau: Request, phanHoi: Response) {
    const payload = kiemTraTaoPortfolio.parse(yeuCau.body)
    const duLieu = await dichVuPortfolio.taoMoi(yeuCau.headers.authorization, payload)
    phanHoi.status(201).json({ duLieu })
  },

  async capNhat(yeuCau: Request, phanHoi: Response) {
    const payload = kiemTraCapNhatPortfolio.parse(yeuCau.body)
    const duLieu = await dichVuPortfolio.capNhat(yeuCau.headers.authorization, String(yeuCau.params.ma), payload)
    phanHoi.json({ duLieu })
  },

  async preview(yeuCau: Request, phanHoi: Response) {
    const payload = kiemTraPreviewPortfolio.parse(yeuCau.body)
    const html = await dichVuPortfolio.preview(yeuCau.headers.authorization, String(yeuCau.params.ma), payload)
    phanHoi.json({ duLieu: { html } })
  },

  async exportHtml(yeuCau: Request, phanHoi: Response) {
    const html = await dichVuPortfolio.exportHtml(yeuCau.headers.authorization, String(yeuCau.params.ma))
    phanHoi.setHeader('Content-Type', 'text/html; charset=utf-8')
    phanHoi.setHeader('Content-Disposition', 'attachment; filename="index.html"')
    phanHoi.send(html)
  },
}
