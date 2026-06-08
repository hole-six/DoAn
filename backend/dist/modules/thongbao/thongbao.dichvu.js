"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dichVuThongBao = void 0;
exports.taoVaGuiThongBao = taoVaGuiThongBao;
exports.danhDauDaDoc = danhDauDaDoc;
exports.danhDauTatCaDaDoc = danhDauTatCaDaDoc;
exports.demThongBaoChuaDoc = demThongBaoChuaDoc;
exports.xoaThongBaoCu = xoaThongBaoCu;
const socket_js_1 = require("../../cauhinh/socket.js");
const dichvucoban_js_1 = require("../../dungchung/dichvucoban.js");
const prismaHelper_js_1 = require("../../dungchung/prismaHelper.js");
const thongbao_mohinh_js_1 = require("./thongbao.mohinh.js");
exports.dichVuThongBao = (0, dichvucoban_js_1.taoDichVuCoBan)(thongbao_mohinh_js_1.ThongBao);
async function taoVaGuiThongBao(duLieu) {
    const thongBao = (0, prismaHelper_js_1.coId)(await thongbao_mohinh_js_1.ThongBao.create({ data: duLieu }));
    (0, socket_js_1.guiThongBaoChoNguoiDung)(duLieu.maNguoiDung, 'thong_bao_moi', {
        _id: thongBao._id,
        id: thongBao.id,
        loai: thongBao.loai,
        tieuDe: thongBao.tieuDe,
        noiDung: thongBao.noiDung,
        lienKet: thongBao.lienKet,
        maHoSoUngTuyen: thongBao.maHoSoUngTuyen,
        maLichPhongVan: thongBao.maLichPhongVan,
        maTinTuyenDung: thongBao.maTinTuyenDung,
        mucDoUuTien: thongBao.mucDoUuTien,
        icon: thongBao.icon,
        mauSac: thongBao.mauSac,
        hanhDong: thongBao.hanhDong,
        ngayTao: thongBao.ngayTao,
    });
    return thongBao;
}
async function danhDauDaDoc(maThongBao, maNguoiDung) {
    const thongBao = await thongbao_mohinh_js_1.ThongBao.findFirst({ where: { id: maThongBao, maNguoiDung } });
    if (!thongBao)
        return null;
    return (0, prismaHelper_js_1.coId)(await thongbao_mohinh_js_1.ThongBao.update({ where: { id: maThongBao }, data: { daDoc: true } }));
}
async function danhDauTatCaDaDoc(maNguoiDung) {
    await thongbao_mohinh_js_1.ThongBao.updateMany({ where: { maNguoiDung, daDoc: false }, data: { daDoc: true } });
}
async function demThongBaoChuaDoc(maNguoiDung) {
    return thongbao_mohinh_js_1.ThongBao.count({ where: { maNguoiDung, daDoc: false } });
}
async function xoaThongBaoCu() {
    const ngayCu = new Date();
    ngayCu.setDate(ngayCu.getDate() - 30);
    const ketQua = await thongbao_mohinh_js_1.ThongBao.deleteMany({ where: { ngayTao: { lt: ngayCu }, daDoc: true } });
    return ketQua.count;
}
