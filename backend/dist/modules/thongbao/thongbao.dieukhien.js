"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dieuKhienThongBao = void 0;
const batloibatdongbo_js_1 = require("../../dungchung/batloibatdongbo.js");
const loiungdung_js_1 = require("../../dungchung/loiungdung.js");
const prismaHelper_js_1 = require("../../dungchung/prismaHelper.js");
const thongbao_dichvu_js_1 = require("./thongbao.dichvu.js");
const thongbao_kiemtra_js_1 = require("./thongbao.kiemtra.js");
const thongbao_mohinh_js_1 = require("./thongbao.mohinh.js");
function maNguoiDungTuRequest(yeuCau) {
    const ma = String(yeuCau?.nguoiDung?._id ?? yeuCau?.user?.id ?? '');
    if (!ma)
        throw new loiungdung_js_1.LoiUngDung('Bạn cần đăng nhập để thực hiện thao tác này', 401, 'UNAUTHORIZED');
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
        const duLieu = (await thongbao_mohinh_js_1.ThongBao.findMany({ where: boLoc, orderBy: { ngayTao: 'desc' }, take: limit })).map(item => (0, prismaHelper_js_1.coId)(item));
        phanHoi.json({ duLieu });
    }),
    layChiTiet: (0, batloibatdongbo_js_1.batLoiBatDongBo)(async (yeuCau, phanHoi) => {
        const maNguoiDung = maNguoiDungTuRequest(yeuCau);
        const ma = String(yeuCau.params.ma ?? '');
        const duLieu = (0, prismaHelper_js_1.coId)(await thongbao_mohinh_js_1.ThongBao.findFirst({ where: { id: ma, maNguoiDung } }));
        if (!duLieu)
            throw new loiungdung_js_1.LoiUngDung('Không tìm thấy thông báo', 404, 'NOT_FOUND');
        phanHoi.json({ duLieu });
    }),
    taoMoi: (0, batloibatdongbo_js_1.batLoiBatDongBo)(async (yeuCau, phanHoi) => {
        const payload = thongbao_kiemtra_js_1.kiemTraTaoThongBao.parse(yeuCau.body);
        const nguoiDung = yeuCau.nguoiDung;
        const coQuyenTaoThongBaoKhac = nguoiDung?.vaiTro === 'admin';
        const maNguoiDung = coQuyenTaoThongBaoKhac ? payload.maNguoiDung : maNguoiDungTuRequest(yeuCau);
        const duLieu = await (0, thongbao_dichvu_js_1.taoVaGuiThongBao)({ ...payload, maNguoiDung, loai: payload.loai ?? 'he_thong' });
        phanHoi.status(201).json({ duLieu });
    }),
    capNhat: (0, batloibatdongbo_js_1.batLoiBatDongBo)(async (yeuCau, phanHoi) => {
        const maNguoiDung = maNguoiDungTuRequest(yeuCau);
        const payload = thongbao_kiemtra_js_1.kiemTraCapNhatThongBao.parse(yeuCau.body);
        const ma = String(yeuCau.params.ma ?? '');
        const hienTai = await thongbao_mohinh_js_1.ThongBao.findFirst({ where: { id: ma, maNguoiDung }, select: { id: true } });
        const duLieu = hienTai ? (0, prismaHelper_js_1.coId)(await thongbao_mohinh_js_1.ThongBao.update({ where: { id: ma }, data: payload })) : null;
        if (!duLieu)
            throw new loiungdung_js_1.LoiUngDung('Không tìm thấy thông báo de cap nhat', 404, 'NOT_FOUND');
        phanHoi.json({ duLieu });
    }),
    xoa: (0, batloibatdongbo_js_1.batLoiBatDongBo)(async (yeuCau, phanHoi) => {
        const maNguoiDung = maNguoiDungTuRequest(yeuCau);
        const ma = String(yeuCau.params.ma ?? '');
        const duLieu = await thongbao_mohinh_js_1.ThongBao.findFirst({ where: { id: ma, maNguoiDung } });
        if (!duLieu)
            throw new loiungdung_js_1.LoiUngDung('Không tìm thấy thông báo de xoa', 404, 'NOT_FOUND');
        await thongbao_mohinh_js_1.ThongBao.delete({ where: { id: ma } });
        phanHoi.status(204).send();
    }),
    danhDauDaDoc: (0, batloibatdongbo_js_1.batLoiBatDongBo)(async (yeuCau, phanHoi) => {
        const { id } = yeuCau.params;
        const maNguoiDung = maNguoiDungTuRequest(yeuCau);
        const thongBao = await (0, thongbao_dichvu_js_1.danhDauDaDoc)(String(id), maNguoiDung);
        if (!thongBao)
            throw new loiungdung_js_1.LoiUngDung('Không tìm thấy thông báo', 404, 'NOT_FOUND');
        phanHoi.json({ thongBao: 'Danh dau da doc thanh cong', duLieu: thongBao });
    }),
    danhDauTatCaDaDoc: (0, batloibatdongbo_js_1.batLoiBatDongBo)(async (yeuCau, phanHoi) => {
        const maNguoiDung = maNguoiDungTuRequest(yeuCau);
        await (0, thongbao_dichvu_js_1.danhDauTatCaDaDoc)(maNguoiDung);
        phanHoi.json({ thongBao: 'Danh dau tat ca da doc thanh cong' });
    }),
    demChuaDoc: (0, batloibatdongbo_js_1.batLoiBatDongBo)(async (yeuCau, phanHoi) => {
        const maNguoiDung = maNguoiDungTuRequest(yeuCau);
        const soLuong = await (0, thongbao_dichvu_js_1.demThongBaoChuaDoc)(maNguoiDung);
        phanHoi.json({ duLieu: { soLuong } });
    }),
};
