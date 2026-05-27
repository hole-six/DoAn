import { z } from 'zod'
import { themePortfolio } from './portfolio.mohinh.js'

export const kiemTraTaoPortfolio = z.object({
  maHoSoNangLuc: z.string().min(1),
  tieuDe: z.string().min(2).optional(),
  markdown: z.string().max(50000).optional(),
  theme: z.enum(themePortfolio).optional(),
  mauChinh: z.string().optional(),
  mauPhu: z.string().optional(),
  font: z.string().optional(),
})

export const kiemTraCapNhatPortfolio = kiemTraTaoPortfolio.partial()

export const kiemTraPreviewPortfolio = kiemTraCapNhatPortfolio
