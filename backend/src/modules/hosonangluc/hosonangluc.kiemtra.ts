import { z } from 'zod'

const kiemTraMucThongTin = z.object({
  tieuDe: z.string().optional(),
  donVi: z.string().optional(),
  thoiGian: z.string().optional(),
  moTa: z.string().optional(),
})

export const kiemTraTaoHoSoNangLuc = z.object({
  maUngVien: z.string().min(1),
  tieuDe: z.string().min(2),
  hocVan: z.array(kiemTraMucThongTin).optional(),
  kinhNghiemLam: z.array(kiemTraMucThongTin).optional(),
  chungChi: z.array(kiemTraMucThongTin).optional(),
  duAn: z.array(kiemTraMucThongTin).optional(),
  anhDaiDien: z.string().optional(),
  templateCv: z.string().optional(),
  mauChinh: z.string().optional(),
  mauPhu: z.string().optional(),
  font: z.string().optional(),
  markdownGoc: z.string().optional(),
  ghiChuAi: z.string().optional(),
  cvChinh: z.boolean().optional(),
  congKhai: z.boolean().optional(),
})

export const kiemTraCapNhatHoSoNangLuc = kiemTraTaoHoSoNangLuc.partial()
