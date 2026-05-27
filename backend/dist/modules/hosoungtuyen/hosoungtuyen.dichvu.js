"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dichVuHoSoUngTuyen = void 0;
const loiungdung_js_1 = require("../../dungchung/loiungdung.js");
require("../hosonangluc/hosonangluc.mohinh.js");
require("../nhatuyendung/nhatuyendung.mohinh.js");
require("../nguoidung/nguoidung.mohinh.js");
require("../tintuyendung/tintuyendung.mohinh.js");
require("../ungvien/ungvien.mohinh.js");
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
                hocVan: duLieu.maHoSoNangLuc.hocVan,
                kinhNghiemLam: duLieu.maHoSoNangLuc.kinhNghiemLam,
                chungChi: duLieu.maHoSoNangLuc.chungChi,
                duAn: duLieu.maHoSoNangLuc.duAn,
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
            return this.layTheoMa(String(ketQua._id));
        }
        catch (loi) {
            if (loi?.code === 11000)
                throw new loiungdung_js_1.LoiUngDung('Ban da ung tuyen tin nay', 409);
            throw loi;
        }
    },
    async capNhat(ma, duLieu) {
        const ketQua = await hosoungtuyen_mohinh_js_1.HoSoUngTuyen
            .findByIdAndUpdate(ma, duLieu, { returnDocument: 'after', runValidators: true })
            .populate({ path: 'maTinTuyenDung', populate: { path: 'maNhaTuyenDung', select: 'tenCongTy logo' } })
            .populate({ path: 'maUngVien', populate: { path: 'maNguoiDung', select: 'hoTen email soDienThoai' } })
            .populate('maHoSoNangLuc');
        if (!ketQua)
            throw new loiungdung_js_1.LoiUngDung('Khong tim thay ho so ung tuyen de cap nhat', 404);
        return chuanHoaUngTuyen(ketQua);
    },
    async xoa(ma) {
        const ketQua = await hosoungtuyen_mohinh_js_1.HoSoUngTuyen.findByIdAndDelete(ma);
        if (!ketQua)
            throw new loiungdung_js_1.LoiUngDung('Khong tim thay ho so ung tuyen de xoa', 404);
        return chuanHoaUngTuyen(ketQua);
    },
};
