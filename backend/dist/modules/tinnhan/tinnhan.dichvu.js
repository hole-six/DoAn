"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.layHoacTaoCuocTroChuyenModel = layHoacTaoCuocTroChuyenModel;
exports.layDanhSachCuocTroChuyenModel = layDanhSachCuocTroChuyenModel;
exports.layCuocTroChuyenModelTheoMa = layCuocTroChuyenModelTheoMa;
exports.danhDauDaDocCuocTroChuyenModel = danhDauDaDocCuocTroChuyenModel;
exports.guiTinNhan = guiTinNhan;
exports.layDanhSachTinNhan = layDanhSachTinNhan;
exports.xoaTinNhan = xoaTinNhan;
exports.themPhanUng = themPhanUng;
const loiungdung_js_1 = require("../../dungchung/loiungdung.js");
const socket_js_1 = require("../../cauhinh/socket.js");
const tinnhan_mohinh_js_1 = require("./tinnhan.mohinh.js");
const thongbao_dichvu_js_1 = require("../thongbao/thongbao.dichvu.js");
// ============================================
// CONVERSATION SERVICES
// ============================================
/**
 * Lấy hoặc tạo cuộc trò chuyện giữa 2 người
 */
async function layHoacTaoCuocTroChuyenModel(params) {
    // Sắp xếp để tìm kiếm nhất quán
    const nguoiThamGiaSorted = [...params.nguoiThamGia].sort();
    // Tìm cuộc trò chuyện hiện có
    let cuocTroChuyenModel = await tinnhan_mohinh_js_1.CuocTroChuyenModel.findOne({
        nguoiThamGia: { $all: nguoiThamGiaSorted, $size: nguoiThamGiaSorted.length },
        daLuuTru: false,
    }).populate('nguoiThamGia', 'hoTen email vaiTro');
    // Nếu chưa có, tạo mới
    if (!cuocTroChuyenModel) {
        cuocTroChuyenModel = await tinnhan_mohinh_js_1.CuocTroChuyenModel.create({
            nguoiThamGia: nguoiThamGiaSorted,
            loai: params.loai || 'ung_vien_nha_tuyen_dung',
            maHoSoUngTuyen: params.maHoSoUngTuyen,
            maTinTuyenDung: params.maTinTuyenDung,
            soChuaDoc: Object.fromEntries(nguoiThamGiaSorted.map((id) => [id, 0])),
        });
        await cuocTroChuyenModel.populate('nguoiThamGia', 'hoTen email vaiTro');
    }
    return cuocTroChuyenModel;
}
/**
 * Lấy danh sách cuộc trò chuyện của user
 */
async function layDanhSachCuocTroChuyenModel(maNguoiDung) {
    const danhSach = await tinnhan_mohinh_js_1.CuocTroChuyenModel.find({
        nguoiThamGia: maNguoiDung,
        daLuuTru: false,
    })
        .populate('nguoiThamGia', 'hoTen email vaiTro')
        .populate('tinNhanCuoiCung.nguoiGui', 'hoTen')
        .sort({ ngayCapNhat: -1 })
        .limit(50);
    return danhSach.map((doc) => {
        const obj = doc.toObject();
        return {
            ...obj,
            id: String(obj._id),
            soChuaDocCuaToi: obj.soChuaDoc?.get(maNguoiDung) || 0,
        };
    });
}
/**
 * Lấy chi tiết cuộc trò chuyện
 */
async function layCuocTroChuyenModelTheoMa(maCuocTroChuyenModel, maNguoiDung) {
    const cuocTroChuyenModel = await tinnhan_mohinh_js_1.CuocTroChuyenModel.findById(maCuocTroChuyenModel).populate('nguoiThamGia', 'hoTen email vaiTro');
    if (!cuocTroChuyenModel) {
        throw new loiungdung_js_1.LoiUngDung('Khong tim thay cuoc tro chuyen', 404);
    }
    // Kiểm tra quyền truy cập
    const coQuyen = cuocTroChuyenModel.nguoiThamGia.some((ng) => String(ng._id) === maNguoiDung);
    if (!coQuyen) {
        throw new loiungdung_js_1.LoiUngDung('Ban khong co quyen truy cap cuoc tro chuyen nay', 403);
    }
    return cuocTroChuyenModel;
}
/**
 * Đánh dấu đã đọc tất cả tin nhắn trong cuộc trò chuyện
 */
async function danhDauDaDocCuocTroChuyenModel(maCuocTroChuyenModel, maNguoiDung) {
    const cuocTroChuyenModel = await tinnhan_mohinh_js_1.CuocTroChuyenModel.findById(maCuocTroChuyenModel);
    if (!cuocTroChuyenModel) {
        throw new loiungdung_js_1.LoiUngDung('Khong tim thay cuoc tro chuyen', 404);
    }
    // Reset số chưa đọc
    cuocTroChuyenModel.soChuaDoc.set(maNguoiDung, 0);
    await cuocTroChuyenModel.save();
    // Đánh dấu tất cả tin nhắn chưa đọc
    await tinnhan_mohinh_js_1.TinNhanModel.updateMany({
        maCuocTroChuyenId: maCuocTroChuyenModel,
        nguoiGui: { $ne: maNguoiDung },
        'daDuocDocBoi.nguoiDung': { $ne: maNguoiDung },
    }, {
        $push: {
            daDuocDocBoi: {
                nguoiDung: maNguoiDung,
                thoiGian: new Date(),
            },
        },
    });
    return cuocTroChuyenModel;
}
// ============================================
// MESSAGE SERVICES
// ============================================
/**
 * Gửi tin nhắn
 */
async function guiTinNhan(params) {
    // Kiểm tra quyền
    const cuocTroChuyenModel = await layCuocTroChuyenModelTheoMa(params.maCuocTroChuyenId, params.nguoiGui);
    // Tạo tin nhắn
    const tinNhan = await tinnhan_mohinh_js_1.TinNhanModel.create({
        maCuocTroChuyenId: params.maCuocTroChuyenId,
        nguoiGui: params.nguoiGui,
        noiDung: params.noiDung,
        loai: params.loai || 'text',
        tepDinhKem: params.tepDinhKem || [],
        traloiTinNhan: params.traloiTinNhan,
    });
    // Populate để trả về đầy đủ thông tin
    await tinNhan.populate('nguoiGui', 'hoTen email vaiTro');
    if (params.traloiTinNhan) {
        await tinNhan.populate('traloiTinNhan');
    }
    // Cập nhật cuộc trò chuyện
    cuocTroChuyenModel.tinNhanCuoiCung = {
        noiDung: params.noiDung,
        nguoiGui: params.nguoiGui,
        thoiGian: new Date(),
    };
    // Tăng số chưa đọc cho người khác
    for (const nguoiThamGia of cuocTroChuyenModel.nguoiThamGia) {
        const id = String(nguoiThamGia._id);
        if (id !== params.nguoiGui) {
            const current = cuocTroChuyenModel.soChuaDoc.get(id) || 0;
            cuocTroChuyenModel.soChuaDoc.set(id, current + 1);
        }
    }
    await cuocTroChuyenModel.save();
    // Gửi real-time qua Socket.IO cho người nhận
    const tinNhanObj = tinNhan.toObject();
    for (const nguoiThamGia of cuocTroChuyenModel.nguoiThamGia) {
        const id = String(nguoiThamGia._id);
        if (id !== params.nguoiGui) {
            (0, socket_js_1.guiThongBaoChoNguoiDung)(id, 'tin_nhan_moi', {
                maCuocTroChuyenId: params.maCuocTroChuyenId,
                tinNhan: {
                    ...tinNhanObj,
                    id: String(tinNhanObj._id),
                },
            });
            // Gửi notification nếu user offline
            await (0, thongbao_dichvu_js_1.taoVaGuiThongBao)({
                maNguoiDung: id,
                loai: 'tin_nhan',
                tieuDe: `Tin nhắn mới từ ${tinNhan.nguoiGui.hoTen}`,
                noiDung: params.noiDung.substring(0, 100),
                lienKet: `/chat/${params.maCuocTroChuyenId}`,
                mucDoUuTien: 'trung_binh',
                icon: '💬',
                mauSac: '#8b5cf6',
            });
        }
    }
    return {
        ...tinNhanObj,
        id: String(tinNhanObj._id),
    };
}
/**
 * Lấy danh sách tin nhắn trong cuộc trò chuyện
 */
async function layDanhSachTinNhan(params) {
    // Kiểm tra quyền
    await layCuocTroChuyenModelTheoMa(params.maCuocTroChuyenId, params.maNguoiDung);
    const query = {
        maCuocTroChuyenId: params.maCuocTroChuyenId,
        daXoa: false,
    };
    // Pagination
    if (params.truocTinNhan) {
        const tinNhanTruoc = await tinnhan_mohinh_js_1.TinNhanModel.findById(params.truocTinNhan);
        if (tinNhanTruoc) {
            query.ngayTao = { $lt: tinNhanTruoc.ngayTao };
        }
    }
    const danhSach = await tinnhan_mohinh_js_1.TinNhanModel.find(query)
        .populate('nguoiGui', 'hoTen email vaiTro')
        .populate('traloiTinNhan')
        .sort({ ngayTao: -1 })
        .limit(params.limit || 50);
    return danhSach.reverse().map((doc) => {
        const obj = doc.toObject();
        return {
            ...obj,
            id: String(obj._id),
            daToi: obj.daDuocDocBoi?.some((d) => String(d.nguoiDung) === params.maNguoiDung),
        };
    });
}
/**
 * Xóa tin nhắn
 */
async function xoaTinNhan(maTinNhan, maNguoiDung) {
    const tinNhan = await tinnhan_mohinh_js_1.TinNhanModel.findById(maTinNhan);
    if (!tinNhan) {
        throw new loiungdung_js_1.LoiUngDung('Khong tim thay tin nhan', 404);
    }
    // Chỉ người gửi mới được xóa
    if (String(tinNhan.nguoiGui) !== maNguoiDung) {
        throw new loiungdung_js_1.LoiUngDung('Ban khong co quyen xoa tin nhan nay', 403);
    }
    tinNhan.daXoa = true;
    tinNhan.noiDung = 'Tin nhan da bi xoa';
    await tinNhan.save();
    // Gửi real-time
    const cuocTroChuyenModel = await tinnhan_mohinh_js_1.CuocTroChuyenModel.findById(tinNhan.maCuocTroChuyenId);
    if (cuocTroChuyenModel) {
        for (const nguoiThamGia of cuocTroChuyenModel.nguoiThamGia) {
            (0, socket_js_1.guiThongBaoChoNguoiDung)(String(nguoiThamGia), 'tin_nhan_da_xoa', {
                maCuocTroChuyenId: String(tinNhan.maCuocTroChuyenId),
                maTinNhan,
            });
        }
    }
    return tinNhan;
}
/**
 * Thêm reaction vào tin nhắn
 */
async function themPhanUng(params) {
    const tinNhan = await tinnhan_mohinh_js_1.TinNhanModel.findById(params.maTinNhan);
    if (!tinNhan) {
        throw new loiungdung_js_1.LoiUngDung('Khong tim thay tin nhan', 404);
    }
    // Xóa reaction cũ của user này (nếu có)
    tinNhan.phanUng = tinNhan.phanUng.filter((r) => String(r.nguoiDung) !== params.maNguoiDung);
    // Thêm reaction mới
    tinNhan.phanUng.push({
        nguoiDung: params.maNguoiDung,
        emoji: params.emoji,
    });
    await tinNhan.save();
    // Gửi real-time
    const cuocTroChuyenModel = await tinnhan_mohinh_js_1.CuocTroChuyenModel.findById(tinNhan.maCuocTroChuyenId);
    if (cuocTroChuyenModel) {
        for (const nguoiThamGia of cuocTroChuyenModel.nguoiThamGia) {
            (0, socket_js_1.guiThongBaoChoNguoiDung)(String(nguoiThamGia), 'phan_ung_moi', {
                maCuocTroChuyenId: String(tinNhan.maCuocTroChuyenId),
                maTinNhan: params.maTinNhan,
                nguoiDung: params.maNguoiDung,
                emoji: params.emoji,
            });
        }
    }
    return tinNhan;
}
