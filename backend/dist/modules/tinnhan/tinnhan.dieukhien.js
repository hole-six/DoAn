"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dieuKhienTinNhan = void 0;
const batloibatdongbo_js_1 = require("../../dungchung/batloibatdongbo.js");
const loiungdung_js_1 = require("../../dungchung/loiungdung.js");
const tinnhan_dichvu_js_1 = require("./tinnhan.dichvu.js");
exports.dieuKhienTinNhan = {
    // ============================================
    // CONVERSATION CONTROLLERS
    // ============================================
    layDanhSachCuocTroChuyenModel: (0, batloibatdongbo_js_1.batLoiBatDongBo)(async (yeuCau, phanHoi) => {
        const maNguoiDung = yeuCau.nguoiDung._id;
        const danhSach = await (0, tinnhan_dichvu_js_1.layDanhSachCuocTroChuyenModel)(maNguoiDung);
        phanHoi.json({ thongBao: 'Lay danh sach cuoc tro chuyen thanh cong', duLieu: danhSach });
    }),
    layHoacTaoCuocTroChuyenModel: (0, batloibatdongbo_js_1.batLoiBatDongBo)(async (yeuCau, phanHoi) => {
        const maNguoiDung = yeuCau.nguoiDung._id;
        const { nguoiNhan, maHoSoUngTuyen, maTinTuyenDung, loai } = yeuCau.body;
        if (!nguoiNhan)
            throw new loiungdung_js_1.LoiUngDung('Thieu nguoi nhan tin nhan', 422, 'MISSING_RECEIVER');
        const cuocTroChuyenModel = await (0, tinnhan_dichvu_js_1.layHoacTaoCuocTroChuyenModel)({
            nguoiThamGia: [maNguoiDung, nguoiNhan],
            loai,
            maHoSoUngTuyen,
            maTinTuyenDung,
        });
        phanHoi.json({ thongBao: 'Lay cuoc tro chuyen thanh cong', duLieu: cuocTroChuyenModel });
    }),
    layCuocTroChuyenModel: (0, batloibatdongbo_js_1.batLoiBatDongBo)(async (yeuCau, phanHoi) => {
        const maNguoiDung = yeuCau.nguoiDung._id;
        const { id } = yeuCau.params;
        const cuocTroChuyenModel = await (0, tinnhan_dichvu_js_1.layCuocTroChuyenModelTheoMa)(String(id), maNguoiDung);
        phanHoi.json({ thongBao: 'Lay cuoc tro chuyen thanh cong', duLieu: cuocTroChuyenModel });
    }),
    danhDauDaDoc: (0, batloibatdongbo_js_1.batLoiBatDongBo)(async (yeuCau, phanHoi) => {
        const maNguoiDung = yeuCau.nguoiDung._id;
        const { id } = yeuCau.params;
        await (0, tinnhan_dichvu_js_1.danhDauDaDocCuocTroChuyenModel)(String(id), maNguoiDung);
        phanHoi.json({ thongBao: 'Danh dau da doc thanh cong' });
    }),
    // ============================================
    // GROUP COMMUNITY CONTROLLERS
    // ============================================
    layNhomCongDong: (0, batloibatdongbo_js_1.batLoiBatDongBo)(async (_yeuCau, phanHoi) => {
        const danhSach = await (0, tinnhan_dichvu_js_1.layDanhSachNhomCongDong)();
        phanHoi.json({ thongBao: 'Lay danh sach nhom cong dong thanh cong', duLieu: danhSach });
    }),
    thamGiaNhomCongDong: (0, batloibatdongbo_js_1.batLoiBatDongBo)(async (yeuCau, phanHoi) => {
        const maNguoiDung = yeuCau.nguoiDung._id;
        const { id } = yeuCau.params;
        const nhom = await (0, tinnhan_dichvu_js_1.thamGiaNhomCongDong)(String(id), maNguoiDung);
        phanHoi.json({ thongBao: 'Tham gia nhom thanh cong', duLieu: nhom });
    }),
    // ============================================
    // MESSAGE CONTROLLERS
    // ============================================
    layDanhSachTinNhan: (0, batloibatdongbo_js_1.batLoiBatDongBo)(async (yeuCau, phanHoi) => {
        const maNguoiDung = yeuCau.nguoiDung._id;
        const { id } = yeuCau.params;
        const { limit, truocTinNhan } = yeuCau.query;
        const danhSach = await (0, tinnhan_dichvu_js_1.layDanhSachTinNhan)({
            maCuocTroChuyenId: String(id),
            maNguoiDung,
            limit: limit ? Number(limit) : undefined,
            truocTinNhan: truocTinNhan,
        });
        phanHoi.json({ thongBao: 'Lay danh sach tin nhan thanh cong', duLieu: danhSach });
    }),
    guiTinNhan: (0, batloibatdongbo_js_1.batLoiBatDongBo)(async (yeuCau, phanHoi) => {
        const maNguoiDung = yeuCau.nguoiDung._id;
        const { id } = yeuCau.params;
        const { noiDung, loai, tepDinhKem, traloiTinNhan } = yeuCau.body;
        const tinNhan = await (0, tinnhan_dichvu_js_1.guiTinNhan)({
            maCuocTroChuyenId: String(id),
            nguoiGui: maNguoiDung,
            noiDung,
            loai,
            tepDinhKem,
            traloiTinNhan,
        });
        phanHoi.json({ thongBao: 'Gui tin nhan thanh cong', duLieu: tinNhan });
    }),
    xoaTinNhan: (0, batloibatdongbo_js_1.batLoiBatDongBo)(async (yeuCau, phanHoi) => {
        const maNguoiDung = yeuCau.nguoiDung._id;
        const { maTinNhan } = yeuCau.params;
        await (0, tinnhan_dichvu_js_1.xoaTinNhan)(String(maTinNhan), maNguoiDung);
        phanHoi.json({ thongBao: 'Xoa tin nhan thanh cong' });
    }),
    themPhanUng: (0, batloibatdongbo_js_1.batLoiBatDongBo)(async (yeuCau, phanHoi) => {
        const maNguoiDung = yeuCau.nguoiDung._id;
        const { maTinNhan } = yeuCau.params;
        const { emoji } = yeuCau.body;
        await (0, tinnhan_dichvu_js_1.themPhanUng)({ maTinNhan: String(maTinNhan), maNguoiDung, emoji });
        phanHoi.json({ thongBao: 'Them phan ung thanh cong' });
    }),
};
