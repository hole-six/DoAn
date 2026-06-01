"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dieuKhienThongBao = void 0;
const batloibatdongbo_js_1 = require("../../dungchung/batloibatdongbo.js");
const loiungdung_js_1 = require("../../dungchung/loiungdung.js");
const thongbao_dichvu_js_1 = require("./thongbao.dichvu.js");
const thongbao_kiemtra_js_1 = require("./thongbao.kiemtra.js");
const thongbao_mohinh_js_1 = require("./thongbao.mohinh.js");
function maNguoiDungTuRequest(yeuCau) {
    const ma = String(yeuCau?.nguoiDung?._id ?? yeuCau?.user?.id ?? '');
    if (!ma)
        throw new loiungdung_js_1.LoiUngDung('Ban can dang nhap de thuc hien thao tac nay', 401, 'UNAUTHORIZED');
    return ma;
}
exports.dieuKhienThongBao = {
    layDanhSach: (0, batloibatdongbo_js_1.batLoiBatDongBo)(async (yeuCau, phanHoi) => {
        const maNguoiDung = maNguoiDungTuRequest(yeuCau);
        const limitRaw = Number(yeuCau.query.limit ?? 30);
        const limit = Number.isFinite(limitRaw) ? Math.max(1, Math.min(limitRaw, 200)) : 30;
        const boLoc = { maNguoiDung };
        if (yeuCau.query.loai)
            boLoc.loai = String(yeuCau.query.loai);
        const duLieu = await thongbao_mohinh_js_1.ThongBao
            .find(boLoc)
            .sort({ ngayTao: -1 })
            .limit(limit);
        phanHoi.json({ duLieu });
    }),
    layChiTiet: (0, batloibatdongbo_js_1.batLoiBatDongBo)(async (yeuCau, phanHoi) => {
        const maNguoiDung = maNguoiDungTuRequest(yeuCau);
        const ma = String(yeuCau.params.ma ?? '');
        const duLieu = await thongbao_mohinh_js_1.ThongBao.findOne({ _id: ma, maNguoiDung });
        if (!duLieu)
            throw new loiungdung_js_1.LoiUngDung('Khong tim thay thong bao', 404, 'NOT_FOUND');
        phanHoi.json({ duLieu });
    }),
    taoMoi: (0, batloibatdongbo_js_1.batLoiBatDongBo)(async (yeuCau, phanHoi) => {
        const payload = thongbao_kiemtra_js_1.kiemTraTaoThongBao.parse(yeuCau.body);
        const nguoiDung = yeuCau.nguoiDung;
        const coQuyenTaoThongBaoKhac = nguoiDung?.vaiTro === 'admin';
        const maNguoiDung = coQuyenTaoThongBaoKhac ? payload.maNguoiDung : maNguoiDungTuRequest(yeuCau);
        const duLieu = await (0, thongbao_dichvu_js_1.taoVaGuiThongBao)({
            ...payload,
            maNguoiDung,
            loai: payload.loai ?? 'he_thong',
        });
        phanHoi.status(201).json({ duLieu });
    }),
    capNhat: (0, batloibatdongbo_js_1.batLoiBatDongBo)(async (yeuCau, phanHoi) => {
        const maNguoiDung = maNguoiDungTuRequest(yeuCau);
        const payload = thongbao_kiemtra_js_1.kiemTraCapNhatThongBao.parse(yeuCau.body);
        const ma = String(yeuCau.params.ma ?? '');
        const duLieu = await thongbao_mohinh_js_1.ThongBao.findOneAndUpdate({ _id: ma, maNguoiDung }, payload, { new: true, runValidators: true });
        if (!duLieu)
            throw new loiungdung_js_1.LoiUngDung('Khong tim thay thong bao de cap nhat', 404, 'NOT_FOUND');
        phanHoi.json({ duLieu });
    }),
    xoa: (0, batloibatdongbo_js_1.batLoiBatDongBo)(async (yeuCau, phanHoi) => {
        const maNguoiDung = maNguoiDungTuRequest(yeuCau);
        const ma = String(yeuCau.params.ma ?? '');
        const duLieu = await thongbao_mohinh_js_1.ThongBao.findOneAndDelete({ _id: ma, maNguoiDung });
        if (!duLieu)
            throw new loiungdung_js_1.LoiUngDung('Khong tim thay thong bao de xoa', 404, 'NOT_FOUND');
        phanHoi.status(204).send();
    }),
    danhDauDaDoc: (0, batloibatdongbo_js_1.batLoiBatDongBo)(async (yeuCau, phanHoi) => {
        const { id } = yeuCau.params;
        const maNguoiDung = maNguoiDungTuRequest(yeuCau);
        const thongBao = await (0, thongbao_dichvu_js_1.danhDauDaDoc)(String(id), maNguoiDung);
        if (!thongBao)
            throw new loiungdung_js_1.LoiUngDung('Khong tim thay thong bao', 404, 'NOT_FOUND');
        phanHoi.json({
            thongBao: 'Danh dau da doc thanh cong',
            duLieu: thongBao,
        });
    }),
    danhDauTatCaDaDoc: (0, batloibatdongbo_js_1.batLoiBatDongBo)(async (yeuCau, phanHoi) => {
        const maNguoiDung = maNguoiDungTuRequest(yeuCau);
        await (0, thongbao_dichvu_js_1.danhDauTatCaDaDoc)(maNguoiDung);
        phanHoi.json({
            thongBao: 'Danh dau tat ca da doc thanh cong',
        });
    }),
    demChuaDoc: (0, batloibatdongbo_js_1.batLoiBatDongBo)(async (yeuCau, phanHoi) => {
        const maNguoiDung = maNguoiDungTuRequest(yeuCau);
        const soLuong = await (0, thongbao_dichvu_js_1.demThongBaoChuaDoc)(maNguoiDung);
        phanHoi.json({
            duLieu: { soLuong },
        });
    }),
};
