import { z } from 'zod'

const chuoiTuyChon = z.string().nullish().transform(value => value ?? undefined)
const mangChuoiTuyChon = z.array(z.string()).nullish().transform(value => value ?? undefined)

const kiemTraMucThongTin = z.object({
  tieuDe: chuoiTuyChon,
  donVi: chuoiTuyChon,
  thoiGian: chuoiTuyChon,
  moTa: chuoiTuyChon,
})

const kiemTraLienKet = z.object({
  nhan: chuoiTuyChon,
  url: chuoiTuyChon,
})

const kiemTraKyNang = z.object({
  nhom: chuoiTuyChon,
  muc: mangChuoiTuyChon,
})

const kiemTraDuAnChiTiet = z.object({
  tenDuAn: chuoiTuyChon,
  thoiGian: chuoiTuyChon,
  viTri: chuoiTuyChon,
  moTa: chuoiTuyChon,
  trachNhiem: mangChuoiTuyChon,
  heDieuHanh: chuoiTuyChon,
  ngonNgu: chuoiTuyChon,
  framework: chuoiTuyChon,
  kyThuat: chuoiTuyChon,
  diaDiem: chuoiTuyChon,
  lienKet: z.array(kiemTraLienKet).nullish().transform(value => value ?? undefined),
})

export const kiemTraTaoHoSoNangLuc = z.object({
  maUngVien: z.string().min(1),
  tieuDe: z.string().min(2),
  hocVan: z.array(kiemTraMucThongTin).optional(),
  kinhNghiemLam: z.array(kiemTraMucThongTin).optional(),
  chungChi: z.array(kiemTraMucThongTin).optional(),
  duAn: z.array(kiemTraMucThongTin).optional(),
  hoTenHienThi: chuoiTuyChon,
  chucDanh: chuoiTuyChon,
  soDienThoai: chuoiTuyChon,
  emailLienHe: chuoiTuyChon,
  facebook: chuoiTuyChon,
  github: chuoiTuyChon,
  portfolioUrl: chuoiTuyChon,
  diaDiem: chuoiTuyChon,
  tomTatKinhNghiem: mangChuoiTuyChon,
  kyNangMem: mangChuoiTuyChon,
  kyNangLapTrinh: z.array(kiemTraKyNang).optional(),
  baiVietKyThuat: z.array(kiemTraLienKet).optional(),
  duAnChiTiet: z.array(kiemTraDuAnChiTiet).optional(),
  fileCvTen: chuoiTuyChon,
  fileCvLoai: chuoiTuyChon,
  fileCvData: chuoiTuyChon,
  fileCvText: chuoiTuyChon,
  fileCvPath: chuoiTuyChon,
  fileCvTextStatus: z.enum(['ok', 'empty', 'gemini_pdf', 'failed']).optional(),
  fileCvTextError: chuoiTuyChon,
  loaiHoSo: z.enum(['builder', 'file_upload']).optional(),
  anhDaiDien: chuoiTuyChon,
  templateCv: chuoiTuyChon,
  mauChinh: chuoiTuyChon,
  mauPhu: chuoiTuyChon,
  font: chuoiTuyChon,
  markdownGoc: chuoiTuyChon,
  ghiChuAi: chuoiTuyChon,
  cvChinh: z.boolean().optional(),
  congKhai: z.boolean().optional(),
})

export const kiemTraCapNhatHoSoNangLuc = kiemTraTaoHoSoNangLuc.partial()
