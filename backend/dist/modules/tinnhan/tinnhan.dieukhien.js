"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dieuKhienTinNhan = void 0;
const batloibatdongbo_js_1 = require("../../dungchung/batloibatdongbo.js");
const loiungdung_js_1 = require("../../dungchung/loiungdung.js");
const prisma_js_1 = require("../../cauhinh/prisma.js");
const tinnhan_dichvu_js_1 = require("./tinnhan.dichvu.js");
const TRANG_THAI_CHAT_NTD_UV = ['da_xem', 'dang_xet_duyet', 'moi_phong_van', 'dat'];
function id(value) {
    return String(value?._id ?? value?.id ?? value ?? '');
}
async function timNguoiDungAdminDauTien() {
    const admin = await prisma_js_1.prisma.nguoiDung.findFirst({ where: { vaiTro: 'admin' }, select: { id: true } });
    if (!admin)
        throw new loiungdung_js_1.LoiUngDung('Hệ thống chưa có tài khoản quản trị viên', 409, 'ADMIN_NOT_FOUND');
    return admin.id;
}
async function layHoSoChat(maHoSoUngTuyen, maTinTuyenDung) {
    const hoSo = maHoSoUngTuyen
        ? await prisma_js_1.prisma.hoSoUngTuyen.findUnique({ where: { id: maHoSoUngTuyen } })
        : await prisma_js_1.prisma.hoSoUngTuyen.findFirst({ where: { maTinTuyenDung }, orderBy: { ngayCapNhat: 'desc' } });
    if (!hoSo)
        return null;
    const [ungVien, tin] = await Promise.all([
        prisma_js_1.prisma.ungVien.findUnique({ where: { id: hoSo.maUngVien } }),
        prisma_js_1.prisma.tinTuyenDung.findUnique({ where: { id: hoSo.maTinTuyenDung } }),
    ]);
    const congTy = tin ? await prisma_js_1.prisma.nhaTuyenDung.findUnique({ where: { id: tin.maNhaTuyenDung } }) : null;
    return { ...hoSo, _id: hoSo.id, maUngVien: ungVien ? { ...ungVien, _id: ungVien.id } : hoSo.maUngVien, maTinTuyenDung: tin ? { ...tin, _id: tin.id, maNhaTuyenDung: congTy ? { ...congTy, _id: congTy.id } : tin.maNhaTuyenDung } : hoSo.maTinTuyenDung };
}
async function xacThucChatUngTuyen(nguoiDung, nguoiNhan, maHoSoUngTuyen, maTinTuyenDung) {
    const vaiTro = String(nguoiDung.vaiTro ?? '');
    const nguoiNhanDoc = await prisma_js_1.prisma.nguoiDung.findUnique({ where: { id: nguoiNhan }, select: { id: true, vaiTro: true } });
    if (!nguoiNhanDoc)
        throw new loiungdung_js_1.LoiUngDung('Không tìm thấy người nhận chat', 404, 'RECIPIENT_NOT_FOUND');
    if (vaiTro === 'nha_tuyen_dung') {
        if (String(nguoiNhanDoc.vaiTro ?? '') !== 'ung_vien')
            throw new loiungdung_js_1.LoiUngDung('Nhà tuyển dụng chỉ có thể chat với ứng viên trong pipeline', 409, 'INVALID_CHAT_TARGET');
        if (!maHoSoUngTuyen && !maTinTuyenDung)
            throw new loiungdung_js_1.LoiUngDung('Cần có thông tin hồ sơ ứng tuyển để mở chat', 422, 'CHAT_CONTEXT_REQUIRED');
        const hoSo = await layHoSoChat(maHoSoUngTuyen, maTinTuyenDung);
        if (!hoSo)
            throw new loiungdung_js_1.LoiUngDung('Không tìm thấy hồ sơ ứng tuyển', 404, 'APPLICATION_NOT_FOUND');
        if (id(hoSo.maTinTuyenDung?.maNhaTuyenDung?.maNguoiDung) !== id(nguoiDung._id))
            throw new loiungdung_js_1.LoiUngDung('Bạn không có quyền chat với ứng viên này', 403, 'FORBIDDEN');
        if (id(hoSo.maUngVien?.maNguoiDung) !== id(nguoiNhanDoc))
            throw new loiungdung_js_1.LoiUngDung('Người nhận không khớp với ứng viên của hồ sơ', 409, 'INVALID_CHAT_TARGET');
        if (!TRANG_THAI_CHAT_NTD_UV.includes(String(hoSo.trangThai ?? '')))
            throw new loiungdung_js_1.LoiUngDung('Chỉ có thể mở chat khi hồ sơ đã được xem và đang được xử lý', 409, 'CHAT_NOT_ALLOWED');
        return { loai: 'ung_vien_nha_tuyen_dung', nguoiNhan: id(nguoiNhanDoc), context: { maHoSoUngTuyen: id(hoSo), maTinTuyenDung: id(hoSo.maTinTuyenDung) } };
    }
    if (vaiTro === 'ung_vien') {
        if (String(nguoiNhanDoc.vaiTro ?? '') !== 'nha_tuyen_dung')
            throw new loiungdung_js_1.LoiUngDung('Ứng viên chỉ có thể chat với nhà tuyển dụng trong pipeline', 409, 'INVALID_CHAT_TARGET');
        if (!maHoSoUngTuyen && !maTinTuyenDung)
            throw new loiungdung_js_1.LoiUngDung('Cần có thông tin hồ sơ ứng tuyển để mở chat', 422, 'CHAT_CONTEXT_REQUIRED');
        const hoSo = await layHoSoChat(maHoSoUngTuyen, maTinTuyenDung);
        if (!hoSo)
            throw new loiungdung_js_1.LoiUngDung('Không tìm thấy hồ sơ ứng tuyển', 404, 'APPLICATION_NOT_FOUND');
        if (id(hoSo.maUngVien?.maNguoiDung) !== id(nguoiDung._id))
            throw new loiungdung_js_1.LoiUngDung('Bạn không có quyền chat với nhà tuyển dụng này', 403, 'FORBIDDEN');
        if (id(hoSo.maTinTuyenDung?.maNhaTuyenDung?.maNguoiDung) !== id(nguoiNhanDoc))
            throw new loiungdung_js_1.LoiUngDung('Người nhận không khớp với nhà tuyển dụng của hồ sơ', 409, 'INVALID_CHAT_TARGET');
        if (!TRANG_THAI_CHAT_NTD_UV.includes(String(hoSo.trangThai ?? '')))
            throw new loiungdung_js_1.LoiUngDung('Chỉ có thể chat khi hồ sơ đã được xem và đang được xử lý', 409, 'CHAT_NOT_ALLOWED');
        return { loai: 'ung_vien_nha_tuyen_dung', nguoiNhan: id(nguoiNhanDoc), context: { maHoSoUngTuyen: id(hoSo), maTinTuyenDung: id(hoSo.maTinTuyenDung) } };
    }
    if (vaiTro === 'admin') {
        if (String(nguoiNhanDoc.vaiTro ?? '') !== 'nha_tuyen_dung')
            throw new loiungdung_js_1.LoiUngDung('Admin chỉ có thể mở chat hỗ trợ với nhà tuyển dụng', 409, 'INVALID_CHAT_TARGET');
        return { loai: 'admin_support', nguoiNhan: id(nguoiNhanDoc), context: {} };
    }
    throw new loiungdung_js_1.LoiUngDung('Bạn không có quyền mở chat này', 403, 'FORBIDDEN');
}
exports.dieuKhienTinNhan = {
    layDanhSachCuocTroChuyenModel: (0, batloibatdongbo_js_1.batLoiBatDongBo)(async (yeuCau, phanHoi) => {
        const nguoiDung = yeuCau.nguoiDung;
        const maNguoiDung = nguoiDung._id;
        await (0, tinnhan_dichvu_js_1.damBaoCuocTroChuyenHoTroQuanTri)(String(maNguoiDung), String(nguoiDung.vaiTro ?? ''));
        const danhSach = await (0, tinnhan_dichvu_js_1.layDanhSachCuocTroChuyenModel)(maNguoiDung);
        phanHoi.json({ thongBao: 'Lấy danh sách cuộc trò chuyện thành công', duLieu: danhSach });
    }),
    layDanhBaHoTroQuanTri: (0, batloibatdongbo_js_1.batLoiBatDongBo)(async (yeuCau, phanHoi) => {
        const nguoiDung = yeuCau.nguoiDung;
        const maNguoiDung = nguoiDung._id;
        await (0, tinnhan_dichvu_js_1.damBaoCuocTroChuyenHoTroQuanTri)(String(maNguoiDung), String(nguoiDung.vaiTro ?? ''));
        const danhSach = await (0, tinnhan_dichvu_js_1.layDanhSachCuocTroChuyenModel)(maNguoiDung);
        phanHoi.json({ thongBao: 'Lấy danh bạ hỗ trợ quản trị thành công', duLieu: danhSach.filter((item) => item.loai === 'admin_support') });
    }),
    layHoacTaoCuocTroChuyenModel: (0, batloibatdongbo_js_1.batLoiBatDongBo)(async (yeuCau, phanHoi) => {
        const nguoiDung = yeuCau.nguoiDung;
        const maNguoiDung = id(nguoiDung);
        const { nguoiNhan: nguoiNhanRaw, maHoSoUngTuyen, maTinTuyenDung, loai } = yeuCau.body;
        const nguoiNhan = String(nguoiNhanRaw ?? '');
        if (!nguoiNhan)
            throw new loiungdung_js_1.LoiUngDung('Thieu nguoi nhan tin nhan', 422, 'MISSING_RECEIVER');
        let loaiCuocTroChuyen = loai ?? 'ung_vien_nha_tuyen_dung';
        let nguoiNhanThuc = nguoiNhan;
        let context = {};
        if (loaiCuocTroChuyen === 'admin_support' || nguoiNhan === 'admin') {
            if (!['nha_tuyen_dung', 'admin'].includes(String(nguoiDung.vaiTro ?? '')))
                throw new loiungdung_js_1.LoiUngDung('Bạn không có quyền mở chat hỗ trợ', 403, 'FORBIDDEN');
            if (String(nguoiDung.vaiTro ?? '') === 'nha_tuyen_dung')
                nguoiNhanThuc = await timNguoiDungAdminDauTien();
            else {
                const nguoiNhanDoc = await prisma_js_1.prisma.nguoiDung.findUnique({ where: { id: nguoiNhan }, select: { id: true, vaiTro: true } });
                if (!nguoiNhanDoc || String(nguoiNhanDoc.vaiTro ?? '') !== 'nha_tuyen_dung')
                    throw new loiungdung_js_1.LoiUngDung('Admin chỉ có thể mở chat hỗ trợ với nhà tuyển dụng', 409, 'INVALID_CHAT_TARGET');
                nguoiNhanThuc = id(nguoiNhanDoc);
            }
            loaiCuocTroChuyen = 'admin_support';
            context = {};
        }
        else if (loaiCuocTroChuyen === 'ung_vien_nha_tuyen_dung') {
            const ketQua = await xacThucChatUngTuyen(nguoiDung, nguoiNhanThuc, maHoSoUngTuyen, maTinTuyenDung);
            loaiCuocTroChuyen = ketQua.loai;
            nguoiNhanThuc = ketQua.nguoiNhan;
            context = ketQua.context;
        }
        const cuocTroChuyenModel = await (0, tinnhan_dichvu_js_1.layHoacTaoCuocTroChuyenModel)({
            nguoiThamGia: [maNguoiDung, nguoiNhanThuc],
            loai: loaiCuocTroChuyen,
            maHoSoUngTuyen: context.maHoSoUngTuyen ?? maHoSoUngTuyen,
            maTinTuyenDung: context.maTinTuyenDung ?? maTinTuyenDung,
        });
        phanHoi.json({ thongBao: 'Lấy cuộc trò chuyện thành công', duLieu: cuocTroChuyenModel });
    }),
    layCuocTroChuyenModel: (0, batloibatdongbo_js_1.batLoiBatDongBo)(async (yeuCau, phanHoi) => {
        const maNguoiDung = yeuCau.nguoiDung._id;
        const { id: ma } = yeuCau.params;
        const cuocTroChuyenModel = await (0, tinnhan_dichvu_js_1.layCuocTroChuyenModelTheoMa)(String(ma), maNguoiDung);
        phanHoi.json({ thongBao: 'Lay cuoc tro chuyen thanh cong', duLieu: cuocTroChuyenModel });
    }),
    danhDauDaDoc: (0, batloibatdongbo_js_1.batLoiBatDongBo)(async (yeuCau, phanHoi) => {
        const maNguoiDung = yeuCau.nguoiDung._id;
        const { id: ma } = yeuCau.params;
        await (0, tinnhan_dichvu_js_1.danhDauDaDocCuocTroChuyenModel)(String(ma), maNguoiDung);
        phanHoi.json({ thongBao: 'Danh dau da doc thanh cong' });
    }),
    layNhomCongDong: (0, batloibatdongbo_js_1.batLoiBatDongBo)(async (_yeuCau, phanHoi) => {
        const danhSach = await (0, tinnhan_dichvu_js_1.layDanhSachNhomCongDong)();
        phanHoi.json({ thongBao: 'Lay danh sach nhom cong dong thanh cong', duLieu: danhSach });
    }),
    thamGiaNhomCongDong: (0, batloibatdongbo_js_1.batLoiBatDongBo)(async (yeuCau, phanHoi) => {
        const maNguoiDung = yeuCau.nguoiDung._id;
        const { id: ma } = yeuCau.params;
        const nhom = await (0, tinnhan_dichvu_js_1.thamGiaNhomCongDong)(String(ma), maNguoiDung);
        phanHoi.json({ thongBao: 'Tham gia nhom thanh cong', duLieu: nhom });
    }),
    layDanhSachTinNhan: (0, batloibatdongbo_js_1.batLoiBatDongBo)(async (yeuCau, phanHoi) => {
        const maNguoiDung = yeuCau.nguoiDung._id;
        const { id: ma } = yeuCau.params;
        const { limit, truocTinNhan } = yeuCau.query;
        const danhSach = await (0, tinnhan_dichvu_js_1.layDanhSachTinNhan)({ maCuocTroChuyenId: String(ma), maNguoiDung, limit: limit ? Number(limit) : undefined, truocTinNhan: truocTinNhan });
        phanHoi.json({ thongBao: 'Lay danh sach tin nhan thanh cong', duLieu: danhSach });
    }),
    guiTinNhan: (0, batloibatdongbo_js_1.batLoiBatDongBo)(async (yeuCau, phanHoi) => {
        const maNguoiDung = yeuCau.nguoiDung._id;
        const { id: ma } = yeuCau.params;
        const { noiDung, loai, tepDinhKem, traloiTinNhan } = yeuCau.body;
        const tinNhan = await (0, tinnhan_dichvu_js_1.guiTinNhan)({ maCuocTroChuyenId: String(ma), nguoiGui: maNguoiDung, noiDung, loai, tepDinhKem, traloiTinNhan });
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
