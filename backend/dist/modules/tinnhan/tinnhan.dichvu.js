"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.layHoacTaoCuocTroChuyenModel = layHoacTaoCuocTroChuyenModel;
exports.damBaoCuocTroChuyenHoTroQuanTri = damBaoCuocTroChuyenHoTroQuanTri;
exports.layDanhSachNhomCongDong = layDanhSachNhomCongDong;
exports.thamGiaNhomCongDong = thamGiaNhomCongDong;
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
const nguoidung_mohinh_js_1 = require("../nguoidung/nguoidung.mohinh.js");
// ============================================
// CONVERSATION SERVICES
// ============================================
/**
 * Láº¥y hoáº·c táº¡o cuá»™c trÃ² chuyá»‡n giá»¯a 2 ngÆ°á»i
 */
async function layHoacTaoCuocTroChuyenModel(params) {
    // Sáº¯p xáº¿p Ä‘á»ƒ tÃ¬m kiáº¿m nháº¥t quÃ¡n
    const nguoiThamGiaSorted = [...params.nguoiThamGia].sort();
    // TÃ¬m cuá»™c trÃ² chuyá»‡n hiá»‡n cÃ³
    const dieuKienTimKiem = {
        nguoiThamGia: { $all: nguoiThamGiaSorted, $size: nguoiThamGiaSorted.length },
        daLuuTru: false,
        ...(params.loai ? { loai: params.loai } : {}),
        ...(params.maHoSoUngTuyen ? { maHoSoUngTuyen: params.maHoSoUngTuyen } : {}),
        ...(params.maTinTuyenDung ? { maTinTuyenDung: params.maTinTuyenDung } : {}),
    };
    let cuocTroChuyenModel = await tinnhan_mohinh_js_1.CuocTroChuyenModel.findOne(dieuKienTimKiem).populate('nguoiThamGia', 'hoTen email vaiTro');
    // Náº¿u chÆ°a cÃ³, táº¡o má»›i
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
async function timAdminDauTien() {
    return nguoidung_mohinh_js_1.NguoiDung.findOne({ vaiTro: 'admin', trangThai: { $ne: 'bi_khoa' } }).select('_id');
}
async function damBaoCuocTroChuyenHoTroQuanTri(maNguoiDung, vaiTro) {
    if (vaiTro === 'admin') {
        const nhaTuyenDungList = await nguoidung_mohinh_js_1.NguoiDung
            .find({ vaiTro: 'nha_tuyen_dung', trangThai: { $ne: 'bi_khoa' } })
            .select('_id')
            .limit(500);
        await Promise.all(nhaTuyenDungList.map((nguoiDung) => layHoacTaoCuocTroChuyenModel({
            nguoiThamGia: [maNguoiDung, String(nguoiDung._id)],
            loai: 'admin_support',
        })));
    }
    if (vaiTro === 'nha_tuyen_dung') {
        const admin = await timAdminDauTien();
        if (admin) {
            await layHoacTaoCuocTroChuyenModel({
                nguoiThamGia: [maNguoiDung, String(admin._id)],
                loai: 'admin_support',
            });
        }
    }
}
async function layDanhSachNhomCongDong() {
    const danhSach = await tinnhan_mohinh_js_1.CuocTroChuyenModel.find({
        loai: 'nhom_cong_dong',
        daLuuTru: false,
    })
        .populate('nguoiThamGia', 'hoTen email vaiTro')
        .populate('quanTriNhom', 'hoTen email')
        .sort({ ngayCapNhat: -1 });
    return danhSach.map((doc) => {
        const obj = doc.toObject();
        return {
            ...obj,
            id: String(obj._id),
            soThanhVien: obj.nguoiThamGia?.length || 0,
        };
    });
}
async function thamGiaNhomCongDong(maNhom, maNguoiDung) {
    const nhom = await tinnhan_mohinh_js_1.CuocTroChuyenModel.findById(maNhom);
    if (!nhom)
        throw new loiungdung_js_1.LoiUngDung('Không tìm thấy nhóm', 404);
    if (nhom.loai !== 'nhom_cong_dong')
        throw new loiungdung_js_1.LoiUngDung('Day khong phai nhom cong dong', 400);
    const daCoMat = nhom.nguoiThamGia.some((id) => String(id) === maNguoiDung);
    if (!daCoMat) {
        nhom.nguoiThamGia.push(maNguoiDung);
        nhom.soChuaDoc.set(maNguoiDung, 0);
        await nhom.save();
        await tinnhan_mohinh_js_1.TinNhanModel.create({
            maCuocTroChuyenId: maNhom,
            nguoiGui: maNguoiDung,
            noiDung: 'da tham gia nhom',
            loai: 'system',
        });
    }
    return nhom;
}
/**
 * Láº¥y danh sÃ¡ch cuá»™c trÃ² chuyá»‡n cá»§a user
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
 * Láº¥y chi tiáº¿t cuá»™c trÃ² chuyá»‡n
 */
async function layCuocTroChuyenModelTheoMa(maCuocTroChuyenModel, maNguoiDung) {
    const cuocTroChuyenModel = await tinnhan_mohinh_js_1.CuocTroChuyenModel.findById(maCuocTroChuyenModel).populate('nguoiThamGia', 'hoTen email vaiTro');
    if (!cuocTroChuyenModel) {
        throw new loiungdung_js_1.LoiUngDung('Không tìm thấy cuộc trò chuyện', 404);
    }
    // Kiá»ƒm tra quyá»n truy cáº­p
    const coQuyen = cuocTroChuyenModel.nguoiThamGia.some((ng) => String(ng._id) === maNguoiDung);
    if (!coQuyen) {
        throw new loiungdung_js_1.LoiUngDung('Ban khong co quyen truy cap cuoc tro chuyen nay', 403);
    }
    return cuocTroChuyenModel;
}
/**
 * ÄÃ¡nh dáº¥u Ä‘Ã£ Ä‘á»c táº¥t cáº£ tin nháº¯n trong cuá»™c trÃ² chuyá»‡n
 */
async function danhDauDaDocCuocTroChuyenModel(maCuocTroChuyenModel, maNguoiDung) {
    const cuocTroChuyenModel = await tinnhan_mohinh_js_1.CuocTroChuyenModel.findById(maCuocTroChuyenModel);
    if (!cuocTroChuyenModel) {
        throw new loiungdung_js_1.LoiUngDung('Không tìm thấy cuộc trò chuyện', 404);
    }
    // Reset sá»‘ chÆ°a Ä‘á»c
    cuocTroChuyenModel.soChuaDoc.set(maNguoiDung, 0);
    await cuocTroChuyenModel.save();
    // ÄÃ¡nh dáº¥u táº¥t cáº£ tin nháº¯n chÆ°a Ä‘á»c
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
 * Gá»­i tin nháº¯n
 */
async function guiTinNhan(params) {
    // Kiá»ƒm tra quyá»n
    const cuocTroChuyenModel = await layCuocTroChuyenModelTheoMa(params.maCuocTroChuyenId, params.nguoiGui);
    // Táº¡o tin nháº¯n
    const tinNhan = await tinnhan_mohinh_js_1.TinNhanModel.create({
        maCuocTroChuyenId: params.maCuocTroChuyenId,
        nguoiGui: params.nguoiGui,
        noiDung: params.noiDung,
        loai: params.loai || 'text',
        tepDinhKem: params.tepDinhKem || [],
        traloiTinNhan: params.traloiTinNhan,
    });
    // Populate Ä‘á»ƒ tráº£ vá» Ä‘áº§y Ä‘á»§ thÃ´ng tin
    await tinNhan.populate('nguoiGui', 'hoTen email vaiTro');
    if (params.traloiTinNhan) {
        await tinNhan.populate('traloiTinNhan');
    }
    // Cáº­p nháº­t cuá»™c trÃ² chuyá»‡n
    cuocTroChuyenModel.tinNhanCuoiCung = {
        noiDung: params.noiDung,
        nguoiGui: params.nguoiGui,
        thoiGian: new Date(),
    };
    // TÄƒng sá»‘ chÆ°a Ä‘á»c cho ngÆ°á»i khÃ¡c
    for (const nguoiThamGia of cuocTroChuyenModel.nguoiThamGia) {
        const id = String(nguoiThamGia._id);
        if (id !== params.nguoiGui) {
            const current = cuocTroChuyenModel.soChuaDoc.get(id) || 0;
            cuocTroChuyenModel.soChuaDoc.set(id, current + 1);
        }
    }
    await cuocTroChuyenModel.save();
    // Gá»­i real-time qua Socket.IO cho ngÆ°á»i nháº­n
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
            const vaiTroNhan = nguoiThamGia.vaiTro;
            const duongDanChat = vaiTroNhan === 'admin'
                ? '/quan-tri/chat'
                : vaiTroNhan === 'ung_vien'
                    ? '/ung-vien/chat'
                    : '/nha-tuyen-dung/chat';
            await (0, thongbao_dichvu_js_1.taoVaGuiThongBao)({
                maNguoiDung: id,
                loai: 'tin_nhan',
                tieuDe: `Tin nhắn mới từ ${tinNhan.nguoiGui.hoTen}`,
                noiDung: params.noiDung.substring(0, 100),
                lienKet: `${duongDanChat}?cuocTroChuyen=${params.maCuocTroChuyenId}`,
                mucDoUuTien: 'trung_binh',
                icon: 'ðŸ’¬',
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
 * Láº¥y danh sÃ¡ch tin nháº¯n trong cuá»™c trÃ² chuyá»‡n
 */
async function layDanhSachTinNhan(params) {
    // Kiá»ƒm tra quyá»n
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
 * XÃ³a tin nháº¯n
 */
async function xoaTinNhan(maTinNhan, maNguoiDung) {
    const tinNhan = await tinnhan_mohinh_js_1.TinNhanModel.findById(maTinNhan);
    if (!tinNhan) {
        throw new loiungdung_js_1.LoiUngDung('Không tìm thấy tin nhắn', 404);
    }
    // Chá»‰ ngÆ°á»i gá»­i má»›i Ä‘Æ°á»£c xÃ³a
    if (String(tinNhan.nguoiGui) !== maNguoiDung) {
        throw new loiungdung_js_1.LoiUngDung('Ban khong co quyen xoa tin nhan nay', 403);
    }
    tinNhan.daXoa = true;
    tinNhan.noiDung = 'Tin nhan da bi xoa';
    await tinNhan.save();
    // Gá»­i real-time
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
 * ThÃªm reaction vÃ o tin nháº¯n
 */
async function themPhanUng(params) {
    const tinNhan = await tinnhan_mohinh_js_1.TinNhanModel.findById(params.maTinNhan);
    if (!tinNhan) {
        throw new loiungdung_js_1.LoiUngDung('Không tìm thấy tin nhắn', 404);
    }
    // XÃ³a reaction cÅ© cá»§a user nÃ y (náº¿u cÃ³)
    tinNhan.phanUng = tinNhan.phanUng.filter((r) => String(r.nguoiDung) !== params.maNguoiDung);
    // ThÃªm reaction má»›i
    tinNhan.phanUng.push({
        nguoiDung: params.maNguoiDung,
        emoji: params.emoji,
    });
    await tinNhan.save();
    // Gá»­i real-time
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
