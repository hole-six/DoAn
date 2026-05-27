"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.thongBaoHoSoDuocXem = thongBaoHoSoDuocXem;
exports.thongBaoMoiPhongVan = thongBaoMoiPhongVan;
exports.thongBaoLichPhongVanThayDoi = thongBaoLichPhongVanThayDoi;
exports.thongBaoKetQuaPhongVan = thongBaoKetQuaPhongVan;
exports.thongBaoTinTuyenDungPhuHop = thongBaoTinTuyenDungPhuHop;
exports.thongBaoHoSoMoiUngTuyen = thongBaoHoSoMoiUngTuyen;
exports.thongBaoUngVienChapNhanLich = thongBaoUngVienChapNhanLich;
exports.thongBaoUngVienTuChoiLich = thongBaoUngVienTuChoiLich;
exports.thongBaoCongTyMoiDangKy = thongBaoCongTyMoiDangKy;
exports.thongBaoHeThong = thongBaoHeThong;
const thongbao_dichvu_js_1 = require("./thongbao.dichvu.js");
// ============================================
// THÔNG BÁO CHO ỨNG VIÊN
// ============================================
/**
 * Thông báo khi hồ sơ được xem bởi nhà tuyển dụng
 */
async function thongBaoHoSoDuocXem(params) {
    return await (0, thongbao_dichvu_js_1.taoVaGuiThongBao)({
        maNguoiDung: params.maUngVien,
        loai: 'ho_so_ung_tuyen',
        tieuDe: 'Hồ sơ của bạn đã được xem',
        noiDung: `${params.tenCongTy} đã xem hồ sơ ứng tuyển vị trí ${params.viTriUngTuyen} của bạn`,
        lienKet: `/ung-vien/ho-so-ung-tuyen/${params.maHoSoUngTuyen}`,
        mucDoUuTien: 'trung_binh',
        icon: '👀',
        mauSac: '#3b82f6',
        maHoSoUngTuyen: params.maHoSoUngTuyen,
    });
}
/**
 * Thông báo khi được mời phỏng vấn (URGENT)
 */
async function thongBaoMoiPhongVan(params) {
    return await (0, thongbao_dichvu_js_1.taoVaGuiThongBao)({
        maNguoiDung: params.maUngVien,
        loai: 'lich_phong_van',
        tieuDe: '🎉 Bạn được mời phỏng vấn!',
        noiDung: `${params.tenCongTy} mời bạn phỏng vấn vị trí ${params.viTriUngTuyen} vào ${new Date(params.thoiGian).toLocaleString('vi-VN')} tại ${params.diaChi}`,
        lienKet: `/ung-vien/lich-phong-van/${params.maLichPhongVan}`,
        mucDoUuTien: 'khan_cap',
        icon: '📅',
        mauSac: '#f59e0b',
        maLichPhongVan: params.maLichPhongVan,
        hanhDong: [
            { nhan: 'Xem chi tiết', url: `/ung-vien/lich-phong-van/${params.maLichPhongVan}`, loai: 'primary' },
            { nhan: 'Xác nhận', url: `/ung-vien/lich-phong-van/${params.maLichPhongVan}/xac-nhan`, loai: 'secondary' },
        ],
    });
}
/**
 * Thông báo khi lịch phỏng vấn thay đổi
 */
async function thongBaoLichPhongVanThayDoi(params) {
    return await (0, thongbao_dichvu_js_1.taoVaGuiThongBao)({
        maNguoiDung: params.maUngVien,
        loai: 'lich_phong_van',
        tieuDe: 'Lịch phỏng vấn đã thay đổi',
        noiDung: `${params.tenCongTy} đã thay đổi lịch phỏng vấn ${params.viTriUngTuyen} sang ${new Date(params.thoiGianMoi).toLocaleString('vi-VN')}${params.lyDo ? `. Lý do: ${params.lyDo}` : ''}`,
        lienKet: `/ung-vien/lich-phong-van/${params.maLichPhongVan}`,
        mucDoUuTien: 'cao',
        icon: '⚠️',
        mauSac: '#f59e0b',
        maLichPhongVan: params.maLichPhongVan,
    });
}
/**
 * Thông báo kết quả phỏng vấn
 */
async function thongBaoKetQuaPhongVan(params) {
    const tieuDe = params.ketQua === 'dat'
        ? '🎉 Chúc mừng! Bạn đã vượt qua phỏng vấn'
        : params.ketQua === 'khong_dat'
            ? 'Kết quả phỏng vấn'
            : 'Cập nhật kết quả phỏng vấn';
    const noiDung = params.ketQua === 'dat'
        ? `Chúc mừng! Bạn đã vượt qua phỏng vấn vị trí ${params.viTriUngTuyen} tại ${params.tenCongTy}. ${params.ghiChu || 'Chúng tôi sẽ liên hệ với bạn sớm nhất.'}`
        : params.ketQua === 'khong_dat'
            ? `Cảm ơn bạn đã tham gia phỏng vấn vị trí ${params.viTriUngTuyen} tại ${params.tenCongTy}. ${params.ghiChu || 'Chúc bạn may mắn lần sau!'}`
            : `Kết quả phỏng vấn ${params.viTriUngTuyen} tại ${params.tenCongTy} đang được xem xét. ${params.ghiChu || ''}`;
    return await (0, thongbao_dichvu_js_1.taoVaGuiThongBao)({
        maNguoiDung: params.maUngVien,
        loai: 'ket_qua_phong_van',
        tieuDe,
        noiDung,
        lienKet: `/ung-vien/lich-phong-van/${params.maLichPhongVan}`,
        mucDoUuTien: params.ketQua === 'dat' ? 'khan_cap' : 'cao',
        icon: params.ketQua === 'dat' ? '🎉' : params.ketQua === 'khong_dat' ? '😔' : '⏳',
        mauSac: params.ketQua === 'dat' ? '#10b981' : params.ketQua === 'khong_dat' ? '#ef4444' : '#f59e0b',
        maLichPhongVan: params.maLichPhongVan,
    });
}
/**
 * Thông báo tin tuyển dụng phù hợp (AI matching)
 */
async function thongBaoTinTuyenDungPhuHop(params) {
    return await (0, thongbao_dichvu_js_1.taoVaGuiThongBao)({
        maNguoiDung: params.maUngVien,
        loai: 'tin_tuyen_dung',
        tieuDe: `Công việc phù hợp ${params.tyLePhuHop}%`,
        noiDung: `${params.tenCongTy} đang tuyển ${params.viTri} với mức lương ${params.mucLuong}. Hồ sơ của bạn phù hợp ${params.tyLePhuHop}%!`,
        lienKet: `/tin-tuyen-dung/${params.maTinTuyenDung}`,
        mucDoUuTien: 'trung_binh',
        icon: '💼',
        mauSac: '#06b6d4',
        maTinTuyenDung: params.maTinTuyenDung,
        hanhDong: [
            { nhan: 'Xem chi tiết', url: `/tin-tuyen-dung/${params.maTinTuyenDung}`, loai: 'primary' },
            { nhan: 'Ứng tuyển ngay', url: `/tin-tuyen-dung/${params.maTinTuyenDung}/ung-tuyen`, loai: 'secondary' },
        ],
    });
}
// ============================================
// THÔNG BÁO CHO NHÀ TUYỂN DỤNG
// ============================================
/**
 * Thông báo khi có hồ sơ mới ứng tuyển
 */
async function thongBaoHoSoMoiUngTuyen(params) {
    return await (0, thongbao_dichvu_js_1.taoVaGuiThongBao)({
        maNguoiDung: params.maNhaTuyenDung,
        loai: 'ho_so_ung_tuyen',
        tieuDe: 'Hồ sơ ứng tuyển mới',
        noiDung: `${params.tenUngVien} (${params.kinhNghiem}) vừa ứng tuyển vị trí ${params.viTriUngTuyen}`,
        lienKet: `/nha-tuyen-dung/ho-so-ung-tuyen/${params.maHoSoUngTuyen}`,
        mucDoUuTien: 'cao',
        icon: '📄',
        mauSac: '#10b981',
        maHoSoUngTuyen: params.maHoSoUngTuyen,
        hanhDong: [
            { nhan: 'Xem hồ sơ', url: `/nha-tuyen-dung/ho-so-ung-tuyen/${params.maHoSoUngTuyen}`, loai: 'primary' },
            { nhan: 'Mời phỏng vấn', url: `/nha-tuyen-dung/ho-so-ung-tuyen/${params.maHoSoUngTuyen}/moi-phong-van`, loai: 'secondary' },
        ],
    });
}
/**
 * Thông báo khi ứng viên chấp nhận lịch phỏng vấn
 */
async function thongBaoUngVienChapNhanLich(params) {
    return await (0, thongbao_dichvu_js_1.taoVaGuiThongBao)({
        maNguoiDung: params.maNhaTuyenDung,
        loai: 'lich_phong_van',
        tieuDe: 'Ứng viên đã xác nhận lịch phỏng vấn',
        noiDung: `${params.tenUngVien} đã xác nhận tham gia phỏng vấn ${params.viTriUngTuyen} vào ${new Date(params.thoiGian).toLocaleString('vi-VN')}`,
        lienKet: `/nha-tuyen-dung/lich-phong-van/${params.maLichPhongVan}`,
        mucDoUuTien: 'trung_binh',
        icon: '✅',
        mauSac: '#10b981',
        maLichPhongVan: params.maLichPhongVan,
    });
}
/**
 * Thông báo khi ứng viên từ chối/hủy lịch phỏng vấn
 */
async function thongBaoUngVienTuChoiLich(params) {
    return await (0, thongbao_dichvu_js_1.taoVaGuiThongBao)({
        maNguoiDung: params.maNhaTuyenDung,
        loai: 'lich_phong_van',
        tieuDe: 'Ứng viên đã hủy lịch phỏng vấn',
        noiDung: `${params.tenUngVien} đã hủy lịch phỏng vấn ${params.viTriUngTuyen}${params.lyDo ? `. Lý do: ${params.lyDo}` : ''}`,
        lienKet: `/nha-tuyen-dung/lich-phong-van/${params.maLichPhongVan}`,
        mucDoUuTien: 'cao',
        icon: '❌',
        mauSac: '#ef4444',
        maLichPhongVan: params.maLichPhongVan,
    });
}
// ============================================
// THÔNG BÁO CHO ADMIN
// ============================================
/**
 * Thông báo khi có công ty mới đăng ký (cần duyệt)
 */
async function thongBaoCongTyMoiDangKy(params) {
    return await (0, thongbao_dichvu_js_1.taoVaGuiThongBao)({
        maNguoiDung: params.maAdmin,
        loai: 'cong_ty',
        tieuDe: 'Công ty mới đăng ký',
        noiDung: `${params.tenCongTy} (${params.email}) vừa đăng ký tài khoản nhà tuyển dụng và cần được duyệt`,
        lienKet: `/admin/nha-tuyen-dung/${params.maNhaTuyenDung}`,
        mucDoUuTien: 'cao',
        icon: '🏢',
        mauSac: '#8b5cf6',
        hanhDong: [
            { nhan: 'Xem chi tiết', url: `/admin/nha-tuyen-dung/${params.maNhaTuyenDung}`, loai: 'primary' },
            { nhan: 'Phê duyệt', url: `/admin/nha-tuyen-dung/${params.maNhaTuyenDung}/phe-duyet`, loai: 'secondary' },
        ],
    });
}
/**
 * Thông báo hệ thống chung
 */
async function thongBaoHeThong(params) {
    return await (0, thongbao_dichvu_js_1.taoVaGuiThongBao)({
        maNguoiDung: params.maNguoiDung,
        loai: 'he_thong',
        tieuDe: params.tieuDe,
        noiDung: params.noiDung,
        lienKet: params.lienKet,
        mucDoUuTien: params.mucDoUuTien || 'trung_binh',
        icon: 'ℹ️',
        mauSac: '#3b82f6',
    });
}
