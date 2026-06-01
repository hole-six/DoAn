"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dichVuHoSoUngTuyen = void 0;
const loiungdung_js_1 = require("../../dungchung/loiungdung.js");
require("../hosonangluc/hosonangluc.mohinh.js");
require("../nhatuyendung/nhatuyendung.mohinh.js");
require("../nguoidung/nguoidung.mohinh.js");
require("../tintuyendung/tintuyendung.mohinh.js");
require("../ungvien/ungvien.mohinh.js");
const nhatuyendung_mohinh_js_1 = require("../nhatuyendung/nhatuyendung.mohinh.js");
const thongbao_helper_js_1 = require("../thongbao/thongbao.helper.js");
const hosoungtuyen_mohinh_js_1 = require("./hosoungtuyen.mohinh.js");
function chuanHoaUngTuyen(taiLieu) {
    const duLieu = typeof taiLieu.toObject === 'function' ? taiLieu.toObject() : taiLieu;
    const tin = duLieu.maTinTuyenDung;
    return {
        id: String(duLieu._id),
        maUngVien: duLieu.maUngVien?._id ? String(duLieu.maUngVien._id) : String(duLieu.maUngVien),
        maTinTuyenDung: tin?._id ? String(tin._id) : String(tin),
        maHoSoNangLuc: duLieu.maHoSoNangLuc?._id ? String(duLieu.maHoSoNangLuc._id) : duLieu.maHoSoNangLuc ? String(duLieu.maHoSoNangLuc) : undefined,
        tinTuyenDung: tin?._id
            ? {
                id: String(tin._id),
                tieuDe: tin.tieuDe,
                diaChi: tin.diaChi,
                luongMin: tin.luongMin,
                luongMax: tin.luongMax,
                capBac: tin.capBac,
                loaiHinh: tin.loaiHinh,
                trangThai: tin.trangThai,
                nhaTuyenDung: tin.maNhaTuyenDung?._id
                    ? {
                        id: String(tin.maNhaTuyenDung._id),
                        tenCongTy: tin.maNhaTuyenDung.tenCongTy,
                        logo: tin.maNhaTuyenDung.logo,
                    }
                    : undefined,
            }
            : undefined,
        ungVien: duLieu.maUngVien?._id
            ? {
                id: String(duLieu.maUngVien._id),
                viTriMongMuon: duLieu.maUngVien.viTriMongMuon,
                kinhNghiem: duLieu.maUngVien.kinhNghiem,
                diaChi: duLieu.maUngVien.diaChi,
                mucLuongMongMuon: duLieu.maUngVien.mucLuongMongMuon,
                tomTat: duLieu.maUngVien.tomTat,
                portfolio: duLieu.maUngVien.portfolio ?? [],
                nguoiDung: duLieu.maUngVien.maNguoiDung?._id
                    ? {
                        id: String(duLieu.maUngVien.maNguoiDung._id),
                        hoTen: duLieu.maUngVien.maNguoiDung.hoTen,
                        email: duLieu.maUngVien.maNguoiDung.email,
                        soDienThoai: duLieu.maUngVien.maNguoiDung.soDienThoai,
                    }
                    : undefined,
            }
            : undefined,
        hoSoNangLuc: duLieu.maHoSoNangLuc?._id
            ? {
                id: String(duLieu.maHoSoNangLuc._id),
                tieuDe: duLieu.maHoSoNangLuc.tieuDe,
                cvChinh: duLieu.maHoSoNangLuc.cvChinh,
                congKhai: duLieu.maHoSoNangLuc.congKhai,
                hoTenHienThi: duLieu.maHoSoNangLuc.hoTenHienThi,
                chucDanh: duLieu.maHoSoNangLuc.chucDanh,
                soDienThoai: duLieu.maHoSoNangLuc.soDienThoai,
                emailLienHe: duLieu.maHoSoNangLuc.emailLienHe,
                facebook: duLieu.maHoSoNangLuc.facebook,
                github: duLieu.maHoSoNangLuc.github,
                portfolioUrl: duLieu.maHoSoNangLuc.portfolioUrl,
                diaDiem: duLieu.maHoSoNangLuc.diaDiem,
                tomTatKinhNghiem: duLieu.maHoSoNangLuc.tomTatKinhNghiem,
                kyNangMem: duLieu.maHoSoNangLuc.kyNangMem,
                kyNangLapTrinh: duLieu.maHoSoNangLuc.kyNangLapTrinh,
                hocVan: duLieu.maHoSoNangLuc.hocVan,
                kinhNghiemLam: duLieu.maHoSoNangLuc.kinhNghiemLam,
                chungChi: duLieu.maHoSoNangLuc.chungChi,
                duAn: duLieu.maHoSoNangLuc.duAn,
                baiVietKyThuat: duLieu.maHoSoNangLuc.baiVietKyThuat,
                duAnChiTiet: duLieu.maHoSoNangLuc.duAnChiTiet,
                fileCvTen: duLieu.maHoSoNangLuc.fileCvTen,
                fileCvLoai: duLieu.maHoSoNangLuc.fileCvLoai,
                fileCvData: duLieu.maHoSoNangLuc.fileCvData,
                anhDaiDien: duLieu.maHoSoNangLuc.anhDaiDien,
                templateCv: duLieu.maHoSoNangLuc.templateCv,
                mauChinh: duLieu.maHoSoNangLuc.mauChinh,
                mauPhu: duLieu.maHoSoNangLuc.mauPhu,
                font: duLieu.maHoSoNangLuc.font,
                ngayCapNhat: duLieu.maHoSoNangLuc.ngayCapNhat,
            }
            : undefined,
        thuXinViec: duLieu.thuXinViec,
        diemKhopKyNang: duLieu.diemKhopKyNang,
        trangThai: duLieu.trangThai,
        ngayNop: duLieu.ngayNop,
        ngayTao: duLieu.ngayTao,
        ngayCapNhat: duLieu.ngayCapNhat,
    };
}
function query() {
    return hosoungtuyen_mohinh_js_1.HoSoUngTuyen
        .find()
        .populate({ path: 'maTinTuyenDung', populate: { path: 'maNhaTuyenDung', select: 'tenCongTy logo' } })
        .populate({ path: 'maUngVien', populate: { path: 'maNguoiDung', select: 'hoTen email soDienThoai' } })
        .populate('maHoSoNangLuc');
}
exports.dichVuHoSoUngTuyen = {
    async layDanhSach() {
        const danhSach = await query().sort({ ngayNop: -1 }).limit(300);
        return danhSach.map(chuanHoaUngTuyen);
    },
    async layTheoMa(ma) {
        const duLieu = await hosoungtuyen_mohinh_js_1.HoSoUngTuyen
            .findById(ma)
            .populate({ path: 'maTinTuyenDung', populate: { path: 'maNhaTuyenDung', select: 'tenCongTy logo' } })
            .populate({ path: 'maUngVien', populate: { path: 'maNguoiDung', select: 'hoTen email soDienThoai' } })
            .populate('maHoSoNangLuc');
        if (!duLieu)
            throw new loiungdung_js_1.LoiUngDung('Khong tim thay ho so ung tuyen', 404);
        return chuanHoaUngTuyen(duLieu);
    },
    async taoMoi(duLieu) {
        try {
            const ketQua = await hosoungtuyen_mohinh_js_1.HoSoUngTuyen.create(duLieu);
            const hoSoMoi = await this.layTheoMa(String(ketQua._id));
            try {
                const maCongTy = hoSoMoi.tinTuyenDung?.nhaTuyenDung?.id;
                const congTy = maCongTy ? await nhatuyendung_mohinh_js_1.NhaTuyenDung.findById(maCongTy).select('maNguoiDung') : null;
                const maNguoiDungNhaTuyenDung = String(congTy?.maNguoiDung ?? '');
                if (maNguoiDungNhaTuyenDung) {
                    await (0, thongbao_helper_js_1.thongBaoHoSoMoiUngTuyen)({
                        maNhaTuyenDung: maNguoiDungNhaTuyenDung,
                        tenUngVien: hoSoMoi.ungVien?.nguoiDung?.hoTen ?? 'Ung vien',
                        viTriUngTuyen: hoSoMoi.tinTuyenDung?.tieuDe ?? 'Vi tri ung tuyen',
                        maHoSoUngTuyen: hoSoMoi.id,
                        kinhNghiem: `${hoSoMoi.ungVien?.kinhNghiem ?? 0} nam kinh nghiem`,
                    });
                }
            }
            catch (error) {
                console.error('Loi gui thong bao ho so moi:', error);
            }
            return hoSoMoi;
        }
        catch (loi) {
            if (loi?.code === 11000)
                throw new loiungdung_js_1.LoiUngDung('Ban da ung tuyen tin nay', 409);
            throw loi;
        }
    },
    async capNhat(ma, duLieu) {
        const truocKhiCapNhat = await hosoungtuyen_mohinh_js_1.HoSoUngTuyen
            .findById(ma)
            .populate({ path: 'maTinTuyenDung', populate: { path: 'maNhaTuyenDung', select: 'tenCongTy logo' } })
            .populate({ path: 'maUngVien', populate: { path: 'maNguoiDung', select: 'hoTen email soDienThoai' } })
            .populate('maHoSoNangLuc');
        const ketQua = await hosoungtuyen_mohinh_js_1.HoSoUngTuyen
            .findByIdAndUpdate(ma, duLieu, { returnDocument: 'after', runValidators: true })
            .populate({ path: 'maTinTuyenDung', populate: { path: 'maNhaTuyenDung', select: 'tenCongTy logo' } })
            .populate({ path: 'maUngVien', populate: { path: 'maNguoiDung', select: 'hoTen email soDienThoai' } })
            .populate('maHoSoNangLuc');
        if (!ketQua)
            throw new loiungdung_js_1.LoiUngDung('Khong tim thay ho so ung tuyen de cap nhat', 404);
        const ketQuaChuanHoa = chuanHoaUngTuyen(ketQua);
        try {
            const trangThaiCu = String(truocKhiCapNhat?.trangThai ?? '');
            const trangThaiMoi = String(ketQuaChuanHoa.trangThai ?? '');
            const maNguoiDungUngVien = ketQuaChuanHoa.ungVien?.nguoiDung?.id;
            const tenCongTy = ketQuaChuanHoa.tinTuyenDung?.nhaTuyenDung?.tenCongTy ?? 'Cong ty';
            const viTriUngTuyen = ketQuaChuanHoa.tinTuyenDung?.tieuDe ?? 'Vi tri ung tuyen';
            if (trangThaiCu !== 'da_xem' && trangThaiMoi === 'da_xem' && maNguoiDungUngVien) {
                await (0, thongbao_helper_js_1.thongBaoHoSoDuocXem)({
                    maUngVien: maNguoiDungUngVien,
                    tenCongTy,
                    viTriUngTuyen,
                    maHoSoUngTuyen: ketQuaChuanHoa.id,
                });
            }
            if (trangThaiCu !== trangThaiMoi && ['dat', 'tu_choi'].includes(trangThaiMoi) && maNguoiDungUngVien) {
                await (0, thongbao_helper_js_1.thongBaoHeThong)({
                    maNguoiDung: maNguoiDungUngVien,
                    tieuDe: trangThaiMoi === 'dat' ? 'Ho so ung tuyen da dat' : 'Ho so ung tuyen bi tu choi',
                    noiDung: `${tenCongTy} da cap nhat ket qua ho so ung tuyen vi tri ${viTriUngTuyen}: ${trangThaiMoi === 'dat' ? 'Dat' : 'Tu choi'}.`,
                    lienKet: '/ung-vien/ung-tuyen',
                    mucDoUuTien: 'cao',
                });
            }
        }
        catch (error) {
            console.error('Loi gui thong bao cap nhat ho so ung tuyen:', error);
        }
        return ketQuaChuanHoa;
    },
    async xoa(ma) {
        const ketQua = await hosoungtuyen_mohinh_js_1.HoSoUngTuyen.findByIdAndDelete(ma);
        if (!ketQua)
            throw new loiungdung_js_1.LoiUngDung('Khong tim thay ho so ung tuyen de xoa', 404);
        return chuanHoaUngTuyen(ketQua);
    },
};
