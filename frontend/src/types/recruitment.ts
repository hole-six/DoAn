export type Id = string

export type NguoiDungRef = {
  id?: Id
  _id?: Id
  hoTen?: string
  email?: string
  soDienThoai?: string
}

export type NhaTuyenDung = {
  id: Id
  _id?: Id
  maNguoiDung?: Id | NguoiDungRef
  nguoiDung?: NguoiDungRef
  tenCongTy: string
  maSoThue?: string
  moTa?: string
  logo?: string
  diaChi?: string
  website?: string
  nganh?: string
  quyMo?: number
  trangThaiDuyet?: string
  lyDoTuChoi?: string
}

export type UngVien = {
  id: Id
  _id?: Id
  maNguoiDung?: Id | NguoiDungRef
  viTriMongMuon?: string
  kinhNghiem?: number
  diaChi?: string
  mucLuongMongMuon?: number
  tomTat?: string
  portfolio?: unknown[]
  nguoiDung?: NguoiDungRef
}

export type HoSoNangLuc = {
  id: Id
  _id?: Id
  maUngVien: Id
  tieuDe: string
  loaiHoSo?: 'builder' | 'file_upload'
  cvChinh?: boolean
  congKhai?: boolean
  hoTenHienThi?: string
  chucDanh?: string
  soDienThoai?: string
  emailLienHe?: string
  facebook?: string
  github?: string
  portfolioUrl?: string
  diaDiem?: string
  tomTatKinhNghiem?: unknown[]
  kyNangMem?: unknown[]
  kyNangLapTrinh?: unknown[]
  hocVan?: unknown[]
  kinhNghiemLam?: unknown[]
  duAnChiTiet?: unknown[]
  fileCvTen?: string
  fileCvLoai?: string
  fileCvData?: string
  anhDaiDien?: string
  [key: string]: unknown
}

export type TinTuyenDung = {
  id: Id
  _id?: Id
  maNhaTuyenDung: Id
  nhaTuyenDung?: Pick<NhaTuyenDung, 'id' | 'tenCongTy' | 'logo' | 'trangThaiDuyet'> & {
    maNguoiDung?: Id | NguoiDungRef
    nguoiDung?: NguoiDungRef
  }
  tieuDe: string
  yeuCauKinhNghiem?: string
  diaChi?: string
  luongMin?: number
  luongMax?: number
  loaiHinh?: string
  capBac?: string
  anhDaiDien?: string
  hanNop?: string
  soLuong?: number
  moTa?: string
  yeuCau?: string
  quyenLoi?: string
  trangThai?: string
  kyNang?: Array<{ maKyNang?: string; tenKyNang?: string; loaiKyNang?: string; batBuoc?: boolean }>
}

export type HoSoUngTuyen = {
  id: Id
  _id?: Id
  maUngVien: Id
  maTinTuyenDung: Id
  maHoSoNangLuc?: Id
  tinTuyenDung?: TinTuyenDung
  ungVien?: UngVien
  hoSoNangLuc?: HoSoNangLuc
  thuXinViec?: string
  diemKhopKyNang?: number
  trangThai: string
  ngayNop?: string
}

export type LichPhongVan = {
  id: Id
  _id?: Id
  maHoSoUngTuyen: Id
  hoSoUngTuyen?: HoSoUngTuyen
  thoiGianBatDau: string
  thoiGianKetThuc?: string
  diaChi?: string
  hinhThuc?: 'online' | 'offline'
  linkHop?: string
  ghiChu?: string
  trangThai: string
  ketQua?: string
}

export type ThongBao = {
  id?: Id
  _id?: Id
  maNguoiDung?: Id | NguoiDungRef
  tieuDe: string
  noiDung: string
  loai?: string
  daDoc?: boolean
  lienKet?: string
  maHoSoUngTuyen?: Id
  maLichPhongVan?: Id
  maTinTuyenDung?: Id
  hanhDong?: Array<{ nhan: string; url: string; loai?: string }>
  ngayTao?: string
}

export type KyNang = {
  id: Id
  _id?: Id
  tenKyNang: string
  loaiKyNang?: string
}
