"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.thongBaoHoSoDuocXem = thongBaoHoSoDuocXem;
exports.thongBaoMoiPhongVan = thongBaoMoiPhongVan;
exports.thongBaoUngVienYeuCauDoiLich = thongBaoUngVienYeuCauDoiLich;
exports.thongBaoAdminUngVienYeuCauDoiLich = thongBaoAdminUngVienYeuCauDoiLich;
exports.thongBaoLichPhongVanThayDoi = thongBaoLichPhongVanThayDoi;
exports.thongBaoKetQuaPhongVan = thongBaoKetQuaPhongVan;
exports.thongBaoTinTuyenDungPhuHop = thongBaoTinTuyenDungPhuHop;
exports.thongBaoHoSoMoiUngTuyen = thongBaoHoSoMoiUngTuyen;
exports.thongBaoUngVienChapNhanLich = thongBaoUngVienChapNhanLich;
exports.thongBaoUngVienTuChoiLich = thongBaoUngVienTuChoiLich;
exports.thongBaoCongTyMoiDangKy = thongBaoCongTyMoiDangKy;
exports.thongBaoAdminCongTyCanDuyet = thongBaoAdminCongTyCanDuyet;
exports.thongBaoAdminTinTuyenDungCanDuyet = thongBaoAdminTinTuyenDungCanDuyet;
exports.thongBaoNhaTuyenDungKetQuaDuyetCongTy = thongBaoNhaTuyenDungKetQuaDuyetCongTy;
exports.thongBaoNhaTuyenDungKetQuaDuyetTin = thongBaoNhaTuyenDungKetQuaDuyetTin;
exports.thongBaoHeThong = thongBaoHeThong;
const thongbao_dichvu_js_1 = require("./thongbao.dichvu.js");
async function thongBaoHoSoDuocXem(params) {
    return (0, thongbao_dichvu_js_1.taoVaGuiThongBao)({
        maNguoiDung: params.maUngVien,
        loai: 'ho_so_ung_tuyen',
        tieuDe: 'Hồ sơ của bạn đã được xem',
        noiDung: `${params.tenCongTy} đã xem hồ sơ ứng tuyển vị trí ${params.viTriUngTuyen} của bạn.`,
        lienKet: `/ung-vien/ung-tuyen?hoSo=${params.maHoSoUngTuyen}`,
        mucDoUuTien: 'trung_binh',
        icon: 'eye',
        mauSac: '#3b82f6',
        maHoSoUngTuyen: params.maHoSoUngTuyen,
    });
}
async function thongBaoMoiPhongVan(params) {
    const diaDiem = params.hinhThuc === 'online'
        ? (params.linkHop ? `link họp ${params.linkHop}` : 'hình thức online')
        : (params.diaChi || 'địa điểm sẽ được cập nhật sau');
    return (0, thongbao_dichvu_js_1.taoVaGuiThongBao)({
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
    });
}
async function thongBaoUngVienYeuCauDoiLich(params) {
    return (0, thongbao_dichvu_js_1.taoVaGuiThongBao)({
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
            ...(params.maHoSoUngTuyen ? [{ nhan: 'Xem hồ sơ', url: `/nha-tuyen-dung/ung-vien?hoSo=${params.maHoSoUngTuyen}`, loai: 'secondary' }] : []),
        ],
    });
}
async function thongBaoAdminUngVienYeuCauDoiLich(params) {
    return (0, thongbao_dichvu_js_1.taoVaGuiThongBao)({
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
    });
}
async function thongBaoLichPhongVanThayDoi(params) {
    return (0, thongbao_dichvu_js_1.taoVaGuiThongBao)({
        maNguoiDung: params.maUngVien,
        loai: 'lich_phong_van',
        tieuDe: 'Lịch phỏng vấn đã thay đổi',
        noiDung: `${params.tenCongTy} đã thay đổi lịch phỏng vấn ${params.viTriUngTuyen} sang ${new Date(params.thoiGianMoi).toLocaleString('vi-VN')}${params.lyDo ? `. Lý do: ${params.lyDo}` : ''}.`,
        lienKet: `/ung-vien/lich-phong-van?lich=${params.maLichPhongVan}`,
        mucDoUuTien: 'cao',
        icon: 'warning',
        mauSac: '#f59e0b',
        maLichPhongVan: params.maLichPhongVan,
    });
}
async function thongBaoKetQuaPhongVan(params) {
    const tieuDe = params.ketQua === 'dat'
        ? 'Chúc mừng! Bạn đã vượt qua phỏng vấn'
        : params.ketQua === 'khong_dat'
            ? 'Kết quả phỏng vấn'
            : 'Cập nhật kết quả phỏng vấn';
    const noiDung = params.ketQua === 'dat'
        ? `Chúc mừng! Bạn đã vượt qua phỏng vấn vị trí ${params.viTriUngTuyen} tại ${params.tenCongTy}. ${params.ghiChu || 'Chúng tôi sẽ liên hệ với bạn sớm nhất.'}`
        : params.ketQua === 'khong_dat'
            ? `Cảm ơn bạn đã tham gia phỏng vấn vị trí ${params.viTriUngTuyen} tại ${params.tenCongTy}. ${params.ghiChu || 'Chúc bạn may mắn lần sau!'}`
            : `Kết quả phỏng vấn ${params.viTriUngTuyen} tại ${params.tenCongTy} đang được xem xét. ${params.ghiChu || ''}`;
    return (0, thongbao_dichvu_js_1.taoVaGuiThongBao)({
        maNguoiDung: params.maUngVien,
        loai: 'ket_qua_phong_van',
        tieuDe,
        noiDung,
        lienKet: `/ung-vien/lich-phong-van?lich=${params.maLichPhongVan}`,
        mucDoUuTien: params.ketQua === 'dat' ? 'khan_cap' : 'cao',
        icon: params.ketQua === 'dat' ? 'success' : params.ketQua === 'khong_dat' ? 'error' : 'clock',
        mauSac: params.ketQua === 'dat' ? '#10b981' : params.ketQua === 'khong_dat' ? '#ef4444' : '#f59e0b',
        maLichPhongVan: params.maLichPhongVan,
    });
}
async function thongBaoTinTuyenDungPhuHop(params) {
    return (0, thongbao_dichvu_js_1.taoVaGuiThongBao)({
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
    });
}
async function thongBaoHoSoMoiUngTuyen(params) {
    return (0, thongbao_dichvu_js_1.taoVaGuiThongBao)({
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
    });
}
async function thongBaoUngVienChapNhanLich(params) {
    return (0, thongbao_dichvu_js_1.taoVaGuiThongBao)({
        maNguoiDung: params.maNhaTuyenDung,
        loai: 'lich_phong_van',
        tieuDe: 'Ứng viên đã xác nhận lịch phỏng vấn',
        noiDung: `${params.tenUngVien} đã xác nhận tham gia phỏng vấn ${params.viTriUngTuyen} vào ${new Date(params.thoiGian).toLocaleString('vi-VN')}.`,
        lienKet: `/nha-tuyen-dung/lich-phong-van?lich=${params.maLichPhongVan}`,
        mucDoUuTien: 'trung_binh',
        icon: 'check',
        mauSac: '#10b981',
        maLichPhongVan: params.maLichPhongVan,
    });
}
async function thongBaoUngVienTuChoiLich(params) {
    return (0, thongbao_dichvu_js_1.taoVaGuiThongBao)({
        maNguoiDung: params.maNhaTuyenDung,
        loai: 'lich_phong_van',
        tieuDe: 'Ứng viên đã hủy lịch phỏng vấn',
        noiDung: `${params.tenUngVien} đã hủy lịch phỏng vấn ${params.viTriUngTuyen}${params.lyDo ? `. Lý do: ${params.lyDo}` : ''}.`,
        lienKet: `/nha-tuyen-dung/lich-phong-van?lich=${params.maLichPhongVan}`,
        mucDoUuTien: 'cao',
        icon: 'x',
        mauSac: '#ef4444',
        maLichPhongVan: params.maLichPhongVan,
    });
}
async function thongBaoCongTyMoiDangKy(params) {
    return (0, thongbao_dichvu_js_1.taoVaGuiThongBao)({
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
    });
}
async function thongBaoAdminCongTyCanDuyet(params) {
    return (0, thongbao_dichvu_js_1.taoVaGuiThongBao)({
        maNguoiDung: params.maAdmin,
        loai: 'he_thong',
        tieuDe: params.capNhatLai ? 'Cong ty cap nhat ho so can duyet lai' : 'Cong ty moi can duyet',
        noiDung: `${params.tenNguoiDangKy} ${params.capNhatLai ? 'da cap nhat lai ho so cong ty' : 'da dang ky cong ty'} ${params.tenCongTy}.`,
        lienKet: `/quan-tri/cong-ty?congTy=${params.maNhaTuyenDung}`,
        mucDoUuTien: 'cao',
        icon: 'building',
        mauSac: '#8b5cf6',
        hanhDong: [
            { nhan: 'Duyet cong ty', url: `/quan-tri/cong-ty?congTy=${params.maNhaTuyenDung}`, loai: 'primary' },
        ],
    });
}
async function thongBaoAdminTinTuyenDungCanDuyet(params) {
    return (0, thongbao_dichvu_js_1.taoVaGuiThongBao)({
        maNguoiDung: params.maAdmin,
        loai: 'tin_tuyen_dung',
        tieuDe: 'Tin tuyen dung moi can duyet',
        noiDung: `${params.tenCongTy} vua gui tin "${params.tieuDeTin}" cho duyet.`,
        lienKet: `/quan-tri/tin-tuyen-dung?tin=${params.maTinTuyenDung}`,
        mucDoUuTien: 'cao',
        icon: 'briefcase',
        mauSac: '#0ea5e9',
        maTinTuyenDung: params.maTinTuyenDung,
        hanhDong: [
            { nhan: 'Duyet tin', url: `/quan-tri/tin-tuyen-dung?tin=${params.maTinTuyenDung}`, loai: 'primary' },
        ],
    });
}
async function thongBaoNhaTuyenDungKetQuaDuyetCongTy(params) {
    const daDuyet = params.trangThaiDuyet === 'da_duyet';
    return (0, thongbao_dichvu_js_1.taoVaGuiThongBao)({
        maNguoiDung: params.maNguoiDung,
        loai: 'he_thong',
        tieuDe: daDuyet ? 'Cong ty da duoc duyet' : 'Ho so cong ty bi tu choi',
        noiDung: daDuyet
            ? `${params.tenCongTy} da duoc duyet. Ban co the dang tin tuyen dung.`
            : `${params.tenCongTy} chua duoc duyet.${params.lyDoTuChoi ? ` Ly do: ${params.lyDoTuChoi}` : ''}`,
        lienKet: '/nha-tuyen-dung/cong-ty',
        mucDoUuTien: daDuyet ? 'cao' : 'khan_cap',
        icon: daDuyet ? 'check' : 'warning',
        mauSac: daDuyet ? '#10b981' : '#ef4444',
    });
}
async function thongBaoNhaTuyenDungKetQuaDuyetTin(params) {
    const daDuyet = params.trangThai === 'dang_mo';
    return (0, thongbao_dichvu_js_1.taoVaGuiThongBao)({
        maNguoiDung: params.maNguoiDung,
        loai: 'tin_tuyen_dung',
        tieuDe: daDuyet ? 'Tin tuyen dung da duoc duyet' : 'Tin tuyen dung bi tu choi',
        noiDung: daDuyet
            ? `Tin "${params.tieuDeTin}" da duoc mo cong khai.`
            : `Tin "${params.tieuDeTin}" chua duoc duyet.`,
        lienKet: `/nha-tuyen-dung/quan-ly-tin?tin=${params.maTinTuyenDung}`,
        mucDoUuTien: daDuyet ? 'cao' : 'khan_cap',
        icon: daDuyet ? 'check' : 'warning',
        mauSac: daDuyet ? '#10b981' : '#ef4444',
        maTinTuyenDung: params.maTinTuyenDung,
    });
}
async function thongBaoHeThong(params) {
    return (0, thongbao_dichvu_js_1.taoVaGuiThongBao)({
        maNguoiDung: params.maNguoiDung,
        loai: params.loai || 'he_thong',
        tieuDe: params.tieuDe,
        noiDung: params.noiDung,
        lienKet: params.lienKet,
        mucDoUuTien: params.mucDoUuTien || 'trung_binh',
        icon: 'info',
        mauSac: '#6b7280',
    });
}
