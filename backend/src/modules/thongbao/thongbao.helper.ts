import { taoVaGuiThongBao } from './thongbao.dichvu.js'

export async function thongBaoHoSoDuocXem(params: {
  maUngVien: string
  tenCongTy: string
  viTriUngTuyen: string
  maHoSoUngTuyen: string
}) {
  return taoVaGuiThongBao({
    maNguoiDung: params.maUngVien,
    loai: 'ho_so_ung_tuyen',
    tieuDe: 'Hồ sơ của bạn đã được xem',
    noiDung: `${params.tenCongTy} đã xem hồ sơ ứng tuyển vị trí ${params.viTriUngTuyen} của bạn.`,
    lienKet: `/ung-vien/ung-tuyen?hoSo=${params.maHoSoUngTuyen}`,
    mucDoUuTien: 'trung_binh',
    icon: 'eye',
    mauSac: '#3b82f6',
    maHoSoUngTuyen: params.maHoSoUngTuyen,
  })
}

export async function thongBaoMoiPhongVan(params: {
  maUngVien: string
  tenCongTy: string
  viTriUngTuyen: string
  thoiGian: Date
  hinhThuc?: 'online' | 'offline'
  diaChi: string
  linkHop?: string
  maLichPhongVan: string
}) {
  const diaDiem = params.hinhThuc === 'online'
    ? (params.linkHop ? `link họp ${params.linkHop}` : 'hình thức online')
    : (params.diaChi || 'địa điểm sẽ được cập nhật sau')

  return taoVaGuiThongBao({
    maNguoiDung: params.maUngVien,
    loai: 'lich_phong_van',
    tieuDe: 'Bạn được mời phỏng vấn',
    noiDung: `${params.tenCongTy} mời bạn phỏng vấn vị trí ${params.viTriUngTuyen} vào ${new Date(params.thoiGian).toLocaleString('vi-VN')} qua ${diaDiem}.`,
    lienKet: `/ung-vien/lich-phong-van?lich=${params.maLichPhongVan}`,
    mucDoUuTien: 'khan_cap',
    icon: 'calendar',
    mauSac: '#f59e0b',
    maLichPhongVan: params.maLichPhongVan,
    hanhDong: [
      { nhan: 'Xem chi tiết', url: `/ung-vien/lich-phong-van?lich=${params.maLichPhongVan}`, loai: 'primary' },
      { nhan: 'Xác nhận', url: `/ung-vien/lich-phong-van?lich=${params.maLichPhongVan}&action=xac-nhan`, loai: 'secondary' },
    ],
  })
}

export async function thongBaoUngVienYeuCauDoiLich(params: {
  maNhaTuyenDung: string
  tenUngVien: string
  viTriUngTuyen: string
  lyDo?: string
  maLichPhongVan: string
  maHoSoUngTuyen?: string
  maTinTuyenDung?: string
}) {
  return taoVaGuiThongBao({
    maNguoiDung: params.maNhaTuyenDung,
    loai: 'lich_phong_van',
    tieuDe: 'Ứng viên yêu cầu đổi lịch phỏng vấn',
    noiDung: `${params.tenUngVien} yêu cầu đổi lịch phỏng vấn ${params.viTriUngTuyen}${params.lyDo ? `. Lý do: ${params.lyDo}` : ''}.`,
    lienKet: `/nha-tuyen-dung/lich-phong-van?lich=${params.maLichPhongVan}`,
    mucDoUuTien: 'cao',
    icon: 'calendar-sync',
    mauSac: '#f59e0b',
    maLichPhongVan: params.maLichPhongVan,
    maHoSoUngTuyen: params.maHoSoUngTuyen,
    maTinTuyenDung: params.maTinTuyenDung,
    hanhDong: [
      { nhan: 'Mở lịch', url: `/nha-tuyen-dung/lich-phong-van?lich=${params.maLichPhongVan}`, loai: 'primary' },
      ...(params.maHoSoUngTuyen ? [{ nhan: 'Xem hồ sơ', url: `/nha-tuyen-dung/ung-vien?hoSo=${params.maHoSoUngTuyen}`, loai: 'secondary' as const }] : []),
    ],
  })
}

export async function thongBaoAdminUngVienYeuCauDoiLich(params: {
  maAdmin: string
  tenUngVien: string
  viTriUngTuyen: string
  lyDo?: string
  maLichPhongVan: string
  maHoSoUngTuyen?: string
  maTinTuyenDung?: string
}) {
  return taoVaGuiThongBao({
    maNguoiDung: params.maAdmin,
    loai: 'lich_phong_van',
    tieuDe: 'Ứng viên yêu cầu đổi lịch phỏng vấn',
    noiDung: `${params.tenUngVien} yêu cầu đổi lịch phỏng vấn ${params.viTriUngTuyen}${params.lyDo ? `. Lý do: ${params.lyDo}` : ''}.`,
    lienKet: '/quan-tri/chat',
    mucDoUuTien: 'cao',
    icon: 'calendar-sync',
    mauSac: '#f59e0b',
    maLichPhongVan: params.maLichPhongVan,
    maHoSoUngTuyen: params.maHoSoUngTuyen,
    maTinTuyenDung: params.maTinTuyenDung,
    hanhDong: [
      { nhan: 'Mở hỗ trợ', url: '/quan-tri/chat', loai: 'primary' },
    ],
  })
}

export async function thongBaoLichPhongVanThayDoi(params: {
  maUngVien: string
  tenCongTy: string
  viTriUngTuyen: string
  thoiGianMoi: Date
  lyDo?: string
  maLichPhongVan: string
}) {
  return taoVaGuiThongBao({
    maNguoiDung: params.maUngVien,
    loai: 'lich_phong_van',
    tieuDe: 'Lịch phỏng vấn đã thay đổi',
    noiDung: `${params.tenCongTy} đã thay đổi lịch phỏng vấn ${params.viTriUngTuyen} sang ${new Date(params.thoiGianMoi).toLocaleString('vi-VN')}${params.lyDo ? `. Lý do: ${params.lyDo}` : ''}.`,
    lienKet: `/ung-vien/lich-phong-van?lich=${params.maLichPhongVan}`,
    mucDoUuTien: 'cao',
    icon: 'warning',
    mauSac: '#f59e0b',
    maLichPhongVan: params.maLichPhongVan,
  })
}

export async function thongBaoKetQuaPhongVan(params: {
  maUngVien: string
  tenCongTy: string
  viTriUngTuyen: string
  ketQua: 'dat' | 'khong_dat' | 'cho_ket_qua'
  ghiChu?: string
  maLichPhongVan: string
}) {
  const tieuDe = params.ketQua === 'dat'
    ? 'Chúc mừng! Bạn đã vượt qua phỏng vấn'
    : params.ketQua === 'khong_dat'
      ? 'Kết quả phỏng vấn'
      : 'Cập nhật kết quả phỏng vấn'

  const noiDung = params.ketQua === 'dat'
    ? `Chúc mừng! Bạn đã vượt qua phỏng vấn vị trí ${params.viTriUngTuyen} tại ${params.tenCongTy}. ${params.ghiChu || 'Chúng tôi sẽ liên hệ với bạn sớm nhất.'}`
    : params.ketQua === 'khong_dat'
      ? `Cảm ơn bạn đã tham gia phỏng vấn vị trí ${params.viTriUngTuyen} tại ${params.tenCongTy}. ${params.ghiChu || 'Chúc bạn may mắn lần sau!'}`
      : `Kết quả phỏng vấn ${params.viTriUngTuyen} tại ${params.tenCongTy} đang được xem xét. ${params.ghiChu || ''}`

  return taoVaGuiThongBao({
    maNguoiDung: params.maUngVien,
    loai: 'ket_qua_phong_van',
    tieuDe,
    noiDung,
    lienKet: `/ung-vien/lich-phong-van?lich=${params.maLichPhongVan}`,
    mucDoUuTien: params.ketQua === 'dat' ? 'khan_cap' : 'cao',
    icon: params.ketQua === 'dat' ? 'success' : params.ketQua === 'khong_dat' ? 'error' : 'clock',
    mauSac: params.ketQua === 'dat' ? '#10b981' : params.ketQua === 'khong_dat' ? '#ef4444' : '#f59e0b',
    maLichPhongVan: params.maLichPhongVan,
  })
}

export async function thongBaoTinTuyenDungPhuHop(params: {
  maUngVien: string
  viTri: string
  tenCongTy: string
  mucLuong: string
  maTinTuyenDung: string
  tyLePhuHop: number
}) {
  return taoVaGuiThongBao({
    maNguoiDung: params.maUngVien,
    loai: 'tin_tuyen_dung',
    tieuDe: `Công việc phù hợp ${params.tyLePhuHop}%`,
    noiDung: `${params.tenCongTy} đang tuyển ${params.viTri} với mức lương ${params.mucLuong}. Hồ sơ của bạn phù hợp ${params.tyLePhuHop}%.`,
    lienKet: `/viec-lam/${params.maTinTuyenDung}`,
    mucDoUuTien: 'trung_binh',
    icon: 'briefcase',
    mauSac: '#06b6d4',
    maTinTuyenDung: params.maTinTuyenDung,
    hanhDong: [
      { nhan: 'Xem chi tiết', url: `/viec-lam/${params.maTinTuyenDung}`, loai: 'primary' },
      { nhan: 'Ứng tuyển ngay', url: `/viec-lam/${params.maTinTuyenDung}`, loai: 'secondary' },
    ],
  })
}

export async function thongBaoHoSoMoiUngTuyen(params: {
  maNhaTuyenDung: string
  tenUngVien: string
  viTriUngTuyen: string
  maHoSoUngTuyen: string
  kinhNghiem: string
}) {
  return taoVaGuiThongBao({
    maNguoiDung: params.maNhaTuyenDung,
    loai: 'ho_so_ung_tuyen',
    tieuDe: 'Hồ sơ ứng tuyển mới',
    noiDung: `${params.tenUngVien} (${params.kinhNghiem}) vừa ứng tuyển vị trí ${params.viTriUngTuyen}.`,
    lienKet: `/nha-tuyen-dung/ung-vien?hoSo=${params.maHoSoUngTuyen}`,
    mucDoUuTien: 'cao',
    icon: 'file-text',
    mauSac: '#10b981',
    maHoSoUngTuyen: params.maHoSoUngTuyen,
    hanhDong: [
      { nhan: 'Xem hồ sơ', url: `/nha-tuyen-dung/ung-vien?hoSo=${params.maHoSoUngTuyen}`, loai: 'primary' },
      { nhan: 'Mời phỏng vấn', url: `/nha-tuyen-dung/ung-vien?hoSo=${params.maHoSoUngTuyen}&action=moi-phong-van`, loai: 'secondary' },
    ],
  })
}

export async function thongBaoUngVienChapNhanLich(params: {
  maNhaTuyenDung: string
  tenUngVien: string
  viTriUngTuyen: string
  thoiGian: Date
  maLichPhongVan: string
}) {
  return taoVaGuiThongBao({
    maNguoiDung: params.maNhaTuyenDung,
    loai: 'lich_phong_van',
    tieuDe: 'Ứng viên đã xác nhận lịch phỏng vấn',
    noiDung: `${params.tenUngVien} đã xác nhận tham gia phỏng vấn ${params.viTriUngTuyen} vào ${new Date(params.thoiGian).toLocaleString('vi-VN')}.`,
    lienKet: `/nha-tuyen-dung/lich-phong-van?lich=${params.maLichPhongVan}`,
    mucDoUuTien: 'trung_binh',
    icon: 'check',
    mauSac: '#10b981',
    maLichPhongVan: params.maLichPhongVan,
  })
}

export async function thongBaoUngVienTuChoiLich(params: {
  maNhaTuyenDung: string
  tenUngVien: string
  viTriUngTuyen: string
  lyDo?: string
  maLichPhongVan: string
}) {
  return taoVaGuiThongBao({
    maNguoiDung: params.maNhaTuyenDung,
    loai: 'lich_phong_van',
    tieuDe: 'Ứng viên đã hủy lịch phỏng vấn',
    noiDung: `${params.tenUngVien} đã hủy lịch phỏng vấn ${params.viTriUngTuyen}${params.lyDo ? `. Lý do: ${params.lyDo}` : ''}.`,
    lienKet: `/nha-tuyen-dung/lich-phong-van?lich=${params.maLichPhongVan}`,
    mucDoUuTien: 'cao',
    icon: 'x',
    mauSac: '#ef4444',
    maLichPhongVan: params.maLichPhongVan,
  })
}

export async function thongBaoCongTyMoiDangKy(params: {
  maAdmin: string
  tenCongTy: string
  tenNguoiDangKy: string
  maNhaTuyenDung: string
}) {
  return taoVaGuiThongBao({
    maNguoiDung: params.maAdmin,
    loai: 'he_thong',
    tieuDe: 'Công ty mới đăng ký cần duyệt',
    noiDung: `${params.tenNguoiDangKy} đã đăng ký công ty ${params.tenCongTy}. Cần kiểm tra và duyệt hồ sơ.`,
    lienKet: `/quan-tri/cong-ty?congTy=${params.maNhaTuyenDung}`,
    mucDoUuTien: 'cao',
    icon: 'building',
    mauSac: '#8b5cf6',
    hanhDong: [
      { nhan: 'Duyệt công ty', url: `/quan-tri/cong-ty?congTy=${params.maNhaTuyenDung}`, loai: 'primary' },
    ],
  })
}

export async function thongBaoHeThong(params: {
  maNguoiDung: string
  tieuDe: string
  noiDung: string
  lienKet?: string
  mucDoUuTien?: 'thap' | 'trung_binh' | 'cao' | 'khan_cap'
  loai?: string
}) {
  return taoVaGuiThongBao({
    maNguoiDung: params.maNguoiDung,
    loai: params.loai || 'he_thong',
    tieuDe: params.tieuDe,
    noiDung: params.noiDung,
    lienKet: params.lienKet,
    mucDoUuTien: params.mucDoUuTien || 'trung_binh',
    icon: 'info',
    mauSac: '#6b7280',
  })
}
