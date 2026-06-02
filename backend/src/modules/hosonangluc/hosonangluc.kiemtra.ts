import { z } from 'zod'

const kiemTraMucThongTin = z.object({
  tieuDe: z.string().optional(),
  donVi: z.string().optional(),
  thoiGian: z.string().optional(),
  moTa: z.string().optional(),
})

const kiemTraLienKet = z.object({
  nhan: z.string().optional(),
  url: z.string().optional(),
})

const kiemTraKyNang = z.object({
  nhom: z.string().optional(),
  muc: z.array(z.string()).optional(),
})

const kiemTraDuAnChiTiet = z.object({
  tenDuAn: z.string().optional(),
  thoiGian: z.string().optional(),
  viTri: z.string().optional(),
  moTa: z.string().optional(),
  trachNhiem: z.array(z.string()).optional(),
  heDieuHanh: z.string().optional(),
  ngonNgu: z.string().optional(),
  framework: z.string().optional(),
  kyThuat: z.string().optional(),
  diaDiem: z.string().optional(),
  lienKet: z.array(kiemTraLienKet).optional(),
})

export const kiemTraTaoHoSoNangLuc = z.object({
  maUngVien: z.string().min(1),
  tieuDe: z.string().min(2),
  hocVan: z.array(kiemTraMucThongTin).optional(),
  kinhNghiemLam: z.array(kiemTraMucThongTin).optional(),
  chungChi: z.array(kiemTraMucThongTin).optional(),
  duAn: z.array(kiemTraMucThongTin).optional(),
  hoTenHienThi: z.string().optional(),
  chucDanh: z.string().optional(),
  soDienThoai: z.string().optional(),
  emailLienHe: z.string().optional(),
  facebook: z.string().optional(),
  github: z.string().optional(),
  portfolioUrl: z.string().optional(),
  diaDiem: z.string().optional(),
  tomTatKinhNghiem: z.array(z.string()).optional(),
  kyNangMem: z.array(z.string()).optional(),
  kyNangLapTrinh: z.array(kiemTraKyNang).optional(),
  baiVietKyThuat: z.array(kiemTraLienKet).optional(),
  duAnChiTiet: z.array(kiemTraDuAnChiTiet).optional(),
  fileCvTen: z.string().optional(),
  fileCvLoai: z.string().optional(),
  fileCvĐạta: z.string().optional(),
  loaiHoSo: z.enum(['builder', 'file_upload']).optional(),
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

