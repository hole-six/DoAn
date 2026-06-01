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
const thongbao_mohinh_js_1 = require("./thongbao.mohinh.js");
exports.dichVuThongBao = (0, dichvucoban_js_1.taoDichVuCoBan)(thongbao_mohinh_js_1.ThongBao);
// Tao va gui thong bao real-time
async function taoVaGuiThongBao(duLieu) {
    const thongBao = await thongbao_mohinh_js_1.ThongBao.create(duLieu);
    (0, socket_js_1.guiThongBaoChoNguoiDung)(duLieu.maNguoiDung, 'thong_bao_moi', {
        _id: thongBao._id,
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
// Danh dau da doc
async function danhDauDaDoc(maThongBao, maNguoiDung) {
    const thongBao = await thongbao_mohinh_js_1.ThongBao.findOneAndUpdate({ _id: maThongBao, maNguoiDung }, { daDoc: true }, { new: true });
    return thongBao;
}
// Danh dau tat ca da doc
async function danhDauTatCaDaDoc(maNguoiDung) {
    await thongbao_mohinh_js_1.ThongBao.updateMany({ maNguoiDung, daDoc: false }, { daDoc: true });
}
// Lay so thong bao chua doc
async function demThongBaoChuaDoc(maNguoiDung) {
    return await thongbao_mohinh_js_1.ThongBao.countDocuments({ maNguoiDung, daDoc: false });
}
// Xoa thong bao cu (> 30 ngay)
async function xoaThongBaoCu() {
    const ngayCu = new Date();
    ngayCu.setDate(ngayCu.getDate() - 30);
    const ketQua = await thongbao_mohinh_js_1.ThongBao.deleteMany({
        ngayTao: { $lt: ngayCu },
        daDoc: true,
    });
    return ketQua.deletedCount;
}
