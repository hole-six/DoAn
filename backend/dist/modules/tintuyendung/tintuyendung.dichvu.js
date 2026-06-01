"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dichVuTinTuyenDung = void 0;
const loiungdung_js_1 = require("../../dungchung/loiungdung.js");
require("../nhatuyendung/nhatuyendung.mohinh.js");
const tintuyendung_mohinh_js_1 = require("./tintuyendung.mohinh.js");
function chuanHoaTin(taiLieu) {
    const duLieu = typeof taiLieu.toObject === 'function' ? taiLieu.toObject() : taiLieu;
    return {
        id: String(duLieu._id),
        maNhaTuyenDung: duLieu.maNhaTuyenDung?._id ? String(duLieu.maNhaTuyenDung._id) : String(duLieu.maNhaTuyenDung),
        nhaTuyenDung: duLieu.maNhaTuyenDung?._id
            ? {
                id: String(duLieu.maNhaTuyenDung._id),
                tenCongTy: duLieu.maNhaTuyenDung.tenCongTy,
                logo: duLieu.maNhaTuyenDung.logo,
                trangThaiDuyet: duLieu.maNhaTuyenDung.trangThaiDuyet,
            }
            : undefined,
        tieuDe: duLieu.tieuDe,
        yeuCauKinhNghiem: duLieu.yeuCauKinhNghiem,
        diaChi: duLieu.diaChi,
        luongMin: duLieu.luongMin,
        luongMax: duLieu.luongMax,
        loaiHinh: duLieu.loaiHinh,
        capBac: duLieu.capBac,
        anhDaiDien: duLieu.anhDaiDien,
        hanNop: duLieu.hanNop,
        soLuong: duLieu.soLuong,
        moTa: duLieu.moTa,
        yeuCau: duLieu.yeuCau,
        quyenLoi: duLieu.quyenLoi,
        luotXem: duLieu.luotXem,
        trangThai: duLieu.trangThai,
        ngayDang: duLieu.ngayDang,
        kyNang: (duLieu.kyNang ?? []).map((muc) => ({
            maKyNang: muc.maKyNang?._id ? String(muc.maKyNang._id) : String(muc.maKyNang),
            tenKyNang: muc.maKyNang?.tenKyNang,
            loaiKyNang: muc.maKyNang?.loaiKyNang,
            batBuoc: muc.batBuoc,
        })),
        ngayTao: duLieu.ngayTao,
        ngayCapNhat: duLieu.ngayCapNhat,
    };
}
exports.dichVuTinTuyenDung = {
    async layDanhSach() {
        const danhSach = await tintuyendung_mohinh_js_1.TinTuyenDung
            .find()
            .populate('maNhaTuyenDung', 'tenCongTy logo trangThaiDuyet')
            .populate('kyNang.maKyNang', 'tenKyNang loaiKyNang')
            .sort({ ngayTao: -1 })
            .limit(300);
        return danhSach.map(chuanHoaTin);
    },
    async layTheoMa(ma) {
        const duLieu = await tintuyendung_mohinh_js_1.TinTuyenDung
            .findById(ma)
            .populate('maNhaTuyenDung', 'tenCongTy logo trangThaiDuyet')
            .populate('kyNang.maKyNang', 'tenKyNang loaiKyNang');
        if (!duLieu)
            throw new loiungdung_js_1.LoiUngDung('Khong tim thay tin tuyen dung', 404);
        return chuanHoaTin(duLieu);
    },
    async taoMoi(duLieu) {
        const ketQua = await tintuyendung_mohinh_js_1.TinTuyenDung.create(duLieu);
        return chuanHoaTin(await tintuyendung_mohinh_js_1.TinTuyenDung
            .findById(ketQua._id)
            .populate('maNhaTuyenDung', 'tenCongTy logo trangThaiDuyet')
            .populate('kyNang.maKyNang', 'tenKyNang loaiKyNang'));
    },
    async capNhat(ma, duLieuNhan) {
        const duLieu = duLieuNhan;
        const duLieuCapNhat = {
            ...duLieu,
            ...(duLieu.trangThai === 'dang_mo' ? { ngayDang: new Date() } : {}),
        };
        const ketQua = await tintuyendung_mohinh_js_1.TinTuyenDung
            .findByIdAndUpdate(ma, duLieuCapNhat, { returnDocument: 'after', runValidators: true })
            .populate('maNhaTuyenDung', 'tenCongTy logo trangThaiDuyet')
            .populate('kyNang.maKyNang', 'tenKyNang loaiKyNang');
        if (!ketQua)
            throw new loiungdung_js_1.LoiUngDung('Khong tim thay tin tuyen dung de cap nhat', 404);
        return chuanHoaTin(ketQua);
    },
    async xoa(ma) {
        const ketQua = await tintuyendung_mohinh_js_1.TinTuyenDung
            .findByIdAndDelete(ma)
            .populate('maNhaTuyenDung', 'tenCongTy logo trangThaiDuyet')
            .populate('kyNang.maKyNang', 'tenKyNang loaiKyNang');
        if (!ketQua)
            throw new loiungdung_js_1.LoiUngDung('Khong tim thay tin tuyen dung de xoa', 404);
        return chuanHoaTin(ketQua);
    },
};
